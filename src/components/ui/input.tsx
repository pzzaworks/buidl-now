import { InputHTMLAttributes, forwardRef, useState } from "react";
import { clsx } from "clsx";
import { MdContentCopy, MdCheck, MdClear } from "react-icons/md";
import { Button } from "./button";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  showCopy?: boolean;
  showClear?: boolean;
  onClearClick?: () => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, showCopy, showClear, onClearClick, value, onBlur, onChange, ...props }, ref) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      if (value) {
        await navigator.clipboard.writeText(String(value));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const trimmedValue = e.target.value.trim();
      if (trimmedValue !== e.target.value && onChange) {
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: trimmedValue },
          currentTarget: { ...e.currentTarget, value: trimmedValue },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
      onBlur?.(e);
    };

    const inputElement = (
      <input
        type={type}
        className={clsx(
          "flex h-10 w-full rounded border border-border bg-[#1a1a1a] px-3 py-2 text-sm",
          "shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 focus-visible:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all overflow-x-auto",
          "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          className
        )}
        ref={ref}
        value={value}
        onChange={onChange}
        onBlur={handleBlur}
        {...props}
      />
    );

    // If no label, copy, or clear - return plain input
    if (!label && !showCopy && !showClear) {
      return inputElement;
    }

    return (
      <div className="w-full">
        {/* Label and Actions Row */}
        {(label || showCopy || showClear) && (
          <div className="mb-2 flex items-center justify-between">
            {label && <label className="text-sm">{label}</label>}
            <div className="flex items-center gap-2">
              {showCopy && value && (
                <Button
                  type="button"
                  onClick={handleCopy}
                  variant="ghost"
                  size="sm"
                  className="h-auto min-h-0 px-2 py-1 text-xs"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <>
                      <MdCheck className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-blue-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <MdContentCopy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              )}
              {showClear && value && onClearClick && (
                <Button
                  type="button"
                  onClick={onClearClick}
                  variant="ghost"
                  size="sm"
                  className="h-auto min-h-0 px-2 py-1 text-xs"
                  title="Clear"
                >
                  <MdClear className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </Button>
              )}
            </div>
          </div>
        )}
        {inputElement}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
