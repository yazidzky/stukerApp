"use client";

import React, { useState, useRef, useEffect } from "react";
import ChatbotMessage from "./ChatbotMessage";
import { chatbotAPI } from "@/utils/function";

type Message = {
  role: "user" | "bot";
  text: string;
};

type GeminiHistory = {
  role: "user" | "model";
  parts: { text: string }[];
};

type Props = {
  onClose: () => void;
};

export default function ChatbotWindow({ onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Halo! Saya StuBot 👋 Asisten virtual StukerApp. Ada yang bisa saya bantu? / Hello! I am StuBot 👋 virtual assistant for StukerApp. How can I help you?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildGeminiHistory = (msgs: Message[]): GeminiHistory[] => {
    // Skip the welcome message and build history format
    return msgs.slice(1).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    const updatedMessages: Message[] = [
      ...messages,
      { role: "user", text: userMessage },
    ];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await chatbotAPI.chat(userMessage, buildGeminiHistory(updatedMessages.slice(0, -1)));
      if (response && response.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: response.reply },
        ]);
      } else {
        throw new Error("No response reply received");
      }
    } catch (error: any) {
      console.error("Chatbot response error:", error);
      const isRateLimited = error.message && (error.message.includes("Terlalu banyak") || error.message.includes("Too many requests"));
      
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: isRateLimited 
            ? "Maaf, Anda mengirim terlalu banyak pesan. Silakan tunggu 1 menit sebelum mencoba lagi. / Sorry, you are sending too many requests. Please wait 1 minute."
            : "Maaf, asisten virtual sedang tidak aktif. Silakan coba lagi nanti. / Sorry, virtual assistant is currently unavailable. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col bg-white rounded-2xl shadow-2xl w-80 sm:w-96 h-[480px] overflow-hidden border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-primary text-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-base">
            🤖
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight">StuBot</p>
            <p className="text-[11px] opacity-80 leading-none mt-0.5">StukerApp Virtual Assistant</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="opacity-75 hover:opacity-100 text-lg w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition"
        >
          ✕
        </button>
      </div>

      {/* CHAT MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
        {messages.map((msg, index) => (
          <ChatbotMessage key={index} role={msg.role} text={msg.text} />
        ))}
        {isLoading && (
          <div className="flex justify-start mb-3">
            <div className="bg-gray-100 text-gray-500 px-4 py-2.5 rounded-2xl rounded-bl-none text-xs border border-gray-200/50 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-3 border-t border-gray-200/80 bg-white flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tanyakan sesuatu... / Ask something..."
          disabled={isLoading}
          className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 disabled:opacity-50 transition"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="bg-primary text-white w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-40 hover:bg-primary/80 transition active:scale-95 shrink-0"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
