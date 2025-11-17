import { limitText } from "@/utils/function";
export default function WellcomeText({
  username = "Teman",
}: {
  username: string;
}) {
  return (
    <div className="font-sans flex flex-col">
      <h1 className="text-3xl font-normal font-sans">Selamat Datang,</h1>
      <h1 className="text-4xl font-bold text-[#F49BAB] font-sans">
        {limitText(username, 24)}!
      </h1>
    </div>
  );
}
