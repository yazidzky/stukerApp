import { useState } from "react";
import { Star } from "lucide-react";

export default function RatingStars({
  setRating,
}: {
  setRating: (r: number) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const [rating, setLocalRating] = useState<number>(0);

  const handleClick = (value: number) => {
    setLocalRating(value);
    setRating(value);
  };

  return (
    <div className="flex flex-col items-center gap-y-1">
      <h2 className="text-md font-semibold text-black">Ulas Stuker</h2>
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={32}
            strokeWidth={1.5}
            className={`cursor-pointer transition-all duration-200 ${
              star <= (hover ?? rating)
                ? "fill-yellow-400 stroke-yellow-400 scale-110"
                : "stroke-gray-400"
            }`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </div>
    </div>
  );
}
