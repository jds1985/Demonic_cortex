import { readFile } from "node:fs/promises";
import path from "node:path";

import { isSubscriber } from "./access";
import { canReadBody, chapterAccess, type ChapterAccess } from "./catalog";

export interface TextPage {
  type: "text";
  paragraphs: string[];
}

export interface PanelPage {
  type: "panel";
  /** Browser-facing URL. Private storage URLs are never included. */
  src: string | null;
  alt: string;
  caption?: string;
}

export type StoryPage = TextPage | PanelPage;

export interface ChapterDocument {
  number: number;
  title: string;
  access: ChapterAccess;
  pages: StoryPage[] | null;
  availability: "placeholder" | "private" | "locked" | "upcoming";
}

interface RawTextPage {
  type: "text";
  paragraphs: string[];
}

interface RawPanelPage {
  type: "panel";
  src: string;
  alt: string;
  caption?: string;
}

type RawPage = RawTextPage | RawPanelPage;

interface RawChapter {
  title?: string;
  pages: RawPage[];
}

const IMAGE_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};

const MAX_IMAGE_BYTES = 12_000_000;
const FILE_NAME = /^[\w.-]+$/;

export const PLACEHOLDER_PAGES: StoryPage[] = [
  { type: "text", paragraphs: ["Chapter text coming soon."] },
  {
    type: "panel",
    src: "/placeholders/panel.svg",
    alt: "Placeholder panel with a flat crimson and black sky, a black cloud, and a red moon. Story art is not on the site yet.",
    caption: "Illustrated page coming soon.",
  },
];

export function chapterFileName(number: number): string {
  return `chapter-${String(number).padStart(2, "0")}.json`;
}

export async function loadChapter(number: number): Promise<ChapterDocument | null> {
  const access = chapterAccess(number);
  if (!access) return null;
  const title = `Chapter ${number}`;
  const subscriber = await isSubscriber();
  if (!canReadBody(access, subscriber)) {
    return {
      number,
      title,
      access,
      pages: null,
      availability: access === "upcoming" ? "upcoming" : "locked",
    };
  }

  const raw = await readRawChapter(number);
  if (!raw) {
    return { number, title, access, pages: PLACEHOLDER_PAGES, availability: "placeholder" };
  }

  return {
    number,
    title: raw.title ?? title,
    access,
    pages: raw.pages.map((page, index) => toClientPage(page, number, index)),
    availability: "private",
  };
}

export async function getPanelAsset(
  number: number,
  index: number,
): Promise<{ data: Uint8Array; contentType: string } | null> {
  const access = chapterAccess(number);
  if (!access || !Number.isInteger(index) || index < 0) return null;
  if (!canReadBody(access, await isSubscriber())) return null;

  const raw = await readRawChapter(number);
  const page = raw?.pages[index];
  if (!page || page.type !== "panel" || !isLoadableImageSrc(page.src)) return null;

  const extension = imageExtension(page.src);
  const contentType = extension ? IMAGE_TYPES[extension] : null;
  if (page.src.startsWith("https:") || page.src.startsWith("http:")) {
    return readRemoteImage(page.src, contentType);
  }
  if (!contentType) return null;

  const source = privateSource();
  if (source && (source.startsWith("https:") || source.startsWith("http:"))) {
    const url = sourceFileUrl(source, page.src);
    return url ? readRemoteImage(url.toString(), contentType) : null;
  }

  const data = await readLocalFile(page.src);
  if (!data || data.byteLength === 0 || data.byteLength > MAX_IMAGE_BYTES) return null;
  return { data, contentType };
}

export function isLoadableImageSrc(src: string): boolean {
  const trimmed = src.trim();
  if (FILE_NAME.test(trimmed) && imageExtension(trimmed)) return true;
  const remote = isAllowedRemoteUrl(trimmed);
  return remote !== null;
}

export function parseChapterJson(raw: string): RawChapter | null {
  try {
    return parseChapterData(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

async function readRawChapter(number: number): Promise<RawChapter | null> {
  const source = privateSource();
  if (!source) return null;
  try {
    const raw = await readSourceText(source, chapterFileName(number));
    return raw ? parseChapterJson(raw) : null;
  } catch {
    return null;
  }
}

function toClientPage(page: RawPage, chapterNumber: number, index: number): StoryPage {
  if (page.type === "text") {
    return { type: "text", paragraphs: page.paragraphs };
  }
  return {
    type: "panel",
    src: isLoadableImageSrc(page.src) ? `/api/panels/${chapterNumber}/${index}` : null,
    alt: page.alt,
    caption: page.caption,
  };
}

function parseChapterData(data: unknown): RawChapter | null {
  if (!data || typeof data !== "object") return null;
  const record = data as { title?: unknown; pages?: unknown; paragraphs?: unknown };
  const title = cleanLine(record.title, 200);
  const pages = Array.isArray(record.pages)
    ? record.pages.flatMap((page) => {
        const parsed = parsePage(page);
        return parsed ? [parsed] : [];
      })
    : paragraphsToPages(record.paragraphs);

  if (pages.length === 0) return null;
  return { title, pages };
}

function parsePage(page: unknown): RawPage | null {
  if (!page || typeof page !== "object") return null;
  const record = page as { type?: unknown; paragraphs?: unknown; src?: unknown; alt?: unknown; caption?: unknown };
  if (record.type === "text") {
    const paragraphs = cleanParagraphs(record.paragraphs);
    return paragraphs.length > 0 ? { type: "text", paragraphs } : null;
  }
  if (record.type === "panel") {
    const alt = cleanLine(record.alt, 2000);
    if (!alt) return null;
    const src = typeof record.src === "string" ? record.src.trim() : "";
    const caption = cleanLine(record.caption, 500);
    return { type: "panel", src, alt, caption };
  }
  return null;
}

function paragraphsToPages(value: unknown): RawPage[] {
  const paragraphs = cleanParagraphs(value);
  return paragraphs.length > 0 ? [{ type: "text", paragraphs }] : [];
}

function cleanParagraphs(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const paragraphs: string[] = [];
  for (const item of value) {
    const line = cleanLine(item, 20_000);
    if (line) paragraphs.push(line);
    if (paragraphs.length >= 400) break;
  }
  return paragraphs;
}

function cleanLine(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

function privateSource(): string | null {
  const value = process.env["PRIVATE_CHAPTER_SOURCE"]?.trim();
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
  const data = await readLocalFileFrom(source, fileName);
  return data ? new TextDecoder().decode(data) : null;
}

async function readLocalFile(fileName: string): Promise<Uint8Array | null> {
  const source = privateSource();
  if (!source || source.startsWith("https:") || source.startsWith("http:")) return null;
  return readLocalFileFrom(source, fileName);
}

async function readLocalFileFrom(source: string, fileName: string): Promise<Uint8Array | null> {
  const filePath = resolveInside(source, fileName);
  if (!filePath) return null;
  // The directory is chosen at runtime and lives outside this repo, so it cannot be traced.
  const data = await readFile(/*turbopackIgnore: true*/ filePath);
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

async function readRemoteImage(
  src: string,
  hintedType: string | null,
): Promise<{ data: Uint8Array; contentType: string } | null> {
  const url = isAllowedRemoteUrl(src);
  if (!url) return null;
  const response = await fetch(url, {
    cache: "no-store",
    redirect: "follow",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok || !isAllowedRemoteUrl(response.url)) return null;
  const headerType = response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ?? "";
  const contentType = hintedType ?? (headerType.startsWith("image/") && headerType !== "image/svg+xml" ? headerType : null);
  if (!contentType || !Object.values(IMAGE_TYPES).includes(contentType)) return null;
  const data = await readLimited(response, MAX_IMAGE_BYTES);
  if (!data || data.byteLength === 0) return null;
  return { data, contentType };
}

async function readLimited(response: Response, max: number): Promise<Uint8Array | null> {
  const reader = response.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > max) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const data = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    data.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return data;
}

function imageExtension(src: string): keyof typeof IMAGE_TYPES | null {
  const clean = src.split("?")[0]?.split("#")[0] ?? "";
  const match = clean.match(/\.([a-z0-9]+)$/i);
  if (!match) return null;
  const extension = match[1].toLowerCase();
  return extension in IMAGE_TYPES ? (extension as keyof typeof IMAGE_TYPES) : null;
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
