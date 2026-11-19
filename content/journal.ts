import { readFileSync } from "node:fs";
import path from "node:path";

export type JournalKind = "sketch" | "entry" | "mixed";

export type JournalDoodle = "eye" | "signoff";

export interface JournalBlock {
  text: string;
  align?: "end";
  /** Public sketch floated beside this paragraph. */
  aside?: string | null;
  asideAlt?: string | null;
  /** Decorative ink mark. It is not read aloud. */
  doodle?: JournalDoodle;
}

/**
 * Public journal catalog. Later entries stay in PRIVATE_JOURNAL_SOURCE.
 * Entries One, Two, and Three are approved for the public site.
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

const PARLOR_ALT =
  "Rayne's pencil sketch of a dark two-story house behind an iron fence, with one lit window and a silhouette in it.";
const FARMHOUSE_ALT =
  "Rayne's pencil sketch of a weathered two-story farmhouse with a porch, standing in tall grass among bare trees.";
const HEARSE_ALT =
  "Rayne's pencil sketch of a long light-colored hearse built from an old muscle car, under a night sky with a crescent moon.";

function entryThreePages(): JournalEntry[] {
  const parts = entryBlocks("entry-three.txt");
  const farmhouse = parts[2];
  const duke = parts[4];
  const signoff = parts[9];
  if (!farmhouse || !duke || !signoff) return [];
  return [
    {
      id: "entry-three",
      number: 3,
      title: "Entry Three",
      unlockOrder: 3,
      type: "mixed",
      image: "/art/journal/entry-three-parlor-960.jpg",
      imageAlt: PARLOR_ALT,
      blocks: [
        parts[0],
        parts[1],
        { ...farmhouse, aside: "/art/journal/entry-three-farmhouse-960.jpg", asideAlt: FARMHOUSE_ALT },
        parts[3],
        { ...duke, doodle: "eye" },
      ].filter((block): block is JournalBlock => Boolean(block)),
    },
    {
      id: "entry-three-continued",
      number: 4,
      title: "Entry Three, continued",
      unlockOrder: 4,
      type: "mixed",
      image: "/art/journal/entry-three-hearse-960.jpg",
      imageAlt: HEARSE_ALT,
      blocks: [parts[5], parts[6], parts[7], parts[8], { ...signoff, doodle: "signoff" }].filter(
        (block): block is JournalBlock => Boolean(block),
      ),
    },
  ];
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
  ...entryThreePages(),
  { id: "page-5", number: 5, title: "Page 5", unlockOrder: 5, type: "sketch", image: null },
  { id: "page-6", number: 6, title: "Page 6", unlockOrder: 6, type: "entry", image: null },
];
