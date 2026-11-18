"use client";

import { useEffect } from "react";
import { useSyncExternalStore } from "react";

import {
  commitProgress,
  getProgressSnapshot,
  getServerProgressSnapshot,
  readProgress,
  subscribeProgress,
} from "@/lib/progress";

export function ReadingProgress({ chapterNumber }: { chapterNumber: number }) {
  const saved = useSyncExternalStore(subscribeProgress, getProgressSnapshot, getServerProgressSnapshot);
  const percent = saved?.chapter === chapterNumber ? Math.round(saved.ratio * 100) : 0;

  useEffect(() => {
    const stored = readProgress();
    const startingRatio = stored?.chapter === chapterNumber ? stored.ratio : 0;
    commitProgress(chapterNumber, startingRatio);

    if (startingRatio > 0) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.max(0, max) * startingRatio);
    }

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = max <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / max));
        commitProgress(chapterNumber, ratio);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [chapterNumber]);

  return (
    <div className="progress-block">
      <p className="progress-label">{percent}% read</p>
      <div
        className="progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label="Reading progress"
      >
        <span className="progress-bar" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
