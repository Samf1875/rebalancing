import { AutoneLogoMark } from './AutoneLogoMark';

/**
 * Sidebar expanded lockup — mark + wordmark.
 * Figma: NEW Autone — Design System 2.0, `AutoneLogo` node `12210:36288` (dev).
 * Vector mark matches `12210:36296`; wordmark uses project Inter until a vector export is wired in.
 */
export function AutoneLogoExpanded({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex h-6 items-center gap-[5.924px] ${className}`.trim()}
      data-name="AutoneLogo"
      data-node-id="12210:36288"
    >
      <AutoneLogoMark className="size-6 shrink-0 text-white" aria-hidden />
      <span className="flex h-[23.971px] w-[112px] max-w-full shrink-0 items-center text-[17px] font-semibold leading-none tracking-[-0.03em] text-white">
        autone
      </span>
    </div>
  );
}
