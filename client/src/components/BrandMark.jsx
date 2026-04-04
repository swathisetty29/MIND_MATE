export default function BrandMark({ size = 44, compact = false }) {
  const width = compact ? size : size * 1.08;
  const height = compact ? size : size * 0.95;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 92 84"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="mindmateBlue" x1="12" y1="11" x2="49" y2="61" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9ED8FF" />
          <stop offset="1" stopColor="#4C8EE8" />
        </linearGradient>
        <linearGradient id="mindmateGreen" x1="44" y1="12" x2="82" y2="63" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B9F0A2" />
          <stop offset="1" stopColor="#6CCC8F" />
        </linearGradient>
      </defs>

      <path
        d="M45.8 8C33.9 8 24 17 24 28.8v1.4c-9.1 2.4-15.7 10.7-15.7 20.5 0 11.7 9.5 21.1 21.1 21.1 6.1 0 10.8-1.8 14.8-5.4 4 3.6 8.6 5.4 14.8 5.4 11.7 0 21.2-9.4 21.2-21.1 0-9.8-6.6-18.1-15.7-20.5v-1.4C64.5 17 54.6 8 42.7 8h3.1Z"
        fill="#F7FCFF"
        stroke="#5B8DD8"
        strokeWidth="4.2"
        strokeLinejoin="round"
      />
      <path
        d="M24 30.4c-8 1.9-13.7 9.1-13.7 17.8 0 10.3 8.3 18.6 18.6 18.6 5.7 0 10-1.8 13.7-5.8V8.6C32.2 9.9 24 18.7 24 29.6v.8Z"
        fill="url(#mindmateBlue)"
        fillOpacity="0.95"
      />
      <path
        d="M64 30.4c8 1.9 13.7 9.1 13.7 17.8 0 10.3-8.3 18.6-18.6 18.6-5.7 0-10-1.8-13.7-5.8V8.6C55.8 9.9 64 18.7 64 29.6v.8Z"
        fill="url(#mindmateGreen)"
        fillOpacity="0.98"
      />
      <path d="M21 17.5 15.5 12" stroke="#F2A352" strokeWidth="4" strokeLinecap="round" />
      <path d="M18.3 25.8H11" stroke="#F2A352" strokeWidth="4" strokeLinecap="round" />
      <circle cx="34.5" cy="26.2" r="3.9" fill="#F6B35C" stroke="#5B8DD8" strokeWidth="2.4" />
      <circle cx="54.8" cy="23.2" r="3.9" fill="#F6B35C" stroke="#5B8DD8" strokeWidth="2.4" />
      <circle cx="30.5" cy="49.8" r="3.9" fill="#F6B35C" stroke="#5B8DD8" strokeWidth="2.4" />
      <path d="M34.5 30.2v15.7H30.5" stroke="#5B8DD8" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M38.4 26.2h12.4V23.2" stroke="#5B8DD8" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />

      <path
        d="M46 20c10.8 0 19.6 8.8 19.6 19.6S56.8 59.2 46 59.2 26.4 50.4 26.4 39.6 35.2 20 46 20Z"
        fill="#FFF9F2"
      />
      <path d="M38.5 36.6c0-2.6 1.8-4.6 4-4.6 2.3 0 4.1 2 4.1 4.6" stroke="#3067B7" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M50.4 36.6c0-2.6 1.8-4.6 4-4.6 2.3 0 4.1 2 4.1 4.6" stroke="#3067B7" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M39.8 46.5c2 3.1 5 4.7 9 4.7s7-1.6 9-4.7" stroke="#3067B7" strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="37.7" cy="42.7" r="2.2" fill="#FFC39D" />
      <circle cx="58.3" cy="42.7" r="2.2" fill="#FFC39D" />
    </svg>
  );
}
