export interface Track {
  id: string;
  title: string;
  src: string;
}

export interface Trailer {
  title: string;
  youtubeId: string;
}

const AUDIO_FILE = /^\/audio\/[\w.-]+\.(mp3|m4a|ogg|wav)$/i;
const YOUTUBE_ID = /^[a-zA-Z0-9_-]{11}$/;

export function visibleTracks(input: unknown): Track[] {
  if (!Array.isArray(input)) return [];
  const tracks: Track[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const record = item as { id?: unknown; title?: unknown; src?: unknown };
    if (typeof record.title !== "string" || record.title.trim() === "") continue;
    if (typeof record.src !== "string" || !isSafeAudioSrc(record.src)) continue;
    const src = record.src.trim();
    const title = record.title.trim();
    const id = typeof record.id === "string" && record.id.trim() ? record.id.trim() : src;
    tracks.push({ id, title, src });
  }
  return tracks;
}

export function visibleTrailers(input: unknown): Trailer[] {
  if (!Array.isArray(input)) return [];
  const videos: Trailer[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const record = item as { title?: unknown; youtubeId?: unknown };
    if (typeof record.title !== "string" || record.title.trim() === "") continue;
    if (typeof record.youtubeId !== "string" || !YOUTUBE_ID.test(record.youtubeId)) continue;
    videos.push({ title: record.title.trim(), youtubeId: record.youtubeId });
  }
  return videos;
}

function isSafeAudioSrc(src: string): boolean {
  const trimmed = src.trim();
  if (AUDIO_FILE.test(trimmed)) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}
