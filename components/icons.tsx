import type { SVGProps } from "react";
import {
  ArrowRight as LArrowRight,
  Award,
  Blinds,
  CircleCheck,
  Columns2,
  DoorClosed,
  DoorOpen,
  Facebook,
  Fence,
  Grid2x2,
  House,
  MapPin,
  MountainSnow,
  Ruler,
  UserCheck,
  Warehouse,
  Wrench,
  type LucideProps,
} from "lucide-react";

type IconProps = SVGProps<SVGSVGElement>;

const l = (p: LucideProps): LucideProps => ({
  strokeWidth: 1.4,
  absoluteStrokeWidth: true,
  ...p,
});

/* ---------- Menuiseries ---------- */
export const WindowIcon = (p: LucideProps) => <Grid2x2 {...l(p)} />;
export const BayIcon = (p: LucideProps) => <Columns2 {...l(p)} />;
export const DoorIcon = (p: LucideProps) => <DoorOpen {...l(p)} />;
export const GateIcon = (p: LucideProps) => <DoorClosed {...l(p)} />;
export const FenceIcon = (p: LucideProps) => <Fence {...l(p)} />;
export const PergolaIcon = (p: LucideProps) => <House {...l(p)} />;
export const ShutterIcon = (p: LucideProps) => <Blinds {...l(p)} />;
export const GarageIcon = (p: LucideProps) => <Warehouse {...l(p)} />;

/* ---------- Atouts / services ---------- */
export const BadgeIcon = (p: LucideProps) => <Award {...l(p)} />;
export const RulerIcon = (p: LucideProps) => <Ruler {...l(p)} />;
export const UserIcon = (p: LucideProps) => <UserCheck {...l(p)} />;
export const WrenchIcon = (p: LucideProps) => <Wrench {...l(p)} />;

/* ---------- Divers ---------- */
export const PinIcon = (p: LucideProps) => <MapPin {...l(p)} />;
export const CheckIcon = (p: LucideProps) => <CircleCheck {...l(p)} />;
export const ArrowRight = (p: LucideProps) => <LArrowRight {...l(p)} />;
export const FacebookIcon = (p: LucideProps) => <Facebook {...p} />;
export const MountainMark = (p: LucideProps) => <MountainSnow {...l(p)} />;

/* ---------- Carte de France (silhouette dessinée à la main) ---------- */
export function FranceIcon(p: IconProps) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 48 48"
      {...p}
    >
      <path d="M30 8 L38 14 L39 20 L37 23 L38 27 L38 32 L31 34 L24 35 L20 34 L17 33 L15 31 L14 27 L13 24 L14 20 L10 20 L6 18 L10 16 L14 13 L15 9 L18 12 L22 9 Z" />
      <path d="M41 34l2 1-1 4-2-1z" />
    </svg>
  );
}

export const solutionIcons: Record<string, (p: LucideProps) => JSX.Element> = {
  window: WindowIcon,
  bay: BayIcon,
  door: DoorIcon,
  gate: GateIcon,
  fence: FenceIcon,
  pergola: PergolaIcon,
  shutter: ShutterIcon,
  garage: GarageIcon,
};
