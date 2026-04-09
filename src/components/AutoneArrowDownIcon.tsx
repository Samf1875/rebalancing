import type { SVGProps } from 'react';

/**
 * Arrow-down (sort / dropdown affordance) — Autone Design System 2.0
 * Figma: NEW-Autone — Design System 2.0, node `14152:1655` (Icon=arrow-down, `14152:225`).
 */
export function AutoneArrowDownIcon({
  size = 14,
  className,
  strokeWidth = 2,
  style,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }) {
  const dim = `${size}px`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      width={size}
      height={size}
      className={['block shrink-0', className].filter(Boolean).join(' ')}
      style={{
        width: dim,
        height: dim,
        minWidth: dim,
        minHeight: dim,
        maxWidth: dim,
        maxHeight: dim,
        boxSizing: 'border-box',
        ...style,
      }}
      {...props}
    >
      <path
        d="M12 5v14"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m19 12-7 7-7-7"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
