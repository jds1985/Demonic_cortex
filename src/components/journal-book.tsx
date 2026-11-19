"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import type { JournalPage } from "@/lib/journal";
import { nextJournalIndex } from "@/lib/journal-nav";
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
  const sheetTopRef = useRef<HTMLDivElement>(null);
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
    sheetTopRef.current?.scrollIntoView({
      block: "start",
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, [open, index]);

  function announce(nextIndex: number) {
    setLive(pageStatus(pages, nextIndex, step));
  }

  function openBook() {
    setIndex(0);
    setTurn(null);
    setOpen(true);
    announce(0);
  }

  function closeBook() {
    setOpen(false);
    setTurn(null);
    pendingIndex.current = null;
    setLive("Journal closed.");
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
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
    const target = nextJournalIndex(index, delta, total, step);
    if (target === "close") {
      closeBook();
      return;
    }
    if (target === index) return;
    if (prefersReducedMotion()) {
      commit(target);
      return;
    }
    pendingIndex.current = target;
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
      <h1 className={open ? "visually-hidden" : undefined}>Rayne&apos;s Journal</h1>
      {open && left ? (
        <>
          <div ref={sheetTopRef} className="journal-sheet-top">
            <FlipBar
              countLabel={countLabel}
              atStart={atStart}
              atEnd={atEnd}
              compact
              onBack={() => turnBy(-step)}
              onNext={() => turnBy(step)}
            />
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
          </div>
          <FlipBar
            countLabel={countLabel}
            atStart={atStart}
            atEnd={atEnd}
            onBack={() => turnBy(-step)}
            onNext={() => turnBy(step)}
            onClose={closeBook}
          />
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

const SKETCH_WIDTHS = [640, 960] as const;

function sketchFrame(src: string): { width: number; height: number } {
  if (/(?:hearse|ritual|arm)-960\./.test(src)) return { width: 960, height: 540 };
  if (src.includes("storm")) return { width: 960, height: 960 };
  return { width: 960, height: 720 };
}

function sketchSources(src: string): { src: string; srcSet?: string; webp?: string } {
  const png = src.match(/^(.*)-960\.png$/i);
  if (png) {
    return {
      src,
      srcSet: SKETCH_WIDTHS.map((width) => `${png[1]}-${width}.png ${width}w`).join(", "),
    };
  }
  const jpg = src.match(/^(.*)-960\.jpe?g$/i);
  if (jpg) {
    return {
      src,
      srcSet: SKETCH_WIDTHS.map((width) => `${jpg[1]}-${width}.jpg ${width}w`).join(", "),
      webp: SKETCH_WIDTHS.map((width) => `${jpg[1]}-${width}.webp ${width}w`).join(", "),
    };
  }
  return { src };
}

function FlipBar({
  countLabel,
  atStart,
  atEnd,
  compact = false,
  onBack,
  onNext,
  onClose,
}: {
  countLabel: string;
  atStart: boolean;
  atEnd: boolean;
  compact?: boolean;
  onBack: () => void;
  onNext: () => void;
  onClose?: () => void;
}) {
  return (
    <div className={compact ? "journal-dock journal-dock-top" : "journal-dock"}>
      <p className="journal-count">{countLabel}</p>
      <div className="journal-nav">
        <button
          type="button"
          className="journal-button"
          onClick={onBack}
          aria-label={atStart ? "Back to cover" : "Back"}
        >
          {compact ? <span aria-hidden="true">← </span> : null}
          Back
        </button>
        <button type="button" className="journal-button" onClick={onNext} disabled={atEnd}>
          Next
          {compact ? <span aria-hidden="true"> →</span> : null}
        </button>
      </div>
      {onClose ? (
        <button type="button" className="journal-button journal-close" onClick={onClose}>
          Close journal
        </button>
      ) : null}
    </div>
  );
}

function SketchSheet({ page }: { page: JournalPage }) {
  const open = page.paragraphs !== null;
  const label = closedLabel(page);
  const sketch = page.image ? sketchSources(page.image) : undefined;
  const wide = page.id === "entry-two" || page.id.startsWith("entry-three") || page.id.startsWith("entry-four");

  return (
    <article
      className={open ? "sketch-page sketch-page-open" : "sketch-page sketch-page-closed"}
      aria-label={open ? page.title : undefined}
    >
      {open ? null : <span className="sketch-tape" aria-hidden="true" />}
      <span className="sketch-stitch" aria-hidden="true" />
      {open && sketch ? (
        <figure className={wide ? "entry-sketch entry-sketch-wide" : "entry-sketch"}>
          <picture>
            {sketch.webp ? (
              <source type="image/webp" srcSet={sketch.webp} sizes="(min-width: 56rem) 34rem, calc(100vw - 4.5rem)" />
            ) : null}
            <img
              src={sketch.src}
              srcSet={sketch.srcSet}
              sizes={wide ? "(min-width: 56rem) 34rem, calc(100vw - 4.5rem)" : "(min-width: 56rem) 28rem, calc(100vw - 5rem)"}
              alt={page.imageAlt ?? ""}
              width={960}
              height={sketchFrame(sketch.src).height}
            />
          </picture>
        </figure>
      ) : null}
      {open ? null : <h2>{label}</h2>}
      {open ? null : <p className="sketch-kind">{KIND[page.type]}</p>}
      {open ? (
        <div className="entry-copy">
          {page.paragraphs?.map((paragraph, paragraphIndex) => (
            <EntryParagraph key={`${page.id}-${paragraphIndex}`} pageId={page.id} paragraph={paragraph} />
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

function EntryParagraph({
  pageId,
  paragraph,
}: {
  pageId: string;
  paragraph: NonNullable<JournalPage["paragraphs"]>[number];
}) {
  if (paragraph.doodle === "signoff") {
    return (
      <div className="entry-signoff-row">
        <EntryDoodle kind="charm" placement="row" />
        <p className="entry-signoff">{paragraph.text}</p>
        <StarDoodles />
      </div>
    );
  }
  const floated = pageId === "entry-two" ? doodleKind(paragraph.text) : null;
  const aside = paragraph.aside ? sketchSources(paragraph.aside) : undefined;
  return (
    <p className={paragraph.align === "end" ? "entry-signoff" : undefined}>
      {aside ? (
        <figure className="entry-aside">
          <picture>
            {aside.webp ? (
              <source type="image/webp" srcSet={aside.webp} sizes="(min-width: 56rem) 12rem, 42vw" />
            ) : null}
            <img
              src={aside.src}
              srcSet={aside.srcSet}
              sizes="(min-width: 56rem) 12rem, 42vw"
              alt={paragraph.asideAlt ?? ""}
              width={960}
              height={sketchFrame(aside.src).height}
            />
          </picture>
        </figure>
      ) : null}
      {floated ? <EntryDoodle kind={floated} /> : null}
      {paragraph.text}
      {paragraph.doodle === "eye" ? <EntryDoodle kind="eye" placement="below" /> : null}
    </p>
  );
}

function StarDoodles() {
  return (
    <svg className="doodle doodle-stars" viewBox="0 0 28 70" aria-hidden="true">
      <path d="M14 2 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6-4 -4-1.6 4-1.6 Z" fill="currentColor" />
      <path d="M14 28 l1.8 4.4 4.4 1.8 -4.4 1.8 -1.8 4.4 -1.8-4.4 -4.4-1.8 4.4-1.8 Z" fill="currentColor" />
      <path d="M14 52 l1.4 3.4 3.4 1.4 -3.4 1.4 -1.4 3.4 -1.4-3.4 -3.4-1.4 3.4-1.4 Z" fill="currentColor" />
    </svg>
  );
}

function doodleKind(text: string): "charm" | "eye" | "sky" | null {
  if (text.startsWith("Inside the cover")) return "charm";
  if (text.startsWith("Foreseen, Heaven")) return "eye";
  if (text.startsWith("I'm going")) return "sky";
  return null;
}

function EntryDoodle({
  kind,
  placement = "float",
}: {
  kind: "charm" | "eye" | "sky" | null;
  placement?: "float" | "below" | "row";
}) {
  if (!kind) return null;
  const place = placement === "float" ? "" : ` doodle-${placement}`;
  if (kind === "charm") {
    return (
      <svg className={`doodle doodle-charm${place}`} viewBox="0 0 40 70" aria-hidden="true">
        <circle cx="20" cy="5" r="3" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <path d="M20 8 V15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path
          d="M20 15 L12 23 L10 38 L20 58 L30 38 L28 23 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (kind === "eye") {
    return (
      <svg className={`doodle doodle-eye${place}`} viewBox="0 0 52 28" aria-hidden="true">
        <path d="M2 14 Q26 1 50 14 Q26 27 2 14 Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="26" cy="14" r="5.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="26" cy="14" r="2.2" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg className={`doodle doodle-sky${place}`} viewBox="0 0 78 58" aria-hidden="true">
      <path
        d="M32 4 C18 8 8 20 10 34 C12 46 22 54 36 56 C22 50 16 40 16 26 C16 14 22 6 32 4Z"
        fill="currentColor"
      />
      <path d="M50 8 l2 4.6 4.6 2 -4.6 2 -2 4.6 -2-4.6 -4.6-2 4.6-2 Z" fill="currentColor" />
      <path d="M66 26 l1.6 3.6 3.6 1.6 -3.6 1.6 -1.6 3.6 -1.6-3.6 -3.6-1.6 3.6-1.6 Z" fill="currentColor" />
      <path d="M48 40 l1.5 3.2 3.2 1.5 -3.2 1.5 -1.5 3.2 -1.5-3.2 -3.2-1.5 3.2-1.5 Z" fill="currentColor" />
    </svg>
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
