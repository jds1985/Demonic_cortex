import Link from "next/link";

import { listChapters, type ChapterAccess } from "@/lib/catalog";

const STATUS: Record<ChapterAccess, string> = {
  free: "Free",
  locked: "Locked",
  upcoming: "Coming soon",
};

export function ChapterList() {
  const chapters = listChapters();

  return (
    <section className="block" id="chapters" aria-labelledby="chapters-heading">
      <h2 id="chapters-heading">Chapters</h2>
      <p className="prose">
        Thirteen chapters are planned. Chapter 1 is free. Chapters 2 through 7 open with a subscription.
        Chapters 8 through 13 are still to come.
      </p>
      <ol className="chapter-list">
        {chapters.map((chapter) => (
          <li key={chapter.number} className="panel chapter-row">
            <h3>
              <Link href={`/read/${chapter.number}`}>{chapter.title}</Link>
            </h3>
            <p className={`status status-${chapter.access}`}>{STATUS[chapter.access]}</p>
            {chapter.access === "free" ? (
              <Link className="button" href={`/read/${chapter.number}`}>
                Read free
              </Link>
            ) : null}
            {chapter.access === "locked" ? (
              <Link className="button" href="/subscribe">
                Subscribe to read
              </Link>
            ) : null}
            {chapter.access === "upcoming" ? <p className="row-note">Not published yet.</p> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
