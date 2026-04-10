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
/** Rich explainers — aligned with rebalancing onboarding panels */
const RICH_TOOLTIP_BG = '#12171E';

const VIEWPORT_PAD = 12;

export type AutoneHeaderInfoTooltipSide = 'top' | 'left';

export type HeaderTooltipRichFooter =
  | { kind: 'impact'; badge: string; sublabel: string }
  | { kind: 'highlight'; text: string }
  | { kind: 'salesMetrics'; l7d: string; l30d: string };

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
  /**
   * When set, hovering the label + icon opens the tooltip (larger hit area).
   * Omit to keep a compact info-only trigger.
   */
  hoverWith?: ReactNode;
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

function TitleIcon({ kind }: { kind: HeaderTooltipRich['icon'] }) {
  const wrap =
    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full [&_svg]:shrink-0';
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

function RichFooter({ footer }: { footer: HeaderTooltipRichFooter }) {
  if (footer.kind === 'impact') {
    return (
      <div className="flex flex-wrap items-center gap-2 font-['Inter',sans-serif] text-xs">
        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 font-semibold tabular-nums text-emerald-200">
          {footer.badge}
        </span>
        <span className="text-emerald-100/90">{footer.sublabel}</span>
      </div>
    );
  }
  if (footer.kind === 'highlight') {
    return (
      <div className="flex items-start gap-2 font-['Inter',sans-serif] text-xs text-amber-100/95">
        <Zap size={14} className="mt-0.5 shrink-0 text-amber-400" aria-hidden />
        <span>{footer.text}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-6 font-['Inter',sans-serif] text-xs tabular-nums text-[#c9d1d9]">
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-white">{footer.l7d}</span>
        <span className="text-[#9AA4B2]">L7D</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-white">{footer.l30d}</span>
        <span className="text-[#9AA4B2]">L30D</span>
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
  } = props;

  const isRich = 'rich' in props && props.rich != null;
  const rich = isRich ? props.rich : undefined;
  const content = !isRich ? props.content : '';

  const bubbleBg = isRich ? RICH_TOOLTIP_BG : TOOLTIP_BG;

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
    ? `${rich?.title}\n${rich?.body}\n${JSON.stringify(rich?.footer)}`
    : content;

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
  }, [visible, rect, layoutKey, showIconInTooltip, side, nudge.x, nudge.y]);

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

  const richBubble = rich ? (
    <div
      className="flex min-w-0 max-w-[min(22rem,calc(100vw-24px))] flex-col gap-3 rounded-lg border border-[#2a3340] px-4 py-3 text-left shadow-[0_8px_24px_-4px_rgba(15,23,42,0.55)]"
      style={{ backgroundColor: bubbleBg }}
    >
      <div className="flex gap-3">
        <TitleIcon kind={rich.icon} />
        <div className="min-w-0 flex-1">
          <p className="font-['Inter',sans-serif] text-sm font-semibold leading-snug text-white">{rich.title}</p>
          <p className="mt-1.5 font-['Inter',sans-serif] text-[13px] font-normal leading-relaxed text-[#c9d1d9]">
            {rich.body}
          </p>
        </div>
      </div>
      {rich.footer ? (
        <div className="border-t border-[#2a3340] pt-2">
          <RichFooter footer={rich.footer} />
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

  const wrapClass =
    side === 'top'
      ? 'pointer-events-none fixed z-[100] flex max-w-[calc(100vw-24px)] flex-col items-center'
      : 'pointer-events-none fixed z-[100] flex max-w-[calc(100vw-24px)] flex-row items-center';

  const triggerClass =
    'inline-flex shrink-0 items-center gap-1.5 rounded px-0.5 text-[#6A7282] transition-colors hover:text-[#374151] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0267FF]';

  const triggerInner = hoverWith != null ? (
    <span
      ref={triggerRef as React.RefObject<HTMLSpanElement | null>}
      role="button"
      tabIndex={0}
      className={`${triggerClass} cursor-help`}
      aria-label={`More about ${label}`}
      aria-describedby={visible ? tooltipId : undefined}
      onMouseEnter={show}
      onMouseLeave={hide}
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
      <Info size={iconSize} className="shrink-0" aria-hidden />
    </span>
  ) : (
    <button
      ref={triggerRef as React.RefObject<HTMLButtonElement | null>}
      type="button"
      className={triggerClass}
      aria-label={`More about ${label}`}
      aria-describedby={visible ? tooltipId : undefined}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <Info size={iconSize} aria-hidden />
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
                ? ({
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
                {caretDown}
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
