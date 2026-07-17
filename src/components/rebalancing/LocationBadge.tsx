import type { ReactNode } from 'react';
import { AutoneHeaderInfoTooltip } from '../AutoneHeaderInfoTooltip';

const ROLE_TOOLTIPS: Record<string, string> = {
  Selling: 'Location both holds stock and sells directly (e.g. ecomm, outlet).',
  Warehouse: 'Location that holds and fulfils stock only, not direct sales.',
};

/** Generic short-label pill for location metadata (e.g. Selling). */
export function LocationBadge({
  children,
  title,
  variant = 'muted',
}: {
  children: ReactNode;
  title?: string;
  variant?: 'muted' | 'strong';
}) {
  const roleLabel = typeof children === 'string' ? children : null;
  const roleTooltip = roleLabel ? ROLE_TOOLTIPS[roleLabel] : undefined;

  const pill = (
    <span
      className={`inline-flex shrink-0 items-center rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-medium leading-none ${
        variant === 'strong' ? 'text-[#101828]' : 'text-[#6A7282]'
      }`}
      title={roleTooltip ? undefined : title}
    >
      {children}
    </span>
  );

  if (!roleTooltip || !roleLabel) return pill;

  return (
    <AutoneHeaderInfoTooltip
      label={roleLabel}
      content={roleTooltip}
      side="top"
      showTriggerIcon={false}
      hoverWith={pill}
    />
  );
}
