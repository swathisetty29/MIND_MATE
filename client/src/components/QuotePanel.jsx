import { getDailyQuote } from "../data/dailyQuotes.js";

export default function QuotePanel({ quote, compact = false, highlight = false }) {
  const text = quote || getDailyQuote();

  return (
    <div className={`quote-panel${compact ? " quote-panel-compact" : ""}${highlight ? " quote-panel-highlight" : ""}`}>
      <p>{text}</p>
    </div>
  );
}
