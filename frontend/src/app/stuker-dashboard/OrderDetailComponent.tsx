"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import CustomerSection from "./CustomerSection";
import OrderSummary from "./OrderSummary";
import PaymentSummary from "./PaymentSummary";
import Button from "@/components/ButtonPrimary";
import OrderUnavailableModal from "@/components/OrderUnavailableModal";
import { orderAPI } from "@/utils/function";
import { useState } from "react";
import type { Order } from "@/store/slices/orderSlice";

interface OrderDetailComponentProps {
  setOrderDetailVisibility: (value: boolean) => void;
  orderDetailVisibility: boolean;
  orderData?: Order | null; // Add orderData prop
  onOrderAccepted?: () => void; // Add callback for refresh
}

export default function OrderDetailComponent({
  setOrderDetailVisibility,
  orderDetailVisibility,
  orderData,
  onOrderAccepted,
}: OrderDetailComponentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);

  // 🔹 Data dummy (sementara) - fallback if no orderData
  const fallbackData = {
    order_id: "001",
    customer_name: "Marip Ramadan",
    customer_nim: "81829919221",
    pickup_location: "Kantin atas dekat pohon",
    pickupLoc: "Kantin atas dekat pohon",
    customer_rate: 49,
    delivery_location: "Lantai 4 FST, R 420",
    deliveryLoc: "Lantai 4 FST, R 420",
    order_description: "Deskripsi orderannya sayang",
    description: "Deskripsi orderannya sayang",
    price_estimation: 10000,
    itemPrice: 10000,
    delivery_fee: 5000,
    deliveryFee: 5000,
    total_price_estimation: 15000,
    order_date: "Mei, 5",
    status: "completed",
    customer_image: "/images/profilePhoto.png",
  };

  // =====================================================
  // 🔹 RENDER UI
  // =====================================================
  return (
    <>
      {/* 🔸 Overlay (klik di luar untuk menutup modal) */}
      {orderDetailVisibility && (
        <div
          className="fixed inset-0 bg-black opacity-20 backdrop-blur-[1px] z-40 transition-opacity duration-300"
          onClick={() => setOrderDetailVisibility(false)}
        ></div>
      )}

      {/* 🔸 Kontainer utama */}
      <div
        className={`z-50 w-full h-[96vh] bg-gray-100 absolute fixed border-t border-gray-300 ${
          orderDetailVisibility
            ? "translate-y-4 opacity-100"
            : "translate-y-full opacity-0"
        } -translate-x-1/2 -translate-y-1/2 rounded-3xl left-1/2 p-3 duration-300 transition-all max-w-112 flex flex-col gap-y-2`}
      >
        {/* 🔹 Header */}
        <div className="flex justify-between items-center">
          <p className="font-medium text-lg self-end">Pemesan</p>
          <Image
            src="/icons/close.svg"
            alt="Close"
            width={30}
            height={30}
            onClick={() => setOrderDetailVisibility(false)}
            className="text-primary hover:scale-105 opacity-90 hover:opacity-100 cursor-pointer active:opacity-10"
          />
        </div>

        {/* 🔹 Informasi Customer */}
        <CustomerSection
          customerName={(orderData?.customer_name) || fallbackData.customer_name}
          customerImage={(orderData?.customer_image) || fallbackData.customer_image}
          customerRate={(orderData?.customer_rate) || fallbackData.customer_rate}
        />

        {/* 🔹 Rincian Order dan Pembayaran */}
        <div className="space-y-2 max-h-[60vh] overflow-scroll scrollbar-hide">
          <OrderSummary
            pickupLocation={(orderData?.pickup_location) || fallbackData.pickup_location || fallbackData.pickupLoc}
            deliveryLocation={(orderData?.delivery_location) || fallbackData.delivery_location || fallbackData.deliveryLoc}
            orderDescription={(orderData?.order_description) || fallbackData.order_description || fallbackData.description}
          />
          <PaymentSummary
            priceEstimation={(orderData?.price_estimation) ?? fallbackData.price_estimation ?? fallbackData.itemPrice}
            deliveryFee={(orderData?.delivery_fee) ?? fallbackData.delivery_fee ?? fallbackData.deliveryFee}
          />
        </div>

        {/* 🔹 Tombol Aksi */}
        {orderData && (
          <Button
            label={loading ? "Menerima..." : "Terima Pesanan"}
            className="mt-2"
            onClick={async () => {
              if (!orderData || !orderData.order_id) return;
              try {
                setLoading(true);
                await orderAPI.acceptOrder(orderData.order_id);
                // Store orderId for process page
                localStorage.setItem('currentOrderId', orderData.order_id);
                // Call callback to refresh orders
                onOrderAccepted?.();
                setOrderDetailVisibility(false);
                router.push("/stuker-order/process");
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Gagal menerima pesanan";
                if (
                  errorMessage.includes("tidak tersedia") ||
                  errorMessage.includes("sudah diambil") ||
                  errorMessage.includes("tidak ditemukan") ||
                  errorMessage.includes("status")
                ) {
                  // Show unavailable modal
                  setShowUnavailableModal(true);
                } else {
                  alert(errorMessage);
                }
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading || !orderData}
          />
        )}
      </div>

      {/* Modal Pesanan Tidak Tersedia */}
      <OrderUnavailableModal
        showModal={showUnavailableModal}
        onClose={() => {
          setShowUnavailableModal(false);
          setOrderDetailVisibility(false);
        }}
        onRefresh={() => {
          onOrderAccepted?.();
        }}
      />
    </>
  );
}
