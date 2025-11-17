"use client";

import Button from "@/components/ButtonPrimary";

interface ConfirmButtonProps {
  label?: string;
  onClick: () => void;
}

export default function ConfirmButton({
  label = "Konfirmasi Selesai",
  onClick,
}: ConfirmButtonProps) {
  return <Button label={label} className="mt-4" onClick={onClick} />;
}
