"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { ReadingSettings } from "./reading-settings";

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
          Demonic Cortex
        </Link>
        <SiteMenu pathname={pathname} />
      </div>
    </header>
  );
}

function SiteMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    }

    function onPointer(event: PointerEvent) {
      const root = rootRef.current;
      if (!root || !(event.target instanceof Node) || root.contains(event.target)) return;
      setOpen(false);
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  function close() {
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="site-menu">
      <button
        ref={buttonRef}
        type="button"
        className="menu-button"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <HamburgerIcon />
      </button>
      {open ? (
        <nav ref={panelRef} id={panelId} className="menu-panel" aria-label="Primary">
          <ul>
            {LINKS.map((link) => {
              const current = link.href === "/" ? pathname === "/" : pathname === link.href;
              return (
                <li key={link.href}>
                  <Link href={link.href} aria-current={current ? "page" : undefined} onClick={close}>
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <ReadingSettings embedded />
        </nav>
      ) : null}
    </div>
  );
}

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
