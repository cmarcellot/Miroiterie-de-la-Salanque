import type { SVGProps } from "react";
import {
  Award,
  Blinds,
  DoorOpen,
  Fence,
  Ruler,
  UserCheck,
  Warehouse,
  Wrench,
  type LucideProps,
} from "lucide-react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 48 48",
};

const lucide = (p: LucideProps) => ({ strokeWidth: 1.4, absoluteStrokeWidth: true, ...p });

/* ---------- Menuiseries : dessins maison (verre / vitrage) ---------- */

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

export function GateIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M5 40h38M8 40V16l16-8 16 8v24" />
      <path d="M16 40V20M24 40V16M32 40V20" />
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

/* ---------- Menuiseries : icônes Lucide (plus fidèles) ---------- */

export const DoorIcon = (p: LucideProps) => <DoorOpen {...lucide(p)} />;
export const FenceIcon = (p: LucideProps) => <Fence {...lucide(p)} />;
export const ShutterIcon = (p: LucideProps) => <Blinds {...lucide(p)} />;
export const GarageIcon = (p: LucideProps) => <Warehouse {...lucide(p)} />;

/* ---------- Atouts / services ---------- */

export const BadgeIcon = (p: LucideProps) => <Award {...lucide(p)} />;
export const RulerIcon = (p: LucideProps) => <Ruler {...lucide(p)} />;
export const UserIcon = (p: LucideProps) => <UserCheck {...lucide(p)} />;
export const WrenchIcon = (p: LucideProps) => <Wrench {...lucide(p)} />;

/* ---------- Carte de France (silhouette dessinée à la main) ---------- */

export function FranceIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M30 8 L38 14 L39 20 L37 23 L38 27 L38 32 L31 34 L24 35 L20 34 L17 33 L15 31 L14 27 L13 24 L14 20 L10 20 L6 18 L10 16 L14 13 L15 9 L18 12 L22 9 Z" />
      <path d="M41 34l2 1-1 4-2-1z" />
    </svg>
  );
}

/* ---------- Divers ---------- */

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
    <svg
      viewBox="0 0 120 34"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinejoin="round"
      {...p}
    >
      <path d="M4 30l20-22 10 12 8-9 14 19M40 30l14-14 22 22M70 30l16-16 30 16" />
    </svg>
  );
}

export const solutionIcons: Record<
  string,
  (p: IconProps & LucideProps) => JSX.Element
> = {
  window: WindowIcon,
  bay: BayIcon,
  door: DoorIcon,
  gate: GateIcon,
  fence: FenceIcon,
  pergola: PergolaIcon,
  shutter: ShutterIcon,
  garage: GarageIcon,
};
