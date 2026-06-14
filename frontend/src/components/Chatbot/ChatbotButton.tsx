"use client";

import React, { useState } from "react";
import ChatbotWindow from "./ChatbotWindow";
import { useAuth } from "@/context/AuthContext";

export default function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();

  // Only render chatbot if user is logged in
  if (loading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-3 font-sans">
      {isOpen && <ChatbotWindow onClose={() => setIsOpen(false)} />}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-primary/80 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        title="StuBot Chatbot"
      >
        {isOpen ? "✕" : "💬"}
      </button>
    </div>
  );
}
