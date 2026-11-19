import { readFileSync } from "node:fs";
import path from "node:path";

export type JournalKind = "sketch" | "entry" | "mixed";

export interface JournalBlock {
  text: string;
  align?: "end";
}

/**
 * Public journal catalog. Later entries stay in PRIVATE_JOURNAL_SOURCE.
 * Entry One and Entry Two are approved for the public site.
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

function entryBlocks(fileName: string): JournalBlock[] {
  const raw = readFileSync(path.join(process.cwd(), "content/journal", fileName), "utf8");
  const parts = raw.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);
  const body = /^Entry\s+\w+$/.test(parts[0]?.trim() ?? "") ? parts.slice(1) : parts;
  return body.map((part) => {
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
    blocks: entryBlocks("entry-one.txt"),
  },
  {
    id: "entry-two",
    number: 2,
    title: "Entry Two",
    unlockOrder: 2,
    type: "mixed",
    image: "/art/journal/entry-two-960.jpg",
    imageAlt:
      "Rayne's pencil sketch of Lou's open journal showing a werewolf, a vampire and a zombie, beside a candle, a leather pouch, and an envelope with her name on it.",
    blocks: entryBlocks("entry-two.txt"),
  },
  { id: "page-3", number: 3, title: "Page 3", unlockOrder: 3, type: "sketch", image: null },
  { id: "page-4", number: 4, title: "Page 4", unlockOrder: 4, type: "entry", image: null },
];
