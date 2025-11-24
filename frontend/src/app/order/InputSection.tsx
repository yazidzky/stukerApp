"use client";
import Image from "next/image";
import InputOrder from "./InputOrder";
import { useState } from "react";

export default function InputSection() {
  const [formData, setFormData] = useState({
    description: "",
    itemPrice: "",
    deliveryFee: "",
    pickupLoc: "",
    deliveryLoc: "",
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  // Expose form data to parent component
  (window as unknown as {
    getOrderFormData?: () => typeof formData;
  }).getOrderFormData = () => formData;

  return (
    <div className="w-[98%] justify-self-center">
      <textarea
        value={formData.description}
        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        placeholder="Tuliskan detail order kamu disini...."
        className="w-full h-40 p-3 text-sm border-1 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none"
      />
      <InputOrder
        label="Perkiraan Biaya (Rp)"
        type="number"
        placeholder="Contoh: 30000"
        value={formData.itemPrice}
        onChange={handleChange('itemPrice')}
      />
      <InputOrder
        label="Ongkos (Rp)"
        type="number"
        placeholder="Contoh: 5000"
        value={formData.deliveryFee}
        onChange={handleChange('deliveryFee')}
      />
      <div className="flex mt-2 gap-x-4">
        <Image
          src={"/icons/pickup-black.svg"}
          alt="Pickup"
          width={36}
          height={36}
        />
        <InputOrder
          label="Lokasi Pengambilan"
          type="text"
          placeholder="Contoh: Kantin atas dekat pohon"
          value={formData.pickupLoc}
          onChange={handleChange('pickupLoc')}
        />
      </div>
      <div className="flex mt-2 gap-x-4">
        <Image
          src={"/icons/location-black.svg"}
          alt="Pickup"
          width={38}
          height={38}
        />
        <InputOrder
          label="Lokasi Penerimaan"
          type="text"
          placeholder="Contoh: Lantai 4 FST, R 4.10"
          value={formData.deliveryLoc}
          onChange={handleChange('deliveryLoc')}
        />
      </div>
    </div>
  );
}
