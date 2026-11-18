export const READING_SIZE_KEY = "dc-reading-size:v1";
export const LINE_SPACING_KEY = "dc-line-spacing:v1";
export const PROGRESS_KEY = "dc-progress:v1";
export const VOLUME_KEY = "dc-volume:v1";

export const READING_SIZE_VALUES = {
  "1": "1.125rem",
  "2": "1.25rem",
  "3": "1.375rem",
  "4": "1.625rem",
  "5": "2rem",
} as const;

export type ReadingSize = keyof typeof READING_SIZE_VALUES;

export const LINE_SPACING_VALUES = {
  compact: "1.6",
  comfortable: "1.85",
  open: "2.2",
} as const;

export type LineSpacing = keyof typeof LINE_SPACING_VALUES;

export const DEFAULT_READING_SIZE: ReadingSize = "3";
export const DEFAULT_LINE_SPACING: LineSpacing = "comfortable";

export const READING_SIZES = Object.keys(READING_SIZE_VALUES) as ReadingSize[];
export const LINE_SPACINGS = Object.keys(LINE_SPACING_VALUES) as LineSpacing[];

export function isReadingSize(value: string | null): value is ReadingSize {
  return value !== null && value in READING_SIZE_VALUES;
}

export function isLineSpacing(value: string | null): value is LineSpacing {
  return value !== null && value in LINE_SPACING_VALUES;
}

export interface ReadingPrefs {
  size: ReadingSize;
  spacing: LineSpacing;
}

const serverPrefs: ReadingPrefs = {
  size: DEFAULT_READING_SIZE,
  spacing: DEFAULT_LINE_SPACING,
};

let prefsSnapshot: ReadingPrefs = serverPrefs;
let prefsKey = `${DEFAULT_READING_SIZE}:${DEFAULT_LINE_SPACING}`;
const prefsListeners = new Set<() => void>();

export function subscribeReadingPrefs(listener: () => void): () => void {
  prefsListeners.add(listener);
  return () => {
    prefsListeners.delete(listener);
  };
}

export function getReadingPrefsSnapshot(): ReadingPrefs {
  if (typeof window === "undefined") return serverPrefs;
  const next = readStoredReadingPrefs();
  const key = `${next.size}:${next.spacing}`;
  if (key !== prefsKey) {
    prefsKey = key;
    prefsSnapshot = next;
  }
  return prefsSnapshot;
}

export function getServerReadingPrefsSnapshot(): ReadingPrefs {
  return serverPrefs;
}

export function applyReadingPrefs(size: ReadingSize, spacing: LineSpacing): void {
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    root.style.setProperty("--reading-size", READING_SIZE_VALUES[size]);
    root.style.setProperty("--reading-leading", LINE_SPACING_VALUES[spacing]);
    root.dataset.readingSize = size;
    root.dataset.lineSpacing = spacing;
  }
  try {
    localStorage.setItem(READING_SIZE_KEY, size);
    localStorage.setItem(LINE_SPACING_KEY, spacing);
  } catch {
    // Storage can be unavailable. The on-screen choice still applies.
  }
  const key = `${size}:${spacing}`;
  if (key !== prefsKey) {
    prefsKey = key;
    prefsSnapshot = { size, spacing };
  }
  for (const listener of prefsListeners) listener();
}

export function readStoredReadingPrefs(): { size: ReadingSize; spacing: LineSpacing } {
  if (typeof document === "undefined") {
    return { size: DEFAULT_READING_SIZE, spacing: DEFAULT_LINE_SPACING };
  }
  try {
    const size = localStorage.getItem(READING_SIZE_KEY);
    const spacing = localStorage.getItem(LINE_SPACING_KEY);
    return {
      size: isReadingSize(size) ? size : DEFAULT_READING_SIZE,
      spacing: isLineSpacing(spacing) ? spacing : DEFAULT_LINE_SPACING,
    };
  } catch {
    return { size: DEFAULT_READING_SIZE, spacing: DEFAULT_LINE_SPACING };
  }
}

/** Runs in the browser before paint so a saved text size does not flash smaller. */
export function readingPrefsBootstrapScript(): string {
  const sizes = JSON.stringify(READING_SIZE_VALUES);
  const leads = JSON.stringify(LINE_SPACING_VALUES);
  const sizeKey = JSON.stringify(READING_SIZE_KEY);
  const leadKey = JSON.stringify(LINE_SPACING_KEY);
  const defaultSize = JSON.stringify(DEFAULT_READING_SIZE);
  const defaultLead = JSON.stringify(DEFAULT_LINE_SPACING);
  return `(function(){try{var sizes=${sizes};var leads=${leads};var root=document.documentElement;var size=localStorage.getItem(${sizeKey});var lead=localStorage.getItem(${leadKey});if(!sizes[size]){size=${defaultSize};}if(!leads[lead]){lead=${defaultLead};}root.style.setProperty("--reading-size",sizes[size]);root.style.setProperty("--reading-leading",leads[lead]);root.dataset.readingSize=size;root.dataset.lineSpacing=lead;}catch(e){}})();`;
}
