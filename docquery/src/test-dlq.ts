import { ingestDLQ } from "./jobs/dlq.js";

const jobs = await ingestDLQ.getJobs(["waiting"]);

console.log(
  jobs.map((job) => ({
    id: job.id,
    ...job.data,
  }))
);

process.exit(0);