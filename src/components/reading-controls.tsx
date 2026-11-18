"use client";

import { useSyncExternalStore } from "react";

import {
  applyReadingPrefs,
  getReadingPrefsSnapshot,
  getServerReadingPrefsSnapshot,
  LINE_SPACINGS,
  READING_SIZES,
  subscribeReadingPrefs,
  type LineSpacing,
  type ReadingSize,
} from "@/lib/reading-prefs";

const SPACING_LABELS: Record<LineSpacing, string> = {
  compact: "Compact",
  comfortable: "Comfortable",
  open: "Open",
};

export function ReadingControls() {
  const { size, spacing } = useSyncExternalStore(
    subscribeReadingPrefs,
    getReadingPrefsSnapshot,
    getServerReadingPrefsSnapshot,
  );
  const sizeIndex = READING_SIZES.indexOf(size);

  function chooseSize(next: ReadingSize) {
    applyReadingPrefs(next, spacing);
  }

  function chooseSpacing(next: LineSpacing) {
    applyReadingPrefs(size, next);
  }

  return (
    <section className="reading-controls" aria-label="Reading display">
      <div className="control-row">
        <p className="control-label" id="text-size-label">
          Text size
        </p>
        <div className="control-group" role="group" aria-labelledby="text-size-label">
          <button
            type="button"
            onClick={() => chooseSize(READING_SIZES[sizeIndex - 1] ?? size)}
            disabled={sizeIndex <= 0}
          >
            Smaller
          </button>
          <p className="control-value">
            {sizeIndex + 1} of {READING_SIZES.length}
          </p>
          <button
            type="button"
            onClick={() => chooseSize(READING_SIZES[sizeIndex + 1] ?? size)}
            disabled={sizeIndex >= READING_SIZES.length - 1}
          >
            Larger
          </button>
        </div>
      </div>
      <div className="control-row">
        <p className="control-label" id="spacing-label">
          Line spacing
        </p>
        <div className="control-group" role="group" aria-labelledby="spacing-label">
          {LINE_SPACINGS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={spacing === option}
              onClick={() => chooseSpacing(option)}
            >
              {SPACING_LABELS[option]}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
