# Demonic Cortex

A reading site for **Demonic Cortex**, a graphic novel in progress by Jim. The look is dark, romantic, and apocalyptic, framed like comic panels: thick ink lines, crimson and black, and room for bold, cel-shaded art later.

Chapter text and story art are **not** in this repository. This repo is public. Chapter 1 on the site is a placeholder until you connect a private source. Chapters 2–7 show a locked state. Chapters 8–13 say they are still to come.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test
npm run lint
npm run build
```

## Deploy

The app is a Next.js project and can go on Vercel’s free Hobby plan.

1. Import this repository in Vercel.
2. Leave the framework as Next.js. The build command is `npm run build`.
3. Do not add a production domain until you mean to launch.
4. Optional environment variables are listed in `.env.example`. You do not need any of them for the placeholder site.

Payments are not live. Do not set a live Stripe key.

## Reading tools

Open **Reading settings** from the header, or the larger button at the top of a chapter.

- **Text size** has five steps. The default is the middle step, which is already large.
- **Line spacing** has compact, comfortable, and open.
- Choices are saved in this browser. The controls stay closed until you open them.

On an illustrated page, **Zoom out**, **Zoom in**, and **Reset zoom** scale the picture inside its frame (100%, 150%, 200%, 300%). The frame scrolls on its own, so the rest of the page does not slide sideways. Each picture needs alt text.

Reading position is remembered per chapter in this browser. The soundtrack does not start by itself.

Decorative embers turn off when the visitor has asked for reduced motion. Text sits on solid panels, not on the sky art.

## Add soundtrack tracks

Jim’s music is not included. Edit `content/soundtrack.json`:

```json
{
  "tracks": [
    { "id": "opening", "title": "Opening", "src": "/audio/opening.mp3" }
  ]
}
```

Put the audio file in `public/audio/`. `src` may be a file under `/audio/` (`.mp3`, `.m4a`, `.ogg`, `.wav`) or an `https://` URL. Other values are ignored. The player shows **Soundtrack coming soon** while the list is empty. There is no silent stand-in file.

Play and volume are in the bar at the bottom of every page. Playback keeps going when the reader moves between chapters. Nothing plays until they press Play.

## Add trailers

Edit `content/trailers.json`:

```json
{
  "videos": [
    { "title": "Teaser", "youtubeId": "xxxxxxxxxxx" }
  ]
}
```

`youtubeId` is the 11-character YouTube id. The embed uses `youtube-nocookie.com` and does not autoplay. An empty list shows two panels that say **Trailer coming soon**.

## Private chapters and illustrated pages

Set `PRIVATE_CHAPTER_SOURCE` to either:

- an absolute directory **outside this repository**, or
- an `https://` base URL (or `http://localhost` / `http://127.0.0.1` for local development)

The app looks for `chapter-01.json` through `chapter-13.json` at request time. You do not change the reader code when you add or replace those files.

Do **not** commit chapter JSON, manuscript notes, or story art to this repo. `.gitignore` ignores `/private-chapters/` and `/manuscript/` if someone creates them here anyway. Prefer a folder that is not inside the project.

### Text and panels

A chapter file can be pages, or a simple list of paragraphs.

```json
{
  "title": "Chapter 1",
  "pages": [
    {
      "type": "text",
      "paragraphs": ["First paragraph.", "Second paragraph."]
    },
    {
      "type": "panel",
      "src": "page-01.png",
      "alt": "Describe the panel for someone who cannot see it.",
      "caption": "Optional caption shown under the panel."
    }
  ]
}
```

Paragraphs only:

```json
{
  "paragraphs": ["First paragraph."]
}
```

`alt` is required for a panel. A panel without alt text is dropped. `src` is either:

- a file name in the **same** private folder as the JSON (`page-01.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.avif`), or
- an `https://` URL

The browser does not receive that private path or URL. Allowed chapters are served through `/api/panels/<chapter>/<page index>`. Locked and upcoming chapters are not fetched, even if the files exist.

Raster images only. SVG uploads are refused by the panel route. The crimson sky on the placeholder page is site art, not a story page.

### Who can read what

| Chapters | What visitors see |
| --- | --- |
| 1 | The private file if it is present, otherwise the placeholder |
| 2–7 | A subscribe gate. The file is not read. |
| 8–13 | Coming soon. The file is not read. |

There are no accounts yet, so `src/lib/access.ts` always reports that the visitor is not a subscriber. When subscriptions exist, replace `isSubscriber()` with a real session check. Leave the file loader as it is. Do not make `isSubscriber()` return true for every visitor, or locked pages would become public.

## Character art

The home page uses the approved cover at `public/art/cover.jpg`. That same file is the Open Graph and Twitter card image. Set `NEXT_PUBLIC_SITE_URL` to the public site address when you have one, so those share links are absolute. The favicon stays the small horn mark, because the cover does not read at icon size.

Portrait frames for Rayne, Heaven, Lou, and Duke are on the home page and on `/characters`. All four use the approved art in `public/art/`.

To add or replace a portrait, put a raster file under `public/art/` and set `image` in `src/lib/characters.ts` to a path like `"/art/name.webp"`. Only `/art/` files are shown. Set `alt` to the character’s name. Keep descriptions short and free of plot surprises.

## Subscriptions

The Subscribe page shows a **placeholder** price of $9 per month for a plan called Cortex Reader. The button does not charge a card. Cipher CTS is not taking payment until mid-December.

`ENABLE_STRIPE` defaults to off. If you set it to `true` and set `STRIPE_SECRET_KEY` to a test key (`sk_test_...`), the checkout route still returns an error and does not create a charge. A live key (`sk_live_...`) is refused. Do not commit keys. Put them in the host’s environment, not in git.

## Accessibility

Jim uses a screen magnifier. The site aims for WCAG AAA contrast on body text (cream `#f8f3ea` on near-black panels) and at least AA elsewhere. Default type is large. Focus is a gold outline. Pages use landmarks, headings, and visible control names. Layouts stack at narrow widths, including 280–390px, and reflow instead of scrolling sideways. Browser zoom is not restricted.
