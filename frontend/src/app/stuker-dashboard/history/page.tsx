"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { orderAPI } from "@/utils/function";
import OrderCard from "./OrderCard";

export default function HistoryPage() {
  const { user } = useAuth();
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      // Fetch history as 'stuker' role
      const response = await orderAPI.getOrderHistory('stuker');
      
      // Handle response format: { success: true, history: [...] }
      let historyData: any[] = [];
      if (response) {
        if (response.success && Array.isArray(response.history)) {
          historyData = response.history;
        } else if (Array.isArray(response)) {
          historyData = response;
        } else if (Array.isArray(response.history)) {
          historyData = response.history;
        }
      }
      
      console.log('Stuker History Response:', response);
      console.log('Stuker History Data:', historyData);
      console.log('Stuker History Data Length:', historyData?.length);
      if (historyData && historyData.length > 0) {
        console.log('First order rating:', historyData[0]?.rating);
      }
      
      if (historyData && Array.isArray(historyData) && historyData.length > 0) {
        // Backend already filters for completed orders, but we ensure completedAt exists as safety check
        // Filter only completed orders (with completedAt) - backend should already return only completed
        // Check if completedAt exists and is not null/undefined
        const completedOrders = historyData.filter((item: any) => {
          const hasCompletedAt = item.completedAt !== null && item.completedAt !== undefined;
          console.log(`Order ${item.orderId}: completedAt =`, item.completedAt, 'hasCompletedAt =', hasCompletedAt);
          return hasCompletedAt;
        });
        
        console.log('Completed Orders Count:', completedOrders.length);
        
        if (completedOrders.length > 0) {
          // Transform API response to match component props
          const transformedHistory = completedOrders.map((item: any) => ({
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
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })
            : "",
          status: "completed",
          stuker_image: item.partnerPicture || user?.profilePicture || "/images/profilePhoto.png",
          rating: item.rating || null, // Rating sudah dalam format { stars, comment, createdAt }
        }));
          setOrderHistory(transformedHistory);
        } else {
          setOrderHistory([]);
        }
      } else {
        setOrderHistory([]);
      }
    } catch (error: any) {
      // Handle 404 gracefully - no orders found is not an error
      if (error.message && (error.message.includes('404') || error.message.includes('tidak ditemukan'))) {
        console.log("No orders found in history");
        setOrderHistory([]);
      } else {
        console.error("Error fetching order history:", error);
        setOrderHistory([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrderHistory();
    }
  }, [user]);

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
  }, [user]);

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
        <div className="flex flex-col items-center justify-center h-[70vh] text-gray-500">
          <p className="text-center font-medium text-lg">Belum ada pesanan</p>
          <p className="text-center text-md text-gray-400 mt-1">
            Ayo buat pesanan pertamamu!
          </p>
        </div>
      )}
    </div>
  );
}
