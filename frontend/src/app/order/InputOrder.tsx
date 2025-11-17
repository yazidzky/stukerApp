"use client";
import React from "react";

type AllowedTypes = "text" | "email" | "password" | "number" | "tel" | "search";

interface InputFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  placeholder: string;
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
  // generate id if not provided (simple)
  const inputId = id ?? `input-${label.toLowerCase().replace(/\s+/g, "-")}`;

  // adapt inputMode for better mobile keyboard UX
  const inputMode =
    type === "number" ? "numeric" : type === "tel" ? "tel" : undefined;

  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={inputId} className="text-sm font-medium text-foreground">
        {label}
      </label>

      <input
        id={inputId}
        type={type}
        inputMode={inputMode}
        {...props}
        className={`w-full rounded-full border px-4 py-2 text-sm placeholder-gray-400
          ${
            error
              ? "border-red-400 focus:ring-red-200"
              : "border-gray-300 focus:ring-primary"
          }
          focus:outline-none focus:ring-1 transition-all duration-150 ${className}`}
      />

      <div className="flex items-center justify-between mt-1">
        {hint ? <p className="text-xs text-gray-500">{hint}</p> : <span />}

        {error ? <p className="text-xs text-red-500">{error}</p> : null}
      </div>
    </div>
  );
}
