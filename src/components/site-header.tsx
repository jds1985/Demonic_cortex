"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/#chapters", label: "Chapters" },
  { href: "/characters", label: "Characters" },
  { href: "/subscribe", label: "Subscribe" },
];

export function SiteHeader() {
  const pathname = usePathname();
  return <HeaderBar pathname={pathname} />;
}

export function HeaderBar({ pathname }: { pathname: string }) {
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link className="brand" href="/">
          <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
            <circle cx="16" cy="18" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M10 12c2-7 1-9-2-11 4 1 7 5 6 10" fill="none" stroke="#ff6a2a" strokeWidth="2" />
            <path d="M22 12c-2-7-1-9 2-11-4 1-7 5-6 10" fill="none" stroke="#ff6a2a" strokeWidth="2" />
            <path d="M8 24h16" stroke="#8a5a32" strokeWidth="2" />
          </svg>
          <span>Demonic Cortex</span>
        </Link>
        <nav aria-label="Primary">
          <ul>
            {LINKS.map((link) => {
              const current = link.href === "/" ? pathname === "/" : pathname === link.href;
              return (
                <li key={link.href}>
                  <Link href={link.href} aria-current={current ? "page" : undefined}>
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
