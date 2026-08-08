import {
  UnrecoverableError,
  Worker,
  type Job,
} from "bullmq";

import redis from "../config/redis.js";
import { ingestDocument } from "../services/ingest.js";

interface IngestJobData {
  filePath: string;
}

interface RetryableError extends Error {
  status?: number;
  retryAfter?: number;
}

function getStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  const err = error as {
    status?: number;
    statusCode?: number;
    response?: {
      status?: number;
    };
  };

  return (
    err.status ??
    err.statusCode ??
    err.response?.status
  );
}

function getRetryAfter(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  const err = error as {
    headers?: Record<string, string | undefined>;
    response?: {
      headers?: Record<string, string | undefined>;
    };
  };

  const value =
    err.headers?.["retry-after"] ??
    err.headers?.["Retry-After"] ??
    err.response?.headers?.["retry-after"] ??
    err.response?.headers?.["Retry-After"];

  if (!value) {
    return undefined;
  }

  const seconds = Number(value);

  if (Number.isFinite(seconds)) {
    return seconds * 1000;
  }

  const retryDate = Date.parse(value);

  if (!Number.isNaN(retryDate)) {
    return Math.max(0, retryDate - Date.now());
  }

  return undefined;
}

function exponentialBackoff(attempt: number): number {
  const baseDelay = 1000;
  const maxDelay = 30000;

  const exponentialDelay = Math.min(
    baseDelay * 2 ** (attempt - 1),
    maxDelay
  );

  const jitter = Math.random() * 1000;

  return exponentialDelay + jitter;
}

export const ingestWorker = new Worker<IngestJobData>(
  "document-ingestion",

  async (job: Job<IngestJobData>) => {
    try {
      console.log(
        `Processing job ${job.id}, attempt ${
          job.attemptsMade + 1
        }`
      );

      await ingestDocument(job.data.filePath);

      console.log(`Job ${job.id} completed`);

      return {
        success: true,
        filePath: job.data.filePath,
      };
    } catch (error) {
      const status = getStatus(error);

      // Permanent 4xx errors should not be retried.
      if (
        status !== undefined &&
        status >= 400 &&
        status < 500 &&
        status !== 429
      ) {
        throw new UnrecoverableError(
          `Permanent ingestion error: HTTP ${status}`
        );
      }

      const retryAfter =
        status === 429
          ? getRetryAfter(error)
          : undefined;

      const retryableError =
        error as RetryableError;

      retryableError.status = status;
      retryableError.retryAfter = retryAfter;

      throw retryableError;
    }
  },

  {
    connection: redis,

    settings: {
      backoffStrategy: (
        attemptsMade: number,
        _type: string,
        error: Error
      ): number => {
        const retryableError =
          error as RetryableError;

        // 429 with Retry-After
        if (
          retryableError.status === 429 &&
          retryableError.retryAfter !== undefined
        ) {
          console.log(
            `429 received. Retrying after ${retryableError.retryAfter}ms`
          );

          return retryableError.retryAfter;
        }

        // 429 without Retry-After
        // or other transient errors
        const delay = exponentialBackoff(
          attemptsMade
        );

        console.log(
          `Transient error. Retrying after ${Math.round(
            delay
          )}ms`
        );

        return delay;
      },
    },
  }
);

ingestWorker.on("completed", (job) => {
  console.log(
    `Job ${job.id} completed successfully`
  );
});

ingestWorker.on("failed", (job, error) => {
  console.error(
    `Job ${job?.id} failed after ${
      job?.attemptsMade
    } attempts:`,
    error.message
  );
});