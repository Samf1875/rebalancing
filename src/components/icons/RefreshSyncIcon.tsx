/** Sidebar + summary banner — sync/refresh arrows (matches nav Rebalancing control). */
export function RefreshSyncIcon({
  className,
  size = 24,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 19 19"
      fill="none"
      className={['shrink-0', className].filter(Boolean).join(' ') || undefined}
      aria-hidden
    >
      <path
        d="M0.75 9.08333C0.75 13.6857 4.48096 17.4167 9.08333 17.4167C13.6857 17.4167 16.5833 12.8333 16.5833 12.8333M17.4167 9.08333C17.4167 4.48096 13.713 0.75 9.08333 0.75C3.52778 0.75 0.75 5.33333 0.75 5.33333M0.75 5.33333V2.41667M0.75 5.33333H3.66667M16.5833 12.8333H13.6667M16.5833 12.8333V15.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
