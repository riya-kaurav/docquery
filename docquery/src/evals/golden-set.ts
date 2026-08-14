export type GoldenCase = {
  id: string;
  query: string;

  expectedChunks: {
    documentId: number;
    chunkIndex: number;
  }[];

  answerable: boolean;

  expectedAnswer?: string;

  type: "direct" | "no-answer" | "ambiguous";
};

export const goldenSet: GoldenCase[] = [
 

  {
    id: "q1",
    query: "What is artificial intelligence?",
    expectedChunks: [
      {
        documentId: 24,
        chunkIndex: 0,
      },
    ],
    answerable: true,
    expectedAnswer:
      "Artificial Intelligence refers to systems capable of performing tasks that traditionally require human intelligence.",
    type: "direct",
  },

  {
    id: "q2",
    query: "What is machine learning?",
    expectedChunks: [
      {
        documentId: 24,
        chunkIndex: 0,
      },
    ],
    answerable: true,
    expectedAnswer:
      "Machine learning is a subset of AI that enables systems to improve performance by analyzing datasets and identifying patterns without being explicitly programmed.",
    type: "direct",
  },

  {
    id: "q3",
    query: "How is AI used in healthcare?",
    expectedChunks: [
      {
        documentId: 24,
        chunkIndex: 0,
      },
    ],
    answerable: true,
    expectedAnswer:
      "AI can assist doctors by analyzing medical images, predicting patient outcomes, and helping discover new drugs.",
    type: "direct",
  },

  {
    id: "q4",
    query: "What are some ethical challenges of AI?",
    expectedChunks: [
      {
        documentId: 24,
        chunkIndex: 0,
      },
    ],
    answerable: true,
    expectedAnswer:
      "AI raises concerns including algorithmic bias, privacy issues, and the impact of automation on jobs.",
    type: "direct",
  },

  

  {
    id: "q5",
    query: "What is artificial general intelligence?",
    expectedChunks: [
      {
        documentId: 24,
        chunkIndex: 1,
      },
    ],
    answerable: true,
    expectedAnswer:
      "Artificial general intelligence is the idea of AI with the ability to understand and adapt across contexts like humans.",
    type: "direct",
  },

  {
    id: "q6",
    query: "What are some emerging areas of AI?",
    expectedChunks: [
      {
        documentId: 24,
        chunkIndex: 1,
      },
    ],
    answerable: true,
    expectedAnswer:
      "Emerging areas include reinforcement learning, generative models, and agentic AI.",
    type: "direct",
  },

  

  {
    id: "q7",
    query: "What is Redis?",
    expectedChunks: [
      {
        documentId: 25,
        chunkIndex: 0,
      },
    ],
    answerable: true,
    expectedAnswer:
      "Redis is an in-memory key-value database.",
    type: "direct",
  },

  {
    id: "q8",
    query: "What is Redis commonly used for?",
    expectedChunks: [
      {
        documentId: 25,
        chunkIndex: 0,
      },
    ],
    answerable: true,
    expectedAnswer:
      "Redis is commonly used for caching, session storage, pub/sub messaging, and queues.",
    type: "direct",
  },

  {
    id: "q9",
    query: "Why is Redis fast?",
    expectedChunks: [
      {
        documentId: 25,
        chunkIndex: 0,
      },
    ],
    answerable: true,
    expectedAnswer:
      "Redis is fast because it stores data primarily in memory.",
    type: "direct",
  },



  {
    id: "q10",
    query: "Who invented the telephone?",
    expectedChunks: [],
    answerable: false,
    expectedAnswer: "I don't know based on the provided context.",
    type: "no-answer",
  },

  {
    id: "q11",
    query: "What is the capital of Japan?",
    expectedChunks: [],
    answerable: false,
    expectedAnswer: "I don't know based on the provided context.",
    type: "no-answer",
  },

  

  {
    id: "q12",
    query: "What is used for caching and improving application performance?",
    expectedChunks: [
      {
        documentId: 24,
        chunkIndex: 0,
      },
      {
        documentId: 25,
        chunkIndex: 0,
      },
    ],
    answerable: true,
    type: "direct",
  },

  {
    id: "q13",
    query: "What technology concept involves improving performance and working with data efficiently?",
    expectedChunks: [
      {
        documentId: 24,
        chunkIndex: 0,
      },
      {
        documentId: 25,
        chunkIndex: 0,
      },
    ],
    answerable: true,
    type: "ambiguous",
  },

];