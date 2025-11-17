"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "History",
      href: "/dashboard/history",
      activeIcon: "/icons/history-purple.svg",
      inactiveIcon: "/icons/history.svg",
    },
    {
      name: "Home",
      href: "/dashboard",
      activeIcon: "/icons/home-purple.svg",
      inactiveIcon: "/icons/home.svg",
    },

    {
      name: "Profile",
      href: "/dashboard/profile",
      activeIcon: "/icons/profile-purple.svg",
      inactiveIcon: "/icons/profile.svg",
    },
  ];
  return (
    <nav className="fixed bottom-0 h-[10vh] w-[100%] border-t border-gray-300 rounded-t-2xl flex items-center justify-around px-0 sm:px-8  bg-white max-w-112">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.name} href={item.href}>
            <Image
              src={isActive ? item.activeIcon : item.inactiveIcon}
              alt={item.name}
              width={item.name === "Home" ? 30 : 34}
              height={item.name === "Home" ? 30 : 34}
              priority
              className={
                isActive
                  ? "scale-105 text-[#6B4EFF] drop-shadow-[0_0_10px_rgba(107,78,255,0.6)] transition-all duration-200 ease-in-out"
                  : ""
              }
            />
          </Link>
        );
      })}
    </nav>
  );
}
