"use client";
import ButtonPrimary from "@/components/ButtonPrimary";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { orderAPI } from "@/utils/function";

export default function BottomCTA({ total }: { total: number }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleCreateOrder = async () => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }

    const formData = (window as any).getOrderFormData?.();
    if (!formData) {
      alert("Form data tidak ditemukan");
      return;
    }

    // Validate required fields
    if (!formData.description || !formData.itemPrice || !formData.deliveryFee ||
        !formData.pickupLoc || !formData.deliveryLoc) {
      alert("Semua field harus diisi");
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        pickupLoc: formData.pickupLoc,
        deliveryLoc: formData.deliveryLoc,
        description: formData.description,
        itemPrice: parseInt(formData.itemPrice),
        deliveryFee: parseInt(formData.deliveryFee),
      };

      const response = await orderAPI.createOrder(orderData);
      // Store orderId for socket listening
      if (response.order && response.order.orderId) {
        localStorage.setItem('currentOrderId', response.order.orderId);
      }
      router.push("/order/searching-stuker");
    } catch (error: any) {
      alert(error.message || "Gagal membuat pesanan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[100%] left-1/2 -translate-x-1/2 bg-[#9B7EBD] h-22 fixed max-w-112 bottom-0 left-0 rounded-t-xl flex items-center px-4">
      <div className="w-[50%] ps-7">
        <p className="text-white">Total:</p>
        <p className="text-white font-semibold text-xl">Rp{total}</p>
      </div>
      <ButtonPrimary
        label={loading ? "Membuat..." : "Buat Pesanan"}
        className="w-[50%] h-14"
        onClick={handleCreateOrder}
        disabled={loading}
      />
    </div>
  );
}
