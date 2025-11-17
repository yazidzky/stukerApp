"use client";
import Button from "./ButtonPrimary";

interface OrderUnavailableModalProps {
  showModal: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function OrderUnavailableModal({
  showModal,
  onClose,
  onRefresh,
}: OrderUnavailableModalProps) {
  const handleOK = () => {
    onRefresh();
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black opacity-30 backdrop-blur-[1px] z-50 transition-opacity duration-300"
          onClick={onClose}
        ></div>
      )}

      {/* Modal */}
      <div
        className={`w-[86%] gap-y-4 bg-white border border-gray-300 fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-xl p-4 flex flex-col items-center pb-6 justify-between max-w-108 transition-all duration-300 ${
          showModal ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="w-[180px] h-[180px] flex items-center justify-center bg-gray-100 rounded-full mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-red-400"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-center font-medium text-xl mb-2">Pesanan Tidak Tersedia</p>
          <p className="text-center text-gray-600">
            Pesanan ini sudah tidak tersedia. Mungkin sudah dibatalkan atau diambil stuker lain.
          </p>
        </div>
        <div className="flex w-[100%]">
          <Button
            label="OK"
            className="w-full"
            onClick={handleOK}
          />
        </div>
      </div>
    </>
  );
}

