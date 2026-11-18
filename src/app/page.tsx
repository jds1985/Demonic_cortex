import Link from "next/link";

import { ChapterList } from "@/components/chapter-list";
import { CharacterGrid } from "@/components/character-grid";
import { ContinueReading } from "@/components/continue-reading";
import { HellRule } from "@/components/hell-rule";
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
          <h1 id="hero-title" className="hell-title">
            <span className="hell-haze" aria-hidden="true">
              Demonic Cortex
            </span>
            <span className="hell-letters">Demonic Cortex</span>
          </h1>
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
          <figcaption className="caption-bar">Cover art coming soon.</figcaption>
        </figure>
      </section>
      <HellRule />
      <ChapterList />
      <HellRule />
      <CharacterGrid />
      <HellRule />
      <TrailerSection videos={trailersFile.videos} />
    </div>
  );
}
