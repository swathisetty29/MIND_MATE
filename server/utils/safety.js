const RISKY_KEYWORDS = [
  "suicide",
  "kill myself",
  "kill yourself",
  "end my life",
  "hopeless",
  "want to die",
  "better off dead",
];

export function detectRiskyContent(text) {
  const lower = text.toLowerCase();
  for (const phrase of RISKY_KEYWORDS) {
    if (lower.includes(phrase)) {
      return true;
    }
  }
  return false;
}

export const SUPPORT_MESSAGE =
  "You are not alone. Consider reaching out to someone you trust. " +
  "If you are in immediate danger, contact local emergency services. " +
  "In the U.S., you can call or text 988 (Suicide & Crisis Lifeline) for free, confidential support 24/7.";
