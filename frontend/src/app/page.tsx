"use client";
import ButtonPrimary from "@/components/ButtonPrimary";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const handleRouter = () => {
    router.push("/auth");
  };

  return (
    <div className="h-[100dvh] flex flex-col justify-between py-8 pt-36">
      <div className="flex justify-center">
        <Image src={"/stuker-logo.svg"} alt="Logo" width={120} height={120} />
      </div>
      <div className="w-[100%] px-6 flex justify-center">
        <ButtonPrimary label="Mulai" onClick={handleRouter} />
      </div>
    </div>
  );
}
