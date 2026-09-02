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

/* ---------- Carte de France métropolitaine (silhouette géographique) ---------- */
export function FranceIcon(p: IconProps) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 96 96"
      {...p}
    >
      {/* Métropole : Flandre, Alsace, Alpes, côte méditerranéenne, Pyrénées, façade atlantique, Bretagne, Cotentin */}
      <path d="M62 8 L66 10 L78 20 L80 28 L74 30 L76 33 L82 38 L74 42 L78 46 L80 55 L72 60 L66 60 L58 61 L50 63 L44 64 L40 66 L34 65 L24 63 L16 62 L14 54 L12 47 L10 42 L9 38 L7 35 L4 34 L0 30 L4 27 L14 27 L18 27 L20 20 L24 27 L30 25 L36 22 L44 18 L52 12 Z" />
      {/* Corse */}
      <path d="M85 67 L90 66 L92 71 L90 80 L86 85 L83 80 L84 70 Z" />
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
