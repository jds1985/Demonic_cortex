import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";

import { getPanelAsset, isLoadableImageSrc, loadChapter } from "./chapters";

const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

const ORIGINAL_SOURCE = process.env.PRIVATE_CHAPTER_SOURCE;

afterEach(() => {
  if (ORIGINAL_SOURCE === undefined) delete process.env.PRIVATE_CHAPTER_SOURCE;
  else process.env.PRIVATE_CHAPTER_SOURCE = ORIGINAL_SOURCE;
});

describe("private chapter source", () => {
  it("uses placeholders when no source is configured", async () => {
    delete process.env.PRIVATE_CHAPTER_SOURCE;
    const chapter = await loadChapter(1);
    assert.equal(chapter?.availability, "placeholder");
    assert.equal(chapter?.pages?.[0]?.type, "text");
    if (chapter?.pages?.[0]?.type === "text") {
      assert.deepEqual(chapter.pages[0].paragraphs, ["Chapter text coming soon."]);
    }
    assert.equal(chapter?.pages?.[1]?.type, "panel");
  });

  it("loads an allowed chapter and hides private file locations", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "dc-chapters-"));
    process.env.PRIVATE_CHAPTER_SOURCE = directory;
    await writeFile(
      path.join(directory, "chapter-01.json"),
      JSON.stringify({
        title: "Chapter 1",
        pages: [
          { type: "text", paragraphs: ["FREE_CHAPTER_SAMPLE_LINE"] },
          { type: "panel", src: "page.png", alt: "A red moon over a black cloud." },
        ],
      }),
    );
    await writeFile(path.join(directory, "page.png"), TINY_PNG);
    await writeFile(
      path.join(directory, "chapter-09.json"),
      JSON.stringify({
        paragraphs: ["LOCKED_SAMPLE_SHOULD_NOT_LEAK"],
        pages: [{ type: "panel", src: "page.png", alt: "Locked art should not load." }],
      }),
    );

    const free = await loadChapter(1);
    assert.equal(free?.availability, "private");
    assert.equal(free?.title, "Chapter 1");
    assert.equal(JSON.stringify(free).includes("FREE_CHAPTER_SAMPLE_LINE"), true);
    assert.equal(JSON.stringify(free).includes(directory), false);
    assert.equal(free?.pages?.[1]?.type, "panel");
    if (free?.pages?.[1]?.type === "panel") {
      assert.equal(free.pages[1].src, "/api/panels/1/1");
      assert.equal(free.pages[1].alt, "A red moon over a black cloud.");
    }

    const asset = await getPanelAsset(1, 1);
    assert.equal(asset?.contentType, "image/png");
    assert.equal(asset?.data.byteLength, TINY_PNG.byteLength);

    const locked = await loadChapter(9);
    assert.equal(locked?.availability, "upcoming");
    assert.equal(locked?.pages, null);
    assert.equal(JSON.stringify(locked).includes("LOCKED_SAMPLE_SHOULD_NOT_LEAK"), false);
    assert.equal(await getPanelAsset(9, 0), null);
  });

  it("rejects unsafe image sources", () => {
    assert.equal(isLoadableImageSrc("page.webp"), true);
    assert.equal(isLoadableImageSrc("../page.webp"), false);
    assert.equal(isLoadableImageSrc("javascript:alert(1)"), false);
    assert.equal(isLoadableImageSrc("https://169.254.169.254/latest/meta-data"), false);
    assert.equal(isLoadableImageSrc("https://cdn.example.com/panel.png"), true);
    assert.equal(isLoadableImageSrc("http://cdn.example.com/panel.png"), false);
  });

  it("falls back when a chapter file is not valid JSON", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "dc-chapters-"));
    process.env.PRIVATE_CHAPTER_SOURCE = directory;
    await writeFile(path.join(directory, "chapter-01.json"), "{not json");
    const chapter = await loadChapter(1);
    assert.equal(chapter?.availability, "placeholder");
  });

  it("accepts a paragraphs-only file for a free chapter", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "dc-chapters-"));
    process.env.PRIVATE_CHAPTER_SOURCE = directory;
    await writeFile(
      path.join(directory, "chapter-01.json"),
      JSON.stringify({ paragraphs: ["A journal line."] }),
    );
    const chapter = await loadChapter(1);
    assert.equal(chapter?.pages?.[0]?.type, "text");
    if (chapter?.pages?.[0]?.type === "text") {
      assert.deepEqual(chapter.pages[0].paragraphs, ["A journal line."]);
    }
  });
});
