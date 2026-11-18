import { readFileSync } from "node:fs";
import path from "node:path";

export type JournalKind = "sketch" | "entry" | "mixed";

export interface JournalBlock {
  text: string;
  align?: "end";
}

/**
 * Public journal catalog. Later entries stay in PRIVATE_JOURNAL_SOURCE.
 * Entry One is approved for the public site and is read from content/journal/entry-one.txt.
 */
export interface JournalEntry {
  id: string;
  number: number;
  title: string;
  unlockOrder: number;
  type: JournalKind;
  /** Public image under /art, or null while the drawing stays unpublished. */
  image: string | null;
  imageAlt?: string | null;
  /** Approved public writing. Absent for pages that are still closed. */
  blocks?: JournalBlock[];
}

const ENTRY_ONE_ALT =
  "Rayne's pencil sketch of a white two-story bed and breakfast on a grassy hill above a rocky ocean coast.";

function entryOneBlocks(): JournalBlock[] {
  const raw = readFileSync(path.join(process.cwd(), "content/journal/entry-one.txt"), "utf8");
  const parts = raw.replace(/\r\n/g, "\n").trim().split(/\n{2,}/).slice(1);
  return parts.map((part) => {
    const text = part.trim();
    return text.startsWith("Love you always,") ? { text, align: "end" as const } : { text };
  });
}

export const journalEntries: JournalEntry[] = [
  {
    id: "entry-one",
    number: 1,
    title: "Entry One",
    unlockOrder: 1,
    type: "mixed",
    image: "/art/journal/entry-one-960.png",
    imageAlt: ENTRY_ONE_ALT,
    blocks: entryOneBlocks(),
  },
  { id: "page-2", number: 2, title: "Page 2", unlockOrder: 2, type: "sketch", image: null },
  { id: "page-3", number: 3, title: "Page 3", unlockOrder: 3, type: "entry", image: null },
];
