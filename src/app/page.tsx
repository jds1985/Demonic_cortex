import Image from "next/image";
import Link from "next/link";

import { ChapterList } from "@/components/chapter-list";
import { CharacterGrid } from "@/components/character-grid";
import { ContinueReading } from "@/components/continue-reading";
import { TrailerSection } from "@/components/trailer-section";
import { coverAlt, coverSrc, premise } from "@/lib/site";

import trailersFile from "../../content/trailers.json";

export default function HomePage() {
  return (
    <div className="wrap">
      <section className="splash" aria-labelledby="hero-title">
        <div className="panel splash-copy">
          <p className="kicker">A graphic novel in progress</p>
          <p className="byline">by Jim</p>
          <div className="actions">
            <Link className="button" href="/read/1">
              Read Chapter 1 free
            </Link>
          </div>
          <p className="prose">{premise}</p>
          <p className="quiet-links">
            <Link href="/characters">Characters</Link>
            <ContinueReading />
          </p>
        </div>
        <figure className="panel cover-slot">
          <Image src={coverSrc} alt={coverAlt} width={864} height={1152} priority sizes="(min-width: 56rem) 32rem, 100vw" />
        </figure>
      </section>
      <ChapterList />
      <CharacterGrid />
      <TrailerSection videos={trailersFile.videos} />
    </div>
  );
}
