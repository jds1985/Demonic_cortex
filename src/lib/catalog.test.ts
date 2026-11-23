import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isSubscriber } from "./access";
import { canReadBody, chapterAccess, listChapters, parseChapterNumber } from "./catalog";

describe("chapter catalog", () => {
  it("lists 13 chapters: 1-6 free, 7 locked, 8-13 upcoming", () => {
    const chapters = listChapters();
    assert.equal(chapters.length, 13);
    assert.deepEqual(
      chapters.map((chapter) => chapter.access),
      [
        "free",
        "free",
        "free",
        "free",
        "free",
        "free",
        "locked",
        "upcoming",
        "upcoming",
        "upcoming",
        "upcoming",
        "upcoming",
        "upcoming",
      ],
    );
    assert.equal(chapters[0]?.title, "Chapter 1");
    assert.equal(chapters[12]?.title, "Chapter 13");
  });

  it("rejects chapter numbers outside the book", () => {
    assert.equal(chapterAccess(0), null);
    assert.equal(chapterAccess(14), null);
    assert.equal(parseChapterNumber("0"), null);
    assert.equal(parseChapterNumber("99"), null);
    assert.equal(parseChapterNumber("1a"), null);
    assert.equal(parseChapterNumber("1"), 1);
  });

  it("keeps locked and upcoming bodies closed", () => {
    assert.equal(canReadBody("free", false), true);
    assert.equal(canReadBody("locked", false), false);
    assert.equal(canReadBody("locked", true), true);
    assert.equal(canReadBody("upcoming", true), false);
  });

  it("does not treat visitors as subscribers", async () => {
    assert.equal(await isSubscriber(), false);
  });
});
