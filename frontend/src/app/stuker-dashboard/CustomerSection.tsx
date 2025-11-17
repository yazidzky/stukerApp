import Image from "next/image";

export default function CustomerSection({
  customerImage,
  customerRate,
  customerName,
}: {
  customerName: string;
  customerImage: string;
  customerRate: number;
}) {
  return (
    <div className="flex justify-between items-center  rounded-md">
      <div className="flex gap-x-3 p-2">
        <Image
          src={customerImage || "/images/profilePhoto.png"}
          alt="stuker profile"
          width={54}
          height={54}
          className="rounded-full"
        />
        <div className="flex flex-col justify-center">
          <p className="font-medium">{customerName}</p>
          <p className="text-sm">Customer</p>
        </div>
      </div>
      <div className="border py-1 px-2 flex rounded-md gap-x-1 items-center mr-6 border border-gray-300">
        <Image src={"/icons/star.svg"} alt="Star" width={20} height={20} />
        <p>{(customerRate / 10).toFixed(1)}</p>
      </div>
    </div>
  );
}
