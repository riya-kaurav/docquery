// implementation of fixed size chunking function without library
// we are making a function taking docs chunks size and overlap

function chunkText(
    text: string,
    chunkSize: number,
    overlap: number
): string[] {

    const words = text.trim().split(/\s+/);
    console.log("Word count:", words.length);
    const chunks: string[] = [];

    // move forward by chunksize - overlap
    const step = chunkSize - overlap;

    for(let i = 0; i < words.length; i += step) {
        const chunk = words.slice(i, i + chunkSize).join(" ");
        chunks.push(chunk);

        // stop when reached end
        if(i + chunkSize >= words.length){
            break;
        }
    }

    return chunks;
}

const document = `
Artificial intelligence is transforming the way software is built.
Developers use machine learning models to automate repetitive tasks.

Retrieval-Augmented Generation (RAG) improves LLM responses by providing
relevant context from external documents instead of relying only on the
model's training data.

Before storing documents in a vector database, they are split into
smaller chunks. Choosing the right chunk size and overlap greatly affects
retrieval quality because embeddings represent the meaning of each chunk.
`;

const chunks = chunkText(document, 30, 5);

chunks.forEach((chunk, index) => {
  console.log(`\nChunk ${index + 1}`);
  console.log(chunk);
});