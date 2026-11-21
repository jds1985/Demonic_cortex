import Link from "next/link";

import type { ComicChapter } from "@/lib/comics";

import { ComicBook } from "./comic-book";

export function ComicReader({ chapter }: { chapter: ComicChapter }) {
  return (
    <div className="wrap reader comic-reader">
      <h1 className="visually-hidden">
        {chapter.heading}: {chapter.name}
      </h1>
      <ComicBook chapter={chapter} />
      <nav className="pager" aria-label="Chapter">
        <span />
        <Link href="/chapters">All chapters</Link>
        <span />
      </nav>
    </div>
  );
}
