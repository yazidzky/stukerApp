"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { limitText } from "@/utils/function";

// 💡 Tipe data pesanan
interface OrderHistoryItem {
  order_id: string;
  stuker_nim: string;
  customer_nim: string;
  customer_name?: string;
  pickup_location: string;
  delivery_location: string;
  order_description: string;
  price_estimation: number;
  delivery_fee: number;
  total_price_estimation: number;
  order_date: string;
  status: string; // misal: "completed" | "pending" | "cancelled"
  stuker_image: string;
  stuker_name: string;
  rating?: {
    stars: number;
    comment?: string;
    createdAt?: string | Date;
  } | null;
}

interface OrderCardProps {
  orderHistory: OrderHistoryItem[];
}

// Fungsi untuk format rupiah
function toRupiah(number: number): string {
  if (isNaN(number)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}

// =====================================================
// 🔹 KOMPONEN UTAMA: OrderCard
// =====================================================
export default function OrderCard({ orderHistory }: OrderCardProps) {
  return (
    <div className="flex flex-col gap-y-2">
      {orderHistory.map((order) => (
        <div
          key={order.order_id}
          className="border border-gray-300 h-36 p-1 rounded-xl hover:scale-[1.01] cursor-pointer transition-all duration-200"
        >
          {/* 🔸 Bagian Atas: Lokasi Pickup & Delivery */}
          <div className="bg-primary rounded-xl p-2 flex justify-between items-center px-3">
            <div className="flex flex-col gap-y-1 flex-1">
              {/* Lokasi Penjemputan */}
              <div className="flex items-center gap-x-2">
                <Image
                  src="/icons/pickup.svg"
                  width={20}
                  height={20}
                  alt="pickup"
                />
                <p className="text-white text-sm truncate" title={order.pickup_location}>
                  {limitText(order.pickup_location, 30)}
                </p>
              </div>

              {/* Lokasi Pengantaran */}
              <div className="flex items-center gap-x-2">
                <Image
                  src="/icons/location.svg"
                  width={22}
                  height={22}
                  alt="delivery"
                />
                <p className="text-white text-sm truncate" title={order.delivery_location}>
                  {limitText(order.delivery_location, 30)}
                </p>
              </div>
            </div>
            {order.rating && order.rating.stars ? (
              <div className="flex items-center gap-x-1 ml-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={
                      star <= order.rating!.stars
                        ? "fill-yellow-400 stroke-yellow-400"
                        : "stroke-white/50"
                    }
                  />
                ))}
              </div>
            ) : null}
          </div>

          {/* 🔸 Bagian Bawah: Profil, Total Harga & Tanggal */}
          <div className="flex justify-between items-center p-2">
            {/* Profil Stuker */}
            <div className="flex items-center gap-x-2">
              <Image
                src={order.stuker_image || "/images/profilePhoto.png"}
                alt="stuker profile"
                width={46}
                height={46}
                className="rounded-full"
              />
              <div>
                <p className="text-md font-medium text-gray-800">
                  {limitText(order.customer_name || order.stuker_name, 15)}
                </p>
                <p className="text-sm text-gray-600">Customer</p>
              </div>
            </div>

            {/* Total Harga & Tanggal Pesanan */}
            <div className="flex flex-col justify-end items-end gap-y-1">
              <p className="text-sm font-semibold text-primary">
                {toRupiah(order.total_price_estimation)}
              </p>
              <p className="text-sm text-gray-600 font-medium">
                {order.order_date}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
