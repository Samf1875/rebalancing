/**
 * Autone DS — "Receiving location" (Figma `13675:43243`, NEW Autone Design System 2.0).
 * Stroke icon: peaked roof + left wall + floor; right side stays open; arrow in the lower half (R→L).
 * DS colors: 07 Grey/800 `#212B36`, Base `#22272F` — use `currentColor` in UI.
 */
export function AutoneReceivingLocationIcon({
  size = 16,
  className,
  title,
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title ? <title>{title}</title> : null}
      {/* House frame: left wall + roof; right side open above the floor (Figma). Floor closes the bottom. */}
      <path
        d="M4.25 19.5V10.75L12 4.75l7.75 6M4.25 19.5h15.5"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inbound arrow (lower half, points left) */}
      <path
        d="M20.75 14.25h-6.75M17.5 12l-3.25 2.25L17.5 16.5"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
