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
      text: "Halo! Saya StuBot 👋 Asisten virtual StukerApp. Ada yang bisa saya bantu? \n --------------------------------Hello! I am StuBot 👋 virtual assistant for StukerApp. How can I help you?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildGeminiHistory = (msgs: Message[]): GeminiHistory[] => {
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
    <div className="flex flex-col bg-white rounded-2xl shadow-2xl w-80 sm:w-80 h-[500px] overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between px-4 py-4 bg-primary text-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-lg border border-white/20">
            🤖
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-primary rounded-full animate-pulse"></span>
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight tracking-wide">StuBot</p>
            <p className="text-[11px] text-white/80 leading-none mt-0.5">Online • Asisten StukerApp</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50/70 space-y-4 scrollbar-thin">
        {messages.map((msg, index) => (
          <ChatbotMessage key={index} role={msg.role} text={msg.text} />
        ))}
        
        {isLoading && (
          <div className="flex justify-start items-center gap-2 animate-fade-in">
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs shrink-0">🤖</div>
            <div className="bg-white text-gray-500 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3.5 border-t border-gray-200 bg-gray-50 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tanyakan sesuatu di sini..."
          disabled={isLoading}
          className="flex-1 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm outline-none font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60 disabled:bg-gray-100 transition-all duration-200"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="bg-primary text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-md shadow-primary/20 disabled:shadow-none disabled:opacity-40 hover:bg-primary/90 transition-all duration-200 active:scale-95 shrink-0"
          aria-label="Send Message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 transform rotate-45 -translate-x-0.5 translate-y-0.5">
            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}