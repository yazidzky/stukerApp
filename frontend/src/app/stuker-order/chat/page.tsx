"use client";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { orderAPI } from "@/utils/function";
import ChatSection from "@/app/order/chat/ChatSection";
import HeaderChat from "./Header";

export default function ChatPage() {
  const { user } = useAppSelector((state) => state.auth);
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

        // Stuker is viewing, so show customer info
        setChatPartner({
          urlProfile: orderData.customer_image || "/images/profilePhoto.png",
          username: orderData.customer_name || "Customer",
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
        <HeaderChat
          urlProfile={chatPartner.urlProfile}
          username={chatPartner.username}
        />
      </div>
      <div className="w-[100%] h-[100dvh] bg-[url('/illustrations/doodle.svg')] bg-no-repeat bg-center bg-cover flex justify-center items-center pt-[10vh]">
        <ChatSection />
      </div>
    </div>
  );
}
