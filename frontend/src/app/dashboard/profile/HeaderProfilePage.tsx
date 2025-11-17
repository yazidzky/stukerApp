"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HeaderProfilePage() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/auth");
  };
  return (
    <div className="flex justify-between h-20 items-center ">
      <div className="w-[18px]"></div>
      <h1 className="text-primary text-xl font-semibold">Sunting Profil</h1>
      <Image
        src={"/icons/logout.svg"}
        alt="Logo"
        width={28}
        height={28}
        onClick={handleLogout}
        className="cursor-pointer opacity-80 hover:opacity-100 hover:scale-110 active:opacity-10"
      />
    </div>
  );
}
