import { ArrowLeft, ExternalLink, Upload } from 'lucide-react';

type HeaderProps = {
  activeMainNavId?: string;
  /** Rebalancing header: return to Replenishment workspace. */
  onSwitchBack?: () => void;
};

export function Header({ activeMainNavId = 'home', onSwitchBack }: HeaderProps) {
  const isRebalancing = activeMainNavId === 'refresh';

  if (isRebalancing) {
    return (
      <header
        className="flex w-full shrink-0 items-center justify-between bg-[#12171e] px-6 py-6"
        data-name="Top bar"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="text-2xl font-semibold leading-none tracking-normal text-white">
            Rebalancing
          </h1>
          <p className="text-sm font-normal leading-snug text-[#a6aaaf]">
            Optimize your inventory between points of sales
          </p>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => onSwitchBack?.()}
            className="flex h-12 shrink-0 items-center justify-center rounded px-4 py-3 text-sm font-medium text-white transition-colors bg-[#212b36] hover:bg-[#2d3844]"
          >
            Switch back
          </button>
          <button
            type="button"
            className="flex h-12 shrink-0 items-center justify-center rounded px-4 py-3 text-sm font-medium text-white transition-colors bg-[#0267FF] hover:bg-[#0258e6]"
          >
            Create new rebalancing
          </button>
        </div>
      </header>
    );
  }

  return (
    <header
      className="flex w-full shrink-0 items-center justify-between bg-[#12171e] px-6 py-6"
      data-name="Top bar"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded text-[#6A7282] transition-colors hover:bg-white/[0.08] hover:text-[#0267FF]"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="text-2xl font-medium leading-none tracking-normal text-white">
            Assortment
          </h1>
          <div className="flex flex-wrap items-center gap-1 text-sm leading-none">
            <span className="font-normal text-[#a6aaaf]">
              Manage your assortment and initial allocations
            </span>
            <span className="font-normal text-[#878d94]">•</span>
            <a
              href="#"
              className="font-medium text-[#878d94] underline underline-offset-2 transition-colors hover:text-white"
            >
              Release notes
            </a>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 flex-1 items-center justify-end gap-1.5">
        <button
          type="button"
          className="flex h-12 items-center justify-center gap-2 rounded bg-[#212b36] px-4 py-3 text-[#a6aaaf] transition-colors hover:bg-[#2d3844] hover:text-white"
          aria-label="External link"
        >
          <ExternalLink size={20} />
        </button>
        <button
          type="button"
          className="flex h-12 items-center justify-center gap-2 rounded bg-[#212b36] px-4 py-3 text-[#a6aaaf] transition-colors hover:bg-[#2d3844] hover:text-white"
          aria-label="Upload"
        >
          <Upload size={20} />
        </button>
      </div>
    </header>
  );
}
