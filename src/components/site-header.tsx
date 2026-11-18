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
            <rect x="2" y="2" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="6" y="16" width="20" height="6" fill="#6e1420" />
            <circle cx="21" cy="11" r="3" fill="#c4473a" />
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
