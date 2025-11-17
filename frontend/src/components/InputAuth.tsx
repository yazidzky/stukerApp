"use client";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type AllowedTypes = "text" | "email" | "password" | "number" | "tel" | "search";

interface InputFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  id?: string;
  type?: AllowedTypes;
  error?: string | null; // optional error message
  hint?: string | null; // optional small helper text
}

export default function InputField({
  label,
  id,
  type = "text",
  error = null,
  hint = null,
  className = "",
  ...props
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  // generate id if not provided (simple)
  const inputId = id ?? `input-${label.toLowerCase().replace(/\s+/g, "-")}`;

  // adapt inputMode for better mobile keyboard UX
  const inputMode =
    type === "number" ? "numeric" : type === "tel" ? "tel" : undefined;

  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={inputId} className="text-md font-medium text-foreground">
        {label}
      </label>

      <div className="relative">
        <input
          id={inputId}
          type={isPassword && showPassword ? "text" : type}
          inputMode={inputMode}
          {...props}
          className={`w-full rounded-full border px-4 py-2 text-md placeholder-gray-400
            ${
              error
                ? "border-red-400 focus:ring-red-200"
                : "border-gray-300 focus:ring-primary"
            }
            ${isPassword ? "pr-10" : ""}
            focus:outline-none focus:ring-2 transition-all duration-150 ${className}`}
          style={isPassword ? {
            // Hide browser default password reveal button
            WebkitAppearance: 'none',
            MozAppearance: 'textfield'
          } : undefined}
        />
        
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mt-1">
        {hint ? <p className="text-xs text-gray-500">{hint}</p> : <span />}

        {error ? <p className="text-xs text-red-500">{error}</p> : null}
      </div>
    </div>
  );
}
