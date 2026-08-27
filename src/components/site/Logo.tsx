import legacyLogo from "@/assets/fact360-logo.png";
import newLogo from "@/assets/fact360-logo-v2.png";

export function Logo({
  inverse = false,
  className = "",
  size = "md",
  variant = "primary",
}: {
  inverse?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  /** "legacy" keeps the original mark (used in the footer). */
  variant?: "primary" | "legacy";
}) {
  const src = variant === "legacy" ? legacyLogo : newLogo;
  const h = size === "lg" ? "h-14" : size === "sm" ? "h-9" : "h-12";
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {inverse ? (
        <div className="rounded-md bg-white px-2 py-1 shadow-sm">
          <img src={src} alt="FACT 360°" className={`${h} w-auto object-contain`} />
        </div>
      ) : (
        <img src={src} alt="FACT 360°" className={`${h} w-auto object-contain`} />
      )}
    </div>
  );
}
