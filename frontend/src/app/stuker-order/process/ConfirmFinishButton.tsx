"use client";

import Button from "@/components/ButtonPrimary";

interface ConfirmFinishButtonProps {
  onClick: () => void;
  label?: string;
}

// 💡 Tombol konfirmasi selesai pesanan.
//    Reusable untuk halaman Process dan Waiting.
export default function ConfirmFinishButton({
  onClick,
  label = "Konfirmasi Selesai",
}: ConfirmFinishButtonProps) {
  return <Button label={label} className="mt-4" onClick={onClick} />;
}
