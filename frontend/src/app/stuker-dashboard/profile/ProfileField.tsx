"use client";
import { useState, useEffect } from "react";
import { Pencil, Eye, EyeOff } from "lucide-react";

interface ProfileFieldProps {
  label: string; // Nama field (misal: "Nama pengguna")
  icon: React.ReactNode; // Icon dari lucide-react atau lainnya
  value: string; // Nilai awal
  editable?: boolean; // Apakah bisa diedit
  onChange?: (newValue: string) => void; // Callback kalau value berubah
  onBlur?: (value: string) => void; // Callback kalau field kehilangan fokus
}

export default function ProfileField({
  label,
  icon,
  value,
  editable = false,
  onChange,
  onBlur,
}: ProfileFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [showPassword, setShowPassword] = useState(false);

  // Sync inputValue with value prop when it changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSave = () => {
    setIsEditing(false);
    onChange?.(inputValue);
    onBlur?.(inputValue);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Determine if this is a password field
  const isPasswordField =
    label.toLowerCase().includes("kata sandi") ||
    label.toLowerCase().includes("password");

  return (
    <div className="flex items-center gap-5 border border-gray-300 rounded-xl p-3 mb-3 shadow-sm">
      {/* Icon */}
      <div className="text-gray-500">{icon}</div>

      {/* Content */}
      <div className="flex-1">
        <p className="text-xs text-gray-500">{label}</p>

        {isEditing ? (
          <input
            type={isPasswordField && !showPassword ? "password" : "text"}
            className="w-full border-b border-gray-400 focus:outline-none text-gray-800 font-medium"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleSave}
            autoFocus
          />
        ) : (
          <p 
            className={`text-gray-900 font-medium ${editable && isPasswordField ? 'cursor-pointer hover:text-gray-700' : ''}`}
            onClick={editable && isPasswordField ? () => setIsEditing(true) : undefined}
          >
            {isPasswordField && !isEditing
              ? showPassword
                ? inputValue
                : "•".repeat(inputValue.length)
              : inputValue}
          </p>
        )}
      </div>

      {/* Tombol edit dan toggle password visibility */}
      <div className="flex items-center gap-2">
        {editable && isPasswordField && !isEditing && (
          <button
            onClick={togglePasswordVisibility}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {editable && !isEditing && !isPasswordField && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <Pencil size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
