import { characterArtLabel, characters, publicArtPath } from "@/lib/characters";

import { InkSky } from "./ink-sky";

export function CharacterGrid({ heading = "Characters", level = "h2" }: { heading?: string; level?: "h1" | "h2" }) {
  const Heading = level;
  const CardHeading = level === "h1" ? "h2" : "h3";

  return (
    <section className="block" id="characters" aria-labelledby="characters-heading">
      <Heading id="characters-heading">{heading}</Heading>
      <p className="prose">
        Rayne, Heaven, Lou, and Duke.
      </p>
      <ul className="card-grid">
        {characters.map((character) => {
          const image = publicArtPath(character.image);
          return (
            <li key={character.id} className="panel character-card">
              <figure className="art-frame">
                {image ? (
                  // Character files are local public art added later. Zoom is for story pages.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} alt={character.alt} />
                ) : (
                  <InkSky />
                )}
                {image ? null : <figcaption className="caption-bar">{characterArtLabel}</figcaption>}
              </figure>
              <CardHeading id={`${character.id}-name`}>{character.name}</CardHeading>
              <p className="role">{character.role}</p>
              <p className="prose">{character.description}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
