import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import type { AssortmentRow } from '../types';

const VIEWPORT_PAD = 12;

const SEASONS = ['26e', 'SS25', 'AW25', 'FW25', '25e'];
const EVENTS = ['P01', 'P02', 'P03', 'P04', 'P05'];
const FIRST_SALE_DATES = [
  '18th Dec 25',
  '4th Jan 26',
  '22nd Feb 26',
  '11th Mar 26',
  '6th Apr 26',
];
const DEPARTMENTS = ['Accessoires', 'Mens', 'Womens', 'Kids', 'Footwear'];
const SUB_DEPARTMENTS = ['Moon', 'Solar', 'Eclipse', 'Comet', 'Aurora'];
const MATERIALS = ['6eve06', '8alf12', '4nov03', '2jul21', '7sep14'];
const GENDERS = ['Plat', 'Mens', 'Womens', 'Unisex', 'Kids'];

function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

export type ProductMeta = {
  rrp: string;
  season: string;
  event: string;
  firstSale: string;
  lifeToDateSales: string;
  department: string;
  subDepartment: string;
  material: string;
  gender: string;
};

export function deriveProductMeta(detail: AssortmentRow['productCellDetail']): ProductMeta {
  const seed = hashString(detail.sku);
  const rrpValue = 95 + (seed % 60) * 5; // €95 – €390 in €5 steps
  const lifeSales = 30 + (seed % 220);
  return {
    rrp: `€${rrpValue}`,
    season: SEASONS[seed % SEASONS.length],
    event: EVENTS[(seed >> 3) % EVENTS.length],
    firstSale: FIRST_SALE_DATES[(seed >> 5) % FIRST_SALE_DATES.length],
    lifeToDateSales: lifeSales.toLocaleString(),
    department: DEPARTMENTS[(seed >> 7) % DEPARTMENTS.length],
    subDepartment: SUB_DEPARTMENTS[(seed >> 9) % SUB_DEPARTMENTS.length],
    material: MATERIALS[(seed >> 11) % MATERIALS.length],
    gender: GENDERS[(seed >> 13) % GENDERS.length],
  };
}

function FieldCell({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="font-['Inter',sans-serif] text-[12px] font-normal leading-snug text-[#6A7282]">
        {label}
      </div>
      <div className="mt-1 font-['Inter',sans-serif] text-[14px] font-semibold leading-snug text-[#101828]">
        {value}
      </div>
    </div>
  );
}

type ProductDetailsPopoverProps = {
  detail: AssortmentRow['productCellDetail'];
};

export function ProductDetailsPopover({ detail }: ProductDetailsPopoverProps) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [style, setStyle] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const meta = deriveProductMeta(detail);

  const close = () => {
    setOpen(false);
    setRect(null);
  };

  const toggle = () => {
    if (open) {
      close();
    } else if (triggerRef.current) {
      setRect(triggerRef.current.getBoundingClientRect());
      setOpen(true);
    }
  };

  useLayoutEffect(() => {
    if (!open || !rect || !panelRef.current) return;
    const panel = panelRef.current.getBoundingClientRect();

    let left = rect.left;
    if (left + panel.width > window.innerWidth - VIEWPORT_PAD) {
      left = window.innerWidth - VIEWPORT_PAD - panel.width;
    }
    if (left < VIEWPORT_PAD) left = VIEWPORT_PAD;

    let top = rect.bottom + 6;
    if (top + panel.height > window.innerHeight - VIEWPORT_PAD) {
      const above = rect.top - panel.height - 6;
      top = above >= VIEWPORT_PAD ? above : window.innerHeight - VIEWPORT_PAD - panel.height;
    }
    if (top < VIEWPORT_PAD) top = VIEWPORT_PAD;

    setStyle({ position: 'fixed', top, left, zIndex: 90, visibility: 'visible' });
  }, [open, rect]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const onScroll = () => close();
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      close();
    };
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('pointerdown', onPointerDown, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        className="inline-flex shrink-0 rounded p-0.5 text-[#6A7282] transition-colors hover:bg-slate-100 hover:text-sky-600"
        aria-label="Product details"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <ChevronDown size={14} strokeWidth={2} aria-hidden />
      </button>
      {open
        ? createPortal(
            <div
              ref={panelRef}
              role="dialog"
              aria-label={`Product details: ${detail.title}`}
              className="w-[320px] max-w-[calc(100vw-24px)] rounded-lg border border-[#E3E8F0] bg-white p-4 text-left shadow-[0_8px_30px_-8px_rgba(15,23,42,0.12),0_4px_12px_-4px_rgba(15,23,42,0.08)]"
              style={{ ...style, visibility: style.visibility ?? 'hidden' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rounded-md bg-[#EEF0FE] py-3 text-center">
                <div className="font-['Inter',sans-serif] text-[12px] font-semibold leading-snug text-[#101828]">
                  RRP
                </div>
                <div className="mt-1 font-['Inter',sans-serif] text-[14px] font-normal leading-snug text-[#6A7282]">
                  {meta.rrp}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4">
                <FieldCell label="Season" value={meta.season} />
                <FieldCell label="Event" value={meta.event} />
                <FieldCell label="First sale" value={meta.firstSale} />
                <FieldCell label="Life to date sales" value={meta.lifeToDateSales} />
                <FieldCell label="Department" value={meta.department} />
                <FieldCell label="Sub-department" value={meta.subDepartment} />
                <FieldCell label="Material" value={meta.material} />
                <FieldCell label="Gender" value={meta.gender} />
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
