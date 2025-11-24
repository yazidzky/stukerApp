"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { orderAPI } from "@/utils/function";
import NoOrderMessage from "./NoOrderMessage";
import OrderCard from "./OrderCardComponent";
import type { OrderHistoryItem } from "./OrderCardComponent";

type ApiOrderHistoryItem = {
  orderId?: string;
  partnerName?: string;
  stukerName?: string;
  pickupLoc?: string;
  pickup_location?: string;
  deliveryLoc?: string;
  delivery_location?: string;
  totalPrice?: number;
  completedAt?: string | null;
  partnerPicture?: string;
  stukerPicture?: string;
  rating?: {
    stars: number;
    comment?: string;
    createdAt?: string | Date;
  } | null;
};

export default function HistoryPage() {
  const { user } = useAuth();
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrderHistory = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch history as 'user' role
      const response = await orderAPI.getOrderHistory('user');
      
      // Handle response format: { success: true, history: [...] }
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
      
      console.log('User History Response:', response);
      console.log('User History Data:', historyData);
      console.log('User History Data Length:', historyData?.length);
      if (historyData && historyData.length > 0) {
        console.log('First order rating:', historyData[0]?.rating);
      }
      
      if (historyData && Array.isArray(historyData) && historyData.length > 0) {
        // Backend already filters for completed orders, but we ensure completedAt exists as safety check
        // Filter only completed orders (with completedAt) - backend should already return only completed
        // Check if completedAt exists and is not null/undefined
        const completedOrders = historyData.filter((item) => {
          const hasCompletedAt = item.completedAt !== null && item.completedAt !== undefined;
          console.log(`Order ${item.orderId}: completedAt =`, item.completedAt, 'hasCompletedAt =', hasCompletedAt);
          return hasCompletedAt;
        });
        
        console.log('Completed Orders Count:', completedOrders.length);
        
        if (completedOrders.length > 0) {
          // Transform API response to match component props
          const transformedHistory: OrderHistoryItem[] = completedOrders.map((item) => ({
          order_id: item.orderId || "",
          stuker_nim: item.partnerName || item.stukerName || "",
          stuker_name: item.partnerName || item.stukerName || "",
          customer_nim: user?.nim || "",
          pickup_location: item.pickupLoc || item.pickup_location || "",
          delivery_location: item.deliveryLoc || item.delivery_location || "",
          order_description: "",
          price_estimation: item.totalPrice ? item.totalPrice - 5000 : 0,
          delivery_fee: 5000,
          total_price_estimation: item.totalPrice || 0,
          order_date: item.completedAt 
            ? new Date(item.completedAt).toLocaleDateString('id-ID', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })
            : "",
          status: "completed",
          stuker_image: item.partnerPicture || item.stukerPicture || "/images/profilePhoto.png",
          rating: item.rating || null, // Rating sudah dalam format { stars, comment, createdAt }
        }));
          setOrderHistory(transformedHistory);
        } else {
          setOrderHistory([]);
        }
      } else {
        setOrderHistory([]);
      }
    } catch (error) {
      console.error("Error fetching order history:", error);
      setOrderHistory([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchOrderHistory();
    }
  }, [user, fetchOrderHistory]);

  // Refresh history when window gains focus (user returns to tab/page)
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        fetchOrderHistory();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, fetchOrderHistory]);

  if (loading) {
    return (
      <div className="pt-4 px-2 flex flex-col gap-y-2 pb-[11vh]">
        <h1 className="text-primary font-medium text-xl">Riwayat Pesanan</h1>
        <div className="flex justify-center items-center h-32">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 px-2 flex flex-col gap-y-2 pb-[11vh]">
      <h1 className="text-primary font-medium text-xl">Riwayat Pesanan</h1>

      {orderHistory && orderHistory.length > 0 ? (
        <OrderCard orderHistory={orderHistory} />
      ) : (
        <NoOrderMessage />
      )}
    </div>
  );
}
