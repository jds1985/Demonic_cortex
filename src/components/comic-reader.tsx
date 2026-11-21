import Link from "next/link";

import { getComicChapter, type ComicChapter } from "@/lib/comics";

import { ComicBook } from "./comic-book";

export function ComicReader({ chapter }: { chapter: ComicChapter }) {
  const previous = getComicChapter(chapter.number - 1);
  const next = getComicChapter(chapter.number + 1);
  return (
    <div className="wrap reader comic-reader">
      <h1 className="visually-hidden">
        {chapter.heading}: {chapter.name}
      </h1>
      <ComicBook
        chapter={chapter}
        nextChapter={next ? { href: `/read/${next.number}`, label: `Chapter ${next.number}: ${next.name}` } : null}
      />
      <nav className="pager" aria-label="Chapter">
        {previous ? <Link href={`/read/${previous.number}`}>Previous: Chapter {previous.number}</Link> : <span />}
        <Link href="/chapters">All chapters</Link>
        {next ? <Link href={`/read/${next.number}`}>Next: Chapter {next.number}</Link> : <span />}
      </nav>
    </div>
  );
}
