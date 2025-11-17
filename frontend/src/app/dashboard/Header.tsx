"use client";

import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { user } = useAuth();

  return (
    <div className="w-[100%] h-28 flex justify-between pt-6 items-center">
      <Image
        src={user?.profilePicture || "/images/profilePhoto.png"}
        alt="Profile"
        width={90}
        height={90}
        className="w-14 h-14 rounded-full"
      />
      <Image
        src={"/stuker-logo.svg"}
        alt="Logo"
        width={90}
        height={90}
        className="w-11 h-11"
      />
    </div>
  );
}
