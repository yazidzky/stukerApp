"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ratingAPI } from "@/utils/function";
import RatingStars from "./RatingStars";
import Button from "@/components/ButtonPrimary";
import OrderLocationCard from "./OrderLocationCard";

function OrderFinishedContent() {
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

  const handleSubmitRating = async () => {
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
      router.push("/dashboard");
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
        router.push("/dashboard");
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
      <div className="w-full h-[100vh] flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  // =====================================================
  // 🔹 RENDER UI
  // =====================================================
  return (
    <div className="w-full h-[100vh] bg-[url('/illustrations/doodle.svg')] bg-no-repeat bg-center bg-cover flex justify-center pt-[8vh]">
      <div className="w-[84%] h-[70vh] bg-gradient-to-b from-[#E1CCEC] to-white rounded-xl shadow-sm flex flex-col items-center justify-center gap-y-4 pt-6 pb-10 relative">
        {/* 🔸 Foto dan nama Stuker */}
        <Image
          src={data.stuker_image || "/images/profilePhoto.png"}
          alt="stuker profile"
          width={84}
          height={84}
          className="rounded-full"
        />
        <div className="text-center">
          <p className="font-semibold text-2xl">{data.stuker_name}</p>
          <p>Student Walker</p>
        </div>

        {/* 🔸 Lokasi pickup dan delivery */}
        <OrderLocationCard
          pickupLocation={data.pickup_location}
          deliveryLocation={data.delivery_location}
        />

        {/* 🔸 Rating bintang */}
        <RatingStars setRating={setRating} />

        {/* 🔸 Kolom review */}
        <textarea
          placeholder="Tuliskan detail review disini...."
          className="w-[85%] p-3 text-sm border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none max-h-32"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        {/* 🔸 Tombol kirim */}
        <Button
          label={loading ? "Mengirim..." : "Kirim"}
          className="w-[50%] absolute bottom-[-22]"
          onClick={handleSubmitRating}
          disabled={loading || !rating}
        />
      </div>
    </div>
  );
}

export default function OrderFinishedPage() {
  return (
    <Suspense fallback={<div className="w-full h-[100vh] flex justify-center items-center">Loading...</div>}>
      <OrderFinishedContent />
    </Suspense>
  );
}
