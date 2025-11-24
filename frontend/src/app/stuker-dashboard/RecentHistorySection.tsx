"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { orderAPI } from "@/utils/function";
import Image from "next/image";

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
  status: string;
  stuker_image: string;
  stuker_name: string;
}

export default function RecentHistorySection() {
  const { user } = useAuth();
  const router = useRouter();
  const [recentHistory, setRecentHistory] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentHistory = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch history as 'stuker' role
      const response = await orderAPI.getOrderHistory('stuker');
      
      // Handle response format: { success: true, history: [...] }
      type ApiOrderHistoryItem = {
        orderId?: string;
        partnerName?: string;
        pickupLoc?: string;
        pickup_location?: string;
        deliveryLoc?: string;
        delivery_location?: string;
        totalPrice?: number;
        completedAt?: string | null;
        partnerPicture?: string;
        rating?: {
          stars: number;
          comment?: string;
          createdAt?: string | Date;
        } | null;
      };
      let historyData: ApiOrderHistoryItem[] = [];
      if (response) {
        if (response.success && Array.isArray(response.history)) {
          historyData = response.history as ApiOrderHistoryItem[];
        } else if (Array.isArray(response)) {
          historyData = response as ApiOrderHistoryItem[];
        } else if (Array.isArray(response.history)) {
          historyData = response.history as ApiOrderHistoryItem[];
        }
      }
      
      if (historyData && Array.isArray(historyData) && historyData.length > 0) {
        // Filter only completed orders (with completedAt)
        const completedOrders = historyData.filter((item) => item.completedAt);
        
        if (completedOrders.length > 0) {
          const transformedHistory: OrderHistoryItem[] = completedOrders.slice(0, 3).map((item) => ({
          order_id: item.orderId || "",
          stuker_nim: user?.nim || "",
          stuker_name: user?.name || "",
          customer_nim: item.partnerName || "",
          customer_name: item.partnerName || "",
          pickup_location: item.pickupLoc || item.pickup_location || "",
          delivery_location: item.deliveryLoc || item.delivery_location || "",
          order_description: "",
          price_estimation: item.totalPrice ? item.totalPrice - 5000 : 0,
          delivery_fee: 5000,
          total_price_estimation: item.totalPrice || 0,
          order_date: item.completedAt 
            ? new Date(item.completedAt).toLocaleDateString('id-ID', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })
            : "",
          status: "completed",
          stuker_image: item.partnerPicture || "/images/profilePhoto.png",
          rating: item.rating || null,
        }));
          setRecentHistory(transformedHistory);
        } else {
          setRecentHistory([]);
        }
      } else {
        setRecentHistory([]);
      }
    } catch (error) {
      // Error is already handled in getOrderHistory, just set empty array
      console.error("Error fetching recent history:", error);
      setRecentHistory([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchRecentHistory();
    }
  }, [user, fetchRecentHistory]);

  // Refresh history when window gains focus (user returns to tab/page)
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        fetchRecentHistory();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, fetchRecentHistory]);

  // Refresh history periodically (every 30 seconds) to catch new completed orders
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchRecentHistory();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [user, fetchRecentHistory]);

  if (loading) {
    return null;
  }

  if (!recentHistory || recentHistory.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-800">Riwayat Pesanan</h2>
        <button
          onClick={() => router.push('/stuker-dashboard/history')}
          className="text-sm text-primary font-medium"
        >
          Lihat Semua
        </button>
      </div>
      <div className="flex flex-col gap-y-2">
        {recentHistory.map((order) => (
          <div
            key={order.order_id}
            className="border border-gray-300 rounded-xl p-2 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => router.push('/stuker-dashboard/history')}
          >
            <div className="bg-primary rounded-lg p-2 flex flex-col gap-y-1 px-3 mb-2">
              <div className="flex gap-x-2 items-center">
                <Image
                  src="/icons/pickup.svg"
                  width={18}
                  height={18}
                  alt="pickup"
                />
                <p className="text-white text-xs truncate">{order.pickup_location}</p>
              </div>
              <div className="flex gap-x-2 items-center">
                <Image
                  src="/icons/location.svg"
                  width={20}
                  height={20}
                  alt="delivery"
                />
                <p className="text-white text-xs truncate">{order.delivery_location}</p>
              </div>
            </div>
            <div className="flex justify-between items-center px-1">
              <div className="flex gap-x-2 items-center">
                <Image
                  src={order.stuker_image || "/images/profilePhoto.png"}
                  alt="customer profile"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <div>
                  <p className="text-sm font-medium">{order.customer_name || order.customer_nim}</p>
                  <p className="text-xs text-gray-500">{order.order_date}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
