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
import { CheckCircle2, Info, Lightbulb, LineChart, Zap } from 'lucide-react';

/** Figma DS tooltips — solid black panels in product headers */
const TOOLTIP_BG = '#000000';
/** Rich explainers — dark panel (Sales-style tooltip mock) */
const RICH_TOOLTIP_BG = '#0F172A';
/** Light panel (Coverage-style tooltip mock): white, 8px radius, border #E3E8F0 */
const RICH_TOOLTIP_BG_LIGHT = '#FFFFFF';

const VIEWPORT_PAD = 12;

export type AutoneHeaderInfoTooltipSide = 'top' | 'left';
/** `side="top"` only: where the bubble anchors horizontally relative to the trigger. */
export type AutoneHeaderInfoTooltipTopAlign = 'center' | 'start';

export type HeaderTooltipRichFooter =
  | { kind: 'impact'; badge: string; sublabel: string; prefix?: string }
  | { kind: 'highlight'; text: string }
  | { kind: 'salesMetrics'; l7d: string; l30d: string }
  | { kind: 'transferTotals'; unitsLine: string; tripsLine: string }
  | { kind: 'footerCaption'; text: string };

export type HeaderTooltipRich = {
  title: string;
  icon: 'info' | 'check' | 'lightbulb' | 'chart';
  body: string;
  footer?: HeaderTooltipRichFooter;
};

type BaseProps = {
  /** Column topic for the trigger label, e.g. "Revenue increase" */
  label: string;
  /** Figma `5478:57391`: leading white info glyph in the bubble (simple mode only) */
  showIconInTooltip?: boolean;
  iconSize?: number;
  /**
   * `top` — Figma `5560:59694` (caret below bubble, above trigger).
   * `left` — Figma `5478:57391` (bubble left of trigger, caret points at icon).
   */
  side?: AutoneHeaderInfoTooltipSide;
  /** When `side` is `top`, align bubble to trigger start (left in LTR) instead of centered. */
  topAlign?: AutoneHeaderInfoTooltipTopAlign;
  /**
   * When set, hovering the label + icon opens the tooltip (larger hit area).
   * Omit to keep a compact info-only trigger.
   */
  hoverWith?: ReactNode;
  /**
   * Rich mode only: replaces the default `max-w-[min(22rem,...)]` on the bubble
   * (e.g. `max-w-[min(32rem,calc(100vw-24px))]` for a wider panel).
   */
  richBubbleMaxWidthClass?: string;
  /**
   * Rich mode only: `light` — white panel, 8px radius, 16px padding (Coverage mock).
   */
  richAppearance?: 'dark' | 'light';
};

type SimpleMode = BaseProps & {
  content: string;
  rich?: never;
};

type RichMode = BaseProps & {
  rich: HeaderTooltipRich;
  content?: never;
  showIconInTooltip?: never;
};

export type AutoneHeaderInfoTooltipProps = SimpleMode | RichMode;

function TitleIcon({
  kind,
  appearance = 'dark',
}: {
  kind: HeaderTooltipRich['icon'];
  appearance?: 'dark' | 'light';
}) {
  const wrap =
    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full [&_svg]:shrink-0';
  if (appearance === 'light' && kind === 'info') {
    return (
      <span
        className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-[#E3E8F0] bg-white text-[#101828] [&_svg]:shrink-0"
        aria-hidden
      >
        <Info size={14} strokeWidth={2} />
      </span>
    );
  }
  switch (kind) {
    case 'info':
      return (
        <span className={`${wrap} bg-[#0267FF]/25 text-[#93c5fd]`} aria-hidden>
          <Info size={14} strokeWidth={2} />
        </span>
      );
    case 'check':
      return (
        <span className={`${wrap} bg-emerald-500/20 text-emerald-300`} aria-hidden>
          <CheckCircle2 size={14} strokeWidth={2} />
        </span>
      );
    case 'lightbulb':
      return (
        <span className={`${wrap} bg-amber-400/15 text-amber-300`} aria-hidden>
          <Lightbulb size={14} strokeWidth={2} />
        </span>
      );
    case 'chart':
      return (
        <span className={`${wrap} bg-slate-500/25 text-slate-300`} aria-hidden>
          <LineChart size={14} strokeWidth={2} />
        </span>
      );
    default:
      return null;
  }
}

function RichFooter({
  footer,
  appearance = 'dark',
}: {
  footer: HeaderTooltipRichFooter;
  appearance?: 'dark' | 'light';
}) {
  const L = appearance === 'light';
  if (footer.kind === 'impact') {
    return (
      <div className="flex flex-wrap items-center gap-2 font-['Inter',sans-serif] text-xs">
        {footer.prefix != null && footer.prefix !== '' ? (
          <span className={L ? 'text-emerald-800' : 'text-emerald-100/90'}>{footer.prefix}</span>
        ) : null}
        <span
          className={
            L
              ? 'rounded-full bg-emerald-500/15 px-2 py-0.5 font-semibold tabular-nums text-emerald-800'
              : 'rounded-full bg-emerald-500/20 px-2 py-0.5 font-semibold tabular-nums text-emerald-200'
          }
        >
          {footer.badge}
        </span>
        <span className={L ? 'text-emerald-800' : 'text-emerald-100/90'}>{footer.sublabel}</span>
      </div>
    );
  }
  if (footer.kind === 'highlight') {
    return (
      <div
        className={`flex items-start gap-2 font-['Inter',sans-serif] text-xs ${L ? 'text-amber-900' : 'text-amber-100/95'}`}
      >
        <Zap size={14} className={`mt-0.5 shrink-0 ${L ? 'text-amber-600' : 'text-amber-400'}`} aria-hidden />
        <span>{footer.text}</span>
      </div>
    );
  }
  if (footer.kind === 'transferTotals') {
    return (
      <div className="flex flex-col gap-0.5 font-['Inter',sans-serif] text-xs tabular-nums">
        <span className={`font-semibold leading-snug ${L ? 'text-[#101828]' : 'text-white'}`}>{footer.unitsLine}</span>
        <span className={`font-normal leading-snug ${L ? 'text-[#667085]' : 'text-[#94A3B8]'}`}>{footer.tripsLine}</span>
      </div>
    );
  }
  if (footer.kind === 'footerCaption') {
    return (
      <p
        className={`font-['Inter',sans-serif] text-sm font-semibold tabular-nums leading-snug ${L ? 'text-[#101828]' : 'text-white'}`}
      >
        {footer.text}
      </p>
    );
  }
  return (
    <div
      className={`flex flex-wrap items-center gap-6 font-['Inter',sans-serif] text-xs tabular-nums ${L ? 'text-[#667085]' : 'text-[#94A3B8]'}`}
    >
      <div className="flex flex-col gap-0.5">
        <span className={`font-semibold ${L ? 'text-[#101828]' : 'text-white'}`}>{footer.l7d}</span>
        <span className={L ? 'text-[#667085]' : 'text-[#94A3B8]'}>L7D</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className={`font-semibold ${L ? 'text-[#101828]' : 'text-white'}`}>{footer.l30d}</span>
        <span className={L ? 'text-[#667085]' : 'text-[#94A3B8]'}>L30D</span>
      </div>
    </div>
  );
}

/**
 * Dark tooltip on hover/focus; fixed + viewport-clamped for scroll containers.
 * Figma: `5560:59694` (top), `5478:57391` (left + optional inline info).
 */
export function AutoneHeaderInfoTooltip(props: AutoneHeaderInfoTooltipProps) {
  const {
    label,
    showIconInTooltip = false,
    iconSize = 14,
    side = 'top',
    hoverWith,
    richBubbleMaxWidthClass,
    richAppearance = 'dark',
    topAlign = 'center',
  } = props;

  const isRich = 'rich' in props && props.rich != null;
  const rich = isRich ? props.rich : undefined;
  const content = !isRich ? props.content : '';

  const isLightRich = isRich && richAppearance === 'light';
  const bubbleBg = !isRich
    ? TOOLTIP_BG
    : isLightRich
      ? RICH_TOOLTIP_BG_LIGHT
      : RICH_TOOLTIP_BG;

  const [visible, setVisible] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [nudge, setNudge] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLButtonElement | HTMLSpanElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();

  const show = useCallback(() => {
    const el = triggerRef.current;
    if (el) setRect(el.getBoundingClientRect());
    setNudge({ x: 0, y: 0 });
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    setVisible(false);
    setRect(null);
    setNudge({ x: 0, y: 0 });
  }, []);

  const layoutKey = isRich
    ? `${rich?.title}\n${rich?.body}\n${JSON.stringify(rich?.footer)}\n${richBubbleMaxWidthClass ?? ''}\n${richAppearance}\n${topAlign}`
    : `${content}\n${topAlign}`;

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
  }, [visible, rect, layoutKey, showIconInTooltip, side, topAlign, nudge.x, nudge.y]);

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

  const richBubbleMaxW =
    richBubbleMaxWidthClass ?? 'max-w-[min(22rem,calc(100vw-24px))]';

  const richBubble = rich ? (
    <div
      className={
        isLightRich
          ? `flex min-w-0 ${richBubbleMaxW} flex-col gap-2 rounded-lg border border-[#E3E8F0] p-4 text-left shadow-[0_4px_16px_-4px_rgba(15,23,42,0.12)]`
          : `flex min-w-0 ${richBubbleMaxW} flex-col gap-3 rounded-lg border border-[#1E293B] p-4 text-left shadow-[0_8px_24px_-6px_rgba(15,23,42,0.45)]`
      }
      style={{ backgroundColor: bubbleBg }}
    >
      <div className={isLightRich ? 'flex gap-2' : 'flex gap-3'}>
        <TitleIcon kind={rich.icon} appearance={richAppearance} />
        <div className="min-w-0 flex-1">
          <p
            className={`font-['Inter',sans-serif] text-sm font-semibold leading-snug ${isLightRich ? 'text-[#101828]' : 'text-white'}`}
          >
            {rich.title}
          </p>
          <p
            className={`mt-1.5 font-['Inter',sans-serif] text-[14px] font-normal leading-relaxed ${isLightRich ? 'text-[#475467]' : 'text-[#94A3B8]'}`}
          >
            {rich.body}
          </p>
        </div>
      </div>
      {rich.footer ? (
        <div className={`border-t pt-2 ${isLightRich ? 'border-[#E3E8F0]' : 'border-[#1E293B]'}`}>
          <RichFooter footer={rich.footer} appearance={richAppearance} />
        </div>
      ) : null}
    </div>
  ) : null;

  const simpleBubble = !isRich ? (
    <div
      className="flex min-w-0 max-w-[min(18rem,calc(100vw-24px))] gap-2 rounded-lg px-4 py-4 text-left shadow-[0_8px_24px_-4px_rgba(15,23,42,0.45)]"
      style={{ backgroundColor: bubbleBg }}
    >
      {showIconInTooltip ? (
        <Info size={18} className="mt-0.5 shrink-0 text-white" strokeWidth={2} aria-hidden />
      ) : null}
      <p className="min-w-0 break-words whitespace-pre-line font-['Inter',sans-serif] text-[14px] font-normal leading-normal text-white">
        {content}
      </p>
    </div>
  ) : null;

  const bubble = isRich ? richBubble : simpleBubble;

  const caretDown = (
    <span
      className="-mt-px border-8 border-transparent"
      style={{ borderTopColor: bubbleBg }}
      aria-hidden
    />
  );

  const caretRight = (
    <span
      className="h-0 w-0 shrink-0 border-y-[8px] border-l-8 border-y-transparent"
      style={{ borderLeftColor: bubbleBg }}
      aria-hidden
    />
  );

  const isTopStart = side === 'top' && topAlign === 'start';

  const wrapClass =
    side === 'top'
      ? `pointer-events-none fixed z-[100] flex max-w-[calc(100vw-24px)] flex-col ${isTopStart ? 'items-start' : 'items-center'}`
      : 'pointer-events-none fixed z-[100] flex max-w-[calc(100vw-24px)] flex-row items-center';

  const triggerClass =
    'inline-flex shrink-0 items-center gap-1.5 rounded px-0.5 text-[#101828] transition-colors hover:text-[#00050a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0267FF]';

  const triggerInner = hoverWith != null ? (
    <span
      ref={triggerRef as React.RefObject<HTMLSpanElement | null>}
      role="button"
      tabIndex={0}
      className={`${triggerClass} cursor-help`}
      aria-label={`More about ${label}`}
      aria-describedby={visible ? tooltipId : undefined}
      onPointerEnter={show}
      onPointerLeave={hide}
      onFocus={show}
      onBlur={hide}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          show();
        }
      }}
    >
      {hoverWith}
      <Info size={iconSize} className="shrink-0 text-[#6A7282]" aria-hidden />
    </span>
  ) : (
    <button
      ref={triggerRef as React.RefObject<HTMLButtonElement | null>}
      type="button"
      className={`${triggerClass} cursor-help rounded p-1 text-[#6A7282] transition-colors hover:bg-slate-100 hover:text-[#101828]`}
      aria-label={`More about ${label}`}
      aria-describedby={visible ? tooltipId : undefined}
      onPointerEnter={show}
      onPointerLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <Info size={iconSize} className="shrink-0" aria-hidden />
    </button>
  );

  return (
    <>
      {triggerInner}
      {visible &&
        rect &&
        createPortal(
          <div
            ref={wrapRef}
            id={tooltipId}
            role="tooltip"
            className={wrapClass}
            style={
              side === 'top'
                ? isTopStart
                  ? ({
                      left: rect.left,
                      top: rect.top - 8,
                      transform: `translate(${nudge.x}px, calc(-100% + ${nudge.y}px))`,
                    } satisfies CSSProperties)
                  : ({
                      left: rect.left + rect.width / 2,
                      top: rect.top - 8,
                      transform: `translate(calc(-50% + ${nudge.x}px), calc(-100% + ${nudge.y}px))`,
                    } satisfies CSSProperties)
                : ({
                    left: rect.left - 8 + nudge.x,
                    top: rect.top + rect.height / 2 + nudge.y,
                    transform: 'translate(-100%, -50%)',
                  } satisfies CSSProperties)
            }
          >
            {side === 'top' ? (
              <>
                {bubble}
                {isTopStart ? (
                  <span
                    className="self-start"
                    style={{ marginLeft: Math.max(0, rect.width / 2 - 8) }}
                    aria-hidden
                  >
                    {caretDown}
                  </span>
                ) : (
                  caretDown
                )}
              </>
            ) : (
              <>
                {bubble}
                {caretRight}
              </>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
