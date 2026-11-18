import Link from "next/link";

import { ChapterList } from "@/components/chapter-list";
import { CharacterGrid } from "@/components/character-grid";
import { ContinueReading } from "@/components/continue-reading";
import { InkSky } from "@/components/ink-sky";
import { TrailerSection } from "@/components/trailer-section";
import { premise } from "@/lib/site";

import trailersFile from "../../content/trailers.json";

export default function HomePage() {
  return (
    <div className="wrap">
      <section className="splash" aria-labelledby="hero-title">
        <div className="panel splash-copy">
          <p className="kicker">A graphic novel in progress</p>
          <h1 id="hero-title">Demonic Cortex</h1>
          <p className="byline">by Jim</p>
          <div className="actions">
            <Link className="button" href="/read/1">
              Read Chapter 1 free
            </Link>
            <Link className="button button-secondary" href="/characters">
              Characters
            </Link>
            <ContinueReading />
          </div>
          <p className="prose">{premise}</p>
        </div>
        <figure className="panel cover-slot">
          <InkSky />
          <figcaption className="caption-bar">
            Cover art coming soon. Bold ink, cel-shaded, on a crimson and black sky.
          </figcaption>
        </figure>
      </section>
      <ChapterList />
      <CharacterGrid />
      <TrailerSection videos={trailersFile.videos} />
    </div>
  );
}
