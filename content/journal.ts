export type JournalKind = "sketch" | "entry" | "mixed";

/**
 * Public journal catalog. Entry text is never stored in this repo.
 * When a page is ready, add its metadata here and put the writing in
 * PRIVATE_JOURNAL_SOURCE as journal-01.json (and so on).
 */
export interface JournalEntry {
  id: string;
  number: number;
  title: string;
  unlockOrder: number;
  type: JournalKind;
  /** Public image under /art, or null while the drawing stays unpublished. */
  image: string | null;
}

/** No journal pages are published yet. */
export const journalEntries: JournalEntry[] = [];
