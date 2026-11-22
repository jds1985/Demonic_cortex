import type { Metadata } from "next";

import { ChapterList } from "@/components/chapter-list";

export const metadata: Metadata = {
  title: "Chapters",
  description: "Thirteen chapters of Demonic Cortex. Chapters 1 through 3 are free. Later chapters stay locked until subscriptions open.",
};

export default function ChaptersPage() {
  return (
    <div className="wrap">
      <ChapterList level="h1" />
    </div>
  );
}
