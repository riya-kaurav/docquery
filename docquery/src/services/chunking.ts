export function chunkText(
  text: string,
  chunkSize = 300,
  overlap = 50
): string[] {
  if (chunkSize <= 0) {
    throw new Error("chunkSize must be greater than 0");
  }

  if (overlap < 0) {
    throw new Error("overlap cannot be negative");
  }

  if (overlap >= chunkSize) {
    throw new Error("overlap must be smaller than chunkSize");
  }

  const words = text.trim().split(/\s+/);

  if (words.length === 0) {
    return [];
  }

  const chunks: string[] = [];
  const step = chunkSize - overlap;

  for (let i = 0; i < words.length; i += step) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    chunks.push(chunk);

    if (i + chunkSize >= words.length) {
      break;
    }
  }

  return chunks;
}