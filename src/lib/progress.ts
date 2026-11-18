import { CHAPTER_COUNT, chapterAccess } from "./catalog";
import { PROGRESS_KEY } from "./reading-prefs";

export interface ReadingProgressRecord {
  chapter: number;
  ratio: number;
}

let progressSnapshot: ReadingProgressRecord | null = null;
let progressKey = "";
const progressListeners = new Set<() => void>();

export function subscribeProgress(listener: () => void): () => void {
  progressListeners.add(listener);
  return () => {
    progressListeners.delete(listener);
  };
}

export function getProgressSnapshot(): ReadingProgressRecord | null {
  if (typeof window === "undefined") return null;
  const record = readProgress();
  const key = record ? `${record.chapter}:${record.ratio}` : "";
  if (key !== progressKey) {
    progressKey = key;
    progressSnapshot = record;
  }
  return progressSnapshot;
}

export function getServerProgressSnapshot(): null {
  return null;
}

export function commitProgress(chapter: number, ratio: number): void {
  if (!chapterAccess(chapter)) return;
  const safeRatio = Math.min(1, Math.max(0, ratio));
  writeProgress(chapter, safeRatio);
  const key = `${chapter}:${safeRatio}`;
  if (key === progressKey) return;
  progressKey = key;
  progressSnapshot = { chapter, ratio: safeRatio };
  for (const listener of progressListeners) listener();
}

export function readProgress(): ReadingProgressRecord | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;
    const record = data as { chapter?: unknown; ratio?: unknown };
    if (typeof record.chapter !== "number" || !chapterAccess(record.chapter)) return null;
    if (typeof record.ratio !== "number" || record.ratio < 0 || record.ratio > 1) return null;
    return { chapter: record.chapter, ratio: record.ratio };
  } catch {
    return null;
  }
}

function writeProgress(chapter: number, ratio: number): void {
  if (!chapterAccess(chapter) || chapter > CHAPTER_COUNT) return;
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ chapter, ratio }));
  } catch {
    // Ignore storage failures. Reading still works.
  }
}
