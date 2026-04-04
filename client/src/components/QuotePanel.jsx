export default function QuotePanel({ quote, author, compact = false }) {
  return (
    <div className={`quote-panel${compact ? " quote-panel-compact" : ""}`}>
      <p>{quote}</p>
      {author ? <span>{author}</span> : null}
    </div>
  );
}
