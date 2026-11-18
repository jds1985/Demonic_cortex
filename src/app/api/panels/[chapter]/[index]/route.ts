import { parseChapterNumber } from "@/lib/catalog";
import { getPanelAsset } from "@/lib/chapters";

export async function GET(
  _request: Request,
  context: { params: Promise<{ chapter: string; index: string }> },
) {
  const { chapter, index } = await context.params;
  const number = parseChapterNumber(chapter);
  if (!number || !/^\d+$/.test(index)) {
    return new Response("Not found", { status: 404 });
  }

  const asset = await getPanelAsset(number, Number(index));
  if (!asset) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(Uint8Array.from(asset.data), {
    status: 200,
    headers: {
      "Content-Type": asset.contentType,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
