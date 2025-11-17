"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import BottomNav from "./BottomNav";

export default function StukerDashboardLayout({
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

      // Only redirect if user ONLY has 'user' role (doesn't have 'stuker' role)
      // If user has both roles, allow access to stuker dashboard
      if (user?.role?.includes('user') && !user?.role?.includes('stuker')) {
        router.push("/dashboard");
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

  // Don't render anything if not authenticated or user ONLY has 'user' role
  // If user has both roles, allow access to stuker dashboard
  if (!isAuthenticated || (user?.role?.includes('user') && !user?.role?.includes('stuker'))) {
    return null;
  }

  return (
    <div className=" w-[100%] h-[100dvh] relative">
      <div className="h-[100dvh] overflow-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] ">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
