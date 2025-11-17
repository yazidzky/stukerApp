"use client";

import Image from "next/image";

interface OrderLocationCardProps {
  pickupLocation: string;
  deliveryLocation: string;
}

// 💡 Komponen ini menampilkan lokasi penjemputan dan pengantaran.
export default function OrderLocationCard({
  pickupLocation,
  deliveryLocation,
}: OrderLocationCardProps) {
  return (
    <div className="bg-[#9767D0] w-[85%] flex flex-col p-3 gap-y-3 rounded-lg">
      {/* 🔹 Lokasi Penjemputan */}
      <div className="flex items-center justify-between gap-x-2">
        <Image src="/icons/pickup.svg" width={24} height={24} alt="pickup" />
        <p className="text-white text-sm font-semibold">{pickupLocation}</p>
      </div>

      {/* 🔹 Lokasi Pengantaran */}
      <div className="flex items-center justify-between gap-x-2">
        <Image
          src="/icons/location.svg"
          width={26}
          height={26}
          alt="delivery"
        />
        <p className="text-white text-sm font-semibold">{deliveryLocation}</p>
      </div>
    </div>
  );
}
