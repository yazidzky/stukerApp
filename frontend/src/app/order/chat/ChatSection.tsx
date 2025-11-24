"use client";
import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import BottomInputChatComponent from "./BottomInputChatComponent";
import MyChat from "./MyChat";
import TheirChat from "./TheirChat";
import { useAppSelector } from "@/store/hooks";

interface ChatMessage {
  _id?: string;
  senderId: string;
  type?: "text" | "image" | "text-image";
  text?: string;
  imageUrl?: string;
  time: number;
}

export default function ChatSection() {
  const { user } = useAppSelector((state) => state.auth);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Helper function to decode JWT token (without verification, just for getting user ID)
  const getUserIdFromToken = (token: string): string | null => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const decoded = JSON.parse(jsonPayload);
      return decoded.id ? String(decoded.id) : null;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("token");
    const orderId = localStorage.getItem("currentOrderId");

    if (!orderId) {
      console.error("No orderId found in localStorage");
      return;
    }

    // Ensure user.id is set - use token as fallback
    if (!user.id && token) {
      const userIdFromToken = getUserIdFromToken(token);
      if (userIdFromToken) {
        console.log(
          "⚠️ User ID not found in user object, using token:",
          userIdFromToken
        );
        // Update user object with ID from token
        const updatedUser = { ...user, id: userIdFromToken };
        // Note: This won't persist, but will work for this session
      }
    }

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : "");
    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    newSocket.on("connect", () => {
      console.log("✅ Connected to socket, joining order:", orderId);
      newSocket.emit("join-order", orderId);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
      console.error("Socket URL:", socketUrl);
      console.error("Error details:", error.message);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("⚠️ Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        // Server disconnected the socket, try to reconnect manually
        newSocket.connect();
      }
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Reconnected to socket, attempt:", attemptNumber);
      newSocket.emit("join-order", orderId);
    });

    newSocket.on("reconnect_attempt", () => {
      console.log("🔄 Attempting to reconnect...");
    });

    newSocket.on("reconnect_error", (error) => {
      console.error("❌ Reconnection error:", error);
    });

    newSocket.on("reconnect_failed", () => {
      console.error("❌ Reconnection failed after all attempts");
      alert("Tidak dapat terhubung ke server. Silakan refresh halaman.");
    });

    newSocket.on("error", (error: { message: string }) => {
      console.error("❌ Socket error:", error.message);
      // Only show alert for critical errors, not for connection issues
      if (error.message && !error.message.includes("xhr poll error")) {
        alert(`Error: ${error.message}`);
      }
    });

    newSocket.on("chat-history", (history: ChatMessage[]) => {
      console.log("Received chat history:", history);
      // Convert senderId and _id to string if they're ObjectIds
      const formattedHistory = history.map((msg) => ({
        ...msg,
        _id: msg._id ? String(msg._id) : undefined,
        senderId: String(msg.senderId),
      }));
      setMessages(formattedHistory);
    });

    newSocket.on("chat", (message: ChatMessage) => {
      console.log("Received new message:", message);
      // Convert senderId to string if it's an ObjectId
      const formattedMessage = {
        ...message,
        _id: message._id ? String(message._id) : undefined,
        senderId: String(message.senderId),
      };
      // Check if message already exists to avoid duplicates
      setMessages((prev) => {
        if (
          formattedMessage._id &&
          prev.some((msg) => msg._id === formattedMessage._id)
        ) {
          return prev;
        }
        return [...prev, formattedMessage];
      });
      if (message.imageUrl) {
        setPreviewImage(null);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const handleSendMessage = (text: string) => {
    if (!socket || !user) return;

    const orderId = localStorage.getItem("currentOrderId");
    if (!orderId) {
      console.error("No orderId found in localStorage");
      return;
    }

    const imageUrl = previewImage;
    socket.emit("chat", {
      orderId,
      text: text || undefined,
      imageUrl: imageUrl || undefined,
    });
    // Clear preview after sending
    setPreviewImage(null);
  };

  const handleImageSelect = (image: string) => {
    setPreviewImage(image);
  };

  const handleCancelPreview = () => {
    setPreviewImage(null);
  };

  return (
    <div className="w-[100%] h-[calc(100dvh-10vh-4.5rem)] flex flex-col justify-between pb-[3vh] relative">
      <div className="flex flex-col gap-y-3 py-2 px-3 overflow-y-scroll scrollbar-hide pb-18">
        {messages.map((msg, index) => {
          // Get user ID - try from user object first, then from token
          const token = localStorage.getItem("token");
          let currentUserId: string | null = null;

          if (user?.id) {
            currentUserId = String(user.id).replace(/\s/g, "");
          } else if (token) {
            // Fallback: get ID from token
            const base64Url = token.split(".")[1];
            if (base64Url) {
              try {
                const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split("")
                    .map(
                      (c) =>
                        "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                    )
                    .join("")
                );
                const decoded = JSON.parse(jsonPayload);
                currentUserId = decoded.id
                  ? String(decoded.id).replace(/\s/g, "")
                  : null;
              } catch (e) {
                console.error("Error decoding token:", e);
              }
            }
          }

          const messageSenderId = String(msg.senderId || "").replace(/\s/g, "");

          // Normalize both IDs for comparison - remove any ObjectId wrapper if present
          const normalizedCurrentUserId = currentUserId
            ? currentUserId.replace(/^ObjectId\(|\)$/g, "").trim()
            : null;
          const normalizedMessageSenderId = messageSenderId
            .replace(/^ObjectId\(|\)$/g, "")
            .trim();

          // Debug logging for first few messages
          if (index < 3) {
            console.log(`🔍 Message ${index}:`, {
              originalCurrentUserId: currentUserId,
              originalMessageSenderId: messageSenderId,
              normalizedCurrentUserId,
              normalizedMessageSenderId,
              exactMatch: normalizedCurrentUserId === normalizedMessageSenderId,
              lengthMatch:
                normalizedCurrentUserId?.length ===
                normalizedMessageSenderId?.length,
              isMyMessage:
                normalizedCurrentUserId === normalizedMessageSenderId,
              userExists: !!user?.id,
              tokenExists: !!token,
              msgText: msg.text?.substring(0, 20),
            });
          }

          // Compare: if senderId matches current user's ID, it's my message (right side)
          // Otherwise, it's from someone else (left side)
          const isMyMessage =
            normalizedCurrentUserId &&
            normalizedMessageSenderId &&
            normalizedCurrentUserId === normalizedMessageSenderId;

          const messageKey = msg._id || `${msg.time}-${index}`;

          // MyChat = messages sent by current user (right side, purple/terang)
          // TheirChat = messages received from others (left side, buram)
          if (isMyMessage) {
            return (
              <MyChat
                key={messageKey}
                textChat={msg.text}
                imageUrl={msg.imageUrl}
              />
            );
          } else {
            return (
              <TheirChat
                key={messageKey}
                textChat={msg.text}
                imageUrl={msg.imageUrl}
              />
            );
          }
        })}
        <div ref={messagesEndRef} />
      </div>
      <BottomInputChatComponent
        onSendMessage={handleSendMessage}
        onImageSelect={handleImageSelect}
        previewImage={previewImage}
        onCancelPreview={handleCancelPreview}
      />
    </div>
  );
}
