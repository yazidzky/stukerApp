import Image from "next/image";

export default function LayoutAuthPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className=" w-[100%]">
      <div className="w-[100%] h-[20dvh] bg-[url('/illustrations/doodle.svg')] bg-no-repeat bg-center bg-cover flex justify-center items-center">
        <Image src={"/stuker-logo.svg"} alt="Logo" width={90} height={90} />
      </div>
      <div>{children}</div>
    </div>
  );
}
