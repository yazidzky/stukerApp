"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { orderAPI } from "@/utils/function";

// 🔹 Komponen internal utama
import CustomerSection from "./CustomerSection";
import Alert from "@/components/Alert";
import ConfirmModalComponent from "@/components/ConfirmationModal";

// 🔹 Komponen modular hasil pemecahan
import ActiveOrderHeader from "./ActiveOrderHeader";
import OrderDetailSection from "./OrderDetailSection";
import ConfirmFinishButton from "./ConfirmFinishButton";

export default function OrderProcessPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mencegah back kehalaman sebelumnya
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
        const orderId = localStorage.getItem('currentOrderId');
        if (!orderId) {
          router.push('/stuker-dashboard');
          return;
        }

        const data = await orderAPI.getOrder(orderId);
        setOrderData(data);
      } catch (error) {
        console.error('Error fetching order:', error);
        router.push('/stuker-dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [router]);

  // 🔹 Socket listener untuk order completed (jika customer yang complete)
  useEffect(() => {
    const orderId = localStorage.getItem('currentOrderId');
    if (!orderId) return;

    // Import socket client dynamically
    import('socket.io-client').then(({ default: io }) => {
      const token = localStorage.getItem('token');
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";
      const socket = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        socket.emit('join-order', orderId);
      });

      socket.on('order-completed', (data: { orderId: string }) => {
        if (data.orderId === orderId) {
          // Auto redirect ke rating page
          router.push(`/stuker-order/rating?orderId=${orderId}`);
        }
      });

      return () => {
        socket.disconnect();
      };
    });
  }, [router]);

  // =====================================================
  // 🔧 HANDLER FUNCTIONS
  // =====================================================

  // 👉 Konfirmasi pesanan selesai
  const handleConfirmFinish = async () => {
    if (!orderData) return;
    try {
      await orderAPI.completeOrder(orderData.order_id);
      setShowModal(false);
      localStorage.removeItem("orderNotificationShown");
      // Pass orderId to rating page
      router.push(`/stuker-order/rating?orderId=${orderData.order_id}`);
    } catch (error: any) {
      alert(error.message || "Gagal menyelesaikan pesanan");
    }
  };

  if (loading) {
    return <div className="h-[100dvh] flex justify-center items-center">Loading...</div>;
  }

  if (!orderData) {
    return <div className="h-[100dvh] flex justify-center items-center">Order not found</div>;
  }

  // =====================================================
  // 🔹 RENDER UI
  // =====================================================
  return (
    <div className="h-[100dvh] px-4 flex flex-col justify-center">
      {/* 🔸 Alert notifikasi */}
      <Alert
        message="Pesanan berhasil diambil, jangan buat pelanggan kamu menunggu terlalu lama ya"
        localStorageName="orderNotificationShown"
      />

      {/* 🔸 Modal konfirmasi selesai */}
      <ConfirmModalComponent
        illustrationUrl="/illustrations/orderFinish.svg"
        message="apakah kamu yakin pesanan sudah selesai?"
        confirm={handleConfirmFinish}
        showModal={showModal}
        setShowModal={setShowModal}
      />

      {/* 🔸 Header pesanan */}
      <ActiveOrderHeader />

      {/* 🔸 Informasi customer */}
      <CustomerSection
        stukerImage={orderData.customer_image}
        customerRate={49} // Default rating, could be fetched from API
        customerName={orderData.customer_name}
      />

      {/* 🔸 Detail pesanan & pembayaran */}
      <OrderDetailSection
        pickupLocation={orderData.pickup_location}
        deliveryLocation={orderData.delivery_location}
        orderDescription={orderData.order_description}
        priceEstimation={orderData.price_estimation}
        deliveryFee={orderData.delivery_fee}
      />

      {/* 🔸 Tombol konfirmasi */}
      <ConfirmFinishButton onClick={() => setShowModal(true)} />
    </div>
  );
}
