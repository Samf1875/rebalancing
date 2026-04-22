import { useId, useState, type ComponentType } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { SCRATCHPAD_852_24160_TOGGLE_PATH } from '../assets/sidebarEdgeToggle85224160';
import { RefreshSyncIcon } from './icons/RefreshSyncIcon';
import { AutoneLogoExpanded } from './icons/AutoneLogoExpanded';
import { AutoneLogoMark } from './icons/AutoneLogoMark';

/** Content width ~240px + horizontal padding (px-4 × 2) so nav labels are not clipped. */
const SIDEBAR_EXPANDED_WIDTH = 272;
const SIDEBAR_COLLAPSED_WIDTH = 72;
/** Matches `h-10 w-10` toggle. */
const EDGE_TOGGLE_PX = 40;
/** Collapsed rail: past centered `size-10` logo (≈16–56px) so the toggle does not overlap. */
const EDGE_TOGGLE_LEFT_COLLAPSED = 56;
/** User avatar — Figma NEW Autone DS 2.0 Sidebar expanded (12299:63282 → Avatar image) */
const USER_AVATAR_SRC =
  'https://www.figma.com/api/mcp/asset/1219bd98-c11e-416a-b2e3-9f49046e360c';

const SIDEBAR_INACTIVE_ICON = 'text-[#9AA4B2]';

/** Avatar stack: Avatar → Container → Image (40px pill), Figma 12299:63282 */
function SidebarUserAvatarImage({ alt }: { alt: string }) {
  return (
    <div className="flex shrink-0 items-center rounded-full" data-name="Avatar" data-node-id="12206:42130">
      <div
        className="flex shrink-0 items-center justify-center rounded-full"
        data-name="Container"
        data-node-id="I12206:42130;12134:33221"
      >
        <div
          className="relative size-10 shrink-0 overflow-hidden rounded-full"
          data-name="Image"
          data-node-id="I12206:42130;12134:33222"
        >
          <img
            src={USER_AVATAR_SRC}
            alt={alt}
            className="pointer-events-none absolute inset-0 size-full max-w-none rounded-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

type NavIconProps = { size?: number; strokeWidth?: number; className?: string };
type LucideLike = ComponentType<NavIconProps>;

function ElementsGridIcon({ className }: Pick<NavIconProps, 'className'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 20 20"
      fill="none"
      className={['shrink-0', className ?? 'text-white'].join(' ')}
      aria-hidden
    >
      <rect
        x="1.66669"
        y="1.66663"
        width="6.66667"
        height="6.66667"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="11.6667"
        y="1.66663"
        width="6.66667"
        height="6.66667"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="1.66669"
        y="11.6666"
        width="6.66667"
        height="6.66667"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="11.6667"
        y="11.6666"
        width="6.66667"
        height="6.66667"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReorderCubeIcon({ className }: Pick<NavIconProps, 'className'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 20 20"
      fill="none"
      className={['shrink-0', className ?? 'text-white'].join(' ')}
      aria-hidden
    >
      <path
        d="M17.5006 8.3335C17.5006 7.55493 17.5006 7.16564 17.4124 6.80999C17.2806 6.27849 17.0058 5.7932 16.6179 5.40672C16.3583 5.14811 16.0245 4.94783 15.3569 4.54726L11.6368 2.31524C10.7389 1.7765 10.29 1.50713 9.81072 1.40189C9.38679 1.30879 8.94772 1.30879 8.52379 1.40189C8.04453 1.50713 7.59558 1.7765 6.69768 2.31524L3.16434 4.43524C2.31455 4.94512 1.88965 5.20006 1.58101 5.55106C1.30788 5.86168 1.10194 6.22541 0.976112 6.61943C0.833923 7.06467 0.833923 7.56018 0.833923 8.55121V11.4491C0.833923 12.4401 0.833923 12.9357 0.976112 13.3809C1.10194 13.7749 1.30788 14.1386 1.58101 14.4493C1.88965 14.8003 2.31455 15.0552 3.16434 15.5651L6.38948 17.5002L7.93247 18.426C8.38142 18.6953 8.60589 18.83 8.84552 18.8826C9.05749 18.9292 9.27703 18.9292 9.48899 18.8826C9.72862 18.83 9.9531 18.6953 10.402 18.426L11.5978 17.7085"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.41736 7.91691L10.1901 5.00024"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.16736 10.4168L16.6674 5.8335M9.16736 10.4168L1.66736 5.8335M9.16736 10.4168V18.7502"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.9152 12.7435V11.5282M12.9152 12.7435C12.9152 12.7435 14.0726 10.8337 16.3874 10.8337C17.0215 10.8337 17.6139 11.0017 18.1236 11.2953M12.9152 12.7435H14.1305M18.6791 15.0351C18.6791 15.0351 17.4718 16.9449 15.5541 16.9449C14.9217 16.9449 14.3287 16.7758 13.818 16.4803M18.6791 15.0351H17.4638M18.6791 15.0351V16.2504"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HomeAssortIcon({ className }: Pick<NavIconProps, 'className'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 20 20"
      fill="none"
      className={['shrink-0', className ?? 'text-white'].join(' ')}
      aria-hidden
    >
      <path
        d="M2.08331 7.91669V14.3751C2.08331 14.9557 2.08331 15.246 2.11939 15.4892C2.33483 16.9415 3.47519 18.0819 4.92755 18.2973C5.17077 18.3334 5.46106 18.3334 6.04165 18.3334L7.65983 18.3334M0.833313 9.16669L6.22874 3.77126C7.5488 2.45121 8.20883 1.79118 8.96992 1.54388C9.6394 1.32636 10.3606 1.32636 11.03 1.54388C11.7911 1.79118 12.4512 2.45121 13.7712 3.77126L19.1666 9.16669"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.266 9.96206L14.2515 8.75337C13.7653 8.46166 13.5222 8.3158 13.2627 8.25881C13.0332 8.20841 12.7955 8.20841 12.5659 8.25881C12.3064 8.3158 12.0633 8.46166 11.5771 8.75337L9.66364 9.90146L9.66364 9.90146C9.2035 10.1775 8.97343 10.3156 8.80632 10.5056C8.65843 10.6738 8.54692 10.8708 8.47878 11.0841C8.40179 11.3252 8.40179 11.5935 8.40179 12.1301V13.6996C8.40179 14.2362 8.40179 14.5045 8.47878 14.7455C8.54692 14.9589 8.65843 15.1558 8.80632 15.324C8.97343 15.5141 9.2035 15.6521 9.66364 15.9282L9.90597 16.0736L11.4101 16.9761L11.5422 17.0553L11.5422 17.0553C12.0404 17.3543 12.2895 17.5037 12.555 17.5601C12.7898 17.61 13.0327 17.6072 13.2663 17.552C13.5304 17.4895 13.776 17.3344 14.2673 17.0241L17.1637 15.1948C17.187 15.1801 17.2083 15.169 17.2324 15.1565L17.2376 15.1538C17.3745 15.0825 17.4269 14.9136 17.4269 14.7593V12.0123C17.4269 11.5907 17.4269 11.3798 17.3791 11.1872C17.3077 10.8995 17.159 10.6368 16.949 10.4275C16.8084 10.2875 16.6276 10.179 16.266 9.96206Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.8834 11.787L13.4687 10.2072"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.9141 13.1405L16.9753 10.6586M12.9141 13.1405L8.85278 10.6586M12.9141 13.1405V17.653"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BuyBagIcon({ className }: Pick<NavIconProps, 'className'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 20 20"
      fill="none"
      className={['shrink-0', className ?? 'text-white'].join(' ')}
      aria-hidden
    >
      <path
        d="M2.7441 8.19252C2.85976 7.1039 2.9176 6.55959 3.04185 6.1002C3.65853 3.82019 5.55549 2.1141 7.88789 1.74177C8.35784 1.66675 8.90521 1.66675 9.99996 1.66675C11.0947 1.66675 11.6421 1.66675 12.112 1.74177C14.4444 2.1141 16.3414 3.82019 16.9581 6.1002C17.0823 6.55959 17.1402 7.1039 17.2558 8.19252L17.4528 10.0467C17.6142 11.5655 17.6949 12.3248 17.6302 12.9504C17.3624 15.541 15.4539 17.663 12.9061 18.203C12.2909 18.3334 11.5272 18.3334 9.99996 18.3334C8.47268 18.3334 7.70904 18.3334 7.09384 18.203C4.546 17.663 2.6375 15.541 2.3697 12.9504C2.30504 12.3248 2.38572 11.5655 2.54709 10.0467L2.7441 8.19252Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.50006 5.83333V7.5C7.50006 8.88071 8.61935 10 10.0001 10C11.3808 10 12.5001 8.88071 12.5001 7.5V5.83333"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IdeaBulbIcon({ className }: Pick<NavIconProps, 'className'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 15 19"
      fill="none"
      className={['shrink-0', className ?? 'text-white'].join(' ')}
      aria-hidden
    >
      <path
        d="M7.41699 0C11.513 0.000176008 14.833 3.32099 14.833 7.41699C14.8328 10.2676 12.751 12.4014 11.4883 13.4463C10.9735 13.8722 10.667 14.451 10.667 15.0225C10.6669 16.7589 9.25892 18.1669 7.52246 18.167H7.32324C5.58017 18.167 4.16725 16.7538 4.16699 15.0107C4.16699 14.4418 3.86548 13.8666 3.3584 13.4424C2.10186 12.3911 0.000161918 10.235 0 7.41699C0 3.32088 3.32088 0 7.41699 0ZM9.16309 15.0859C8.716 15.1755 8.13411 15.25 7.41699 15.25C6.70006 15.25 6.11797 15.1755 5.6709 15.0859C5.7105 15.9656 6.43383 16.667 7.32324 16.667H7.52246C8.40921 16.6669 9.1296 15.9645 9.16309 15.0859ZM7.41699 1.5C4.14931 1.5 1.5 4.14931 1.5 7.41699C1.50017 9.51224 3.10879 11.2776 4.32129 12.292C4.6875 12.5984 5.00759 12.9776 5.24414 13.4082C5.24606 13.4091 5.24809 13.4102 5.25 13.4111L5.24902 13.4102C5.24811 13.4097 5.24676 13.4094 5.24609 13.4092L5.24512 13.4082C5.24609 13.4087 5.25016 13.4111 5.25684 13.4141C5.27096 13.4202 5.29802 13.4317 5.33691 13.4463C5.41541 13.4757 5.5445 13.5187 5.72363 13.5635C6.08266 13.6532 6.64701 13.75 7.41699 13.75C8.18697 13.75 8.75139 13.6532 9.11035 13.5635C9.28942 13.5187 9.41865 13.4757 9.49707 13.4463C9.53589 13.4317 9.56311 13.4202 9.57715 13.4141C9.58392 13.4111 9.58817 13.4085 9.58887 13.4082L9.58789 13.4092C9.58736 13.4094 9.58589 13.4098 9.58496 13.4102L9.58398 13.4111C9.58921 13.4085 9.59435 13.4058 9.59961 13.4033C9.83969 12.9731 10.1641 12.5956 10.5322 12.291C11.7384 11.293 13.3328 9.54807 13.333 7.41699C13.333 4.14942 10.6845 1.50018 7.41699 1.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function AssortmentDotsIcon({ className }: Pick<NavIconProps, 'className'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 20 20"
      fill="none"
      className={['shrink-0', className ?? 'text-white'].join(' ')}
      aria-hidden
    >
      <path
        d="M5.00063 3.33293C5.00063 4.2534 4.25444 4.99959 3.33396 4.99959C2.41349 4.99959 1.6673 4.2534 1.6673 3.33293C1.6673 2.41245 2.41349 1.66626 3.33396 1.66626C4.25444 1.66626 5.00063 2.41245 5.00063 3.33293Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="3.33396"
        cy="16.6664"
        r="1.66667"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="10.0007"
        cy="3.33293"
        r="1.66667"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="10.0007"
        cy="9.99967"
        r="1.66667"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="3.33396"
        cy="9.99967"
        r="1.66667"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="10.0007"
        cy="16.6664"
        r="1.66667"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="16.6673"
        cy="9.99967"
        r="1.66667"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="16.6673"
        cy="3.33293"
        r="1.66667"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="16.6673"
        cy="16.6664"
        r="1.66667"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SidebarCalendarIcon({ className }: Pick<NavIconProps, 'className'>) {
  const clipId = 'sidebar-calendar-clip';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 20 20"
      fill="none"
      className={['shrink-0', className ?? 'text-white'].join(' ')}
      aria-hidden
    >
      <g clipPath={`url(#${clipId})`}>
        <rect
          x="1.66669"
          y="1.66675"
          width="16.6667"
          height="16.6667"
          rx="5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.66669 0.833252L6.66669 3.33325"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.3333 0.833252L13.3333 3.33325"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.1666 6.66675H5.83331"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="6.66665" cy="10.8333" r="0.833333" fill="currentColor" />
        <circle cx="6.66665" cy="14.1666" r="0.833333" fill="currentColor" />
        <circle cx="10" cy="14.1666" r="0.833333" fill="currentColor" />
        <circle cx="13.3333" cy="14.1666" r="0.833333" fill="currentColor" />
        <circle cx="10" cy="10.8333" r="0.833333" fill="currentColor" />
        <circle cx="13.3333" cy="10.8333" r="0.833333" fill="currentColor" />
      </g>
      <defs>
        <clipPath id={clipId}>
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function SidebarHistoryIcon({ className }: Pick<NavIconProps, 'className'>) {
  const clipId = `sidebar-timeline-${useId().replace(/\W/g, '')}`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 20 20"
      fill="none"
      className={['shrink-0', className ?? 'text-white'].join(' ')}
      aria-hidden
    >
      <g clipPath={`url(#${clipId})`}>
        <path
          d="M15.8333 15.8333L18.3333 15.8333"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M1.66669 10L4.16669 10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M15.8333 4.16675L18.3333 4.16675"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M1.66669 15.8333L8.33335 15.8333"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M11.6667 10L18.3334 10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M1.66669 4.16675L8.33335 4.16675"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <rect
          x="10.8333"
          y="1.66675"
          width="5"
          height="5"
          rx="2.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <rect
          x="10.8333"
          y="13.3333"
          width="5"
          height="5"
          rx="2.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <rect
          x="4.16669"
          y="7.5"
          width="5"
          height="5"
          rx="2.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
      <defs>
        <clipPath id={clipId}>
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function SidebarHistoryClockIcon({ className }: Pick<NavIconProps, 'className'>) {
  const clipId = `sidebar-history-clock-${useId().replace(/\W/g, '')}`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 20 20"
      fill="none"
      className={['shrink-0', className ?? 'text-[#08A16A]'].join(' ')}
      aria-hidden
    >
      <g clipPath={`url(#${clipId})`}>
        <rect
          x="1.66669"
          y="1.66675"
          width="16.6667"
          height="16.6667"
          rx="8.33333"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M10 6.66675V10.0001L12.5 11.6667"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id={clipId}>
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

/** Chat — Sidebar element Icon=chat (Figma 12350:172509 → 12353:173494). */
function SidebarChatIcon() {
  return (
    <div
      className="relative shrink-0 size-6 text-white transition-colors group-hover:text-[#0267FF]"
      aria-hidden
      data-node-id="I12350:172509;12203:35386"
    >
      <div className="absolute inset-[4.58%]" data-node-id="I12350:172509;12203:35386;12353:173494">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 18.167 18.167"
          fill="none"
          className="absolute block size-full max-w-none"
        >
          <path
            d="M9.08301 0C14.0993 0.000175944 18.1668 4.06668 18.167 9.08301C18.1668 14.0993 14.0993 18.1668 9.08301 18.167C8.05918 18.167 7.15758 18.0197 6.31055 17.7168C5.95237 17.5887 5.68849 17.4942 5.49707 17.4277C5.40163 17.3946 5.32718 17.3704 5.27148 17.3525C5.24426 17.3438 5.22298 17.3367 5.20703 17.332C5.19935 17.3298 5.19274 17.3283 5.18848 17.3271C5.18557 17.3264 5.18336 17.3255 5.18262 17.3252C4.77707 17.2299 4.51065 17.3073 4.1709 17.4688C3.84936 17.6216 3.2802 17.9722 2.59766 18.0859C1.58046 18.2552 0.675542 17.4223 0.759766 16.3945C0.790682 16.0188 0.932497 15.6867 1.03809 15.4531C1.16184 15.1794 1.2377 15.0323 1.2832 14.874C1.46423 14.2437 1.25147 13.7914 0.836914 12.8965C0.299457 11.7363 4.77694e-05 10.4432 0 9.08301C0.000175813 4.06668 4.06668 0.000175809 9.08301 0ZM5.75 8.25C5.28976 8.25 4.91602 8.62277 4.91602 9.08301C4.91602 9.54325 5.28976 9.91602 5.75 9.91602C6.21009 9.91584 6.58301 9.54314 6.58301 9.08301C6.58301 8.62288 6.21009 8.25018 5.75 8.25ZM9.08301 8.25C8.62277 8.25 8.25 8.62277 8.25 9.08301C8.25 9.54325 8.62277 9.91602 9.08301 9.91602C9.54324 9.91602 9.91602 9.54324 9.91602 9.08301C9.91602 8.62277 9.54325 8.25 9.08301 8.25ZM12.416 8.25C11.9559 8.25018 11.583 8.62288 11.583 9.08301C11.583 9.54314 11.9559 9.91584 12.416 9.91602C12.8763 9.91602 13.25 9.54325 13.25 9.08301C13.25 8.62277 12.8763 8.25 12.416 8.25Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
}

/** Currency — Sidebar element Icon=circle-dollar (Figma 12718:7365 → Vector + Ellipse). */
function SidebarCurrencyIcon() {
  return (
    <div
      className="relative size-6 shrink-0 text-white transition-colors group-hover:text-[#0267FF]"
      aria-hidden
      data-node-id="I12718:7365;12203:35386"
    >
      <div className="absolute inset-[8.33%]">
        <div className="absolute -inset-[4.5%]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 18.1667 18.1667"
            fill="none"
            className="block size-full max-w-none"
          >
            <path
              d="M12.4167 1.44341C11.3959 0.997413 10.2685 0.75 9.08333 0.75C4.48096 0.75 0.75 4.48096 0.75 9.08333C0.75 13.6857 4.48096 17.4167 9.08333 17.4167C13.6857 17.4167 17.4167 13.6857 17.4167 9.08333C17.4167 7.20696 16.7965 5.47543 15.75 4.08252M6.58323 10.75C6.58323 11.6705 7.32942 12.4167 8.2499 12.4167H10.1304C10.9328 12.4167 11.5832 11.7662 11.5832 10.9638C11.5832 10.3385 11.1831 9.78328 10.5898 9.58553L7.57665 8.58114C6.98339 8.38339 6.58323 7.8282 6.58323 7.20285C6.58323 6.40046 7.23369 5.75 8.03608 5.75H9.91656C10.837 5.75 11.5832 6.49619 11.5832 7.41667M9.08323 4.5V13.6667"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="9.08333"
              cy="9.08333"
              r="8.33333"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

/** Language UK flag — Sidebar element Icon=uk (Figma 12350:172510 → Element). Blue field is `bg-[#1a47b8]`. */
function SidebarLanguageUkIcon() {
  return (
    <div className="relative size-6 shrink-0 overflow-hidden" aria-hidden data-node-id="I12350:172510;12203:35386">
      <div
        className="absolute inset-[20.83%_4.17%_16.67%_4.17%] flex flex-col items-center justify-center overflow-hidden rounded-[0.676px] bg-[#1a47b8] shadow-[0px_0px_0.055px_0px_rgba(66,71,76,0.32),0px_0.442px_0.662px_0px_rgba(66,71,76,0.08)]"
        data-name="language-icon"
        data-node-id="I12350:172510;12203:35386;10027:30852"
      >
        <div className="relative h-[15px] w-full shrink-0" data-node-id="I12350:172510;12203:35386;10027:30853">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 18.3333 15"
            fill="none"
            className="pointer-events-none absolute inset-0 block size-full max-w-none"
          >
            <g id="Element">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M1.95029 0H0V2.5L16.3725 15L18.3333 15V12.5L1.95029 0Z"
                fill="white"
              />
              <path
                d="M0.650483 0L18.3333 13.5354V15L17.6981 15L0 1.45056V0H0.650483Z"
                fill="#F93939"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M16.5873 0H18.3333V2.5C18.3333 2.5 6.99269 10.8281 1.74603 15H0V12.5L16.5873 0Z"
                fill="white"
              />
              <path
                d="M18.3333 0H17.7412L0 13.5471V15H0.650483L18.3333 1.46151V0Z"
                fill="#F93939"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.66729 0H11.6813V4.62682H18.3333V10.3701H11.6813V15H6.66729V10.3701H0V4.62682H6.66729V0Z"
                fill="white"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.7193 0H10.614V5.76923H18.3333V9.23077H10.614V15H7.7193V9.23077H0V5.76923H7.7193V0Z"
                fill="#F93939"
              />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

const MAIN_NAV: {
  id: string;
  label: string;
  icon: LucideLike | null;
  active?: boolean;
  submenu?: boolean;
}[] = [
  { id: 'elements', label: 'Dashboard', icon: null },
  { id: 'home', label: 'Replenishment', icon: null },
  { id: 'reorder', label: 'Reorder', icon: null },
  { id: 'refresh', label: 'Rebalancing', icon: null },
  { id: 'buy', label: 'Buying', icon: null },
  { id: 'bulb', label: 'Insights', icon: null, submenu: true },
];

const SECOND_NAV: {
  id: string;
  label: string;
  icon: LucideLike | null;
  active?: boolean;
}[] = [
  { id: 'assortment', label: 'Assortment', icon: null },
  { id: 'calendar', label: 'Events', icon: null },
  { id: 'settings', label: 'Parameters', icon: null },
];

type SidebarProps = {
  className?: string;
  /** Which primary (main) nav item is active — drives highlight and main panel routing. */
  activeMainNavId?: string;
  onMainNavChange?: (id: string) => void;
};

/** Filled vector from Figma Scratchpad 852:24160 (11×11); expand mirrors horizontally. */
function SidebarEdgeToggleIcon({ direction }: { direction: 'collapse' | 'expand' }) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 11 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden
    >
      {direction === 'expand' ? (
        <g transform="translate(11 0) scale(-1 1)">
          <path d={SCRATCHPAD_852_24160_TOGGLE_PATH} fill="currentColor" />
        </g>
      ) : (
        <path d={SCRATCHPAD_852_24160_TOGGLE_PATH} fill="currentColor" />
      )}
    </svg>
  );
}

function navRowClasses(active: boolean, expanded: boolean, alignExpanded: boolean) {
  const base =
    'flex min-h-10 w-full shrink-0 gap-3 rounded px-4 py-2 text-sm transition-colors hover:bg-white/[0.08] hover:text-[#0267FF]';
  const layout = expanded && alignExpanded ? 'items-center justify-start text-left' : 'items-center justify-center';
  if (active) {
    return `${base} ${layout} bg-[#0D7580] text-white`;
  }
  return `${base} ${layout} text-white`;
}

export function Sidebar({
  className = '',
  activeMainNavId = 'home',
  onMainNavChange,
}: SidebarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      style={{ width: expanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH }}
      className={`relative flex h-full shrink-0 flex-col bg-[#12171e] px-4 py-6 transition-[width] duration-200 ease-out ${
        expanded ? 'items-stretch gap-[72px]' : 'items-center gap-[72px]'
      } ${className}`.trim()}
      data-name="Sidebar"
      data-node-id={expanded ? '12212:42693' : '12212:42694'}
    >
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        style={{
          left: expanded ? SIDEBAR_EXPANDED_WIDTH - EDGE_TOGGLE_PX : EDGE_TOGGLE_LEFT_COLLAPSED,
        }}
        className="absolute top-[28px] z-10 flex h-10 w-10 items-center justify-center rounded text-[#6A7282] transition-colors hover:bg-white/[0.08] hover:text-[#0267FF]"
        aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        data-node-id="12203:5655"
      >
        <SidebarEdgeToggleIcon direction={expanded ? 'collapse' : 'expand'} />
      </button>

      <div
        className={`flex min-h-0 min-w-0 w-full flex-1 flex-col ${expanded ? 'items-start gap-8' : 'items-center gap-8'}`}
      >
        <div
          className={`flex shrink-0 items-center ${expanded ? 'w-full justify-start px-4 py-2' : 'size-10 justify-center py-[7.44px]'}`}
          data-node-id="12203:5564"
        >
          {expanded ? (
            <AutoneLogoExpanded />
          ) : (
            <div className="relative size-6 shrink-0 text-white" data-name="Vector" data-node-id="12207:7487">
              <AutoneLogoMark className="absolute inset-0 size-full" />
            </div>
          )}
        </div>

        <nav
          className="flex w-full min-w-0 shrink-0 flex-col gap-1.5"
          data-name="Container"
          data-node-id="12210:36322"
        >
          {MAIN_NAV.map((item) => {
            const Icon = item.icon;
            const active = item.id === activeMainNavId && item.id !== 'home';
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onMainNavChange?.(item.id)}
                className={navRowClasses(active, expanded, true)}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                {item.id === 'elements' ? (
                  <ElementsGridIcon className="text-inherit" />
                ) : item.id === 'home' ? (
                  <HomeAssortIcon className="text-inherit" />
                ) : item.id === 'reorder' ? (
                  <ReorderCubeIcon className="text-inherit" />
                ) : item.id === 'refresh' ? (
                  <RefreshSyncIcon className="text-inherit" />
                ) : item.id === 'buy' ? (
                  <BuyBagIcon className="text-inherit" />
                ) : item.id === 'bulb' ? (
                  <IdeaBulbIcon className="text-inherit" />
                ) : Icon ? (
                  <Icon size={24} strokeWidth={1.5} className="shrink-0 text-inherit" aria-hidden />
                ) : null}
                {expanded && (
                  <>
                    <span className="min-w-0 flex-1 text-left font-medium leading-snug break-words">
                      {item.label}
                    </span>
                    {item.submenu ? (
                      <ChevronDown size={20} strokeWidth={1.5} className="shrink-0 text-inherit opacity-80" aria-hidden />
                    ) : null}
                  </>
                )}
              </button>
            );
          })}

          <div className="my-2 h-px w-full shrink-0 bg-[#22272F]" data-name="divider" aria-hidden />

          {SECOND_NAV.map((item) => {
            const Icon = item.icon;
            const active = Boolean(item.active);
            return (
              <button
                key={item.id}
                type="button"
                className={navRowClasses(active, expanded, true)}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                {item.id === 'assortment' ? (
                  <AssortmentDotsIcon className="text-inherit" />
                ) : item.id === 'calendar' ? (
                  <SidebarCalendarIcon className="text-inherit" />
                ) : item.id === 'settings' ? (
                  <SidebarHistoryIcon className="text-inherit" />
                ) : Icon ? (
                  <Icon size={24} strokeWidth={1.5} className="shrink-0 text-inherit" aria-hidden />
                ) : null}
                {expanded && (
                  <span className="min-w-0 flex-1 text-left font-medium leading-snug break-words">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div
        className={`flex w-full min-w-0 shrink-0 flex-col gap-1.5 ${expanded ? 'items-stretch' : 'items-center'}`}
        data-name="Container"
        data-node-id="12350:172771"
      >
        {expanded ? (
          <>
            <button
              type="button"
              className={`group flex min-h-10 w-full items-center gap-3 rounded px-4 py-2 text-sm transition-colors hover:bg-white/[0.08] hover:text-[#0267FF] ${SIDEBAR_INACTIVE_ICON}`}
              aria-label="Data age"
              data-node-id="13296:17707"
            >
              <SidebarHistoryClockIcon className="text-[#08A16A]" />
              <span className="min-w-0 flex-1 text-left font-normal leading-snug break-words text-white group-hover:text-[#0267FF]">
                Data age
              </span>
              <span className="shrink-0 font-medium text-[#08A16A]">12h</span>
              <ChevronRight size={20} strokeWidth={1.5} className="shrink-0 group-hover:text-[#0267FF]" aria-hidden />
            </button>
            <div className="h-px w-full shrink-0 bg-[#22272F]" aria-hidden />
          </>
        ) : (
          <button
            type="button"
            className={`flex h-10 w-full items-center justify-center gap-3 rounded px-4 py-2 transition-colors hover:bg-white/[0.08] hover:text-[#0267FF] ${SIDEBAR_INACTIVE_ICON}`}
            aria-label="History"
            data-node-id="13296:16152"
          >
            <SidebarHistoryClockIcon className="text-[#08A16A]" />
          </button>
        )}

        {!expanded && <div className="h-px w-full shrink-0 bg-[#22272F]" data-name="divider" aria-hidden />}

        <button
          type="button"
          className={`group flex min-h-10 w-full shrink-0 items-center gap-3 rounded-[4px] px-4 py-2 text-sm transition-colors hover:bg-white/[0.08] hover:text-[#0267FF] ${SIDEBAR_INACTIVE_ICON} ${
            expanded ? 'justify-start text-left' : 'justify-center'
          }`}
          aria-label="Chat"
          data-name="Sidebar element"
          data-node-id="12350:172509"
        >
          <SidebarChatIcon />
          {expanded && (
            <span className="min-w-0 flex-1 text-left font-normal leading-snug break-words text-white group-hover:text-[#0267FF]">
              Chat with us
            </span>
          )}
        </button>

        <button
          type="button"
          className={`group flex min-h-10 w-full shrink-0 items-center gap-3 rounded px-4 py-2 text-sm transition-colors hover:bg-white/[0.08] hover:text-[#0267FF] ${SIDEBAR_INACTIVE_ICON} ${
            expanded ? 'justify-start text-left' : 'justify-center'
          }`}
          aria-label="Currency"
          data-name="Sidebar element"
          data-node-id="12718:7365"
        >
          <SidebarCurrencyIcon />
          {expanded && (
            <span className="min-w-0 flex-1 text-left font-normal leading-snug break-words text-white group-hover:text-[#0267FF]">
              Currency
            </span>
          )}
        </button>

        <button
          type="button"
          className={`group flex min-h-10 w-full shrink-0 items-center gap-3 rounded px-4 py-2 text-sm transition-colors hover:bg-white/[0.08] hover:text-[#0267FF] ${SIDEBAR_INACTIVE_ICON} ${
            expanded ? 'justify-start text-left' : 'justify-center'
          }`}
          aria-label="Language (UK)"
          data-name="Sidebar element"
          data-node-id="12350:172510"
        >
          <SidebarLanguageUkIcon />
          {expanded && (
            <span className="min-w-0 flex-1 text-left font-normal leading-snug break-words text-white group-hover:text-[#0267FF]">
              English
            </span>
          )}
        </button>

        {expanded ? (
          <button
            type="button"
            className="flex h-10 min-h-10 w-full shrink-0 items-center gap-2 rounded-lg py-0 pl-0 pr-4 text-left shadow-[0px_8px_25px_0px_rgba(0,0,0,0.03)] transition-colors hover:bg-white/[0.06]"
            data-name="user-avatar"
            data-node-id="12212:42592"
          >
            <div className="flex min-w-0 min-h-0 flex-1 items-center gap-2">
              <SidebarUserAvatarImage alt="" />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="truncate font-['Inter',sans-serif] text-base font-medium leading-normal text-white">
                  Charles Morenno
                </p>
                <p className="truncate font-['Inter',sans-serif] text-[10px] font-normal leading-normal text-[#878d94]">
                  charlesmorenno@gmail.com
                </p>
              </div>
            </div>
            <ChevronRight size={20} strokeWidth={1.5} className="shrink-0 text-[#9AA4B2]" aria-hidden />
          </button>
        ) : (
          <div
            className="flex shrink-0 items-center justify-center rounded-lg p-0 shadow-[0px_20px_40px_0px_rgba(145,158,171,0.12)]"
            data-name="user-avatar"
            data-node-id="12203:35406"
          >
            <SidebarUserAvatarImage alt="User avatar" />
          </div>
        )}
      </div>
    </aside>
  );
}
