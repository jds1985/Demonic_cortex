"use client";

import { createContext, useContext, useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

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

type SoundtrackValue = {
  tracks: Track[];
  track: Track | null;
  playing: boolean;
  status: string;
  volume: number;
  toggle: () => void;
  changeTrack: (direction: number) => void;
  setVolume: (value: number) => void;
  requestOpen: () => void;
};

const SoundtrackContext = createContext<SoundtrackValue | null>(null);

function useSoundtrack(): SoundtrackValue {
  const value = useContext(SoundtrackContext);
  if (!value) throw new Error("Soundtrack controls are outside the soundtrack provider.");
  return value;
}

export function useSoundtrackPlaying(): boolean {
  return useSoundtrack().playing;
}

let openMenu: (() => void) | null = null;
let openPanel: (() => void) | null = null;

export function registerMenuOpener(opener: () => void): () => void {
  openMenu = opener;
  return () => {
    if (openMenu === opener) openMenu = null;
  };
}

export function registerPanelOpener(opener: () => void): () => void {
  openPanel = opener;
  return () => {
    if (openPanel === opener) openPanel = null;
  };
}

export function SoundtrackProvider({ tracks, children }: { tracks: Track[]; children: ReactNode }) {
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
      setStatus("Soundtrack coming soon.");
      setPlaying(false);
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
    if (tracks.length === 0) return;
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

  return (
    <SoundtrackContext.Provider
      value={{
        tracks,
        track,
        playing,
        status,
        volume,
        toggle,
        changeTrack,
        setVolume: commitVolume,
        requestOpen: () => {
          openMenu?.();
          openPanel?.();
        },
      }}
    >
      {children}
      <audio
        ref={audioRef}
        className="soundtrack-audio"
        src={track?.src}
        preload="none"
        onEnded={onEnded}
      />
    </SoundtrackContext.Provider>
  );
}

export function OpenSoundtrack() {
  const { requestOpen } = useSoundtrack();
  return (
    <button type="button" className="button" onClick={() => requestOpen()}>
      Soundtrack
    </button>
  );
}

export function SkipToSoundtrack() {
  const { requestOpen } = useSoundtrack();
  return (
    <a
      className="skip skip-audio"
      href="#soundtrack"
      onClick={(event) => {
        event.preventDefault();
        requestOpen();
      }}
    >
      Skip to soundtrack
    </a>
  );
}

export function SoundtrackMenu() {
  const soundtrack = useSoundtrack();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => registerPanelOpener(() => setOpen(true)), []);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("button")?.focus();
  }, [open]);

  const message = soundtrack.track ? soundtrack.track.title : "Soundtrack coming soon.";

  return (
    <div className="soundtrack-menu">
      <button
        ref={buttonRef}
        id="soundtrack"
        type="button"
        className="soundtrack-link"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        Soundtrack
      </button>
      {open ? (
        <div ref={panelRef} id={panelId} className="soundtrack-panel" role="region" aria-label="Soundtrack">
          <button type="button" className="play" onClick={soundtrack.toggle} aria-pressed={soundtrack.playing}>
            <PlayIcon playing={soundtrack.playing} />
            {soundtrack.playing ? "Pause" : "Play"}
          </button>
          <p className="soundtrack-now" aria-live="polite">
            {message}
          </p>
          {soundtrack.tracks.length > 1 ? (
            <div className="track-switch" role="group" aria-label="Tracks">
              <button type="button" onClick={() => soundtrack.changeTrack(-1)}>
                Previous track
              </button>
              <button type="button" onClick={() => soundtrack.changeTrack(1)}>
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
              value={Math.round(soundtrack.volume * 100)}
              onChange={(event) => soundtrack.setVolume(Number(event.target.value) / 100)}
            />
          </label>
        </div>
      ) : null}
    </div>
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
