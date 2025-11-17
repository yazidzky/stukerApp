"use client";
import { useState } from "react";
import RatingStars from "./RatingStars";
import Button from "@/components/ButtonPrimary";

interface OrderReviewSectionProps {
  setRating: (value: number) => void;
  onSubmit: () => void;
  loading?: boolean;
}

export default function OrderReviewSection({
  setRating,
  onSubmit,
  loading = false,
}: OrderReviewSectionProps) {
  const [comment, setComment] = useState("");

  return (
    <div className="flex flex-col items-center gap-y-3 w-full">
      <RatingStars setRating={setRating} />
      <textarea
        placeholder="Tuliskan detail review disini...."
        className="w-[85%] p-3 text-sm border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none max-h-32"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button
        label={loading ? "Mengirim..." : "Kirim"}
        className="w-[50%] absolute bottom-[-22]"
        onClick={onSubmit}
        disabled={loading}
      />
    </div>
  );
}
