"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
export default function Alert({
  message,
  localStorageName,
}: {
  message: string;
  localStorageName: string;
}) {
  const [visibility, setVisibility] = useState<boolean>(false);
  useEffect(() => {
    const alreadyShown = localStorage.getItem(localStorageName);

    if (!alreadyShown) {
      const timer = setTimeout(() => {
        setVisibility(true);
        localStorage.setItem(localStorageName, "true");
      }, 20);
      const timer2 = setTimeout(() => {
        setVisibility(false);
      }, 3500);

      return () => {
        clearTimeout(timer);
        clearTimeout(timer2);
      };
    }
  }, []);
  return (
    <div
      className={`absolute bg-[#E1CCEC] flex border border-gray-300 w-[92%] max-w-108 left-1/2 -translate-x-1/2 py-2 px-4 gap-x-3 items-center rounded-xl ${
        visibility ? "top-3" : "top-[-130]"
      } transisition-all duration-300 z-10`}
    >
      <Image
        src={"/illustrations/dashboardBoy.svg"}
        alt="Dashboard Boy"
        width={50}
        height={50}
      />
      <div className="flex justify-center flex-1">
        <p className="font-medium text-md text-center">{message}</p>
      </div>
    </div>
  );
}
