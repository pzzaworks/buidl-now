import { InputHTMLAttributes, forwardRef, useId } from "react";
import { clsx } from "clsx";
import { MdCheck } from "react-icons/md";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, checked, onChange, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;

    const checkboxElement = (
      <div className="relative inline-flex">
        <input
          type="checkbox"
          id={checkboxId}
          checked={checked}
          onChange={onChange}
          className={clsx(
            "peer h-5 w-5 cursor-pointer appearance-none rounded border border-border bg-[#1a1a1a]",
            "shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]",
            "checked:bg-[#DDD] checked:border-[#DDD]",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all",
            className
          )}
          ref={ref}
          {...props}
        />
        <MdCheck className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 text-black opacity-0 transition-opacity peer-checked:opacity-100" />
      </div>
    );

    if (!label) {
      return checkboxElement;
    }

    return (
      <div className="flex items-center gap-2">
        {checkboxElement}
        <label
          htmlFor={checkboxId}
          className="text-sm cursor-pointer select-none"
        >
          {label}
        </label>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
