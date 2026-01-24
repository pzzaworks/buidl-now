import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  variant?: "secondary" | "primary";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size = "md", variant = "secondary", style, ...props }, ref) => {
    return (
      <button
        className={clsx(
          "inline-flex items-center justify-center gap-2 cursor-pointer font-medium transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blue-500)]/20",
          "disabled:pointer-events-none disabled:opacity-40",
          "rounded-[var(--radius-12)]",
          // Variants
          variant === "primary" && [
            "bg-[var(--color-gray-0)] text-[var(--color-gray-950)]",
            "border border-[var(--color-blue-500)]",
            "shadow-[0_0_0_3px_rgba(51,92,255,0.2)]",
            "hover:bg-[var(--color-blue-50)] active:bg-[var(--color-blue-100)]",
          ],
          variant === "secondary" && [
            "bg-[var(--color-gray-0)] text-[var(--color-gray-950)]",
            "border border-[var(--color-gray-200)]",
            "hover:bg-[var(--color-gray-50)] active:bg-[var(--color-gray-100)]",
          ],
          // Sizes
          {
            "h-9 min-h-9 px-4 text-sm": size === "sm",
            "h-11 min-h-11 px-4 text-sm": size === "md",
            "h-12 min-h-12 px-5 text-[15px]": size === "lg",
          },
          className
        )}
        style={style}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
