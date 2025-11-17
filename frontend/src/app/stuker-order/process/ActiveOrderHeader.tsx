"use client";

// 💡 Header status pesanan aktif.

export default function ActiveOrderHeader() {
  return (
    <div className="flex items-center gap-x-2">
      <p className="font-medium text-lg self-end">Pesanan Aktif</p>
      <div className="bg-green-400 rounded-full w-2.5 h-2.5"></div>
    </div>
  );
}
