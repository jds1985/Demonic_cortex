"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { getProgressSnapshot, getServerProgressSnapshot, subscribeProgress } from "@/lib/progress";

export function ContinueReading() {
  const saved = useSyncExternalStore(subscribeProgress, getProgressSnapshot, getServerProgressSnapshot);
  if (!saved) return null;

  return (
    <Link href={`/read/${saved.chapter}`}>Continue Chapter {saved.chapter}</Link>
  );
}
