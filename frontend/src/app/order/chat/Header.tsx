"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HeaderChat({
  urlProfile,
  username,
}: {
  urlProfile: string;
  username: string;
}) {
  const router = useRouter();
  return (
    <div className="bg-primary h-[10vh] flex ps-4 items-center gap-x-3">
      <Image
        src={"/icons/arrow-white.svg"}
        alt="Arrow"
        width={38}
        height={38}
        onClick={() => router.back()}
        className="text-primary hover:scale-105 opacity-90 hover:opacity-100 cursor-pointer active:opacity-10"
      />
      <Image
        src={urlProfile}
        width={38}
        height={38}
        className="rounded-full w-12 h-12"
        alt="Foto Profil"
      />
      <p className="text-white font-medium text-lg">{username}</p>
    </div>
  );
}
