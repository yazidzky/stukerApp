import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CustomerSection({
  stukerImage,
  customerRate,
  customerName,
}: {
  stukerImage: string;
  customerRate: number;
  customerName?: string;
}) {
  const router = useRouter();
  return (
    <div className="flex justify-between items-center  rounded-md">
      <div className="flex gap-x-3 p-2">
        <Image
          src={stukerImage || "/images/profilePhoto.png"}
          alt="customer profile"
          width={54}
          height={54}
          className="rounded-full"
        />
        <div className="flex flex-col justify-center">
          <p className="font-medium">{customerName || "Customer"}</p>
          <p className="text-sm">Customer</p>
        </div>
      </div>
      <div
        className=" p-2 flex rounded-md gap-x-1 items-center mr-1 border border-gray-300 rounded-full cursor-pointer active:opacity-30"
        onClick={() => router.push("/stuker-order/chat")}
      >
        <Image
          src={"/icons/message-purple.svg"}
          alt="Message"
          width={30}
          height={30}
        />
      </div>
    </div>
  );
}
