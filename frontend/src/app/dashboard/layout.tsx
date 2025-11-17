"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import BottomNav from "./BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/auth");
        return;
      }

      // Only redirect if user ONLY has 'stuker' role (doesn't have 'user' role)
      // If user has both roles, allow access to user dashboard
      if (user?.role?.includes('stuker') && !user?.role?.includes('user')) {
        router.push("/stuker-dashboard");
        return;
      }
    }
  }, [isAuthenticated, loading, user, router]);

  // Show loading or redirecting state
  if (loading) {
    return (
      <div className="w-full h-[100dvh] flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Don't render anything if not authenticated or user ONLY has 'stuker' role
  // If user has both roles, allow access to user dashboard
  if (!isAuthenticated || (user?.role?.includes('stuker') && !user?.role?.includes('user'))) {
    return null;
  }

  return (
    <div className=" w-[100%] relative">
      <div className="h-[100dvh] overflow-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
