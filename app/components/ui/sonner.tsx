import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "rounded-xl border bg-white shadow-lg font-sora",
          title: "text-sm font-medium font-sora",
          description: "text-sm text-[#94938D] font-sora",
          actionButton: "bg-[#006CFF] text-white rounded-lg font-sora",
          cancelButton: "bg-[#F5F5F5] text-[#242424] rounded-lg font-sora",
          success: "!border-[#00C853] !bg-[#00C853]/10 [&>div]:!text-[#00C853]",
          error: "!border-red-600 !bg-red-50 [&>div]:!text-red-600",
          warning: "!border-[#FF9300] !bg-[#FF9300]/10 [&>div]:!text-[#FF9300]",
          info: "!border-[#006CFF] !bg-[#006CFF]/10 [&>div]:!text-[#006CFF]",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
