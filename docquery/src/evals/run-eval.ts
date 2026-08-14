import { goldenSet } from "./golden-set.js";
import { retrieveChunks } from "../services/retrieve.js";
import { answerQuery } from "../services/rag.js";

const TOP_K = 1;
const FALLBACK = "I don't know based on the provided context.";

type EvalResult = {
  id: string;
  query: string;
  retrievalHit: boolean;
  generationError: boolean;
  fallbackCorrect: boolean | null;
  actualAnswer: string;
};

async function runEval() {
  const results: EvalResult[] = [];

  for (const testCase of goldenSet) {
    console.log(testCase.id);
    console.log("Query:", testCase.query);



    let retrieved: any[] = [];

    try {
      retrieved = await retrieveChunks(testCase.query, TOP_K);
    } catch (error) {
      console.error("Retrieval error:", error);

      results.push({
        id: testCase.id,
        query: testCase.query,
        retrievalHit: false,
        generationError: true,
        fallbackCorrect: null,
        actualAnswer: "",
      });

      continue;
    }

    console.log(
      "Retrieved:",
      retrieved.map(
        (chunk) =>
          `${chunk.document_id}:${chunk.chunk_index}`
      )
    );

    let retrievalHit = false;

    // No-answer case
    if (testCase.expectedChunks.length === 0) {
      retrievalHit = true;
    } else {
      

      retrievalHit = testCase.expectedChunks.some(
        (expected) => {
          return retrieved.some((chunk) => {
            return (
              chunk.document_id === expected.documentId &&
              chunk.chunk_index === expected.chunkIndex
            );
          });
        }
      );

      
    //   if (!retrievalHit) {
    //     retrievalHit = testCase.expectedChunks.some(
    //       (expected) => {
    //         return retrieved.some((chunk) => {
    //           return (
    //             chunk.chunk_index === expected.chunkIndex &&
    //             typeof chunk.content === "string"
    //           );
    //         });
    //       }
    //     );
    //   }
    }

    console.log(
      "Retrieval:",
      retrievalHit ? "HIT" : "MISS"
    );

    
    let actualAnswer = "";
    let generationError = false;

    try {
      const result = await answerQuery(testCase.query);

      actualAnswer =
        typeof result === "string"
          ? result
          : result.answer;

      console.log("Answer:", actualAnswer);
    } catch (error) {
      generationError = true;

      console.log("Generation: ERROR");
      console.log("Error:", String(error));
    }

   
    let fallbackCorrect: boolean | null = null;

    if (!testCase.answerable && !generationError) {
      fallbackCorrect = actualAnswer === FALLBACK;

      console.log(
        "Fallback:",
        fallbackCorrect ? "CORRECT" : "WRONG"
      );
    }

    
    if (testCase.answerable && !generationError) {
      console.log(
        "Faithfulness: MANUAL CHECK"
      );

      console.log(
        "Expected:",
        testCase.expectedAnswer
      );
    }

    results.push({
      id: testCase.id,
      query: testCase.query,
      retrievalHit,
      generationError,
      fallbackCorrect,
      actualAnswer,
    });
  }

 
  const total = results.length;

  const retrievalHits = results.filter(
    (result) => result.retrievalHit
  ).length;

  const retrievalMisses = total - retrievalHits;

  const noAnswerCases = goldenSet.filter(
    (testCase) => !testCase.answerable
  );

  const fallbackResults = results.filter(
    (result) => result.fallbackCorrect !== null
  );

  const fallbackCorrect = fallbackResults.filter(
    (result) => result.fallbackCorrect === true
  ).length;

  const generationErrors = results.filter(
    (result) => result.generationError
  ).length;

  console.log("FINAL EVALUATION SUMMARY");

  console.log(
    `Retrieval hit-rate: ${retrievalHits}/${total}`
  );

  console.log(
    `Retrieval misses: ${retrievalMisses}/${total}`
  );

  console.log(
    `No-answer fallback: ${fallbackCorrect}/${noAnswerCases.length}`
  );

  console.log(
    `Generation errors: ${generationErrors}/${total}`
  );

  console.log(
    "Generation faithfulness: MANUAL REVIEW REQUIRED"
  );

  console.log("\nManual review checklist:");
  console.log(
    "1. Is the answer supported by the retrieved chunks?"
  );
  console.log(
    "2. Did the model invent information?"
  );
  console.log(
    "3. Did the model answer the actual question?"
  );
  console.log(
    "4. Did no-answer cases correctly use the fallback?"
  );

}

runEval().catch((error) => {
  console.error("Evaluation failed:", error);
  process.exit(1);
});