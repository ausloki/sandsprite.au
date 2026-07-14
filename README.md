# Sandsprite Kennels website

Static, responsive website for Sandsprite Kennels (Australian Kelpies — Southern River, WA), for the domain **sandsprite.au**.

## Stack

Plain HTML/CSS/JS — no build step, no framework. This keeps the site fast, easy to host anywhere, and simple for a non-technical owner to hand-edit later if needed.

- `index.html`, `about.html`, `litters.html`, `stud.html`, `services.html`, `gallery.html`, `contact.html` — one file per page, sharing the same header/nav/footer markup.
- `css/style.css` — single shared stylesheet, mobile-first with breakpoints at 600px / 700px / 900px.
- `js/main.js` — small script for the mobile hamburger nav toggle only. All content is visible without JS.
- `js/litters.js` — fetches `data/litters.csv` and fills in the "Previous litters" table on `litters.html`. If the CSV can't be loaded (or JS is off), the static fallback row already in the HTML stays put.
- `data/litters.csv` — the "Previous litters" table, one row per litter. Columns: `Litter,Sire,Dam,Colours,Status`. Edit this file (in a text editor, Excel/Numbers, or Google Sheets exported as CSV) to add/update litters — no HTML editing needed. Wrap any field containing a comma in double quotes.
- `js/gallery.js` — fetches `data/gallery.csv`, sorts photos by date (newest first), and rebuilds the `gallery.html` grid. Each thumbnail links to its own full-size image in a new browser tab. Falls back to the static photos already in the HTML if the CSV can't be loaded or JS is off.
- `data/gallery.csv` — the photo gallery, one row per photo. Columns: `File,Date,Caption,Alt,Description`. `File` is the filename in `assets/gallery-photos/`, `Date` (YYYY-MM-DD) controls sort order, `Caption` is the short label shown on the photo, `Alt` is the longer accessibility description, and `Description` is optional extra text shown as a second line under the caption (leave blank if not needed). Add a row (and drop the photo into `assets/gallery-photos/`) to add a new gallery photo — no HTML editing or manual reordering needed.
- `js/kelpies.js` — fetches `data/kelpies.csv` and rebuilds the "Some of our dogs" grid on `about.html`, superimposing the name/title and description on each photo. Falls back to the static cards already in the HTML if the CSV can't be loaded or JS is off.
- `data/kelpies.csv` — titleholders and awards, one row per dog. Columns: `File,Name,Title,Description`. `File` is the filename in `assets/kelpies-photos/` (leave blank to show the generic paw-icon placeholder instead of a photo), `Name` and `Title` appear bold on the photo (e.g. `Sandsprite Blaze` / `Australian Grand Champion`), `Description` is the explanatory text shown beneath them, overlaid on the image. Add a row (and drop the photo into `assets/kelpies-photos/`) to add a new titleholder — no HTML editing needed.
- `js/litter-photos.js` — fetches `data/litter-photos.csv` and rebuilds the "June 2025 litter" photo grid on `litters.html`. Falls back to the static photos already in the HTML if the CSV can't be loaded or JS is off. (This is separate from `js/litters.js`, which drives the "Previous litters" table above it.)
- `data/litter-photos.csv` — the litter photo grid, one row per photo. Columns: `File,Caption,Alt,Description`. `File` is the filename in `assets/litters-photos/`; `Caption` and `Description` are both optional — leave them blank for a plain photo with no overlay text (like the current 3 rows), or fill them in to add an overlay caption/explanation the same way the Gallery and My Kelpies photos do.
- `assets/` — vector recreations of the kennel's real sign (walking figure + dogs), based on the owner's photo of the sign and confirmed against a second photo of it found on the kennel's Facebook page:
  - `logo-mark.svg` — compact icon-only version, used as the favicon and nav brand mark (small sizes).
  - `logo-sign.svg` — full recreation (silhouette scene + "Sandsprite Kennels" wordmark, sign legs/posts omitted), used large on the homepage hero and in the footer. On the footer's dark background it's recoloured white via a CSS `filter` (`.footer-logo` in `style.css`), since the source art is a single dark colour.
  - `paw.svg`, `hero-dog.svg` — original placeholders, no longer used for branding; `paw.svg` is still used as the generic photo-placeholder icon for the one remaining unfilled "Some of our dogs" card.
- `assets/gallery-photos/` — the same 7 real Facebook photos described below, in their own folder that only `gallery.html` reads from (via `data/gallery.csv`), so editing the gallery can't affect `litters.html` or `about.html`.
- `assets/kelpies-photos/` — photos for the "Some of our dogs" titleholders grid on `about.html`, in their own folder read from `data/kelpies.csv`, separate from the Gallery/Litters photo folders.
- `assets/litters-photos/` — photos for the litter announcement grid on `litters.html`, in their own folder read from `data/litter-photos.csv`, separate from the Gallery/My Kelpies photo folders.
- `assets/facilities/` — real photos of the property (currently the kitchenette), linked from the "Our facilities" section on `services.html`; click a thumbnail to open the full-size original in a new tab.
- `assets/gallery/` — 7 real photos from the kennel's Facebook page (sourced via the connected Chrome extension, matched against a metadata file the owner supplied with post dates/captions), resized and compressed for web. Kept as the original source copies; the live pages now read from the dedicated `gallery-photos/`, `kelpies-photos/` and `litters-photos/` folders instead.

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

## Admin tool (adding photos without hand-editing CSVs)

`admin/` is a small password-protected tool — drag a photo onto it and it
saves the file and appends the matching CSV row for you (Gallery, Litters or
My Kelpies). It's a separate Python (Flask) app from the static site pages;
see `admin/README.md` for local setup and for deploying it on cPanel via
Phusion Passenger (`admin/passenger_wsgi.py` is the entry point cPanel's
"Setup Python App" needs). Uploading doesn't auto-publish — you still
commit/push the result yourself; wiring up auto-publish is a TODO.

## Deploying to sandsprite.au

Hosting is a **cPanel Economy / Business Hosting plan from TPP Wholesale**,
which supports Python apps via Phusion Passenger. The static pages
(`*.html`, `css/`, `js/`, `data/`, `assets/`) go in `public_html` as plain
files — no server-side runtime needed for those. The `admin/` tool is set up
separately as its own cPanel **Python App** (see `admin/README.md`), since it
needs Passenger to actually run its Python code.

## Browser/device support

Built mobile-first with standard flexbox/grid and `prefers-color-scheme` dark mode support; no vendor-specific CSS or JS features are used, so it should work unmodified across current versions of Chrome, Safari, Firefox and Edge, at any screen size from small mobile up.
