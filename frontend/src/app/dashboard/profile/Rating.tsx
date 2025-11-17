import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number; // contoh: 45 = 4.5
  reviews?: number; // opsional: jumlah review
}

export default function RatingStars({ rating, reviews }: RatingStarsProps) {
  // Ensure rating is a valid number, default to 0 if not
  const validRating = typeof rating === 'number' && !isNaN(rating) ? rating : 0;
  const score = validRating / 10; // ubah ke skala 0–5
  const fullStars = Math.floor(score);
  const hasHalfStar = score % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex flex-col items-center mb-4">
      {/* Bintang */}
      <div className="flex space-x-1">
        {/* bintang penuh */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} fill="#FFD700" stroke="#FFD700" />
        ))}

        {/* setengah bintang */}
        {hasHalfStar && (
          <div className="relative">
            <Star fill="transparent" stroke="#C4A5FF" />
            <div className="absolute top-0 left-0 overflow-hidden w-1/2">
              <Star fill="#FFD700" stroke="#FFD700" />
            </div>
          </div>
        )}

        {/* bintang kosong */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} fill="transparent" stroke="#C4A5FF" />
        ))}
      </div>

      {/* Nilai dan jumlah ulasan */}
      <p className="mt-1 text-black font-semibold">
        {score.toFixed(1)}{" "}
        {reviews && <span className="text-gray-600">({reviews})</span>}
      </p>
    </div>
  );
}
