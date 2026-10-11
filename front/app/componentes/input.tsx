"use client";

import { forwardRef, useId, useState } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";

export type InputProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "title"
> & {
  error?: string;
  icon: LucideIcon;
  title: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { error, icon: Icon, title, id, type = "text", className, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const isPassword = type === "password";
    const [showPassword, setShowPassword] = useState(false);
    const inputType = isPassword && showPassword ? "text" : type;
    const describedBy = [props["aria-describedby"], error && errorId]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="mb-2">
        <label className="mb-1 block text-xs" htmlFor={inputId}>
          {title}
        </label>
        <div className="input w-full border border-base-300 transition-colors focus-within:border-primary focus-within:outline-none">
          <Icon
            aria-hidden="true"
            className="size-4 shrink-0 text-base-content/25 mr-1"
          />
          <input
            {...props}
            ref={ref}
            className={`min-w-0 flex-1 bg-base-100 outline-none focus:outline-none ${className ?? ""}`}
            id={inputId}
            title={title}
            type={inputType}
            aria-describedby={describedBy || undefined}
            aria-invalid={error ? true : props["aria-invalid"]}
          />
          {isPassword && (
            <button
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="btn btn-link btn-primary btn-xs"
              disabled={props.disabled}
              onClick={() => setShowPassword((visible) => !visible)}
              type="button"
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" className="size-4" />
              ) : (
                <Eye aria-hidden="true" className="size-4" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="text-xs text-error" id={errorId}>
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
