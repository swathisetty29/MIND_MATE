export const DAILY_QUOTES = [
  "You are not alone. You are seen. I am with you. You are not alone.",
  "There is hope, even when your brain tells you there isn't.",
  "Anything that's human is mentionable, and anything that is mentionable can be more manageable.",
  "You walk in the rain and you feel the rain, but you are not the rain.",
  "Healing is not linear, and it is perfectly okay to have both healing and hurting days.",
  "Your track record for getting through your hardest days is 100% so far.",
  "It is brave to ask for help; it is not a sign of weakness, but a profound act of self-love.",
  "You are not a burden; you are a human being who deserves support.",
  "Your struggle is real, but so is the community of people who understand it.",
  "Reaching out is a sign of strength, not a lack of it.",
  "You don't have to be okay all the time to be enough.",
  "Be as patient with yourself as you would be with a garden in winter.",
  "It's okay if your only achievement today was taking a deep breath.",
  "Feelings are like clouds: they pass through, but they are not the sky.",
  "You have survived every worst day you've ever had so far.",
  "Healing doesn't mean the damage never existed; it means the damage no longer controls your life.",
  "Rest is productive. Your mind needs a recharge as much as your phone does.",
  "Small steps still move you forward. Don't underestimate the power of just for now.",
  "You are more than your thoughts, and you are far more than your mistakes.",
];

export const CHAT_COMFORT_QUOTES = [
  "I'm right here in your pocket whenever the world feels a little too loud. You don't have to face it alone.",
  "Take a deep breath with me. Whatever you're carrying right now, we can sit with it together for a while.",
  "It's okay if you don't have the words yet. I'm just glad you're here, exactly as you are.",
  "If today was hard, remember: you've already survived the toughest part by getting through it. Rest now.",
  "You're doing a lot more than you give yourself credit for. Even just being is enough today.",
  "I don't need you to be fixed or perfect. I just want you to know you're seen and you're valued.",
  "Think of me as your safe harbor. When the waves get high, you can always drop anchor here.",
  "Your progress isn't defined by how fast you move, but by the fact that you're still showing up for yourself.",
];

export function getDailyQuote() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
}

export function getDailyChatComfortQuote() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return CHAT_COMFORT_QUOTES[dayOfYear % CHAT_COMFORT_QUOTES.length];
}
