"use client";
import Image from "next/image";
import { useState, useRef } from "react";
import EmojiPicker from "@/components/EmojiPicker";

interface BottomInputChatComponentProps {
  onSendMessage: (text: string) => void;
  onImageSelect: (image: string) => void;
  previewImage: string | null;
  onCancelPreview: () => void;
}

export default function BottomInputChatComponent({
  onSendMessage,
  onImageSelect,
  previewImage,
  onCancelPreview,
}: BottomInputChatComponentProps) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  const handleSend = () => {
    if (message.trim() || previewImage) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const imageUrl = event.target.result as string;
          onImageSelect(imageUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  return (
    <div className="fixed bg-white shadow-md rounded-t-sm w-[100%] bottom-0 left-1/2 -translate-x-1/2 max-w-112">
      {/* Preview Image */}
      {previewImage && (
        <div className="px-5 pt-4 pb-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 relative">
              <img
                src={previewImage}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">Gambar siap dikirim</p>
              <p className="text-xs text-gray-500 mt-0.5">Tekan kirim untuk mengirim gambar</p>
            </div>
            {/* Cancel Button - positioned above send icon */}
            <div className="flex-shrink-0">
              <button
                onClick={onCancelPreview}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors active:opacity-70"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="px-5 flex items-center h-18">
        <div className="flex w-[100%] gap-x-4 items-center">
          {/* Image Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0"
          >
            <Image
              src="/icons/imgsend.svg"
              alt="image icon"
              width={20}
              height={20}
              className="active:opacity-10 cursor-pointer"
            />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Input */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ketik pesan"
            className="flex-1 bg-transparent outline-none placeholder-gray-400 text-gray-700 px-2 font-medium"
          />

          {/* Emoji Icon */}
          <button
            ref={emojiButtonRef}
            onClick={toggleEmojiPicker}
            className="flex-shrink-0 relative"
          >
            <Image
              src="/icons/emoji-purple.svg"
              alt="emoji icon"
              width={28}
              height={28}
              className="active:opacity-10 cursor-pointer"
            />
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 z-50">
                <EmojiPicker
                  isOpen={showEmojiPicker}
                  onClose={() => setShowEmojiPicker(false)}
                  onEmojiSelect={handleEmojiSelect}
                />
              </div>
            )}
          </button>

          {/* Send Icon */}
          <button onClick={handleSend} className="flex-shrink-0">
            <Image
              src="/icons/send-purple.svg"
              alt="send icon"
              width={36}
              height={36}
              className="active:opacity-10 cursor-pointer"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
