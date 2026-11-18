import type { Metadata } from "next";
import { io } from "next/cache";
import { Suspense } from "react";

import { JournalBook } from "@/components/journal-book";
import { loadJournalPages } from "@/lib/journal";

export const metadata: Metadata = {
  title: "Rayne's Journal",
  description: "Rayne's sketchbook. Her sketches and notes will appear here as the story unfolds.",
};

export default function JournalPage() {
  return (
    <Suspense fallback={<JournalFallback />}>
      <JournalContent />
    </Suspense>
  );
}

async function JournalContent() {
  await io();
  const pages = await loadJournalPages();
  return <JournalBook pages={pages} />;
}

function JournalFallback() {
  return (
    <div className="wrap journal">
      <h1>Rayne&apos;s Journal</h1>
      <p className="journal-lead">Opening the sketchbook.</p>
    </div>
  );
}
