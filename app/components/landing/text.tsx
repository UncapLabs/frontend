import { cn } from "~/lib/utils";

type HeadingProps = {
  as?: "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  dark?: boolean;
} & React.ComponentPropsWithoutRef<
  "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
>;

export function Heading({
  className,
  as: Element = "h2",
  dark = false,
  ...props
}: HeadingProps) {
  return (
    <Element
      {...props}
      data-dark={dark ? "true" : undefined}
      className={cn(
        "text-4xl font-sora font-medium tracking-tighter text-pretty text-neutral-950 data-dark:text-white sm:text-6xl",
        className
      )}
    />
  );
}

export function Subheading({
  className,
  as: Element = "h2",
  dark = false,
  ...props
}: HeadingProps) {
  return (
    <Element
      {...props}
      data-dark={dark ? "true" : undefined}
      className={cn(
        "font-sora text-xs/5 font-semibold tracking-widest text-neutral-600 uppercase data-dark:text-gray-400",
        className
      )}
    />
  );
}

export function Lead({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"p">) {
  return (
    <p
      className={cn(
        "text-2xl font-sora font-normal text-neutral-600",
        className
      )}
      {...props}
    />
  );
}
