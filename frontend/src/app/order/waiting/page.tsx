"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { Order } from "@/store/slices/orderSlice";
import CustomerSection from "./CustomerSection";
import Alert from "@/components/Alert";
import ConfirmModalComponent from "@/components/ConfirmationModal";
import { orderAPI } from "@/utils/function";

// 🔹 Komponen baru hasil modularisasi
import ActiveOrderHeader from "./ActiveOrderHeader";
import OrderDetailSection from "./OrderDetailSection";
import ConfirmButton from "./ConfirmButton";

export default function WaitingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Hapus halaman sebelumnya dari history
    history.pushState(null, "", location.href);
    window.onpopstate = () => {
      history.pushState(null, "", location.href);
    };

    // 🧹 Bersihkan event listener saat unmount
    return () => {
      window.onpopstate = null;
    };
  }, []);

  // Fetch order data
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const orderId = localStorage.getItem("currentOrderId");
        if (!orderId) {
          router.push("/order");
          return;
        }

        const data = await orderAPI.getOrder(orderId);
        setOrderData(data);
      } catch (error) {
        console.error("Error fetching order:", error);
        router.push("/order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [router]);

  // 🔹 Handler konfirmasi pesanan selesai
  const handleConfirm = async () => {
    if (!orderData) return;
    try {
      await orderAPI.completeOrder(orderData.order_id);
      setShowModal(false);
      localStorage.removeItem("orderNotificationShown");
      // Pass orderId to rating page
      router.push(`/order/rating?orderId=${orderData.order_id}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menyelesaikan pesanan";
      alert(errorMessage);
    }
  };

  // 🔹 Socket listener untuk order completed (jika stuker yang complete)
  useEffect(() => {
    const orderId = localStorage.getItem("currentOrderId");
    if (!orderId) return;

    // Import socket client dynamically
    import("socket.io-client").then(({ default: io }) => {
      const token = localStorage.getItem("token");
      const socketUrl =
        process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";
      const socket = io(socketUrl, {
        auth: { token },
        transports: ["websocket", "polling"],
      });

      socket.on("connect", () => {
        socket.emit("join-order", orderId);
      });

      socket.on("order-completed", (data: { orderId: string }) => {
        if (data.orderId === orderId) {
          // Auto redirect ke rating page
          router.push(`/order/rating?orderId=${orderId}`);
        }
      });

      return () => {
        socket.disconnect();
      };
    });
  }, [router]);

  if (loading) {
    return (
      <div className="h-[100dvh] flex justify-center items-center">
        Loading...
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="h-[100dvh] flex justify-center items-center">
        Order not found
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col justify-center px-4">
      {/* 🔸 Header Pesanan Aktif */}
      <ActiveOrderHeader />

      {/* 🔸 Informasi Customer */}
      <CustomerSection
        stukerImage={orderData.stuker_image || ""}
        stukerName={orderData.stuker_name || ""}
      />

      {/* 🔸 Rincian Order & Pembayaran */}
      <OrderDetailSection
        pickupLocation={orderData.pickup_location}
        deliveryLocation={orderData.delivery_location}
        orderDescription={orderData.order_description}
        priceEstimation={orderData.price_estimation}
        deliveryFee={orderData.delivery_fee}
      />

      {/* 🔸 Tombol Konfirmasi */}
      <ConfirmButton onClick={() => setShowModal(true)} />

      {/* =====================================================
          🔸 Komponen Non-Visible (Modal & Alert)
      ===================================================== */}
      <Alert
        message="Yeay! 🎉 Pesanan kamu sudah diambil oleh stuker. Mohon tunggu ya"
        localStorageName="orderNotificationShown"
      />

      <ConfirmModalComponent
        illustrationUrl="/illustrations/orderFinish.svg"
        message="apakah kamu yakin pesanan sudah selesai?"
        confirm={handleConfirm}
        showModal={showModal}
        setShowModal={setShowModal}
      />
    </div>
  );
}
