export function cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  export function getTopKSimilarMessages(
    messageEmbeddings: { index: number; embedding: number[] }[],
    queryEmbedding: number[],
    topK: number = 5
  ): number[] {
    return messageEmbeddings
      .map(({ index, embedding }) => ({
        index,
        score: cosineSimilarity(embedding, queryEmbedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(({ index }) => index);
  }
