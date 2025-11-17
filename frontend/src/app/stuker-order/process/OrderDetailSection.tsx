"use client";

import OrderSummary from "@/app/stuker-dashboard/OrderSummary";
import PaymentSummary from "@/app/stuker-dashboard/PaymentSummary";

interface OrderDetailSectionProps {
  pickupLocation: string;
  deliveryLocation: string;
  orderDescription: string;
  priceEstimation: number;
  deliveryFee: number;
}

// 💡 Komponen ini membungkus ringkasan pesanan & pembayaran.
export default function OrderDetailSection({
  pickupLocation,
  deliveryLocation,
  orderDescription,
  priceEstimation,
  deliveryFee,
}: OrderDetailSectionProps) {
  return (
    <div className="space-y-2 max-h-[66vh] overflow-scroll scrollbar-hide">
      <OrderSummary
        pickupLocation={pickupLocation}
        deliveryLocation={deliveryLocation}
        orderDescription={orderDescription}
      />
      <PaymentSummary
        priceEstimation={priceEstimation}
        deliveryFee={deliveryFee}
      />
    </div>
  );
}
