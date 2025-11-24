import { clsx } from 'clsx'

export function Gradient({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'bg-[#FFFBF5]',
        // Sophisticated mesh-like gradient using multiple radial fills
        'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#FFE8CC] via-[#FFFBF5] to-[#E5F0FF]',
        'before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] before:from-[#FFFBF5] before:via-transparent before:to-transparent',
        // Subtle noise texture for premium feel (optional, simulating with opacity)
        'after:absolute after:inset-0 after:bg-white/30'
      )}
    />
  )
}

export function GradientBackground() {
  return (
    <div className="relative mx-auto max-w-7xl">
      <div
        className={clsx(
          'absolute -top-44 -right-60 h-60 w-xl transform-gpu md:right-0',
          'bg-gradient-to-br from-[#FFE8CC] via-[#FFFBF5] to-[#FFE8CC]',
          'rotate-[-10deg] rounded-full blur-3xl opacity-60',
        )}
      />
    </div>
  )
}
