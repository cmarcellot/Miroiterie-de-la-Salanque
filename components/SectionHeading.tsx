import Image from "next/image";

export default function SectionHeading({
  children,
  className = "",
  variant = "dark",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "dark" | "light";
}) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <Image
        src={
          variant === "light"
            ? "/logo/mds-montagnes-blanc.png"
            : "/logo/mds-montagnes-bleu.png"
        }
        alt=""
        width={598}
        height={195}
        className="h-8 w-auto"
        aria-hidden
      />
      <h2 className="section-title">{children}</h2>
    </div>
  );
}
