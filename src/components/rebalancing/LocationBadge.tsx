import type { ReactNode } from 'react';

/** Generic short-label pill for location metadata (e.g. Selling). */
export function LocationBadge({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-medium leading-none text-[#6A7282]"
      title={title}
    >
      {children}
    </span>
  );
}
