"use client";

import { useState } from "react";

import type { PanelPage } from "@/lib/chapters";

import { InkSky } from "./ink-sky";

const ZOOMS = [1, 1.5, 2, 3] as const;

export function IllustratedPanel({
  page,
  index,
  total,
  headingId,
}: {
  page: PanelPage;
  index: number;
  total: number;
  headingId: string;
}) {
  const [zoomIndex, setZoomIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const zoom = ZOOMS[zoomIndex] ?? 1;
  const showImage = Boolean(page.src) && !failed;

  function changeZoom(nextIndex: number) {
    const clamped = Math.min(ZOOMS.length - 1, Math.max(0, nextIndex));
    setZoomIndex(clamped);
    setAnnouncement(`Zoom ${Math.round((ZOOMS[clamped] ?? 1) * 100)} percent`);
  }

  return (
    <figure className="panel page-panel" aria-labelledby={headingId}>
      <p id={headingId} className="page-label">
        Page {index + 1} of {total}. Illustrated page.
      </p>
      {showImage ? (
        <>
          <div className="zoom-controls" role="group" aria-label="Illustrated page zoom">
            <button type="button" onClick={() => changeZoom(zoomIndex - 1)} disabled={zoomIndex === 0}>
              Zoom out
            </button>
            <p className="zoom-value">Zoom {Math.round(zoom * 100)}%</p>
            <button
              type="button"
              onClick={() => changeZoom(zoomIndex + 1)}
              disabled={zoomIndex === ZOOMS.length - 1}
            >
              Zoom in
            </button>
            <button type="button" onClick={() => changeZoom(0)} disabled={zoomIndex === 0}>
              Reset zoom
            </button>
          </div>
          <div
            className={zoom > 1 ? "panel-viewport is-zoomed" : "panel-viewport"}
            tabIndex={0}
            aria-label="Illustrated page frame. After zooming in, use arrow keys or scroll inside this frame."
          >
            {/* Plain img so zoom can grow the picture inside the frame. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={page.src ?? undefined}
              alt={page.alt}
              style={{ width: `${zoom * 100}%` }}
              onError={() => setFailed(true)}
            />
          </div>
          <p className="help">
            Zoom stays inside this frame, so the rest of the page does not slide sideways.
          </p>
        </>
      ) : (
        <div className="placeholder-panel">
          <InkSky />
          <p className="caption-bar">{page.caption || page.alt}</p>
        </div>
      )}
      {showImage && page.caption ? <p className="caption-bar">{page.caption}</p> : null}
      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>
    </figure>
  );
}
