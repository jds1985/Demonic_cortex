"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { registerMenuOpener, SoundtrackMenu, useSoundtrackPlaying } from "./music-player";
import { ReadingSettings } from "./reading-settings";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/#chapters", label: "Chapters" },
  { href: "/journal", label: "Rayne's Journal" },
  { href: "/characters", label: "Characters" },
  { href: "/subscribe", label: "Subscribe" },
];

export function SiteHeader() {
  const pathname = usePathname();
  return <HeaderBar pathname={pathname} />;
}

const GATE_WIDTHS = [640, 960, 1152] as const;

function gateSrcSet(extension: "webp" | "jpg") {
  return GATE_WIDTHS.map((width) => `/art/gate-${width}.${extension} ${width}w`).join(", ");
}

function GateArt() {
  return (
    <picture className="gate-art">
      <source type="image/webp" sizes="100vw" srcSet={gateSrcSet("webp")} />
      <img
        src="/art/gate-1152.jpg"
        srcSet={gateSrcSet("jpg")}
        sizes="100vw"
        alt="Demonic Cortex"
        width={1152}
        height={800}
        fetchPriority="high"
      />
    </picture>
  );
}

export function HeaderBar({ pathname }: { pathname: string }) {
  const onHome = pathname === "/";

  return (
    <header className={onHome ? "site-header site-header-home" : "site-header site-header-inner"}>
      {onHome ? (
        <h1 id="hero-title" className="visually-hidden">
          Demonic Cortex
        </h1>
      ) : null}
      {onHome ? (
        <GateArt />
      ) : (
        <Link href="/" className="gate-home">
          <GateArt />
        </Link>
      )}
      <SiteMenu pathname={pathname} />
    </header>
  );
}

function SiteMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const panelId = useId();
  const playing = useSoundtrackPlaying();
  const openedFromSoundtrack = useRef(false);

  useEffect(
    () =>
      registerMenuOpener(() => {
        openedFromSoundtrack.current = true;
        setOpen(true);
      }),
    [],
  );

  useEffect(() => {
    if (!open) return;
    if (openedFromSoundtrack.current) {
      openedFromSoundtrack.current = false;
      return;
    }
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
        aria-label={playing ? "Menu, soundtrack playing" : "Menu"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <HamburgerIcon />
        {playing ? <span className="menu-playing" aria-hidden="true" /> : null}
      </button>
      <nav ref={panelRef} id={panelId} className="menu-panel" aria-label="Primary" hidden={!open}>
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
          <SoundtrackMenu />
          <ReadingSettings embedded />
      </nav>
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

