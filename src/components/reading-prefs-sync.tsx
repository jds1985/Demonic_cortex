"use client";

import { useLayoutEffect } from "react";
import { useSyncExternalStore } from "react";

import {
  getReadingPrefsSnapshot,
  getServerReadingPrefsSnapshot,
  LINE_SPACING_VALUES,
  READING_SIZE_VALUES,
  readStoredReadingPrefs,
  subscribeReadingPrefs,
} from "@/lib/reading-prefs";

export function ReadingPrefsSync() {
  const prefs = useSyncExternalStore(
    subscribeReadingPrefs,
    getReadingPrefsSnapshot,
    getServerReadingPrefsSnapshot,
  );

  useLayoutEffect(() => {
    const stored = readStoredReadingPrefs();
    const root = document.documentElement;
    root.style.setProperty("--reading-size", READING_SIZE_VALUES[stored.size]);
    root.style.setProperty("--reading-leading", LINE_SPACING_VALUES[stored.spacing]);
  }, [prefs.size, prefs.spacing]);

  return null;
}
