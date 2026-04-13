/**
 * Autone DS 2.0 — "Receiving location" (Figma `14152:1320`, NEW Autone Design System 2.0).
 * Line house with rounded joins; horizontal inbound arrow (R→L) through a gap in the right wall.
 * Tokens: 07 Grey/800 `#212B36`, Base `#22272F` — use `currentColor` in UI (e.g. `text-[#101828]`).
 * Default: `text-[20px]` + `size-[1em]` → 20×20px box; override with `className`.
 */
export function AutoneReceivingLocationIcon({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className={['block size-[1em] shrink-0 text-[20px] leading-none', className].filter(Boolean).join(' ')}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title ? <title>{title}</title> : null}
      {/* House: peaked roof, rounded bottom-left (Q), right wall gap for inbound arrow */}
      <path
        d="M6 19.5H19.5V16M19.5 12.5V11.25L12 5.25L4.5 11.25V17.25Q4.5 19.5 6 19.5"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inbound arrow: shaft through gap + chevron head (R→L) */}
      <path
        d="M20.75 14.25h-7M13.75 12l-2.75 2.25L13.75 16.5"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
