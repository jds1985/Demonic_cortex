export const CHAPTER_COUNT = 13;
/** Chapters 1 through FREE_THROUGH are free to read. */
export const FREE_THROUGH = 3;
export const LOCKED_THROUGH = 7;

export type ChapterAccess = "free" | "locked" | "upcoming";

export interface ChapterMeta {
  number: number;
  title: string;
  access: ChapterAccess;
}

export function chapterAccess(number: number): ChapterAccess | null {
  if (!Number.isInteger(number) || number < 1 || number > CHAPTER_COUNT) {
    return null;
  }
  if (number <= FREE_THROUGH) return "free";
  if (number <= LOCKED_THROUGH) return "locked";
  return "upcoming";
}

export function canReadBody(access: ChapterAccess, isSubscriber: boolean): boolean {
  if (access === "free") return true;
  if (access === "locked") return isSubscriber;
  return false;
}

export function listChapters(): ChapterMeta[] {
  const chapters: ChapterMeta[] = [];
  for (let number = 1; number <= CHAPTER_COUNT; number += 1) {
    const access = chapterAccess(number);
    if (!access) continue;
    chapters.push({ number, title: `Chapter ${number}`, access });
  }
  return chapters;
}

export function parseChapterNumber(value: string): number | null {
  if (!/^\d{1,2}$/.test(value)) return null;
  return chapterAccess(Number(value)) ? Number(value) : null;
}
