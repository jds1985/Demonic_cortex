import { visibleTrailers, type Trailer } from "@/lib/media";

export function TrailerSection({
  videos,
  level = "h2",
}: {
  videos: Trailer[] | unknown;
  level?: "h1" | "h2";
}) {
  const ready = visibleTrailers(videos);
  const Heading = level;

  return (
    <section className="block" aria-labelledby="trailers-heading">
      <Heading id="trailers-heading">Trailers</Heading>
      <p className="prose">YouTube trailers will appear in these panels.</p>
      <ul className="trailer-grid">
        {ready.length === 0
          ? [1, 2].map((slot) => (
              <li key={slot} className="panel trailer-slot">
                <p className="page-label">Trailer {slot}</p>
                <p className="caption-bar">Trailer coming soon</p>
              </li>
            ))
          : ready.map((video) => (
              <li key={video.youtubeId} className="panel">
                <div className="frame">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}`}
                    title={video.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </li>
            ))}
      </ul>
    </section>
  );
}
