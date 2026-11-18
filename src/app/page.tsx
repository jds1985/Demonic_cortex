import Image from "next/image";
import Link from "next/link";

import { ContinueReading } from "@/components/continue-reading";
import { OpenSoundtrack } from "@/components/music-player";
import { coverAlt, coverSrc, premise } from "@/lib/site";

export default function HomePage() {
  return (
    <div className="wrap">
      <section className="splash" aria-labelledby="hero-title">
        <div className="panel splash-copy">
          <p className="kicker">A graphic novel in progress</p>
          <p className="byline">by Jim</p>
          <p className="prose">{premise}</p>
          <div className="actions">
            <Link className="button" href="/read/1">
              Read Chapter 1 free
            </Link>
          </div>
          <nav className="home-sections" aria-label="Sections">
            <Link className="button" href="/chapters">
              Chapters
            </Link>
            <Link className="button" href="/characters">
              Characters
            </Link>
            <Link className="button" href="/journal">
              Rayne&apos;s Journal
            </Link>
            <Link className="button" href="/subscribe">
              Subscribe
            </Link>
            <Link className="button" href="/trailers">
              Trailers
            </Link>
            <OpenSoundtrack />
          </nav>
          <p className="quiet-links">
            <ContinueReading />
          </p>
        </div>
        <figure className="panel cover-slot">
          <Image src={coverSrc} alt={coverAlt} width={864} height={1152} priority sizes="(min-width: 56rem) 32rem, 100vw" />
        </figure>
      </section>
    </div>
  );
}
