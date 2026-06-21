"use client";

import React, { useState } from "react";
import ChatbotWindow from "./ChatbotWindow";
import { useAuth } from "@/context/AuthContext";

export default function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();

  if (loading || !isAuthenticated) {
    return null;
  }

  return (
    <div
  className="
    absolute bottom-35 right-10 z-50
  "
>
  <div className="flex justify-end pointer-events-auto">
    {isOpen && <ChatbotWindow onClose={() => setIsOpen(false)} />}

    <button
      onClick={() => setIsOpen(!isOpen)}
      className="w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-primary/80 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
    >
      {isOpen ? "✕" : "💬"}
    </button>
  </div>
</div>
  );
}
