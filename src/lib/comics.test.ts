import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import { clampLeaf, COMIC_WIDTHS, getComicChapter, hashForLeaf, leafFromHash, leafSrc, listComicChapters } from "./comics";

describe("comic chapters", () => {
  it("opens chapter 1 on its cover, then its title page, then 20 pages", () => {
    const chapter = getComicChapter(1);
    assert.ok(chapter);
    assert.equal(chapter.leaves.length, 22);
    assert.equal(chapter.leaves[0]?.kind, "cover");
    assert.equal(chapter.leaves[1]?.kind, "title");
    assert.equal(chapter.leaves[2]?.stem, "p01");
    assert.equal(chapter.leaves[21]?.stem, "p20");
    assert.equal(chapter.name, "How It Started");
  });

  it("has every image file on disk", () => {
    for (const chapter of listComicChapters()) {
      for (const leaf of chapter.leaves) {
        for (const width of COMIC_WIDTHS) {
          const file = path.join(process.cwd(), "public", leafSrc(chapter, leaf, width));
          assert.ok(existsSync(file), `missing ${file}`);
        }
      }
    }
  });

  it("maps URL hashes to leaves and back", () => {
    const chapter = getComicChapter(1)!;
    assert.equal(leafFromHash(chapter, "#cover"), 0);
    assert.equal(leafFromHash(chapter, "#title"), 1);
    assert.equal(leafFromHash(chapter, "#page-1"), 2);
    assert.equal(leafFromHash(chapter, "#page-20"), 21);
    assert.equal(leafFromHash(chapter, "#page-21"), null);
    assert.equal(hashForLeaf(chapter, 7), "#page-6");
    assert.equal(clampLeaf(chapter, 99), 21);
    assert.equal(clampLeaf(chapter, -3), 0);
  });

  it("opens chapter 2, The Book of Lies, the same way", () => {
    const chapter = getComicChapter(2);
    assert.ok(chapter);
    assert.equal(chapter.leaves.length, 22);
    assert.equal(chapter.heading, "Chapter Two");
    assert.equal(chapter.name, "The Book of Lies");
    assert.equal(chapter.folder, "/comics/ch02");
    assert.equal(chapter.leaves[0]?.kind, "cover");
    assert.equal(chapter.leaves[1]?.alt, "Title page. Demonic Cortex. Chapter Two: The Book of Lies.");
    assert.equal(chapter.leaves[21]?.stem, "p20");
  });

  it("opens chapter 3, Help in the Darkness, the same way", () => {
    const chapter = getComicChapter(3);
    assert.ok(chapter);
    assert.equal(chapter.leaves.length, 22);
    assert.equal(chapter.heading, "Chapter Three");
    assert.equal(chapter.name, "Help in the Darkness");
    assert.equal(chapter.folder, "/comics/ch03");
    assert.equal(chapter.leaves[1]?.alt, "Title page. Demonic Cortex. Chapter Three: Help in the Darkness.");
    assert.equal(chapter.leaves[21]?.stem, "p20");
  });

  it("has no comic for chapters without art", () => {
    assert.equal(getComicChapter(4), null);
  });
});
