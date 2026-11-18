import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { publicArtPath } from "./characters";
import { visibleTracks, visibleTrailers } from "./media";

describe("soundtrack and trailers", () => {
  it("accepts local audio files and https URLs only", () => {
    const tracks = visibleTracks([
      { id: "open", title: "Opening", src: "/audio/opening.mp3" },
      { title: "Remote", src: "https://cdn.example.com/theme.mp3" },
      { title: "Escape", src: "/audio/../secret.mp3" },
      { title: "Script", src: "javascript:alert(1)" },
      { title: "Insecure", src: "http://cdn.example.com/theme.mp3" },
      { title: " ", src: "/audio/nope.mp3" },
    ]);
    assert.deepEqual(
      tracks.map((track) => track.src),
      ["/audio/opening.mp3", "https://cdn.example.com/theme.mp3"],
    );
  });

  it("accepts only 11-character YouTube ids", () => {
    const videos = visibleTrailers([
      { title: "Teaser", youtubeId: "abcdefghijk" },
      { title: "Short", youtubeId: "short" },
      { title: "", youtubeId: "abcdefghijk" },
    ]);
    assert.deepEqual(videos, [{ title: "Teaser", youtubeId: "abcdefghijk" }]);
  });

  it("allows character art only from /art", () => {
    assert.equal(publicArtPath("/art/rayne.webp"), "/art/rayne.webp");
    assert.equal(publicArtPath("/placeholders/panel.svg"), null);
    assert.equal(publicArtPath("https://example.com/rayne.webp"), null);
    assert.equal(publicArtPath(null), null);
  });
});
