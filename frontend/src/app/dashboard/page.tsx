"use client";
import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import ActionCard from "./ActionCard";
import Header from "./Header";
import NotificationSection from "./NotificationSection";
import WellcomeText from "./WellcomeText";
import RecentHistorySection from "./RecentHistorySection";

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth");
      return;
    }
  }, [loading, isAuthenticated, router]);

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

  const notifications = [
    {
      notification_id: "NTF001",
      message:
        "Pesanan kamu #ORD892 sudah diterima oleh penjual dan sedang diproses 🛍️",
      created_at: "2025-10-05T09:30:00Z",
    },
    {
      notification_id: "NTF002",
      message:
        "Titipan kamu sedang dalam perjalanan ke Indonesia ✈️ Estimasi tiba 2 hari lagi.",
      created_at: "2025-10-06T14:15:00Z",
    },
    {
      notification_id: "NTF003",
      message:
        "Pembayaran untuk pesanan #ORD892 telah dikonfirmasi ✅ Terima kasih sudah menggunakan layanan kami!",
      created_at: "2025-10-07T08:00:00Z",
    },
    {
      notification_id: "NTF004",
      message:
        "Promo spesial minggu ini! Cashback 10% untuk semua titipan luar negeri 🌏",
      created_at: "2025-10-08T10:45:00Z",
    },
  ];

  if (loading || !isAuthenticated || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-[100%] px-4  pb-[11vh]">
      <Header />
      <WellcomeText username={user.name} />
      <ActionCard />
      <NotificationSection notifications={notifications} />
      <RecentHistorySection />
    </div>
  );
}
