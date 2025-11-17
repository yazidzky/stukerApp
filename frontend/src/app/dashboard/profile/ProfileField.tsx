"use client";
import { useState, useEffect } from "react";
import { Pencil, Eye, EyeOff } from "lucide-react";

interface ProfileFieldProps {
  label: string; // Nama field (misal: "Nama pengguna")
  icon: React.ReactNode; // Icon dari lucide-react atau lainnya
  value: string; // Nilai awal
  editable?: boolean; // Apakah bisa diedit
  viewOnly?: boolean; // Apakah hanya bisa dilihat (untuk password yang tidak bisa diubah)
  onChange?: (newValue: string) => void; // Callback kalau value berubah
  onBlur?: (newValue: string) => void; // Callback khusus ketika field kehilangan fokus
}

export default function ProfileField({
  label,
  icon,
  value,
  editable = false,
  viewOnly = false,
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
    // Panggil onBlur callback jika ada (untuk password khusus)
    if (onBlur) {
      onBlur(inputValue);
    }
    onChange?.(inputValue);
  };

  // Untuk password yang hanya bisa dilihat (viewOnly)
  // Jika showPassword false, tampilkan asterisk sesuai panjang password asli
  // Jika showPassword true, tampilkan password asli
  const displayValue = viewOnly && !showPassword 
    ? "*".repeat(value.length > 0 ? value.length : 8) 
    : value;

  return (
    <div className="flex items-center gap-5 border border-gray-300 rounded-xl p-3 mb-3 shadow-sm">
      {/* Icon */}
      <div className="text-gray-500">{icon}</div>

      {/* Content */}
      <div className="flex-1">
        <p className="text-xs text-gray-500">{label}</p>

        {isEditing && !viewOnly ? (
          <input
            type="text"
            className="w-full border-b border-gray-400 focus:outline-none text-gray-800 font-medium"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleSave}
            autoFocus
          />
        ) : (
          <p className="text-gray-900 font-medium">{displayValue}</p>
        )}
      </div>

      {/* Tombol untuk viewOnly (password yang hanya bisa dilihat) */}
      {viewOnly && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          {showPassword ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      )}

      {/* Tombol edit untuk field yang bisa diedit */}
      {editable && !isEditing && !viewOnly && (
        <button
          onClick={() => setIsEditing(true)}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <Pencil size={18} />
        </button>
      )}
    </div>
  );
}
