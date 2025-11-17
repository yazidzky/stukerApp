"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { orderAPI } from "@/utils/function";
import ChatSection from "./ChatSection";
import HeaderChat from "./Header";

export default function ChatPage() {
  const { user } = useAuth();
  const [chatPartner, setChatPartner] = useState<{
    urlProfile: string;
    username: string;
  }>({
    urlProfile: "/images/profilePhoto.png",
    username: "Loading...",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChatPartner = async () => {
      try {
        const orderId = localStorage.getItem("currentOrderId");
        if (!orderId) {
          setChatPartner({
            urlProfile: "/images/profilePhoto.png",
            username: "Unknown",
          });
          setLoading(false);
          return;
        }

        const orderData = await orderAPI.getOrder(orderId);
        
        // Since we're in /order/chat, user is a customer
        // Show stuker info as chat partner
        setChatPartner({
          urlProfile: orderData.stuker_image || "/images/profilePhoto.png",
          username: orderData.stuker_name || "Stuker",
        });
      } catch (error) {
        console.error("Error fetching chat partner:", error);
        setChatPartner({
          urlProfile: "/images/profilePhoto.png",
          username: "Unknown",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchChatPartner();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="w-[100%] h-[100dvh] flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 z-50 w-[100%] max-w-112">
        <HeaderChat urlProfile={chatPartner.urlProfile} username={chatPartner.username} />
      </div>
      <div className="w-[100%] h-[100dvh] bg-[url('/illustrations/doodle.svg')] bg-no-repeat bg-center bg-cover flex justify-center items-center pt-[10vh]">
        <ChatSection />
      </div>
    </div>
  );
}
