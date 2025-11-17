"use client";

import { Lock, User, IdCard, Phone } from "lucide-react";
import ProfileField from "./ProfileField";

// 💡 Komponen ini menampung seluruh field profil pengguna
//    Tetap fleksibel untuk menerima data dan fungsi dari parent (ProfilePage)

interface ProfileFieldsSectionProps {
  editedData: {
    name: string;
    nim: string;
    phone: string;
    password: string;
  };
  onFieldChange: (
    field: keyof ProfileFieldsSectionProps["editedData"],
    value: string
  ) => void;
  onPasswordBlur?: (value: string) => void;
}

export default function ProfileFieldsSection({
  editedData,
  onFieldChange,
  onPasswordBlur,
}: ProfileFieldsSectionProps) {
  return (
    <div className="flex flex-col">
      {/* 🔸 Nama pengguna */}
      <ProfileField
        label="Nama pengguna"
        icon={<User size={20} />}
        value={editedData.name}
        editable
        onChange={(v) => onFieldChange("name", v)}
      />

      {/* 🔸 NIM */}
      <ProfileField
        label="NIM"
        icon={<IdCard size={20} />}
        value={editedData.nim}
      />

      {/* 🔸 Nomor telepon */}
      <ProfileField
        label="Nomor telepon"
        icon={<Phone size={20} />}
        value={editedData.phone}
        editable
        onChange={(v) => onFieldChange("phone", v)}
      />

      {/* 🔸 Kata sandi - hanya bisa dilihat, tidak bisa diubah */}
      <ProfileField
        label="Kata sandi"
        icon={<Lock size={20} />}
        value={editedData.password}
        viewOnly
      />
    </div>
  );
}
