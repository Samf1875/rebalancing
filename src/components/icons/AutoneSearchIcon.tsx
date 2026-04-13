/**
 * Autone DS 2.0 — Search (Figma `14152:65`, NEW Autone Design System 2.0).
 * Token: Base `#22272F` — use `currentColor` on parent.
 */
export function AutoneSearchIcon({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className={['block size-[1em] shrink-0 text-[24px] leading-none', className].filter(Boolean).join(' ')}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title ? <title>{title}</title> : null}
      <circle cx="10" cy="10" r="5.5" stroke="currentColor" strokeWidth={1.5} />
      <path
        d="M14.2 14.2L20 20"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
