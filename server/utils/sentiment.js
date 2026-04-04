import Sentiment from "sentiment";

const analyzer = new Sentiment();

/**
 * Maps sentiment score to positive / neutral / negative (simple buckets).
 */
export function analyzeSentiment(text) {
  const result = analyzer.analyze(text);
  const score = result.comparative;
  if (score > 0.05) return "positive";
  if (score < -0.05) return "negative";
  return "neutral";
}
