import { useEffect } from "react";

export default function NotificationSection({
  notifications,
}: {
  notifications: {
    notification_id: string;
    message: string;
    created_at: string;
  }[];
}) {
  const formatDate = (notifDate: string) => {
    return new Date(notifDate).toLocaleString("id-ID", {
      hour12: false, // 24 jam
      hour: "2-digit", // selalu 2 digit, misal 08, 16
      minute: "2-digit", // tampil menit aja
      second: undefined, // sembunyikan detik
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  useEffect(() => {
    // ✅ Hapus halaman sebelumnya dari history
    history.pushState(null, "", location.href);
    window.onpopstate = () => {
      history.pushState(null, "", location.href);
    };

    // 🧹 Bersihkan event listener saat unmount
    return () => {
      window.onpopstate = null;
    };
  }, []);
  return (
    <div className="mt-3 gap-y-2 flex flex-col">
      <h1 className=" text-primary text-xl font-medium">Pemberitahuan</h1>
      {notifications.map((notif) => (
        <div
          key={notif.notification_id}
          className="shadow-[0_4px_15px_rgba(0,0,0,0.1)] py-3 px-4 rounded-md transition-all duration-200 flex flex-col gap-y-2"
        >
          <p>{notif.message}</p>
          <p className="font-medium text-sm self-end">
            {formatDate(notif.created_at)}
          </p>
        </div>
      ))}
    </div>
  );
}
