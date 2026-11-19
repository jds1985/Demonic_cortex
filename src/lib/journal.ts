import { readFile } from "node:fs/promises";
import path from "node:path";

import { journalEntries, type JournalBlock, type JournalEntry, type JournalKind } from "../../content/journal";
import { isSubscriber } from "./access";
import { canReadBody, type ChapterAccess } from "./catalog";
import { publicArtPath } from "./characters";

export interface JournalPage {
  id: string;
  number: number;
  title: string;
  unlockOrder: number;
  type: JournalKind;
  image: string | null;
  imageAlt: string | null;
  access: ChapterAccess;
  paragraphs: JournalBlock[] | null;
}

/** Entries One and Two are free. Later pages stay closed until their unlock order is raised. */
export const JOURNAL_FREE_THROUGH = 2;
export const JOURNAL_LOCKED_THROUGH = 0;

const FILE_NAME = /^[\w.-]+$/;
const MAX_TEXT_BYTES = 200_000;

const CLOSED_PREVIEW: JournalEntry[] = [
  { id: "preview-1", number: 1, title: "Page 1", unlockOrder: 1, type: "sketch", image: null },
  { id: "preview-2", number: 2, title: "Page 2", unlockOrder: 2, type: "entry", image: null },
  { id: "preview-3", number: 3, title: "Page 3", unlockOrder: 3, type: "mixed", image: null },
];

export function journalAccess(unlockOrder: number): ChapterAccess | null {
  return accessByOrder(unlockOrder, JOURNAL_FREE_THROUGH, JOURNAL_LOCKED_THROUGH);
}

/** Same free, locked, then upcoming ladder as the chapters. */
export function accessByOrder(unlockOrder: number, freeThrough: number, lockedThrough: number): ChapterAccess | null {
  if (!Number.isInteger(unlockOrder) || unlockOrder < 1) return null;
  if (unlockOrder <= freeThrough) return "free";
  if (unlockOrder <= lockedThrough) return "locked";
  return "upcoming";
}

export function journalFileName(number: number): string {
  return `journal-${String(number).padStart(2, "0")}.json`;
}

export function parseJournalJson(raw: string): string[] | null {
  try {
    return parseJournalData(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export async function loadJournalPages(entries: readonly JournalEntry[] = journalEntries): Promise<JournalPage[]> {
  const source = entries.length > 0 ? entries : CLOSED_PREVIEW;
  const subscriber = await isSubscriber();
  const pages: JournalPage[] = [];
  for (const entry of source) {
    pages.push(await releaseJournal(entry, subscriber));
  }
  return pages;
}

export async function releaseJournal(entry: JournalEntry, subscriber: boolean): Promise<JournalPage> {
  const access = journalAccess(entry.unlockOrder) ?? "upcoming";
  return presentJournal(entry, access, subscriber);
}

/** Opens writing only when the chapter rule allows this access. */
export async function presentJournal(
  entry: JournalEntry,
  access: ChapterAccess,
  subscriber: boolean,
): Promise<JournalPage> {
  if (!canReadBody(access, subscriber)) {
    return { ...entry, image: null, imageAlt: null, access, paragraphs: null };
  }
  if (entry.blocks && entry.blocks.length > 0) {
    return {
      ...entry,
      image: publicArtPath(entry.image),
      imageAlt: entry.imageAlt ?? null,
      access,
      paragraphs: entry.blocks,
    };
  }
  const paragraphs = await readPrivateJournal(entry.number);
  return {
    ...entry,
    image: publicArtPath(entry.image),
    imageAlt: entry.imageAlt ?? null,
    access,
    paragraphs,
  };
}

async function readPrivateJournal(number: number): Promise<JournalBlock[] | null> {
  const source = privateSource();
  if (!source) return null;
  try {
    const raw = await readSourceText(source, journalFileName(number));
    const lines = raw ? parseJournalJson(raw) : null;
    return lines ? lines.map((text) => ({ text })) : null;
  } catch {
    return null;
  }
}

function parseJournalData(data: unknown): string[] | null {
  if (!data || typeof data !== "object") return null;
  const record = data as { paragraphs?: unknown; text?: unknown };
  const fromList = cleanParagraphs(record.paragraphs);
  if (fromList.length > 0) return fromList;
  const line = cleanLine(record.text, 20_000);
  return line ? [line] : null;
}

function cleanParagraphs(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const paragraphs: string[] = [];
  for (const item of value) {
    const line = cleanLine(item, 20_000);
    if (line) paragraphs.push(line);
    if (paragraphs.length >= 80) break;
  }
  return paragraphs;
}

function cleanLine(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

function privateSource(): string | null {
  const value = process.env["PRIVATE_JOURNAL_SOURCE"]?.trim();
  return value ? value : null;
}

async function readSourceText(source: string, fileName: string): Promise<string | null> {
  if (!FILE_NAME.test(fileName)) return null;
  if (source.startsWith("https:") || source.startsWith("http:")) {
    const url = sourceFileUrl(source, fileName);
    if (!url) return null;
    const response = await fetch(url, {
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok || !isAllowedRemoteUrl(response.url)) return null;
    return response.text();
  }
  const data = await readLocalFile(source, fileName);
  return data ? new TextDecoder().decode(data) : null;
}

async function readLocalFile(source: string, fileName: string): Promise<Uint8Array | null> {
  const filePath = resolveInside(source, fileName);
  if (!filePath) return null;
  const data = await readFile(/*turbopackIgnore: true*/ filePath);
  if (data.byteLength === 0 || data.byteLength > MAX_TEXT_BYTES) return null;
  return data;
}

function resolveInside(root: string, fileName: string): string | null {
  if (!FILE_NAME.test(fileName)) return null;
  const rootResolved = path.resolve(root);
  const filePath = path.resolve(rootResolved, fileName);
  if (filePath !== path.join(rootResolved, fileName)) return null;
  return filePath;
}

function sourceFileUrl(base: string, fileName: string): URL | null {
  const root = isAllowedRemoteUrl(base.endsWith("/") ? base : `${base}/`);
  if (!root || !FILE_NAME.test(fileName)) return null;
  const url = new URL(fileName, root);
  if (url.origin !== root.origin) return null;
  return isAllowedRemoteUrl(url.toString());
}

function isPrivateOrMetadataHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "metadata.google.internal" || host.endsWith(".internal")) return true;
  const match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return false;
  const parts = match.slice(1).map(Number);
  if (parts.some((part) => part > 255)) return true;
  const [a, b] = parts;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

function isAllowedRemoteUrl(raw: string): URL | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.username || url.password) return null;
  const host = url.hostname.toLowerCase();
  const local = host === "localhost" || host === "127.0.0.1" || host === "::1";
  if (!local && isPrivateOrMetadataHost(host)) return null;
  if (url.protocol === "https:") return url;
  if (url.protocol === "http:" && local) return url;
  return null;
}
