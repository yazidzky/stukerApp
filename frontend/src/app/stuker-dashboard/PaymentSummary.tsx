interface PaymentSummaryProps {
  priceEstimation: number;
  deliveryFee: number;
}

export default function PaymentSummary({
  priceEstimation,
  deliveryFee,
}: PaymentSummaryProps) {
  const total = priceEstimation + deliveryFee;

  // Format number to Rupiah
  const formatToRupiah = (value: number) =>
    value.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    });

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <h2 className="font-semibold text-gray-800 mb-3">Pembayaran</h2>

      <div className="flex justify-between text-gray-600 mb-1">
        <span>Estimasi Pesanan</span>
        <span>{formatToRupiah(priceEstimation)}</span>
      </div>

      <div className="flex justify-between text-gray-600 mb-2">
        <span>Ongkos</span>
        <span>{formatToRupiah(deliveryFee)}</span>
      </div>

      <div className="border-t border-gray-300 my-2"></div>

      <div className="flex justify-between font-semibold text-gray-900">
        <span>Total</span>
        <span className="text-[#7F55B1]">{formatToRupiah(total)}</span>
      </div>
    </div>
  );
}
