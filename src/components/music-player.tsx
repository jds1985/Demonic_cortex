"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import type { Track } from "@/lib/media";
import { VOLUME_KEY } from "@/lib/reading-prefs";

let volumeSnapshot = 0.7;
let volumeKey = "70";
const volumeListeners = new Set<() => void>();

function subscribeVolume(listener: () => void): () => void {
  volumeListeners.add(listener);
  return () => {
    volumeListeners.delete(listener);
  };
}

function getVolumeSnapshot(): number {
  if (typeof window === "undefined") return 0.7;
  try {
    const raw = localStorage.getItem(VOLUME_KEY);
    const parsed = raw === null ? 0.7 : Number(raw);
    const safe = parsed >= 0 && parsed <= 1 ? parsed : 0.7;
    const key = String(Math.round(safe * 100));
    if (key !== volumeKey) {
      volumeKey = key;
      volumeSnapshot = safe;
    }
    return volumeSnapshot;
  } catch {
    return volumeSnapshot;
  }
}

function commitVolume(next: number): void {
  const safe = Math.min(1, Math.max(0, next));
  try {
    localStorage.setItem(VOLUME_KEY, String(safe));
  } catch {
    // The slider still moves for this visit.
  }
  const key = String(Math.round(safe * 100));
  if (key === volumeKey) return;
  volumeKey = key;
  volumeSnapshot = safe;
  for (const listener of volumeListeners) listener();
}

export function MusicPlayer({ tracks }: { tracks: Track[] }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const indexRef = useRef(0);
  const pendingPlayRef = useRef(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState(tracks.length === 0 ? "Soundtrack coming soon." : "");
  const volume = useSyncExternalStore(subscribeVolume, getVolumeSnapshot, () => 0.7);
  const track = tracks[index] ?? null;

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!pendingPlayRef.current) return;
    pendingPlayRef.current = false;
    const audio = audioRef.current;
    if (!audio) return;
    void audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => {
        setPlaying(false);
        setStatus("Playback could not start.");
      });
  }, [index]);

  function toggle() {
    if (!track) {
      setStatus("Soundtrack coming soon. There is no audio to play.");
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio
        .play()
        .then(() => {
          setPlaying(true);
          setStatus(`Playing ${track.title}`);
        })
        .catch(() => {
          setPlaying(false);
          setStatus("Playback could not start.");
        });
      return;
    }
    audio.pause();
    setPlaying(false);
    setStatus(`Paused ${track.title}`);
  }

  function changeTrack(direction: number) {
    audioRef.current?.pause();
    pendingPlayRef.current = false;
    setPlaying(false);
    setIndex((current) => (current + direction + tracks.length) % tracks.length);
  }

  function onEnded() {
    const current = indexRef.current;
    if (current + 1 < tracks.length) {
      pendingPlayRef.current = true;
      setIndex(current + 1);
      return;
    }
    setPlaying(false);
    setStatus("End of soundtrack.");
  }

  const visibleStatus = tracks.length === 0 ? "Soundtrack coming soon." : status || track?.title || "";

  return (
    <section id="soundtrack" className="player" aria-label="Soundtrack" tabIndex={-1}>
      <div className="wrap player-inner">
        <button type="button" className="play" onClick={toggle} aria-pressed={playing}>
          <PlayIcon playing={playing} />
          {playing ? "Pause" : "Play"}
        </button>
        <div className="player-copy">
          <p className="player-name">Soundtrack</p>
          <p className="player-status" aria-live="polite">
            {visibleStatus}
          </p>
        </div>
        {tracks.length > 1 ? (
          <div className="track-switch" role="group" aria-label="Tracks">
            <button type="button" onClick={() => changeTrack(-1)}>
              Previous track
            </button>
            <button type="button" onClick={() => changeTrack(1)}>
              Next track
            </button>
          </div>
        ) : null}
        <label className="volume" htmlFor="soundtrack-volume">
          Volume
          <input
            id="soundtrack-volume"
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(volume * 100)}
            onChange={(event) => commitVolume(Number(event.target.value) / 100)}
          />
        </label>
        {track ? <audio ref={audioRef} src={track.src} preload="none" onEnded={onEnded} /> : null}
      </div>
    </section>
  );
}

function PlayIcon({ playing }: { playing: boolean }) {
  if (playing) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="5" y="4" width="5" height="16" fill="currentColor" />
        <rect x="14" y="4" width="5" height="16" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 4l13 8-13 8V4z" fill="currentColor" />
    </svg>
  );
}
