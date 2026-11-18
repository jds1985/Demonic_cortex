import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";

import { journalEntries } from "../../content/journal";
import { canReadBody } from "./catalog";
import { accessByOrder, journalAccess, loadJournalPages, parseJournalJson, presentJournal, releaseJournal } from "./journal";

const ORIGINAL_SOURCE = process.env.PRIVATE_JOURNAL_SOURCE;

afterEach(() => {
  if (ORIGINAL_SOURCE === undefined) delete process.env.PRIVATE_JOURNAL_SOURCE;
  else process.env.PRIVATE_JOURNAL_SOURCE = ORIGINAL_SOURCE;
});

describe("journal catalog", () => {
  it("publishes Entry One and keeps the later pages closed", () => {
    assert.deepEqual(
      journalEntries.map((entry) => entry.title),
      ["Entry One", "Page 2", "Page 3"],
    );
    assert.equal(journalAccess(1), "free");
    assert.equal(journalAccess(2), "upcoming");
    assert.equal(journalAccess(3), "upcoming");
    assert.equal(journalAccess(0), null);
    assert.equal(canReadBody("upcoming", true), false);
    assert.equal(canReadBody("locked", false), false);
    assert.equal(canReadBody("locked", true), true);
    assert.equal(canReadBody("free", false), true);
  });

  it("uses the chapter ladder of free, then locked, then upcoming", () => {
    assert.equal(accessByOrder(1, 1, 7), "free");
    assert.equal(accessByOrder(2, 1, 7), "locked");
    assert.equal(accessByOrder(7, 1, 7), "locked");
    assert.equal(accessByOrder(8, 1, 7), "upcoming");
    assert.equal(accessByOrder(0, 1, 7), null);
  });

  it("shows Entry One in full and leaves the later pages shut", async () => {
    delete process.env.PRIVATE_JOURNAL_SOURCE;
    const pages = await loadJournalPages();
    assert.deepEqual(
      pages.map((page) => page.title),
      ["Entry One", "Page 2", "Page 3"],
    );
    assert.deepEqual(
      pages.map((page) => page.access),
      ["free", "upcoming", "upcoming"],
    );
    const entry = pages[0];
    assert.equal(entry?.image, "/art/journal/entry-one-1152.jpg");
    assert.equal(
      entry?.imageAlt,
      "Rayne's pencil sketch of a white two-story bed and breakfast on a grassy hill above a rocky ocean coast.",
    );
    assert.deepEqual(
      entry?.paragraphs?.map((block) => block.text),
      [
        "Heaven, my baby,",
        "We went overseas to fix things, your father and I. A family vacation. A fresh start. You laughed the whole flight to Europe and I thought, maybe this is it.",
        "Then everything went wrong. The airline lost our bags, our money, our IDs. The sky turned gray and the wind wouldn't quit.",
        "Then your father disappeared for a while and came back with a miracle. A limo, new clothes, food, and a room at a bed and breakfast on the coast, on a windy hill like a fairytale.",
        "I sketched it the first night so I'd never forget it. I didn't know yet why I'd need to.",
        "I should have asked how he paid for it.",
        "Love you always,\nMom",
      ],
    );
    assert.equal(entry?.paragraphs?.at(-1)?.align, "end");
    for (const page of pages.slice(1)) {
      assert.equal(page.paragraphs, null);
      assert.equal(page.image, null);
    }
  });

  it("does not load private writing for a closed page", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "dc-journal-"));
    process.env.PRIVATE_JOURNAL_SOURCE = directory;
    await writeFile(
      path.join(directory, "journal-01.json"),
      JSON.stringify({ paragraphs: ["JOURNAL_SAMPLE_SHOULD_NOT_LEAK"] }),
    );
    const page = await releaseJournal(
      {
        id: "page-1",
        number: 1,
        title: "Page 1",
        unlockOrder: 2,
        type: "mixed",
        image: "/art/secret.jpg",
      },
      true,
    );
    assert.equal(page.access, "upcoming");
    assert.equal(page.imageAlt, null);
    assert.equal(page.paragraphs, null);
    assert.equal(page.image, null);
    assert.equal(JSON.stringify(page).includes("JOURNAL_SAMPLE_SHOULD_NOT_LEAK"), false);
    assert.equal(JSON.stringify(page).includes(directory), false);
  });

  it("reads a private file only after the chapter rule opens the page", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "dc-journal-"));
    process.env.PRIVATE_JOURNAL_SOURCE = directory;
    await writeFile(
      path.join(directory, "journal-02.json"),
      JSON.stringify({ text: "OPEN_JOURNAL_SAMPLE" }),
    );
    const entry = {
      id: "page-2",
      number: 2,
      title: "Page 2",
      unlockOrder: 2,
      type: "entry" as const,
      image: "https://cdn.example.com/secret.jpg",
    };

    const locked = await presentJournal(entry, "locked", false);
    assert.equal(locked.paragraphs, null);
    assert.equal(locked.image, null);
    assert.equal(JSON.stringify(locked).includes("OPEN_JOURNAL_SAMPLE"), false);

    const upcoming = await presentJournal(entry, "upcoming", true);
    assert.equal(upcoming.paragraphs, null);

    const opened = await presentJournal(entry, "free", false);
    assert.equal(opened.access, "free");
    assert.deepEqual(opened.paragraphs, [{ text: "OPEN_JOURNAL_SAMPLE" }]);
    assert.equal(opened.image, null);
    assert.equal(JSON.stringify(opened).includes(directory), false);

    const subscribed = await presentJournal(
      { ...entry, image: "/art/journal-cover-864.jpg" },
      "locked",
      true,
    );
    assert.deepEqual(subscribed.paragraphs, [{ text: "OPEN_JOURNAL_SAMPLE" }]);
    assert.equal(subscribed.image, "/art/journal-cover-864.jpg");
  });

  it("parses private journal files without keeping empty text", () => {
    assert.deepEqual(parseJournalJson(JSON.stringify({ paragraphs: ["A line."] })), ["A line."]);
    assert.deepEqual(parseJournalJson(JSON.stringify({ text: "One line." })), ["One line."]);
    assert.equal(parseJournalJson("{nope"), null);
    assert.equal(parseJournalJson(JSON.stringify({ paragraphs: [] })), null);
  });
});
