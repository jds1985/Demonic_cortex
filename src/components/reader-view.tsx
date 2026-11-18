import Link from "next/link";

import { listChapters } from "@/lib/catalog";
import type { ChapterDocument } from "@/lib/chapters";

import { IllustratedPanel } from "./illustrated-panel";
import { ReadingProgress } from "./reading-progress";
import { ReadingSettings } from "./reading-settings";

const ACCESS_LABEL = {
  free: "Free",
  locked: "Locked",
  upcoming: "Coming soon",
} as const;

export function ReaderView({ chapter }: { chapter: ChapterDocument }) {
  const chapters = listChapters();
  const previous = chapter.number > 1 ? chapter.number - 1 : null;
  const next = chapter.number < chapters.length ? chapter.number + 1 : null;
  const pages = chapter.pages;

  return (
    <div className="wrap reader">
      <p className="kicker">Graphic novel</p>
      <h1>{chapter.title}</h1>
      <ReadingSettings prominent />
      <p className={`status status-${chapter.access}`}>{ACCESS_LABEL[chapter.access]}</p>
      <ReadingProgress chapterNumber={chapter.number} />
      {pages ? (
        <>
          {chapter.availability === "placeholder" ? (
            <p className="note">Placeholder. Chapter text and story art are not on the site yet.</p>
          ) : null}
          <ol className="pages">
            {pages.map((page, index) => (
              <li key={`${chapter.number}-${index}`}>
                {page.type === "text" ? (
                  <article className="panel text-panel" aria-labelledby={`page-${chapter.number}-${index}`}>
                    <p id={`page-${chapter.number}-${index}`} className="page-label">
                      Page {index + 1} of {pages.length}. Journal entry.
                    </p>
                    <div className="journal prose">
                      {page.paragraphs.map((paragraph, paragraphIndex) => (
                        <p key={paragraphIndex}>{paragraph}</p>
                      ))}
                    </div>
                  </article>
                ) : (
                  <IllustratedPanel
                    page={page}
                    index={index}
                    total={pages.length}
                    headingId={`page-${chapter.number}-${index}`}
                  />
                )}
              </li>
            ))}
          </ol>
        </>
      ) : chapter.access === "upcoming" ? (
        <section className="panel gate" aria-labelledby="gate-title">
          <h2 id="gate-title">Coming soon</h2>
          <p className="prose">Chapter {chapter.number} is not on the site yet.</p>
        </section>
      ) : (
        <section className="panel gate" aria-labelledby="gate-title">
          <h2 id="gate-title">Subscribe to read Chapter {chapter.number}</h2>
          <p className="prose">
            This chapter is locked. A subscription will open its pages. Payments are not available yet.
          </p>
          <Link className="button" href="/subscribe">
            Subscribe to read
          </Link>
        </section>
      )}
      <nav className="pager" aria-label="Chapter">
        {previous ? (
          <Link className="button button-secondary" href={`/read/${previous}`}>
            Previous chapter
          </Link>
        ) : (
          <span />
        )}
        <Link href="/#chapters">All chapters</Link>
        {next ? (
          <Link className="button button-secondary" href={`/read/${next}`}>
            Next chapter
          </Link>
        ) : (
          <span />
        )}
      </nav>
      <details className="panel chapter-jump">
        <summary>Jump to a chapter</summary>
        <ol>
          {chapters.map((item) => (
            <li key={item.number}>
              <Link
                href={`/read/${item.number}`}
                aria-current={item.number === chapter.number ? "page" : undefined}
              >
                Chapter {item.number}
              </Link>
              <span>{ACCESS_LABEL[item.access]}</span>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}
