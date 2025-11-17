"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HeaderOrder() {
  const router = useRouter();
  return (
    <div className="flex justify-between items-center h-18">
      <Image
        src={"/icons/arrow.svg"}
        alt="Arrow"
        width={40}
        height={40}
        onClick={() => router.back()}
        className="text-primary hover:scale-105 opacity-70 hover:opacity-100 cursor-pointer active:opacity-10"
      />
      <h1 className="text-xl font-medium text-primary">Buat Pesanan</h1>
      <div className="w-[40px]"></div>
    </div>
  );
}
