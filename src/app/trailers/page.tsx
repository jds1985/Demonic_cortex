import type { Metadata } from "next";

import { TrailerSection } from "@/components/trailer-section";

import trailersFile from "../../../content/trailers.json";

export const metadata: Metadata = {
  title: "Trailers",
  description: "Trailers for Demonic Cortex. Videos will appear here when they are ready.",
};

export default function TrailersPage() {
  return (
    <div className="wrap">
      <TrailerSection videos={trailersFile.videos} level="h1" />
    </div>
  );
}
