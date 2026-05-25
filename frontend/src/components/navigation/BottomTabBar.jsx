"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/home", label: "홈" },
  { href: "/records", label: "기록" },
  { href: "/matches/new", label: "생성" },
  { href: "/matches", label: "경기" },
  { href: "/account", label: "내 정보" },
];

function isActive(pathname, href) {
  if (href === "/home") {
    return pathname === "/home";
  }

  if (href === "/matches/new") {
    return pathname === "/matches/new";
  }

  if (href === "/matches") {
    if (pathname === "/matches/new") {
      return false;
    }

    return pathname === "/matches"
      || /^\/matches\/[^/]+$/.test(pathname)
      || /^\/matches\/[^/]+\/record$/.test(pathname)
      || /^\/matches\/[^/]+\/records\/[^/]+$/.test(pathname)
      || /^\/matches\/[^/]+\/records\/[^/]+\/edit$/.test(pathname);
  }

  return pathname === href;
}

export default function BottomTabBar({ className = "" }) {
  const pathname = usePathname();

  return (
    <nav className={`bottom-tab-bar ${className}`.trim()} aria-label="하단 탭">
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
