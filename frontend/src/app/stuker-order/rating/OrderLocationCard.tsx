"use client";
import Image from "next/image";

interface OrderLocationCardProps {
  pickupLocation: string;
  deliveryLocation: string;
}

export default function OrderLocationCard({
  pickupLocation,
  deliveryLocation,
}: OrderLocationCardProps) {
  return (
    <div className="bg-primary w-[80%] flex flex-col p-3 gap-y-3 rounded-lg">
      <div className="flex items-center justify-between gap-x-2">
        <Image src="/icons/pickup.svg" width={24} height={24} alt="pickup" />
        <p className="text-white text-sm">{pickupLocation}</p>
      </div>
      <div className="flex items-center justify-between gap-x-2">
        <Image
          src="/icons/location.svg"
          width={26}
          height={26}
          alt="delivery"
        />
        <p className="text-white text-sm">{deliveryLocation}</p>
      </div>
    </div>
  );
}
