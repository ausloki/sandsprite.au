# Sandsprite Kennels website

Static, responsive website for Sandsprite Kennels (Australian Kelpies — Southern River, WA), for the domain **sandsprite.au**.

## Stack

Plain HTML/CSS/JS — no build step, no framework. This keeps the site fast, easy to host anywhere, and simple for a non-technical owner to hand-edit later if needed.

- `index.html`, `about.html`, `litters.html`, `stud.html`, `services.html`, `gallery.html`, `contact.html` — one file per page, sharing the same header/nav/footer markup.
- `css/style.css` — single shared stylesheet, mobile-first with breakpoints at 600px / 700px / 900px.
- `js/main.js` — small script for the mobile hamburger nav toggle only. All content is visible without JS.
- `js/litters.js` — fetches `data/litters.csv` and fills in the "Previous litters" table on `litters.html`. If the CSV can't be loaded (or JS is off), the static fallback row already in the HTML stays put.
- `data/litters.csv` — the "Previous litters" table, one row per litter. Columns: `Litter,Sire,Dam,Colours,Status`. Edit this file (in a text editor, Excel/Numbers, or Google Sheets exported as CSV) to add/update litters — no HTML editing needed. Wrap any field containing a comma in double quotes.
- `assets/` — vector recreations of the kennel's real sign (walking figure + dogs), based on the owner's photo of the sign and confirmed against a second photo of it found on the kennel's Facebook page:
  - `logo-mark.svg` — compact icon-only version, used as the favicon and nav brand mark (small sizes).
  - `logo-sign.svg` — full recreation (silhouette scene + "Sandsprite Kennels" wordmark, sign legs/posts omitted), used large on the homepage hero and in the footer. On the footer's dark background it's recoloured white via a CSS `filter` (`.footer-logo` in `style.css`), since the source art is a single dark colour.
  - `paw.svg`, `hero-dog.svg` — original placeholders, no longer used for branding; `paw.svg` is still used as the generic photo-placeholder icon for the one remaining unfilled "Some of our dogs" card.
- `assets/gallery/` — 7 real photos from the kennel's Facebook page (sourced via the connected Chrome extension, matched against a metadata file the owner supplied with post dates/captions), resized and compressed for web. Used on `gallery.html` (all 7, newest first), `litters.html` (the 3 June 2025 litter photos), and `about.html` (2 of the show photos in "Some of our dogs").

## Content sources

Copy was written fresh (not copy-pasted) based on facts gathered from the kennel's existing public listings:
- https://www.sandsprite-kelpies.com/
- https://www.dogzonline.com.au/breeds/member.asp?name=trinity (blocked by the host when fetched — not used directly)
- https://www.facebook.com/p/Sandsprite-Kennels-61556303832501/
- https://petsonline.com.au/breeder/sandsprite/

Placeholders you'll want to replace before launch:
- `info@sandsprite.au` contact address — confirm the real inbox once the domain's email is set up (the kennel's current real address, per Facebook, is `sandspritekelpies@bigpond.com`).
- Individual dog/litter/stud profiles (`about.html`, `litters.html`, `stud.html`) — structure is in place, most content marked "coming soon".
- One remaining photo card in "Some of our dogs" (`about.html`) still needs a photo + name/title.

## Known gaps (blocked, need your input)

- **"Some of our dogs"** (`about.html`): dogzonline.com.au blocks automated access (Cloudflare bot-check, confirmed via two different fetch methods), so I couldn't pull the actual dog names/titles from that page. The section structure is built and ready — send me the names/titles/blurbs (or a screenshot of that page) and I'll fill it in.

## Booking &amp; maps links added

- **Grooming/boarding/daycare** (`services.html`): each service now links to the real PetManager booking portal (`https://petmanager.app/portal?token=...`, taken from the live sandsprite-kelpies.com site), plus a prominent "Open booking portal" button.
- **Contact page**: added a "Get directions on Google Maps" link and an embedded Google Maps iframe (using the free no-API-key `output=embed` format, keyed off the street address). I couldn't verify the embed renders in this sandboxed preview environment (it has no external network access, so the map request was blocked there) — worth a quick check in a real browser after deploying. If it doesn't render, swapping in a proper Google Maps **Embed API** key is the standard fix.

## Deploying to sandsprite.au

This is a static site, so it can be deployed to any static host (Netlify, Cloudflare Pages, GitHub Pages, or plain shared hosting) by uploading the contents of this folder and pointing the sandsprite.au DNS at the host. No server-side runtime is required.

## Browser/device support

Built mobile-first with standard flexbox/grid and `prefers-color-scheme` dark mode support; no vendor-specific CSS or JS features are used, so it should work unmodified across current versions of Chrome, Safari, Firefox and Edge, at any screen size from small mobile up.
