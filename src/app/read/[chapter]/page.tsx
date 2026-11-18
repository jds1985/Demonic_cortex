import type { Metadata } from "next";
import { io } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ReaderView } from "@/components/reader-view";
import { listChapters, parseChapterNumber } from "@/lib/catalog";
import { loadChapter } from "@/lib/chapters";

export function generateStaticParams() {
  return listChapters().map((chapter) => ({ chapter: String(chapter.number) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapter: string }>;
}): Promise<Metadata> {
  const { chapter } = await params;
  const number = parseChapterNumber(chapter);
  if (!number) return { title: "Chapter" };
  return {
    title: `Chapter ${number}`,
    description: `Chapter ${number} of Demonic Cortex, a graphic novel in progress.`,
  };
}

export default function ChapterPage({ params }: { params: Promise<{ chapter: string }> }) {
  return (
    <Suspense fallback={<ReaderFallback />}>
      <ChapterContent params={params} />
    </Suspense>
  );
}

async function ChapterContent({ params }: { params: Promise<{ chapter: string }> }) {
  await io();
  const { chapter } = await params;
  const number = parseChapterNumber(chapter);
  if (!number) notFound();
  const document = await loadChapter(number);
  if (!document) notFound();
  return <ReaderView chapter={document} />;
}

function ReaderFallback() {
  return (
    <div className="wrap reader">
      <p className="kicker">Graphic novel</p>
      <h1>Opening the chapter</h1>
      <p className="prose">Loading this entry.</p>
    </div>
  );
}
