"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import ButtonPrimary from "@/components/ButtonPrimary";

// 💡 Komponen ini muncul setelah pesanan selesai,
//    menampilkan pesan apresiasi sebelum kembali ke dashboard.

export default function OrderFinishedPage() {
  const router = useRouter();

  // =====================================================
  // 🔹 RENDER UI
  // =====================================================
  return (
    <div className="px-4">
      {/* 🔸 Pesan dan ilustrasi */}
      <div className="w-full h-[85vh] flex flex-col justify-center items-center gap-y-8">
        <h1 className="text-xl text-primary font-medium text-center">
          Pesanan selesai, terus semangat berikan pelayanan terbaik!
        </h1>
        <Image
          src="/illustrations/orderFinished.svg"
          alt="Order Finished Illustration"
          width={220}
          height={220}
        />
      </div>

      {/* 🔸 Tombol navigasi kembali ke dashboard */}
      <ButtonPrimary
        label="Selesai"
        onClick={() => router.push("/stuker-dashboard")}
      />
    </div>
  );
}
