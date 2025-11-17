"use client";

import { MapPin, Truck, ClipboardList } from "lucide-react";

interface OrderSummaryProps {
  pickupLocation: string;
  deliveryLocation: string;
  orderDescription: string;
}

// 💡 Komponen ini menampilkan ringkasan pesanan (lokasi & deskripsi).
export default function OrderSummary({
  pickupLocation,
  deliveryLocation,
  orderDescription,
}: OrderSummaryProps) {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      {/* 🔹 Judul Section */}
      <h2 className="font-semibold text-gray-800 mb-3">Ringkasan Pesanan</h2>

      {/* 🔹 Isi Ringkasan */}
      <div className="space-y-3 scrollbar-hide">
        {/* Lokasi Penjemputan */}
        <div className="flex items-center justify-between text-gray-700">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-purple-600" />
            <span className="text-sm w-1/3">Lokasi Penjemputan</span>
          </div>
          <span className="text-sm font-medium text-gray-900 text-right w-2/3">
            {pickupLocation}
          </span>
        </div>

        {/* Lokasi Pengantaran */}
        <div className="flex items-center justify-between text-gray-700">
          <div className="flex items-center gap-2">
            <Truck size={18} className="text-purple-600" />
            <span className="text-sm w-1/3">Lokasi Pengantaran</span>
          </div>
          <span className="text-sm font-medium text-gray-900 text-right w-2/3">
            {deliveryLocation}
          </span>
        </div>

        {/* Deskripsi Pesanan */}
        <div className="flex items-start justify-between text-gray-700">
          <div className="flex items-center gap-2">
            <ClipboardList size={18} className="text-purple-600 mt-1" />
            <span className="text-sm w-24">Deskripsi Pesanan</span>
          </div>
          <p className="text-sm font-medium text-gray-900 text-right w-2/3 whitespace-pre-wrap break-words overflow-y-auto">
            {orderDescription}
          </p>
        </div>
      </div>
    </div>
  );
}
