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
  const onHome = pathname === "/";

  return (
    <header className={onHome ? "site-header site-header-home" : "site-header site-header-inner"}>
      <div className="gate-arch" aria-hidden="true">
        <GateArch />
      </div>
      {onHome ? (
        <h1 id="hero-title" className="gate-title">
          <span className="visually-hidden">Demonic Cortex</span>
          <TitleArt decorative />
        </h1>
      ) : (
        <Link href="/" className="gate-title">
          <TitleArt />
        </Link>
      )}
      <SiteMenu pathname={pathname} />
    </header>
  );
}

function TitleArt({ decorative = false }: { decorative?: boolean }) {
  return (
    <picture>
      <source srcSet="/art/title.webp" type="image/webp" />
      <img src="/art/title.png" alt={decorative ? "" : "Demonic Cortex"} width={813} height={140} />
    </picture>
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

function GateArch() {
  return (
    <svg viewBox="0 0 1000 420" preserveAspectRatio="none" focusable="false">
      <path
        d="M36 420V214C36 96 190 46 470 30L500 8l30 22c280 16 434 66 434 184V420"
        fill="#0c0708"
        stroke="#6a2c1c"
        strokeWidth="8"
      />
      <path
        d="M78 420V236C78 128 214 78 474 60L500 38l26 22c260 18 396 68 396 176V420"
        fill="none"
        stroke="#ff4d1a"
        strokeWidth="3"
      />
      <path
        d="M98 420V248C98 148 230 98 478 80L500 60l22 20c248 18 380 68 380 168V420"
        fill="none"
        stroke="#ffb070"
        strokeWidth="1.5"
        opacity="0.85"
      />
      <path d="M500 8l22 34-22 14-22-14z" fill="#1a0a0c" stroke="#ff6a2a" strokeWidth="2" />
      <path d="M36 206h34M930 206h34" fill="none" stroke="#8a3a22" strokeWidth="3" />
      <path d="M70 250c18-8 18-22 0-30M930 250c-18-8-18-22 0-30" fill="none" stroke="#c4552a" strokeWidth="2" />
    </svg>
  );
}
