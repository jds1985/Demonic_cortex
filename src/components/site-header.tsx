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
        <DcMonogram />
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

function DcMonogram() {
  return (
        <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path d="M18 20c2-12 0-16-8-20 8 2 14 10 12 20" fill="none" stroke="#ff6a2a" strokeWidth="2.2" />
      <path d="M46 20c-2-12 0-16 8-20-8 2-14 10-12 20" fill="none" stroke="#ff6a2a" strokeWidth="2.2" />
      <path
        d="M14 18v28M14 18h10c11 0 16 6 16 14s-5 14-16 14H14"
        fill="none"
        stroke="#f6efe6"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M28 24h8c9 0 14 4.5 14 10s-5 10-14 10H22"
        fill="none"
        stroke="#ffb070"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <ellipse cx="24" cy="54" rx="6" ry="3" fill="none" stroke="#c6a15a" strokeWidth="1.7" />
      <ellipse cx="34" cy="54" rx="6" ry="3" fill="none" stroke="#c6a15a" strokeWidth="1.7" />
    </svg>
  );
}
