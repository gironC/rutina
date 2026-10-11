import { forwardRef, useId } from "react";
import type { ComponentPropsWithoutRef } from "react";
import type { LucideIcon } from "lucide-react";

export type SelectProps = Omit<
  ComponentPropsWithoutRef<"select">,
  "title"
> & {
  icon: LucideIcon;
  title: string;
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ children, className, icon: Icon, id, title, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <div className="mb-2">
        <label className="mb-1 block text-xs" htmlFor={selectId}>
          {title}
        </label>
        <div className="select w-full border border-base-300 transition-colors focus-within:border-primary focus-within:outline-none">
          <Icon
            aria-hidden="true"
            className="size-4 shrink-0 text-base-content/25 mr-2"
          />
          <select
            {...props}
            ref={ref}
            className={`min-w-0 flex-1 bg-base-100 outline-none focus:outline-none ${className ?? ""}`}
            id={selectId}
            title={title}
          >
            {children}
          </select>
        </div>
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;
