import type { Metadata } from "next";

import { CharacterGrid } from "@/components/character-grid";

export const metadata: Metadata = {
  title: "Characters",
  description: "Rayne, Heaven, Lou, and Duke. Portrait art is not on the site yet.",
};

export default function CharactersPage() {
  return (
    <div className="wrap">
      <CharacterGrid heading="Characters" level="h1" />
    </div>
  );
}
