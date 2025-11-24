"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ratingAPI } from "@/utils/function";

// 🔹 Komponen internal hasil modularisasi
import FinishedHeader from "./FinishedHeader";
import OrderLocationCard from "./OrderLocationCard";
import OrderReviewSection from "./OrderReviewSection";

function OrderRatingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  interface RatingOrderData {
    stuker_image: string;
    stuker_name: string;
    delivery_location: string;
    pickup_location: string;
  }
  const [data, setData] = useState<RatingOrderData | null>(null);

  const orderId = searchParams.get('orderId');

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

  useEffect(() => {
    // Fetch order data from backend if orderId is available
    if (orderId) {
      fetchOrderData();
    } else {
      // Fallback to dummy data if no orderId
      setData({
        stuker_image: "/images/profilePhoto.png",
        stuker_name: "Marip Ramadan",
        delivery_location: "Kantin atas dekat pohon",
        pickup_location: "Lantai 4 FST, R 4.10",
      });
    }
  }, [orderId]);

  const fetchOrderData = async () => {
    if (!orderId) return;

    try {
      const response = await ratingAPI.getOrderRatingData(orderId);
      // Handle null response (404 - order not found)
      if (!response) {
        // Use fallback data when order is not found
        setData({
          stuker_image: "/images/profilePhoto.png",
          stuker_name: "Data tidak ditemukan",
          delivery_location: "Lokasi tidak ditemukan",
          pickup_location: "Lokasi tidak ditemukan",
        });
        return;
      }
      
      if (response && response.success) {
        setData({
          stuker_image: response.data.rateeImage || "/images/profilePhoto.png",
          stuker_name: response.data.rateeName,
          delivery_location: response.data.deliveryLocation,
          pickup_location: response.data.pickupLocation,
        });
      }
    } catch (error) {
      // Only log unexpected errors (not 404s which are handled gracefully)
      const message = error instanceof Error ? error.message : '';
      if (message && !message.includes('tidak ditemukan') && !message.includes('404')) {
        console.error("Error fetching order data:", error);
      }
      // Fallback to dummy data
      setData({
        stuker_image: "/images/profilePhoto.png",
        stuker_name: "Data tidak ditemukan",
        delivery_location: "Lokasi tidak ditemukan",
        pickup_location: "Lokasi tidak ditemukan",
      });
    }
  };

  const handleSubmit = async () => {
    if (!rating || !orderId) {
      alert("Rating dan Order ID diperlukan");
      return;
    }

    setLoading(true);
    try {
      await ratingAPI.createRating({
        orderId,
        stars: rating,
        comment: comment.trim() || undefined,
      });

      // Tunggu lebih lama untuk memastikan backend selesai recalculate rating untuk kedua pihak
      await new Promise(resolve => setTimeout(resolve, 800));

      // Refresh user data untuk update rating di profil
      // Tunggu sampai refresh selesai sebelum redirect
      await refreshUser();
      
      // Tambahkan delay untuk memastikan context terupdate dan React re-render
      await new Promise(resolve => setTimeout(resolve, 400));

      // Refresh router untuk memastikan halaman terupdate
      router.refresh();
      router.push("/stuker-dashboard");
    } catch (error) {
      // Extract error message from various error formats
      let errorMessage = "Gagal mengirim rating";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else {
        errorMessage = String(error);
      }
      
      // Check if it's a duplicate rating error
      if (errorMessage.includes("sudah memberi rating") || 
          errorMessage.includes("duplicate") ||
          errorMessage.includes("E11000")) {
        alert("Anda sudah memberi rating untuk order ini. Mengarahkan ke dashboard...");
        router.push("/stuker-dashboard");
      } else {
        // Only log unexpected errors (not duplicate rating errors)
        if (!errorMessage.includes("sudah memberi rating") && !errorMessage.includes("duplicate")) {
          console.error("Error submitting rating:", error);
        }
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return (
      <div className="w-full h-[100dvh] flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  // =====================================================
  // 🔹 RENDER UI
  // =====================================================
  return (
    <div className="w-full h-[100dvh] bg-[url('/illustrations/doodle.svg')] bg-no-repeat bg-center bg-cover flex justify-center pt-[8vh]">
      <div className="w-[88%] h-[58vh] bg-gradient-to-b from-[#E1CCEC] to-white rounded-xl shadow-sm flex flex-col justify-center items-center gap-y-4 pb-8 relative">
        {/* 🔸 Header (Foto, Nama, Role) */}
        <FinishedHeader
          imageUrl={data.stuker_image}
          name={data.stuker_name}
          role="Customer"
        />

        {/* 🔸 Lokasi Pickup & Delivery */}
        <OrderLocationCard
          pickupLocation={data.pickup_location}
          deliveryLocation={data.delivery_location}
        />

        {/* 🔸 Rating dan tombol kirim */}
        <OrderReviewSection setRating={setRating} onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}

export default function OrderRatingPage() {
  return (
    <Suspense fallback={<div className="w-full h-[100dvh] flex justify-center items-center">Loading...</div>}>
      <OrderRatingContent />
    </Suspense>
  );
}
