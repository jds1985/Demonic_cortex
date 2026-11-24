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
      "Chapter 2 cover. Under the glowing title Demonic Cortex, Rayne sits at a desk in a dark guest room lit by a single candle, tears on her cheeks, one green eye and one blue, her long silver-grey box braids gleaming like chains and a small silver cylinder locket with a dark red gem at her neck. She holds up a cream envelope sealed with dark red wax over an open journal filled with sketches of creatures. Behind her, Heaven lies in bed hugging her patched teddy bear, her eyes open and solid black. Candle shadows of chains and grasping hands crawl up the wall.",
  },
  {
    number: 3,
    heading: "Chapter Three",
    name: "Help in the Darkness",
    pageCount: 20,
    coverAlt:
      "Chapter 3 cover. Under the glowing title Demonic Cortex, Rayne in a long black coat holds Heaven, wrapped in a blanket with her patched teddy bear, in the fog outside a funeral parlor. A tall man in a wide-brim hat stands as a silhouette in the lit doorway, and a glossy black Firebird hearse with a glowing coffin emblem waits beside them.",
  },
  {
    number: 4,
    heading: "Chapter Four",
    name: "The Pleasure of Knowing",
    pageCount: 21,
    coverAlt:
      "Chapter 4 cover. Under the glowing title Demonic Cortex, Duke stands in the rain in a black shirt and long black coat, his blue eyes glowing under a plain wide-brim hat. Rayne, her silver-grey box braids gleaming like chains, leans into him under his arm. Lightning strikes behind an old farmhouse, and the black Firebird hearse with its glowing coffin emblem waits beside them.",
  },
  {
    number: 5,
    heading: "Chapter Five",
    name: "Key Ingredients",
    pageCount: 34,
    coverAlt:
      "Chapter 5 cover. Under the glowing title Demonic Cortex and a full moon, Rayne, her silver-grey box braids gleaming like chains, holds up a small silver locket on a chain while Duke grins behind her in a black shirt and coat, his blue eyes glowing under his wide-brim hat. A ribbon of blue light winds around them through a frame of deadly ingredients: oleander flowers, a golden poison frog, monarch butterflies, a cassowary, scarab beetles, red berries and copper nuggets. An old barn stands in the background.",
  },
  {
    number: 6,
    heading: "Chapter Six",
    name: "The Scenic Route",
    pageCount: 35,
    coverAlt:
      "Chapter 6 cover. Rayne and Duke ride in the glossy black Firebird hearse, its glowing coffin emblem on the nose, bursting out of a flaming coffin-shaped portal. Rayne sits on the left and Duke grins behind the wheel on the right, his blue eyes glowing under his wide-brim hat. Around them swirl deadly ingredients: oleander flowers, a golden poison frog, a black widow spider, a jellyfish, monarch butterflies and dark berries. Pink oleander blooms line the dark road beneath the car.",
  },
  {
    number: 7,
    heading: "Chapter Seven",
    name: "Where We're Going",
    pageCount: 35,
    coverAlt:
      "Chapter 7 cover. The glossy black Firebird hearse, frosted white and crackling with blue lightning, roars out of a flaming coffin-shaped portal at dusk, its glowing coffin emblem on the nose. Rayne smiles from the passenger seat on the left and Duke grins behind the wheel on the right, his blue eyes glowing under his wide-brim hat. Two trails of fire burn behind them as the car races down a wet country road.",
  },
  {
    number: 8,
    heading: "Chapter Eight",
    name: "Home Fires",
    pageCount: 34,
    coverAlt:
      "Chapter 8 cover. Under a blood-red moon, Duke sits on the steps of an old farmhouse porch, big and muscular in a plain wide-brim hat, black shirt and long black coat, his blue eyes glowing. Rayne leans against him on the step below, her long silver-grey box braids falling over her coat, one green eye and one blue, a small silver cylinder locket on a chain at her neck. Fireflies drift over the dark farmyard, a barn glows behind them and a lantern burns beside them.",
  },
  {
    number: 9,
    heading: "Chapter Nine",
    name: "Blood Prices",
    pageCount: 51,
    coverAlt:
      "Chapter 9 cover. Under the glowing title Demonic Cortex, Rayne stands in front with her long silver-grey box braids, one green eye and one blue, a small silver cylinder locket at her neck, holding up a glowing green vial. Duke looms behind her in his wide-brim hat and black coat, his blue eyes glowing. On the left a rainy neon city rises in the dark; on the right glowing orange pentagram sigils burn on the wall of a domed stone chamber. Vials, pills and a syringe lie scattered at the bottom.",
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
