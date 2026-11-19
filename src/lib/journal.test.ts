import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";

import { journalEntries } from "../../content/journal";
import { canReadBody } from "./catalog";
import { nextJournalIndex } from "./journal-nav";
import { accessByOrder, journalAccess, loadJournalPages, parseJournalJson, presentJournal, releaseJournal } from "./journal";

const ORIGINAL_SOURCE = process.env.PRIVATE_JOURNAL_SOURCE;

afterEach(() => {
  if (ORIGINAL_SOURCE === undefined) delete process.env.PRIVATE_JOURNAL_SOURCE;
  else process.env.PRIVATE_JOURNAL_SOURCE = ORIGINAL_SOURCE;
});

describe("journal catalog", () => {
  it("publishes the approved entries and keeps the later pages closed", () => {
    assert.deepEqual(
      journalEntries.map((entry) => entry.title),
      ["Entry One", "Entry Two", "Entry Three", "Entry Three, continued", "Page 5", "Page 6"],
    );
    assert.equal(journalAccess(1), "free");
    assert.equal(journalAccess(2), "free");
    assert.equal(journalAccess(3), "free");
    assert.equal(journalAccess(4), "free");
    assert.equal(journalAccess(5), "upcoming");
    assert.equal(journalAccess(6), "upcoming");
    assert.equal(journalAccess(0), null);
    assert.equal(canReadBody("upcoming", true), false);
    assert.equal(canReadBody("locked", false), false);
    assert.equal(canReadBody("locked", true), true);
    assert.equal(canReadBody("free", false), true);
  });

  it("returns to the cover when going back from the first page", () => {
    assert.equal(nextJournalIndex(0, -1, 3, 1), "close");
    assert.equal(nextJournalIndex(0, -2, 3, 2), "close");
    assert.equal(nextJournalIndex(1, -1, 3, 1), 0);
    assert.equal(nextJournalIndex(2, -2, 3, 2), 0);
    assert.equal(nextJournalIndex(0, 1, 3, 1), 1);
    assert.equal(nextJournalIndex(2, 1, 3, 1), 2);
  });

  it("uses the chapter ladder of free, then locked, then upcoming", () => {
    assert.equal(accessByOrder(1, 1, 7), "free");
    assert.equal(accessByOrder(2, 1, 7), "locked");
    assert.equal(accessByOrder(7, 1, 7), "locked");
    assert.equal(accessByOrder(8, 1, 7), "upcoming");
    assert.equal(accessByOrder(0, 1, 7), null);
  });

  it("shows the approved entries in full and leaves the later pages shut", async () => {
    delete process.env.PRIVATE_JOURNAL_SOURCE;
    const pages = await loadJournalPages();
    assert.deepEqual(
      pages.map((page) => page.title),
      ["Entry One", "Entry Two", "Entry Three", "Entry Three, continued", "Page 5", "Page 6"],
    );
    assert.deepEqual(
      pages.map((page) => page.access),
      ["free", "free", "free", "free", "upcoming", "upcoming"],
    );
    const entry = pages[0];
    assert.equal(entry?.image, "/art/journal/entry-one-960.png");
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
    const second = pages[1];
    assert.equal(second?.image, "/art/journal/entry-two-960.jpg");
    assert.equal(
      second?.imageAlt,
      "Rayne's pencil sketch of Lou's open journal showing a werewolf, a vampire and a zombie, beside a candle, a leather pouch, and an envelope with her name on it.",
    );
    assert.deepEqual(
      second?.paragraphs?.map((block) => block.text),
      [
        "Heaven,",
        "Your father wasn't who he said he was. I have to write it down or I'll go crazy.",
        "After the cave I laid you in bed and sat at the little desk with his journal and a leather pouch I found with it. I opened it and I cried.",
        "Every page was worse than the last. Rituals. Creatures I can't even describe. The only ones I knew were a werewolf, a vampire, and something like a dead man walking.",
        'Inside the cover it said "Property of Lou Cypher." Under it, a carving of a man on a throne who looks like your father. A woman beside him who looks like me. And a man with a coffin charm on his wrist. I drew it all tonight so I\'d never doubt what I saw.',
        "Then an envelope fell out. One word on it, in his handwriting. Rayne.",
        "His letter said if I'm reading it, he's most likely dead. Find Duke. This has been foreseen.",
        "Foreseen, Heaven. By who?",
        "I'm going to that address tomorrow.",
        "Love you always,\nMom",
      ],
    );
    assert.equal(second?.paragraphs?.at(-1)?.align, "end");
    const third = pages[2];
    assert.equal(third?.image, "/art/journal/entry-three-parlor-960.jpg");
    assert.equal(
      third?.imageAlt,
      "Rayne's pencil sketch of a dark two-story house behind an iron fence, with one lit window and a silhouette in it.",
    );
    assert.deepEqual(
      third?.paragraphs?.map((block) => block.text),
      [
        "Heaven,",
        "We left before sunrise in a car that wasn't ours. You sat in the front seat staring out the window and never said a word. I keep telling myself you're just tired.",
        "I found an old farmhouse out in the fields, buried in grass and trees. Nobody has lived there in years. It's our hiding place now. Your father's note said to go only at night, so we slept through the day.",
        'The address was a funeral parlor. Fog everywhere. I pounded on the door until a man let us in, and the second I said "Lou Cypher," everything changed.',
        "Duke stayed in the shadows by the window the whole time. He said he'd help us on one condition. I was terrified of what he'd ask for.",
      ],
    );
    assert.equal(third?.paragraphs?.[2]?.aside, "/art/journal/entry-three-farmhouse-960.jpg");
    assert.equal(third?.paragraphs?.[4]?.doodle, "eye");
    const fourth = pages[3];
    assert.equal(fourth?.image, "/art/journal/entry-three-hearse-960.jpg");
    assert.deepEqual(
      fourth?.paragraphs?.map((block) => block.text),
      [
        "He wanted a kids' meal. Nuggets only. I'm not joking, Heaven.",
        "His car is a hearse built out of an old muscle car. He ate in the back seat, singing, playing with the little toy. That's when I saw it on his wrist. The coffin charm bracelet from your father's book.",
        'He came back to the farmhouse with us, stuck his head out the window like a dog, and said "This will do."',
        "I don't know if I should trust him. But he's all we have.",
        "Love you always,\nMom",
      ],
    );
    assert.equal(fourth?.paragraphs?.at(-1)?.align, "end");
    assert.equal(fourth?.paragraphs?.at(-1)?.doodle, "signoff");
    for (const page of pages.slice(4)) {
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
        unlockOrder: 5,
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
