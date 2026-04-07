const BRAND_IMAGE_URL =
  "https://play-lh.googleusercontent.com/7gYKx1SSrTA5EcauZIXjnuS0jU5Dtw-8IuUOtj6v05WMbK4l3uVDix10ODXzJZADYg=w240-h480-rw";

export default function BrandMark({ size = 44, compact = false }) {
  const dimension = compact ? size : size * 1.08;

  return (
    <img
      src={BRAND_IMAGE_URL}
      alt="Haven: Your Mind Mate"
      width={dimension}
      height={dimension}
      style={{
        display: "block",
        width: `${dimension}px`,
        height: `${dimension}px`,
        objectFit: "cover",
        borderRadius: compact ? "14px" : "28px",
      }}
    />
  );
}

export { BRAND_IMAGE_URL };
