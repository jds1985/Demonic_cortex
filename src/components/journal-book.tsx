import Link from "next/link";

import type { JournalPage } from "@/lib/journal";
import type { JournalKind } from "../../content/journal";

const KIND: Record<JournalKind, string> = {
  sketch: "Sketch",
  entry: "Note",
  mixed: "Sketch and note",
};

const COVER_WIDTHS = [480, 720, 864] as const;

function coverSrcSet(extension: "webp" | "jpg") {
  return COVER_WIDTHS.map((width) => `/art/journal-cover-${width}.${extension} ${width}w`).join(", ");
}

export function JournalBook({ pages }: { pages: JournalPage[] }) {
  return (
    <div className="wrap journal">
      <h1>Rayne&apos;s Journal</h1>
      <p className="journal-lead">Rayne&apos;s sketches and notes will appear here as the story unfolds.</p>
      <figure className="journal-cover">
        <picture>
          <source
            type="image/webp"
            sizes="(min-width: 56rem) 36rem, calc(100vw - 2rem)"
            srcSet={coverSrcSet("webp")}
          />
          <img
            src="/art/journal-cover-864.jpg"
            srcSet={coverSrcSet("jpg")}
            sizes="(min-width: 56rem) 36rem, calc(100vw - 2rem)"
            alt="Rayne's sketchbook cover"
            width={864}
            height={1152}
          />
        </picture>
      </figure>
      <ol className="journal-pages">
        {pages.map((page) => (
          <li key={page.id}>
            <SketchPage page={page} />
          </li>
        ))}
      </ol>
    </div>
  );
}

function SketchPage({ page }: { page: JournalPage }) {
  const open = page.paragraphs !== null;
  const label = open ? page.title : closedLabel(page);

  return (
    <article className={open ? "sketch-page sketch-page-open" : "sketch-page sketch-page-closed"}>
      <span className="sketch-tape" aria-hidden="true" />
      <span className="sketch-stitch" aria-hidden="true" />
      <h2>{label}</h2>
      <p className="sketch-kind">{KIND[page.type]}</p>
      {open ? (
        <div className="sketch-body">
          {page.image ? (
            // Unlocked sketches are already-sized public files.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={page.image} alt={page.title} />
          ) : null}
          {page.paragraphs?.map((paragraph, index) => (
            <p key={`${page.id}-${index}`}>{paragraph}</p>
          ))}
        </div>
      ) : page.access === "locked" ? (
        <p className="sketch-closed">
          <Link href="/subscribe">Subscribe to open this page</Link>
        </p>
      ) : (
        <p className="sketch-closed">This page stays shut until it unlocks.</p>
      )}
    </article>
  );
}

function closedLabel(page: JournalPage): string {
  if (page.access === "locked") return `${page.title} - locked`;
  return `${page.title} - unlocks soon`;
}
