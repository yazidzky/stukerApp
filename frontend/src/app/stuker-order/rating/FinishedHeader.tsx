"use client";

import Image from "next/image";

interface FinishedHeaderProps {
  imageUrl: string;
  name: string;
  role: string;
}

// 💡 Komponen header untuk halaman Order Finished.
//    Menampilkan foto, nama, dan peran (Customer / Stuker).
export default function FinishedHeader({
  imageUrl,
  name,
  role,
}: FinishedHeaderProps) {
  return (
    <>
      <Image
        src={imageUrl || "/images/profilePhoto.png"}
        alt="profile photo"
        width={84}
        height={84}
        className="rounded-full"
      />
      <div className="text-center">
        <p className="font-semibold text-2xl">{name}</p>
        <p>{role}</p>
      </div>
    </>
  );
}
