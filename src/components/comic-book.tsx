"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import {
  clampLeaf,
  COMIC_PAGE_HEIGHT,
  COMIC_PAGE_WIDTH,
  hashForLeaf,
  leafFromHash,
  leafSrc,
  leafSrcSet,
  type ComicChapter,
} from "@/lib/comics";
import { commitProgress } from "@/lib/progress";

import styles from "./comic-book.module.css";

const TURN_MS = 800;
const SWIPE_PX = 45;
const SIZES = "(min-width: 56rem) 42rem, 100vw";

type Turn = { dir: "next" | "back"; from: number; to: number };

function storageKey(chapter: number): string {
  return `dc-comic-leaf:v1:${chapter}`;
}

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** True while the reader is pinch-zoomed in, so panning never flips a page. */
function zoomedIn(): boolean {
  const scale = window.visualViewport?.scale ?? 1;
  return scale > 1.05;
}

export interface NextChapterLink {
  href: string;
  /** e.g. "Chapter 2: The Book of Lies" */
  label: string;
}

export function ComicBook({ chapter, nextChapter = null }: { chapter: ComicChapter; nextChapter?: NextChapterLink | null }) {
  const leaves = chapter.leaves;
  const last = leaves.length - 1;
  const [index, setIndex] = useState(0);
  const [turn, setTurn] = useState<Turn | null>(null);
  const [live, setLive] = useState("");
  const [canFullscreen, setCanFullscreen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const turnRef = useRef<Turn | null>(null);
  const indexRef = useRef(0);
  const pointer = useRef<{ id: number; x: number; y: number; multi: boolean } | null>(null);
  const suppressClick = useRef(false);
  const liveId = useId();

  const settle = useCallback(
    (next: number) => {
      indexRef.current = next;
      turnRef.current = null;
      setTurn(null);
      setIndex(next);
      setLive(leaves[next].label);
      try {
        localStorage.setItem(storageKey(chapter.number), String(next));
      } catch {
        // Reading still works without saved progress.
      }
      history.replaceState(null, "", hashForLeaf(chapter, next));
      commitProgress(chapter.number, last > 0 ? next / last : 1);
    },
    [chapter, last, leaves],
  );

  const go = useCallback(
    (target: number) => {
      if (turnRef.current) return;
      const from = indexRef.current;
      const to = clampLeaf(chapter, target);
      if (to === from) return;
      if (reducedMotion()) {
        settle(to);
        return;
      }
      const next: Turn = { dir: to > from ? "next" : "back", from, to };
      turnRef.current = next;
      setTurn(next);
      window.setTimeout(() => {
        if (turnRef.current === next) settle(to);
      }, TURN_MS + 120);
    },
    [chapter, settle],
  );

  const goNext = useCallback(() => go(indexRef.current + 1), [go]);
  const goBack = useCallback(() => go(indexRef.current - 1), [go]);

  // Start where the link or the last visit left off (read once the page is in the browser).
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      let start = leafFromHash(chapter, window.location.hash);
      if (start === null) {
        try {
          const saved = Number(localStorage.getItem(storageKey(chapter.number)));
          start = Number.isFinite(saved) ? clampLeaf(chapter, saved) : 0;
        } catch {
          start = 0;
        }
      }
      indexRef.current = start;
      setIndex(start);
      setLive(leaves[start].label);
      setCanFullscreen(typeof document.documentElement.requestFullscreen === "function");
      if (window.location.hash) rootRef.current?.scrollIntoView({ block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [chapter, leaves]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (target?.closest("[data-no-flip-keys]")) return;
      const key = event.key;
      if (key === "ArrowRight" || key === "PageDown" || (key === " " && target?.tagName !== "BUTTON")) {
        event.preventDefault();
        goNext();
      } else if (key === "ArrowLeft" || key === "PageUp") {
        event.preventDefault();
        goBack();
      } else if (key === "Home") {
        event.preventDefault();
        go(0);
      } else if (key === "End") {
        event.preventDefault();
        go(last);
      }
    }
    function onHash() {
      const target = leafFromHash(chapter, window.location.hash);
      if (target !== null && target !== indexRef.current) go(target);
    }
    function onFullscreen() {
      setIsFullscreen(document.fullscreenElement === rootRef.current);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("hashchange", onHash);
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("fullscreenchange", onFullscreen);
    };
  }, [chapter, go, goBack, goNext, last]);

  // Warm the next pages so turning never waits on the network.
  useEffect(() => {
    const width = window.innerWidth * (window.devicePixelRatio || 1) > 700 ? 864 : 600;
    for (const offset of [1, 2, -1]) {
      const leaf = leaves[index + offset];
      if (!leaf) continue;
      const img = new Image();
      img.decoding = "async";
      img.src = leafSrc(chapter, leaf, width);
    }
  }, [chapter, index, leaves]);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (pointer.current) {
      pointer.current.multi = true;
      return;
    }
    suppressClick.current = false;
    pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, multi: false };
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const start = pointer.current;
    if (!start || start.id !== event.pointerId) return;
    pointer.current = null;
    if (start.multi || zoomedIn()) {
      suppressClick.current = true;
      return;
    }
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) >= 12 || Math.abs(dy) >= 12) suppressClick.current = true;
    if (Math.abs(dx) >= SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.2) {
      if (dx < 0) goNext();
      else goBack();
    }
  }

  function onClick(event: React.MouseEvent<HTMLDivElement>) {
    // Taps and clicks: the left third turns back, the rest turns forward.
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (zoomedIn()) return;
    tapAt(event.clientX, event.currentTarget);
  }

  function tapAt(clientX: number, element: HTMLElement) {
    const box = element.getBoundingClientRect();
    if (clientX - box.left < box.width * 0.35) goBack();
    else goNext();
  }

  function toggleFullscreen() {
    const root = rootRef.current;
    if (!root) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void root.requestFullscreen().catch(() => {});
  }

  const shown = turn ? (turn.dir === "next" ? turn.to : turn.from) : index;
  const leafIndex = turn ? (turn.dir === "next" ? turn.from : turn.to) : null;
  const current = leaves[turn ? turn.to : index];
  const atStart = (turn ? turn.to : index) <= 0;
  const atEnd = (turn ? turn.to : index) >= last;

  return (
    <div ref={rootRef} className={styles.book} data-fullscreen={isFullscreen ? "" : undefined}>
      <p className={styles.counter} aria-hidden="true">
        {current.label}
      </p>
      <p id={liveId} className="visually-hidden" aria-live="polite">
        {live}
      </p>
      <div
        className={styles.stage}
        role="group"
        aria-roledescription="book"
        aria-label={`${chapter.heading}: ${chapter.name}. Swipe, tap the edges, or use the arrow keys to turn pages.`}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          pointer.current = null;
        }}
        onClick={onClick}
      >
        <div className={styles.page}>
          <LeafImage chapter={chapter} index={shown} priority />
          {turn ? <span className={`${styles.underShade} ${styles[`under-${turn.dir}`]}`} aria-hidden="true" /> : null}
        </div>
        {turn && leafIndex !== null ? (
          <div
            key={`${turn.from}-${turn.to}`}
            className={`${styles.leaf} ${turn.dir === "next" ? styles.turnNext : styles.turnBack}`}
            style={{ animationDuration: `${TURN_MS}ms` }}
            aria-hidden="true"
          >
            <div className={styles.front}>
              <LeafImage chapter={chapter} index={leafIndex} />
              <span className={styles.frontShade} style={{ animationDuration: `${TURN_MS}ms` }} />
            </div>
            <div className={styles.back} />
          </div>
        ) : null}
        <span className={styles.spine} aria-hidden="true" />
      </div>
      <div className={styles.controls}>
        <button type="button" className={styles.control} onClick={goBack} disabled={atStart} aria-label="Previous page">
          <span aria-hidden="true">◀</span> Back
        </button>
        <button type="button" className={styles.control} onClick={goNext} disabled={atEnd} aria-label="Next page">
          Next <span aria-hidden="true">▶</span>
        </button>
      </div>
      {atEnd && !turn && nextChapter ? (
        <Link className={styles.nextChapter} href={nextChapter.href} data-no-flip-keys>
          <span>Next chapter</span>
          <span className={styles.nextName}>
            {nextChapter.label} <span aria-hidden="true">▶</span>
          </span>
        </Link>
      ) : null}
      <div className={styles.extras}>
        {!atStart ? (
          <button type="button" className={styles.minor} onClick={() => go(0)}>
            Back to cover
          </button>
        ) : null}
        {canFullscreen ? (
          <button type="button" className={styles.minor} onClick={toggleFullscreen}>
            {isFullscreen ? "Exit full screen" : "Full screen"}
          </button>
        ) : null}
        {atEnd ? (
          <Link className={styles.minor} href="/chapters">
            All chapters
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function LeafImage({ chapter, index, priority = false }: { chapter: ComicChapter; index: number; priority?: boolean }) {
  const leaf = chapter.leaves[index];
  return (
    // Plain img: pre-sized WebP files are already optimized and served statically.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={styles.art}
      src={leafSrc(chapter, leaf)}
      srcSet={leafSrcSet(chapter, leaf)}
      sizes={SIZES}
      width={COMIC_PAGE_WIDTH}
      height={COMIC_PAGE_HEIGHT}
      alt={leaf.alt}
      draggable={false}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}
