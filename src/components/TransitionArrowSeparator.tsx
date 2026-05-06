import { ArrowRight } from 'lucide-react';

type TransitionArrowSeparatorProps = {
  /** Spacing around the icon (default `mx-0.5`). */
  className?: string;
};

/**
 * Thin grey arrow between “from” and “to” values — matches header info grey `#6A7282`
 * and assortment metric columns (13px, stroke 1.35).
 */
export function TransitionArrowSeparator({
  className = 'mx-0.5',
}: TransitionArrowSeparatorProps) {
  return (
    <ArrowRight
      size={13}
      strokeWidth={1.35}
      className={`inline-block shrink-0 align-middle text-[#6A7282] ${className}`}
      aria-hidden
    />
  );
}
