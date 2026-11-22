import Link from "next/link";

import { listChapters, type ChapterAccess } from "@/lib/catalog";
import { getComicChapter } from "@/lib/comics";

const STATUS: Record<ChapterAccess, string> = {
  free: "Free",
  locked: "Locked",
  upcoming: "Coming soon",
};

export function ChapterList({ level = "h2" }: { level?: "h1" | "h2" }) {
  const chapters = listChapters();
  const Heading = level;
  const Title = level === "h1" ? "h2" : "h3";

  return (
    <section className="block" id="chapters" aria-labelledby="chapters-heading">
      <Heading id="chapters-heading">Chapters</Heading>
      <p className="prose">
        Thirteen chapters are planned. Chapters 1 through 3 are free. Chapters 4 through 7 open with a subscription.
        Chapters 8 through 13 are still to come.
      </p>
      <ol className="chapter-list">
        {chapters.map((chapter) => (
          <li key={chapter.number} className="panel chapter-row">
            <Title>
              <Link href={`/read/${chapter.number}`}>
                {chapter.title}
                {getComicChapter(chapter.number) ? `: ${getComicChapter(chapter.number)?.name}` : null}
              </Link>
            </Title>
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
