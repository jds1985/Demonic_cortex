"use client";

import { useEffect, useId, useRef, useState } from "react";

import { ReadingControls } from "./reading-controls";

export function ReadingSettings({
  prominent = false,
  embedded = false,
}: {
  prominent?: boolean;
  embedded?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("button")?.focus();

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

  return (
    <div
      ref={rootRef}
      className={
        prominent
          ? "reading-settings reading-settings-prominent"
          : embedded
            ? "reading-settings reading-settings-embedded"
            : "reading-settings"
      }
    >
      <button
        ref={buttonRef}
        type="button"
        className={prominent ? "button reading-settings-open" : "reading-settings-link"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {prominent || embedded ? "Reading settings" : "Reading"}
      </button>
      {open ? (
        <div
          id={panelId}
          ref={panelRef}
          className="reading-settings-panel"
          role="region"
          aria-label="Reading settings"
        >
          <ReadingControls />
          <button
            type="button"
            className="reading-settings-close"
            onClick={() => {
              setOpen(false);
              buttonRef.current?.focus();
            }}
          >
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}
