import { clsx } from "clsx";

export function Gradient({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        "bg-[#FFFBF5]",
        // Linear gradient from Orange (left/Borrow) to Blue (right/USDU) to match the cards
        "bg-gradient-to-r from-[#FFE8CC]/80 via-[#FFFBF5] to-[#E5F0FF]/80",
        // Subtle noise texture for premium feel
        "after:absolute after:inset-0 after:rounded-4xl after:bg-white/40 after:mix-blend-overlay"
      )}
    />
  );
}

export function GradientBackground() {
  return (
    <div className="relative mx-auto max-w-7xl">
      <div
        className={clsx(
          "absolute -top-44 -right-60 h-60 w-xl transform-gpu md:right-0",
          "bg-gradient-to-br from-[#FFE8CC] via-[#FFFBF5] to-[#FFE8CC]",
          "rotate-[-10deg] rounded-full blur-3xl opacity-60"
        )}
      />
    </div>
  );
}
