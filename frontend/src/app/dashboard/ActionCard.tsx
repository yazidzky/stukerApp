"use client";
import ButtonPrimary from "@/components/ButtonPrimary";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ActionCard() {
  const router = useRouter();
  const handleNav = () => {
    router.push("/order");
  };

  return (
    <div className="flex h-40 shadow-[0_4px_15px_rgba(0,0,0,0.1)] rounded-xl p-4 justify-between items-center mt-5">
      <div className="w-[78%]">
        <h1 className="text-xl sm:text-2xl">Perlu apa hari ini?</h1>
        <h1 className="text-xl sm:text-2xl">yuk nitip!</h1>
        <ButtonPrimary
          label="Nitip sekarang"
          className="py-2 w-[96%] sm:w-[80%] mt-3 text-md sm:text-lg"
          onClick={handleNav}
        />
      </div>
      <Image
        src={"/illustrations/dashboardBoy.svg"}
        alt="Dashboard Boy"
        width={110}
        height={110}
      />
    </div>
  );
}
