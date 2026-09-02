import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 48 48",
};

export function WindowIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <rect x="8" y="6" width="32" height="36" rx="1" />
      <path d="M24 6v36M8 24h32" />
      <path d="M14 15h4M30 15h4M14 33h4M30 33h4" />
    </svg>
  );
}

export function BayIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <rect x="5" y="8" width="38" height="32" rx="1" />
      <path d="M24 8v32M14 8v32M34 8v32" />
      <path d="M18 24h2M28 24h2" />
    </svg>
  );
}

export function DoorIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <rect x="12" y="5" width="24" height="38" rx="1" />
      <path d="M12 43h24" />
      <circle cx="30" cy="24" r="1.4" />
      <path d="M18 12h12M18 20h12M18 28h12" />
    </svg>
  );
}

export function GateIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M5 40h38M8 40V16l16-8 16 8v24" />
      <path d="M16 40V20M24 40V16M32 40V20" />
    </svg>
  );
}

export function FenceIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M6 14h36M6 24h36M6 34h36" />
      <path d="M12 10v32M24 10v32M36 10v32" />
    </svg>
  );
}

export function PergolaIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M6 14h36M10 14v26M38 14v26" />
      <path d="M6 14l6-6h36l-6 6M14 14v-6M24 14v-6M32 14v-6" />
    </svg>
  );
}

export function ShutterIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <rect x="8" y="6" width="32" height="8" rx="1" />
      <rect x="10" y="16" width="28" height="26" rx="1" />
      <path d="M10 22h28M10 28h28M10 34h28" />
    </svg>
  );
}

export function GarageIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M5 42V18L24 7l19 11v24" />
      <rect x="12" y="22" width="24" height="20" rx="1" />
      <path d="M12 28h24M12 34h24" />
    </svg>
  );
}

export function BadgeIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <circle cx="24" cy="19" r="12" />
      <path d="M17 29l-3 13 10-5 10 5-3-13" />
    </svg>
  );
}

export function FranceIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M12 6l6 3 8-3 6 5 4 2-2 6 3 5-5 6 1 6-8 2-6-4-8 1-1-7-5-4 3-6-2-6z" />
    </svg>
  );
}

export function RulerIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <rect
        x="6"
        y="18"
        width="36"
        height="12"
        rx="1"
        transform="rotate(-45 24 24)"
      />
      <path d="M18 12l3 3M24 18l3 3M30 24l3 3" />
    </svg>
  );
}

export function UserIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <circle cx="24" cy="16" r="8" />
      <path d="M8 40c2-9 8-13 16-13s14 4 16 13" />
    </svg>
  );
}

export function WrenchIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M31 6a10 10 0 00-9 16L8 36a4 4 0 006 6l14-14A10 10 0 0031 6z" />
    </svg>
  );
}

export function PinIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M24 43s14-13 14-24A14 14 0 0010 19c0 11 14 24 14 24z" />
      <circle cx="24" cy="19" r="5" />
    </svg>
  );
}

export function CheckIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <circle cx="24" cy="24" r="18" />
      <path d="M16 24l6 6 12-12" />
    </svg>
  );
}

export function ArrowRight(p: IconProps) {
  return (
    <svg {...base} strokeWidth={2} {...p}>
      <path d="M8 24h30M26 12l12 12-12 12" />
    </svg>
  );
}

export function FacebookIcon(p: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.5 2.9h-2.3v7A10 10 0 0022 12z" />
    </svg>
  );
}

export function MountainMark(p: IconProps) {
  return (
    <svg viewBox="0 0 120 34" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" {...p}>
      <path d="M4 30l20-22 10 12 8-9 14 19M40 30l14-14 22 22M70 30l16-16 30 16" />
    </svg>
  );
}

export const solutionIcons: Record<string, (p: IconProps) => JSX.Element> = {
  window: WindowIcon,
  bay: BayIcon,
  door: DoorIcon,
  gate: GateIcon,
  fence: FenceIcon,
  pergola: PergolaIcon,
  shutter: ShutterIcon,
  garage: GarageIcon,
};
