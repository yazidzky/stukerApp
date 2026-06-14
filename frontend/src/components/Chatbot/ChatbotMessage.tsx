"use client";
import React from "react";

type MessageProps = {
  role: "user" | "bot";
  text: string;
};

export default function ChatbotMessage({ role, text }: MessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex mb-3 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
          ${isUser
            ? "bg-primary text-white rounded-br-none"
            : "bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200/50"
          }
        `}
      >
        {text.split("\n").map((line, i) => (
          <span key={i}>
            {line}
            {i < text.split("\n").length - 1 && <br />}
          </span>
        ))}
      </div>
    </div>
  );
}
