import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        className={clsx(
          "inline-flex items-center justify-center cursor-pointer rounded font-medium transition-all",
          "shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:pointer-events-none disabled:opacity-50",
          "active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]",
          {
            "bg-[#DDD] text-black hover:bg-[#DDD]/90 hover:shadow-[0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]":
              variant === "default",
            "bg-[#1a1a1a] text-muted-foreground hover:bg-[#222222] border border-border":
              variant === "secondary",
            "text-muted-foreground hover:text-foreground border border-border bg-background hover:bg-accent":
              variant === "outline",
            "hover:bg-accent shadow-none": variant === "ghost",
          },
          {
            "min-h-9 py-2 px-4 text-sm": size === "sm",
            "min-h-10 py-2.5 px-5 text-sm": size === "md",
            "min-h-11 py-3 px-6 text-base": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
