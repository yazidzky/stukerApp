import Image from "next/image";

interface ImagePreviewModalProps {
  image: string;
  onCancel: () => void;
}

export default function ImagePreviewModal({
  image,
  onCancel,
}: ImagePreviewModalProps) {
  return (
    <div className="bg-white p-4 border-t border-gray-200 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 relative">
          <Image
            src={image}
            alt="Preview"
            width={80}
            height={80}
            className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 rounded-lg transition-opacity"></div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-700 truncate">Gambar siap dikirim</p>
          <p className="text-xs text-gray-500 mt-0.5">Tekan kirim untuk mengirim gambar</p>
        </div>
        <button
          onClick={onCancel}
          className="flex-shrink-0 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors active:opacity-70"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
