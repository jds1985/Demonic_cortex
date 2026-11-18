import { artDirection } from "./site";

export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string | null;
  alt: string;
}

const ART_PATH = /^\/art\/(?:journal\/)?[\w.-]+\.(png|jpe?g|webp|gif|avif)$/i;

/** Public character art lives under /public/art. Anything else is ignored. */
export function publicArtPath(src: string | null): string | null {
  if (!src || !ART_PATH.test(src)) return null;
  return src;
}

export const characters: Character[] = [
  {
    id: "rayne",
    name: "Rayne",
    role: "The mother and narrator",
    description: "Description coming soon.",
    image: "/art/rayne.jpg",
    alt: "Rayne",
  },
  {
    id: "heaven",
    name: "Heaven",
    role: "Rayne's daughter",
    description: "Description coming soon.",
    image: "/art/heaven.jpg",
    alt: "Heaven",
  },
  {
    id: "lou",
    name: "Lou",
    role: "Rayne's husband. He was not who he seemed.",
    description: "Description coming soon.",
    image: "/art/lou.jpg",
    alt: "Lou",
  },
  {
    id: "duke",
    name: "Duke",
    role: "Guides Rayne toward the soul key and the demonic cortex.",
    description: "Description coming soon.",
    image: "/art/duke.jpg",
    alt: "Duke",
  },
];

export const characterArtLabel = artDirection;
