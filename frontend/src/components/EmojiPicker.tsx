"use client";
import { useState, useEffect, useRef } from "react";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

// Popular emojis organized by category
const emojiCategories = {
  smileys: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓"],
  gestures: ["👋", "🤚", "🖐", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏"],
  hearts: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"],
  objects: ["📦", "📱", "💻", "⌚", "📷", "📹", "🎥", "📺", "📻", "🎙️", "🎚️", "🎛️", "⏱️", "⏲️", "⏰", "🕰️", "⌛", "⏳", "📡", "🔋", "🔌", "💡", "🔦", "🕯️", "🧯", "🛢️", "💸", "💵", "💴", "💶", "💷", "💰", "💳", "💎", "⚖️", "🧰", "🔧", "🔨", "⚒️", "🛠️", "⛏️", "🔩", "⚙️", "🧱", "⛓️", "🧲", "🔫", "💣", "🧨", "🔪", "🗡️", "⚔️", "🛡️", "🚬", "⚰️", "⚱️", "🏺", "🔮", "📿", "🧿"],
  symbols: ["✅", "❌", "❓", "❔", "❕", "❗", "💯", "🔟", "🔠", "🔡", "🔢", "🔣", "🔤", "🅰️", "🆎", "🆑", "🆒", "🆓", "ℹ️", "🆔", "Ⓜ️", "🆕", "🆖", "🅾️", "🆗", "🅿️", "🆘", "🆙", "🆚", "🈁", "🈂️", "🈷️", "🈶", "🈯", "🉐", "🈹", "🈲", "🉑", "🈸", "🈴", "🈳", "㊗️", "㊙️", "🈺", "🈵", "🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "⚫", "⚪", "🟤", "🔶", "🔷", "🔸", "🔹", "🔺", "🔻", "💠", "🔘", "🔳", "🔲"],
};

export default function EmojiPicker({ onEmojiSelect, isOpen, onClose }: EmojiPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={pickerRef}
      className="bg-white border border-gray-300 rounded-xl shadow-lg p-4 w-[320px] max-h-[300px] overflow-y-auto"
    >
      <div className="space-y-4">
        {/* Smileys */}
        <div>
          <h3 className="text-xs font-semibold text-gray-600 mb-2">Smileys & People</h3>
          <div className="grid grid-cols-8 gap-1">
            {emojiCategories.smileys.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiClick(emoji)}
                className="text-2xl hover:bg-gray-100 rounded-lg p-1 transition-colors active:scale-90"
                type="button"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Gestures */}
        <div>
          <h3 className="text-xs font-semibold text-gray-600 mb-2">Gestures</h3>
          <div className="grid grid-cols-8 gap-1">
            {emojiCategories.gestures.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiClick(emoji)}
                className="text-2xl hover:bg-gray-100 rounded-lg p-1 transition-colors active:scale-90"
                type="button"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Hearts */}
        <div>
          <h3 className="text-xs font-semibold text-gray-600 mb-2">Hearts</h3>
          <div className="grid grid-cols-8 gap-1">
            {emojiCategories.hearts.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiClick(emoji)}
                className="text-2xl hover:bg-gray-100 rounded-lg p-1 transition-colors active:scale-90"
                type="button"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Objects */}
        <div>
          <h3 className="text-xs font-semibold text-gray-600 mb-2">Objects</h3>
          <div className="grid grid-cols-8 gap-1">
            {emojiCategories.objects.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiClick(emoji)}
                className="text-2xl hover:bg-gray-100 rounded-lg p-1 transition-colors active:scale-90"
                type="button"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Symbols */}
        <div>
          <h3 className="text-xs font-semibold text-gray-600 mb-2">Symbols</h3>
          <div className="grid grid-cols-8 gap-1">
            {emojiCategories.symbols.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiClick(emoji)}
                className="text-2xl hover:bg-gray-100 rounded-lg p-1 transition-colors active:scale-90"
                type="button"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

