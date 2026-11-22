/**
 * Lettered comic chapters. Each chapter has its own cover, its own title page,
 * and its numbered pages, all stored under public/comics/chNN/.
 * To add a chapter: export its images into public/comics/chNN/ with the same
 * file names and add an entry below.
 */

export const COMIC_WIDTHS = [600, 864] as const;
export const COMIC_PAGE_WIDTH = 864;
export const COMIC_PAGE_HEIGHT = 1152;

export type ComicLeafKind = "cover" | "title" | "page";

export interface ComicLeaf {
  kind: ComicLeafKind;
  /** File stem inside the chapter folder, e.g. "cover", "title", "p01". */
  stem: string;
  /** Short label read aloud and shown in the page counter. */
  label: string;
  alt: string;
}

export interface ComicChapter {
  number: number;
  /** Spoken form used on the title page, e.g. "Chapter One". */
  heading: string;
  /** Chapter name, e.g. "How It Started". */
  name: string;
  folder: string;
  leaves: ComicLeaf[];
}

interface ComicChapterSource {
  number: number;
  heading: string;
  name: string;
  pageCount: number;
  coverAlt: string;
}

const SOURCES: ComicChapterSource[] = [
  {
    number: 1,
    heading: "Chapter One",
    name: "How It Started",
    pageCount: 20,
    coverAlt:
      "Chapter 1 cover. Rayne, in a long black coat with silver braids, stands before burning iron gates while Heaven's spirit floats above, under the glowing title Demonic Cortex.",
  },
  {
    number: 2,
    heading: "Chapter Two",
    name: "The Book of Lies",
    pageCount: 20,
    coverAlt:
      "Chapter 2 cover. Under the glowing title Demonic Cortex, Rayne in a black coat and red top holds open a burning book marked with a trident. Smoke shapes of a werewolf, a vampire and a throne of skulls rise behind her, and a sealed envelope floats at her side. Subtitle: Chapter Two, The Book of Lies.",
  },
  {
    number: 3,
    heading: "Chapter Three",
    name: "Help in the Darkness",
    pageCount: 20,
    coverAlt:
      "Chapter 3 cover. Under the glowing title Demonic Cortex, Rayne in a long black coat holds Heaven, wrapped in a blanket with her patched teddy bear, in the fog outside a funeral parlor. A tall man in a wide-brim hat stands as a silhouette in the lit doorway, and a glossy black Firebird hearse with a glowing coffin emblem waits beside them. Subtitle: Chapter Three, Help in the Darkness.",
  },
  {
    number: 4,
    heading: "Chapter Four",
    name: "The Pleasure of Knowing",
    pageCount: 21,
    coverAlt:
      "Chapter 4 cover. Under the glowing title Demonic Cortex, Duke stands in the rain with his long coat open, his glowing blue eyes under a wide-brim hat and ancient script shimmering across his chest like armor. Rayne leans into him under his arm. Lightning strikes behind an old farmhouse, and the black Firebird hearse with its glowing coffin emblem waits beside them. Subtitle: Chapter Four, The Pleasure of Knowing.",
  },
  {
    number: 5,
    heading: "Chapter Five",
    name: "Key Ingredients",
    pageCount: 34,
    coverAlt:
      "Chapter 5 cover. Under the glowing title Demonic Cortex and a full moon, Rayne holds up a small silver locket on a chain while Duke grins behind her, his blue eyes glowing under his wide-brim hat. A ribbon of blue light winds around them through a frame of deadly ingredients: oleander flowers, a golden poison frog, monarch butterflies, a cassowary, scarab beetles, red berries and copper nuggets. An old barn stands in the background. Subtitle: Chapter Five, Key Ingredients.",
  },
];

function buildChapter(source: ComicChapterSource): ComicChapter {
  const folder = `/comics/ch${String(source.number).padStart(2, "0")}`;
  const leaves: ComicLeaf[] = [
    { kind: "cover", stem: "cover", label: "Cover", alt: source.coverAlt },
    {
      kind: "title",
      stem: "title",
      label: "Title page",
      alt: `Title page. Demonic Cortex. ${source.heading}: ${source.name}.`,
    },
  ];
  for (let page = 1; page <= source.pageCount; page += 1) {
    leaves.push({
      kind: "page",
      stem: `p${String(page).padStart(2, "0")}`,
      label: `Page ${page} of ${source.pageCount}`,
      alt: `${source.heading}, page ${page} of ${source.pageCount}.`,
    });
  }
  return { number: source.number, heading: source.heading, name: source.name, folder, leaves };
}

const CHAPTERS = new Map(SOURCES.map((source) => [source.number, buildChapter(source)]));

export function getComicChapter(number: number): ComicChapter | null {
  return CHAPTERS.get(number) ?? null;
}

export function listComicChapters(): ComicChapter[] {
  return [...CHAPTERS.values()];
}

export function leafSrc(chapter: ComicChapter, leaf: ComicLeaf, width: number = COMIC_PAGE_WIDTH): string {
  return `${chapter.folder}/${leaf.stem}-${width}.webp`;
}

export function leafSrcSet(chapter: ComicChapter, leaf: ComicLeaf): string {
  return COMIC_WIDTHS.map((width) => `${leafSrc(chapter, leaf, width)} ${width}w`).join(", ");
}

/** Keeps a requested leaf index inside the book. */
export function clampLeaf(chapter: ComicChapter, index: number): number {
  if (!Number.isFinite(index)) return 0;
  return Math.min(chapter.leaves.length - 1, Math.max(0, Math.trunc(index)));
}

/** Reads "#page-7" (page 7 of the story) or "#cover" / "#title" from a URL hash. */
export function leafFromHash(chapter: ComicChapter, hash: string): number | null {
  const value = hash.replace(/^#/, "").toLowerCase();
  if (value === "cover") return 0;
  if (value === "title") return 1;
  const match = /^page-(\d{1,3})$/.exec(value);
  if (!match) return null;
  const index = chapter.leaves.findIndex((leaf) => leaf.stem === `p${match[1].padStart(2, "0")}`);
  return index >= 0 ? index : null;
}

export function hashForLeaf(chapter: ComicChapter, index: number): string {
  const leaf = chapter.leaves[clampLeaf(chapter, index)];
  if (leaf.kind !== "page") return `#${leaf.kind}`;
  return `#page-${Number(leaf.stem.slice(1))}`;
}
