import { MountainMark } from "./icons";

export default function SectionHeading({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <MountainMark className="h-5 w-24 text-navy/70" />
      <h2 className="section-title">{children}</h2>
    </div>
  );
}
