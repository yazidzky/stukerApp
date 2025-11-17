"use client";
import Image from "next/image";
import { useState } from "react";
export default function OrderGuide() {
  const [dropDown, setDropDown] = useState<boolean>(false);
  return (
    <div className="px-1 mb-2">
      <div className="flex gap-x-2 items-center">
        <h1 className="font-medium text-md mb-1">Ketentuan Pemesanan</h1>
        <Image
          src="/icons/dropdown.svg"
          width={26}
          height={26}
          alt="Info"
          className={
            dropDown
              ? "rotate-180 cursor-pointer transition-all duration-200"
              : "rotate-0 cursor-pointer transition-all duration-200"
          }
          onClick={() => setDropDown(!dropDown)}
        />
      </div>
      <ol
        className={`list-disc list-inside space-y-2 text-gray-800 ${
          dropDown ? "bl1ock" : "hidden"
        }`}
      >
        <li className="text-xs">
          Pastiin detail pesananmu lengkap dan rapi biar gampang dipahami ya!
        </li>
        <li className="text-xs">
          Hindari pakai kata-kata yang membingungkan ya, supaya ga salah paham
        </li>
        <li className="text-xs">
          Contoh: “Saya mau pesan pangsit ayam di kantin Mang Elang. Tolong ya
          jangan pakai saus dan kecap. Makasih!”
        </li>
      </ol>
    </div>
  );
}
