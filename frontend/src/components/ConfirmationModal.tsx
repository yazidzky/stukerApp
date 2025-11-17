import Image from "next/image";
import Button from "./ButtonPrimary";
import { useState } from "react";
export default function ConfirmModalComponent({
  illustrationUrl,
  message,
  confirm,
  showModal,
  setShowModal,
}: {
  message: string;
  illustrationUrl: string;
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  confirm: () => void;
}) {
  return (
    <div
      className={`w-[86%] gap-y-4 bg-white border border-gray-300 absolute z-10 top-2/5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-xl p-4 flex flex-col items-center pb-6 
      justify-between max-w-108 ${showModal ? "block" : "hidden"}`}
    >
      <Image
        src={illustrationUrl}
        alt="illustration"
        width={180}
        height={180}
      />
      <div>
        <p className="text-center font-medium text-xl">Tunggu dulu!</p>
        <p className="text-center">{message}</p>
      </div>
      <div className="flex w-[100%] gap-x-2">
        <Button
          label="Batal"
          className="bg-white text-primary "
          onClick={() => setShowModal(false)}
        />
        <Button label="Simpan" onClick={confirm} />
      </div>
    </div>
  );
}
