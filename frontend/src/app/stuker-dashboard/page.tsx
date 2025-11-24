"use client";
export const dynamic = 'force-dynamic';
import Image from "next/image";
import OrderCardStuker from "./OrderCardStuker";
import OrderDetailComponent from "./OrderDetailComponent";
import Header from "../dashboard/Header";
import RecentHistorySection from "./RecentHistorySection";
import { useEffect, useState, useCallback } from "react";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import type { Order } from "@/store/slices/orderSlice";

export default function StukerDashboard() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  // const [socket, setSocket] = useState<any>(null); // Removed unused variable

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
  }, [isAuthenticated, router]);

  // Fetch available orders
  const fetchAvailableOrders = useCallback(async () => {
    try {
      const { orderAPI } = await import("@/utils/function");
      const data = await orderAPI.getAvailableOrders();
      // Ensure data is an array
      if (Array.isArray(data)) {
        setActiveOrders(data);
      } else {
        setActiveOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setActiveOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch available orders on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchAvailableOrders();
    }
  }, [isAuthenticated, fetchAvailableOrders]);

  // Setup socket connection untuk auto-refresh
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const newSocket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000",
      {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
      }
    );

    newSocket.on("connect", () => {
      console.log("✅ Connected to socket for stuker dashboard");
      // Join stuker dashboard room
      newSocket.emit("join-stuker-dashboard");
    });

    // Listen for new order available
    newSocket.on("new-order-available", (data) => {
      console.log("📦 New order available:", data);
      // Refresh orders list
      fetchAvailableOrders();
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("⚠️ Socket disconnected:", reason);
    });

    // Removed unused setSocket

    return () => {
      if (newSocket) {
        newSocket.emit("leave-stuker-dashboard");
        newSocket.disconnect();
      }
    };
  }, [isAuthenticated, user, fetchAvailableOrders]);

  // Refresh orders after accept
  const refreshOrders = () => {
    fetchAvailableOrders();
  };

  // Mencegah back kehalaman sebelumnya
  useEffect(() => {
    if (isAuthenticated) {
      // ✅ Hapus halaman sebelumnya dari history
      history.pushState(null, "", location.href);
      window.onpopstate = () => {
        history.pushState(null, "", location.href);
      };

      // 🧹 Bersihkan event listener saat unmount
      return () => {
        window.onpopstate = null;
      };
    }
  }, [isAuthenticated]);

  const [orderDetailVisibility, setOrderDetailVisibility] =
    useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (!isAuthenticated || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-[100%] px-4 flex flex-col relative overflow-y-hidden pb-[11vh]">
      <Header />
      <div className="flex mb-1 justify-end pr-1">
        <h1>Pesanan Tersedia</h1>
        <Image width={26} height={26} alt="List" src={"/icons/list-menu.svg"} />
      </div>
      <OrderDetailComponent
        orderDetailVisibility={orderDetailVisibility}
        setOrderDetailVisibility={setOrderDetailVisibility}
        orderData={selectedOrder}
        onOrderAccepted={refreshOrders}
      />
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <p>Loading orders...</p>
        </div>
      ) : activeOrders && activeOrders.length > 0 ? (
        <OrderCardStuker
          activeOrders={activeOrders}
          setOrderDetailVisibility={setOrderDetailVisibility}
          setSelectedOrder={setSelectedOrder}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <p className="text-center font-medium text-lg">
            Tidak ada pesanan tersedia
          </p>
          <p className="text-center text-md text-gray-400 mt-1">
            Pesanan baru akan muncul di sini
          </p>
        </div>
      )}
      <RecentHistorySection />
    </div>
  );
}
