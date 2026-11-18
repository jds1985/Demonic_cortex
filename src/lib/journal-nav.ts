/** Moving back from the first sheet closes the book. A later page steps backward. */
export function nextJournalIndex(index: number, delta: number, total: number, step = 1): number | "close" {
  const stride = step > 1 ? step : 1;
  if (delta < 0 && index <= 0) return "close";
  const nextIndex = Math.max(0, Math.min(index + delta, Math.max(0, total - stride)));
  return stride > 1 ? nextIndex - (nextIndex % stride) : nextIndex;
}
