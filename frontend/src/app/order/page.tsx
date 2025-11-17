"use client";
import BottomCTA from "./BottomCTA";
import HeaderOrder from "./HeaderOrder";
import InputSection from "./InputSection";
import OrderGuide from "./OrderGuide";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrderPage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [total, setTotal] = useState(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
  }, [isAuthenticated, router]);

  // Calculate total dynamically
  useEffect(() => {
    const updateTotal = () => {
      const formData = (window as any).getOrderFormData?.();
      if (
        formData &&
        typeof formData === "object" &&
        "itemPrice" in formData &&
        "deliveryFee" in formData
      ) {
        const itemPrice = parseInt(String(formData.itemPrice)) || 0;
        const deliveryFee = parseInt(String(formData.deliveryFee)) || 0;
        setTotal(itemPrice + deliveryFee);
      }
    };

    // Update total when form data changes
    const interval = setInterval(updateTotal, 500);
    return () => clearInterval(interval);
  }, []);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className=" px-4 relative h-[100dvh]">
      <div className="overflow-scroll pb-24 scrollbar-hide">
        <HeaderOrder />
        <OrderGuide />
        <InputSection />
      </div>
      <BottomCTA total={total} />
    </div>
  );
}
