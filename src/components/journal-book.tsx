"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import type { JournalPage } from "@/lib/journal";
import type { JournalKind } from "../../content/journal";

const KIND: Record<JournalKind, string> = {
  sketch: "Sketch",
  entry: "Note",
  mixed: "Sketch and note",
};

const COVER_WIDTHS = [480, 720, 864] as const;
const PAGE_KEY = "dc-journal-page:v1";
const SPREAD_QUERY = "(min-width: 56rem)";

function coverSrcSet(extension: "webp" | "jpg") {
  return COVER_WIDTHS.map((width) => `/art/journal-cover-${width}.${extension} ${width}w`).join(", ");
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function readSavedPage(count: number): number {
  try {
    const raw = localStorage.getItem(PAGE_KEY);
    const parsed = raw === null ? 0 : Number(raw);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed >= count) return 0;
    return parsed;
  } catch {
    return 0;
  }
}

function writeSavedPage(index: number): void {
  try {
    localStorage.setItem(PAGE_KEY, String(index));
  } catch {
    // The book still turns for this visit.
  }
}

export function JournalBook({ pages }: { pages: JournalPage[] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [spread, setSpread] = useState(false);
  const [turn, setTurn] = useState<"next" | "back" | null>(null);
  const [snap, setSnap] = useState(false);
  const [live, setLive] = useState("");
  const coverRef = useRef<HTMLButtonElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const pendingIndex = useRef<number | null>(null);
  const turnByRef = useRef<(delta: number) => void>(() => {});
  const closeRef = useRef<() => void>(() => {});
  const liveId = useId();
  const step = spread ? 2 : 1;
  const total = pages.length;
  const atStart = index <= 0;
  const atEnd = index >= Math.max(0, total - step);

  useEffect(() => {
    const media = window.matchMedia(SPREAD_QUERY);
    const apply = () => setSpread(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!open) return;
    bookRef.current?.focus();
    const player = document.querySelector(".player");
    if (!(player instanceof HTMLElement)) return;
    const sync = () => {
      const height = Math.ceil(player.getBoundingClientRect().height) + 12;
      document.documentElement.style.setProperty("--player-clearance", `${height}px`);
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(player);
    window.addEventListener("resize", sync);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
      document.documentElement.style.removeProperty("--player-clearance");
    };
  }, [open]);

  function announce(nextIndex: number) {
    setLive(pageStatus(pages, nextIndex, step));
  }

  function openBook() {
    const saved = readSavedPage(total);
    const aligned = spread ? saved - (saved % step) : saved;
    setIndex(aligned);
    setTurn(null);
    setOpen(true);
    announce(aligned);
  }

  function closeBook() {
    setOpen(false);
    setTurn(null);
    pendingIndex.current = null;
    setLive("Journal closed.");
    coverRef.current?.focus();
  }

  function commit(nextIndex: number) {
    const aligned = spread ? Math.min(nextIndex, Math.max(0, total - 1)) - 0 : nextIndex;
    const bounded = Math.max(0, Math.min(aligned, Math.max(0, total - step)));
    const snapped = spread ? bounded - (bounded % step) : bounded;
    setIndex(snapped);
    writeSavedPage(snapped);
    announce(snapped);
  }

  function turnBy(delta: number) {
    if (turn) return;
    const nextIndex = Math.max(0, Math.min(index + delta, Math.max(0, total - step)));
    const aligned = spread ? nextIndex - (nextIndex % step) : nextIndex;
    if (aligned === index) return;
    if (prefersReducedMotion()) {
      commit(aligned);
      return;
    }
    pendingIndex.current = aligned;
    setTurn(delta > 0 ? "next" : "back");
  }

  useEffect(() => {
    turnByRef.current = turnBy;
    closeRef.current = closeBook;
  });

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select")) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        turnByRef.current(step);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        turnByRef.current(-step);
      } else if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  function onTransitionEnd(event: React.TransitionEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || event.propertyName !== "transform") return;
    const nextIndex = pendingIndex.current;
    pendingIndex.current = null;
    if (nextIndex === null) return;
    setSnap(true);
    commit(nextIndex);
    setTurn(null);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setSnap(false));
    });
  }

  const left = pages[index];
  const right = spread ? pages[index + 1] : undefined;
  const countLabel = countText(index, step, total);

  return (
    <div className={open ? "wrap journal journal-is-open" : "wrap journal"}>
      <h1>Rayne&apos;s Journal</h1>
      {open && left ? (
        <>
          <div
            ref={bookRef}
            className={spread ? "book-scene is-spread" : "book-scene"}
            tabIndex={-1}
            aria-label="Sketchbook"
            aria-describedby={liveId}
            onPointerDown={(event) => {
              if (event.pointerType === "mouse" && event.button !== 0) return;
              const scene = bookRef.current;
              if (!scene) return;
              scene.setPointerCapture(event.pointerId);
              scene.dataset.startX = String(event.clientX);
              scene.dataset.startY = String(event.clientY);
            }}
            onPointerUp={(event) => {
              const scene = bookRef.current;
              const startX = Number(scene?.dataset.startX ?? event.clientX);
              const startY = Number(scene?.dataset.startY ?? event.clientY);
              const dx = event.clientX - startX;
              const dy = event.clientY - startY;
              if (scene) delete scene.dataset.startX;
              if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
              if ((event.target as Element | null)?.closest("a, button")) return;
              turnBy(dx < 0 ? step : -step);
            }}
          >
            <div
              className={["leaf", turn ? `leaf-${turn}` : "", snap ? "leaf-snap" : ""].filter(Boolean).join(" ")}
              onTransitionEnd={onTransitionEnd}
            >
              <div className="leaf-spread">
                <SketchSheet page={left} />
                {right ? <SketchSheet page={right} /> : null}
              </div>
            </div>
            <button
              type="button"
              className="page-edge page-edge-back"
              tabIndex={-1}
              aria-hidden="true"
              disabled={atStart}
              onClick={() => turnBy(-step)}
            />
            <button
              type="button"
              className="page-edge page-edge-next"
              tabIndex={-1}
              aria-hidden="true"
              disabled={atEnd}
              onClick={() => turnBy(step)}
            />
          </div>
          <div className="journal-dock">
            <p className="journal-count">{countLabel}</p>
            <div className="journal-nav">
              <button type="button" className="journal-button" onClick={() => turnBy(-step)} disabled={atStart}>
                Back
              </button>
              <button type="button" className="journal-button" onClick={() => turnBy(step)} disabled={atEnd}>
                Next
              </button>
            </div>
            <button type="button" className="journal-button journal-close" onClick={closeBook}>
              Close journal
            </button>
          </div>
          <p id={liveId} className="visually-hidden" aria-live="polite">
            {live}
          </p>
        </>
      ) : (
        <>
          <p className="journal-lead">Rayne&apos;s sketches and notes will appear here as the story unfolds.</p>
          <button ref={coverRef} type="button" className="journal-cover-button" onClick={openBook}>
            <picture>
              <source
                type="image/webp"
                sizes="(min-width: 56rem) 34rem, calc(100vw - 2.5rem)"
                srcSet={coverSrcSet("webp")}
              />
              <img
                src="/art/journal-cover-864.jpg"
                srcSet={coverSrcSet("jpg")}
                sizes="(min-width: 56rem) 34rem, calc(100vw - 2.5rem)"
                alt="Rayne's sketchbook cover"
                width={864}
                height={1152}
              />
            </picture>
            <span className="visually-hidden">Open the journal</span>
          </button>
          <button type="button" className="journal-button journal-open" onClick={openBook}>
            Open the journal
          </button>
        </>
      )}
    </div>
  );
}

function SketchSheet({ page }: { page: JournalPage }) {
  const open = page.paragraphs !== null;
  const label = open ? page.title : closedLabel(page);

  return (
    <article className={open ? "sketch-page sketch-page-open" : "sketch-page sketch-page-closed"}>
      <span className="sketch-tape" aria-hidden="true" />
      <span className="sketch-stitch" aria-hidden="true" />
      <h2>{label}</h2>
      <p className="sketch-kind">{KIND[page.type]}</p>
      {open ? (
        <div className="sketch-body">
          {page.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={page.image} alt={page.title} />
          ) : null}
          {page.paragraphs?.map((paragraph, paragraphIndex) => (
            <p key={`${page.id}-${paragraphIndex}`}>{paragraph}</p>
          ))}
        </div>
      ) : page.access === "locked" ? (
        <p className="sketch-closed">
          <Link href="/subscribe">Subscribe to open this page</Link>
        </p>
      ) : (
        <p className="sketch-closed">This page stays shut until it unlocks.</p>
      )}
    </article>
  );
}

function closedLabel(page: JournalPage): string {
  if (page.access === "locked") return `${page.title} - locked`;
  return `${page.title} - unlocks soon`;
}

function countText(index: number, step: number, total: number): string {
  if (total === 0) return "Page 0 of 0";
  const start = index + 1;
  const end = Math.min(total, index + step);
  if (end > start) return `Pages ${start}–${end} of ${total}`;
  return `Page ${start} of ${total}`;
}

function pageStatus(pages: JournalPage[], index: number, step: number): string {
  const shown = pages.slice(index, index + step);
  const names = shown.map((page) => (page.paragraphs !== null ? page.title : closedLabel(page))).join(". ");
  return `${countText(index, step, pages.length)}. ${names}`;
}
