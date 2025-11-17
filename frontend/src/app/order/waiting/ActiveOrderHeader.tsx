"use client";

// 💡 Komponen kecil untuk header "Pesanan Aktif" dengan indikator hijau.
//    Reusable untuk halaman status pesanan lain (waiting, delivering, finished, dll).

export default function ActiveOrderHeader() {
  return (
    <div className="flex items-center gap-x-2">
      <p className="font-medium text-lg self-end">Pesanan Aktif</p>
      <div className="bg-green-400 rounded-full w-2.5 h-2.5"></div>
    </div>
  );
}
