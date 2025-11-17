"use client";

import Image from "next/image";
import { limitText } from "@/utils/function";

// 💡 Tipe data untuk item pesanan
interface OrderHistoryItem {
  order_id: string;
  stuker_nim?: string;
  customer_nim?: string;
  pickup_location: string;
  delivery_location: string;
  order_description: string;
  price_estimation: number;
  delivery_fee: number;
  total_price_estimation?: number;
  order_date?: string;
  status?: string;
  stuker_image?: string;
  stuker_name?: string;
  // Fields from API
  customer_name?: string;
  customer_image?: string;
}

interface OrderCardStukerProps {
  activeOrders: OrderHistoryItem[];
  setOrderDetailVisibility: (value: boolean) => void;
  setSelectedOrder?: (order: OrderHistoryItem) => void;
}

// 💡 Utility konversi ke format Rupiah
function toRupiah(number: number): string {
  if (isNaN(number)) return "Input bukan angka";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}

// =====================================================
// 🔹 KOMPONEN UTAMA
// =====================================================
export default function OrderCardStuker({
  activeOrders,
  setOrderDetailVisibility,
  setSelectedOrder,
}: OrderCardStukerProps) {
  return (
    <div className="flex flex-col gap-y-2">
      {activeOrders.map((order) => (
        <div
          key={order.order_id}
          onClick={() => {
            setSelectedOrder?.(order);
            setOrderDetailVisibility(true);
          }}
          className="border border-gray-300 h-36 p-1 rounded-xl hover:scale-[1.01] cursor-pointer active:opacity-40 transition-all duration-200"
        >
          {/* 🔸 Bagian Atas: Lokasi & Estimasi Biaya */}
          <div className="bg-primary rounded-xl p-2 flex justify-between items-center px-3">
            <div className="flex flex-col justify-center gap-y-1">
              {/* Lokasi Penjemputan */}
              <div className="flex items-center gap-x-2">
                <Image
                  src="/icons/pickup.svg"
                  width={20}
                  height={20}
                  alt="pickup"
                />
                <p className="text-white text-sm">{order.pickup_location}</p>
              </div>

              {/* Lokasi Pengantaran */}
              <div className="flex items-center gap-x-2">
                <Image
                  src="/icons/location.svg"
                  width={22}
                  height={22}
                  alt="delivery"
                />
                <p className="text-white text-sm">{order.delivery_location}</p>
              </div>
            </div>

            {/* Estimasi Harga */}
            <div className="flex flex-col items-end gap-y-1">
              <p className="bg-[#E1CCEC] text-sm rounded-lg px-2 py-1 font-medium text-gray-800">
                {toRupiah(order.price_estimation)}
              </p>
              <p className="bg-[#F49BAB] text-sm rounded-lg px-2 py-1 font-medium text-gray-800">
                {toRupiah(order.delivery_fee)}
              </p>
            </div>
          </div>

          {/* 🔸 Bagian Bawah: Profil & Deskripsi */}
          <div className="flex justify-between items-start p-2">
            {/* Profil Customer */}
            <div className="flex items-center gap-x-2 flex-1">
              <Image
                src={order.customer_image || order.stuker_image || "/images/profilePhoto.png"}
                alt="customer profile"
                width={46}
                height={46}
                className="rounded-full"
              />
              <div>
                <p className="text-md font-medium">
                  {limitText(order.customer_name || order.stuker_name || "Customer", 8)}
                </p>
                <p className="text-sm text-gray-600">Customer</p>
              </div>
            </div>

            {/* Deskripsi Pesanan */}
            <div className="flex-1 border-l pl-2 text-sm text-gray-700 max-h-11 overflow-hidden">
              <p className="text-black text-md leading-snug break-words">
                {order.order_description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
