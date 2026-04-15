import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  LineChart,
  OctagonAlert,
  Package,
  Plus,
  TrendingUp,
} from 'lucide-react';

const VIEWPORT_PAD = 12;

/** Grey → black gradient (border + fill text); inner surface is white. */
const kpiChipGradient = 'from-[#6b7280] via-[#3f4654] to-[#0f1117]';

export type KpiDriverTone = 'warning' | 'positive' | 'negative';

export type KpiDriverItem = { tone: KpiDriverTone; text: string };

export type KpiPopoverColumn = 'product' | 'sales' | 'forecast';

const HEADER_BY_COLUMN: Record<
  KpiPopoverColumn,
  { accent: string; Icon: typeof Package }
> = {
  product: { accent: 'bg-[#14B8A6]', Icon: Package },
  sales: { accent: 'bg-[#08a16a]', Icon: TrendingUp },
  forecast: { accent: 'bg-[#6366f1]', Icon: LineChart },
};

function DriverRow({ tone, text }: KpiDriverItem) {
  const icon =
    tone === 'warning' ? (
      <AlertTriangle className="size-6 shrink-0 text-[#f29a35]" strokeWidth={2} aria-hidden />
    ) : tone === 'positive' ? (
      <TrendingUp className="size-6 shrink-0 text-[#08a16a]" strokeWidth={2.25} aria-hidden />
    ) : (
      <OctagonAlert className="size-6 shrink-0 text-[#e30d3c]" strokeWidth={2.25} aria-hidden />
    );
  return (
    <li className="flex items-center gap-2">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center" aria-hidden>
        {icon}
      </span>
      <span className="font-['Inter',sans-serif] text-[13px] leading-snug text-[#101828]">{text}</span>
    </li>
  );
}

export type AssortmentCellKpiContent = {
  column: KpiPopoverColumn;
  title: string;
  rangeText: string;
  deltaText?: string;
  /** When set, tints delta: true = emerald, false = rose; omit for neutral gray. */
  deltaPositive?: boolean;
  summary: ReactNode;
  drivers: KpiDriverItem[];
  footerHighlight: string;
  footerRest: string;
};

type AssortmentCellKpiTriggerProps = {
  align?: 'start' | 'end';
} & AssortmentCellKpiContent;

/** Caret on the right of the card; tip points toward the KPI chip (to the right). */
function CaretTowardChip() {
  return (
    <svg width="8" height="22" viewBox="0 0 8 22" className="shrink-0 text-white" aria-hidden>
      <polygon points="0,0 0,22 8,11" fill="currentColor" stroke="#E3E8F0" strokeWidth="1" />
    </svg>
  );
}

/** Caret on the left of the card; tip points toward the KPI chip (to the left). */
function CaretTowardChipLeft() {
  return (
    <svg width="8" height="22" viewBox="0 0 8 22" className="shrink-0 text-white" aria-hidden>
      <polygon points="8,0 8,22 0,11" fill="currentColor" stroke="#E3E8F0" strokeWidth="1" />
    </svg>
  );
}

/**
 * KPI chip + hover popover for assortment body cells. Content is supplied per column/cell.
 */
export function AssortmentCellKpiTrigger({
  align = 'start',
  column,
  title,
  rangeText,
  deltaText,
  deltaPositive,
  summary,
  drivers,
  footerHighlight,
  footerRest,
}: AssortmentCellKpiTriggerProps) {
  const [visible, setVisible] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [nudge, setNudge] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId();

  const hide = useCallback(() => {
    setVisible(false);
    setRect(null);
    setNudge({ x: 0, y: 0 });
  }, []);

  const show = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    const el = triggerRef.current;
    if (el) setRect(el.getBoundingClientRect());
    setNudge({ x: 0, y: 0 });
    setVisible(true);
  }, []);

  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      hideTimerRef.current = null;
      hide();
    }, 120);
  }, [hide]);

  const cancelHide = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  useLayoutEffect(() => {
    if (!visible || !rect || !wrapRef.current) return;

    const br = wrapRef.current.getBoundingClientRect();
    let dx = 0;
    let dy = 0;

    if (br.right > window.innerWidth - VIEWPORT_PAD) {
      dx = window.innerWidth - VIEWPORT_PAD - br.right;
    }
    if (br.left + dx < VIEWPORT_PAD) {
      dx = VIEWPORT_PAD - br.left;
    }
    if (br.top < VIEWPORT_PAD) {
      dy = VIEWPORT_PAD - br.top;
    }
    if (br.bottom > window.innerHeight - VIEWPORT_PAD) {
      dy = window.innerHeight - VIEWPORT_PAD - br.bottom;
    }

    if (dx !== 0 || dy !== 0) {
      setNudge((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    }
  }, [visible, rect]);

  useEffect(() => {
    if (!visible) return;
    const onScrollOrResize = () => hide();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [visible, hide]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [visible, hide]);

  const isEnd = align === 'end';

  const positionStyle: CSSProperties = isEnd
    ? {
        left: rect ? rect.left - 8 + nudge.x : 0,
        top: rect ? rect.top + rect.height / 2 + nudge.y : 0,
        transform: 'translate(-100%, -50%)',
      }
    : {
        left: rect ? rect.right + 8 + nudge.x : 0,
        top: rect ? rect.top + rect.height / 2 + nudge.y : 0,
        transform: 'translate(0, -50%)',
      };

  const { accent, Icon: HeaderIcon } = HEADER_BY_COLUMN[column];

  const deltaClass =
    deltaPositive === true
      ? 'text-emerald-600'
      : deltaPositive === false
        ? 'text-rose-600'
        : 'text-[#475467]';

  const panelBody = (
    <div className="w-[min(18rem,calc(100vw-24px))] rounded-xl border border-[#E3E8F0] bg-white p-4 text-left shadow-[0_8px_30px_-8px_rgba(15,23,42,0.12),0_4px_12px_-4px_rgba(15,23,42,0.08)]">
      <div className="flex items-start gap-2.5">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${accent}`} aria-hidden>
          <HeaderIcon className="size-5 text-white" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-['Inter',sans-serif] text-sm font-semibold text-[#101828]">{title}</span>
            <span className="font-['Inter',sans-serif] text-sm tabular-nums text-[#475467]">{rangeText}</span>
            {deltaText != null && deltaText !== '' ? (
              <span className={`font-['Inter',sans-serif] text-sm font-semibold tabular-nums ${deltaClass}`}>
                {deltaText}
              </span>
            ) : null}
          </div>
          <div className="mt-2 font-['Inter',sans-serif] text-[13px] leading-snug text-[#475467]">{summary}</div>
        </div>
      </div>

      {drivers.length > 0 ? (
        <div className="mt-4 border-t border-[#E3E8F0] pt-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="shrink-0 font-['Inter',sans-serif] text-xs font-medium text-[#667085]">Driven by:</span>
            <div className="h-px min-w-0 flex-1 bg-[#E3E8F0]" />
          </div>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">{drivers.map((d, i) => <DriverRow key={i} {...d} />)}</ul>
        </div>
      ) : null}

      <div className="mt-4 rounded-lg border border-[#E3E8F0] bg-[#F8FAFC] p-3">
        <div className="flex gap-2.5">
          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${accent}`} aria-hidden>
            <Plus className="size-4 text-white" strokeWidth={2.5} />
          </div>
          <p className="m-0 font-['Inter',sans-serif] text-[13px] leading-snug text-[#475467]">
            <span className="font-semibold text-[#101828]">{footerHighlight}</span>
            {footerRest}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`pointer-events-auto inline-flex shrink-0 items-center rounded bg-gradient-to-br p-px shadow-sm transition-[filter,opacity] hover:brightness-110 active:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9CA3AF] ${kpiChipGradient}`}
        aria-label={`View KPI summary: ${title}`}
        aria-expanded={visible}
        aria-describedby={visible ? tooltipId : undefined}
        onPointerEnter={() => {
          cancelHide();
          show();
        }}
        onPointerLeave={scheduleHide}
        onFocus={() => {
          cancelHide();
          show();
        }}
        onBlur={hide}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            visible ? hide() : show();
          }
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="flex items-center justify-center rounded-[3px] bg-white px-2 py-1">
          <span
            className={`bg-gradient-to-br bg-clip-text font-['Inter',sans-serif] text-[11px] font-semibold leading-none text-transparent ${kpiChipGradient}`}
          >
            KPI
          </span>
        </span>
      </button>
      {visible &&
        rect &&
        createPortal(
          <div
            ref={wrapRef}
            id={tooltipId}
            role="tooltip"
            className="fixed z-[90] flex max-w-[calc(100vw-24px)] flex-row items-center"
            style={positionStyle}
            onPointerEnter={cancelHide}
            onPointerLeave={scheduleHide}
          >
            {isEnd ? (
              <>
                {panelBody}
                <div className="-ml-px flex shrink-0 items-center self-stretch py-1">
                  <CaretTowardChip />
                </div>
              </>
            ) : (
              <>
                <div className="-mr-px flex shrink-0 items-center self-stretch py-1">
                  <CaretTowardChipLeft />
                </div>
                {panelBody}
              </>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
