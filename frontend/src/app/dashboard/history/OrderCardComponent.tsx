import Image from "next/image";
import { Star } from "lucide-react";
import { limitText } from "@/utils/function";

export interface OrderHistoryItem {
  order_id: string;
  stuker_nim: string;
  customer_nim: string;
  pickup_location: string;
  delivery_location: string;
  order_description: string;
  price_estimation: number;
  delivery_fee: number;
  total_price_estimation: number;
  order_date: string;
  status: string; // bisa pakai union type
  stuker_image: string;
  stuker_name: string;
  rating?: {
    stars: number;
    comment?: string;
    createdAt?: string | Date;
  } | null;
}

// Fungsi untuk format rupiah
function toRupiah(number: number): string {
  if (isNaN(number)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}

export default function OrderCardComponent({
  orderHistory,
}: {
  orderHistory: OrderHistoryItem[];
}) {
  return (
    <div className="flex flex-col gap-y-1">
      {orderHistory.map((order) => (
        <div
          key={order.order_id}
          className="border border-gray-300 h-36 p-1 rounded-xl"
        >
          <div className="bg-primary rounded-xl p-2 flex justify-between items-center px-3">
            <div className="flex flex-col gap-y-1 flex-1">
              <div className="flex gap-x-2 items-center">
                <Image
                  src={"/icons/pickup.svg"}
                  width={24}
                  height={24}
                  alt="pickup"
                />
                <p className="text-white text-sm truncate" title={order.pickup_location}>
                  {limitText(order.pickup_location, 30)}
                </p>
              </div>
              <div className="flex gap-x-2 items-center">
                <Image
                  src={"/icons/location.svg"}
                  width={26}
                  height={26}
                  alt="delivery"
                />
                <p className="text-white text-sm truncate" title={order.delivery_location}>
                  {limitText(order.delivery_location, 30)}
                </p>
              </div>
            </div>
            {order.rating && order.rating.stars ? (
              <div className="flex items-center gap-x-1 ml-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={
                      star <= order.rating!.stars
                        ? "fill-yellow-400 stroke-yellow-400"
                        : "stroke-white/50"
                    }
                  />
                ))}
              </div>
            ) : null}
          </div>
          <div className="flex p-2 justify-between">
            <div className="flex gap-x-2">
              <Image
                src={order.stuker_image || "/images/profilePhoto.png"}
                alt="stuker profile"
                width={46}
                height={46}
                className="rounded-full"
              />
              <div>
                <p className="text-md font-medium">
                  {limitText(order.stuker_name, 15)}
                </p>
                <p className="text-sm">Student Walker</p>
              </div>
            </div>
            <div className="flex flex-col justify-end items-end gap-y-1">
              <p className="text-sm font-semibold text-primary">
                {toRupiah(order.total_price_estimation)}
              </p>
              <p className="text-sm text-gray-600">
                {order.order_date}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
