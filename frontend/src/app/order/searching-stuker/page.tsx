"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ButtonPrimary from "@/components/ButtonPrimary";
import { io } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { orderAPI } from "@/utils/function";

export default function SearchingStudent() {
  const router = useRouter();
  const { user } = useAuth();
  const [socket, setSocket] = useState<any>(null);
  const [orderAccepted, setOrderAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔹 Setup socket connection
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('token');
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket');
      // Join order room if we have orderId (assuming it's stored in localStorage or URL)
      const orderId = localStorage.getItem('currentOrderId');
      if (orderId) {
        newSocket.emit('join-order', orderId);
      }
    });

    newSocket.on('order-accepted', (data) => {
      console.log('Order accepted:', data);
      setOrderAccepted(true);
      // Navigate to waiting page
      router.push("/order/waiting");
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, router]);

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
  // =====================================================
  // 🔹 RENDER UI
  // =====================================================
  return (
    <div className="px-4">
      {/* 🔸 Ilustrasi pencarian stuker */}
      <div className="w-full h-[85vh] flex flex-col justify-center items-center">
        <Image
          src="/illustrations/lookingstuker.svg"
          alt="Looking Stuker"
          width={180}
          height={180}
        />
        <h1 className="text-2xl mt-5 text-primary font-medium">
          Mencari Stuker...
        </h1>
      </div>

      {/* 🔸 Tombol batal (kembali ke halaman sebelumnya) */}
      <ButtonPrimary 
        label={loading ? "Membatalkan..." : "Batalkan"} 
        onClick={async () => {
          try {
            setLoading(true);
            const orderId = localStorage.getItem('currentOrderId');
            if (orderId) {
              await orderAPI.cancelOrder(orderId);
              localStorage.removeItem('currentOrderId');
            }
            router.push("/dashboard");
          } catch (error: any) {
            alert(error.message || "Gagal membatalkan pesanan");
          } finally {
            setLoading(false);
          }
        }}
        disabled={loading}
      />
    </div>
  );
}
