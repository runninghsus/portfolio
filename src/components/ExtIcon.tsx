/** Small "opens elsewhere" arrow drawn as SVG, so it never turns into an emoji (↗ does on Apple devices). */
export default function ExtIcon() {
  return (
    <svg className="ext" viewBox="0 0 16 16" width="0.8em" height="0.8em" aria-hidden="true" focusable="false">
      <path d="M4 12 L12 4 M6 4 H12 V10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
