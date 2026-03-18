"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/home", label: "홈" },
  { href: "/records", label: "기록" },
  { href: "/games/new", label: "생성" },
  { href: "/games", label: "경기" },
  { href: "/account", label: "내 정보" },
];

function isActive(pathname, href) {
  if (href === "/home") {
    return pathname === "/home";
  }

  if (href === "/games") {
    return pathname === "/games" || /^\/games\/[^/]+$/.test(pathname);
  }

  return pathname === href;
}

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="bottom-tab-bar" aria-label="하단 탭">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={isActive(pathname, tab.href) ? "bottom-tab active" : "bottom-tab"}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
