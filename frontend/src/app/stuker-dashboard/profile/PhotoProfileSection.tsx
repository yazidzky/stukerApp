import Image from "next/image";
import { ChangeEvent, RefObject } from "react";

export default function PhotoProfileSection({
  handleClick,
  fileInputRef,
  handleFileChange,
  imageUrl,
}: {
  handleClick: () => void;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  imageUrl: string;
}) {
  return (
    <div className="flex justify-center mb-6 ">
      <div
        className="relative rounded-full flex justify-center self-center w-[100px]"
        onClick={handleClick}
      >
        <Image
          src={imageUrl}
          alt="Profile Photo"
          width={100}
          height={100}
          className="rounded-full object-cover"
        />
        <div className="absolute bottom-[-16px] bg-primary rounded-full p-1 border border-white">
          <Image
            src={"/icons/pencil.svg"}
            alt="Edit Button"
            width={20}
            height={20}
          />
        </div>
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
