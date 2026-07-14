# Sandsprite admin tool (local, not part of the public site)

A small password-protected local tool for adding photos to the Gallery, Litters
and My Kelpies sections without hand-editing CSV files. It is **not** part of
the static site — don't deploy this folder to whatever host you end up
choosing (see "Before you deploy the site" below).

## Setup (one-time)

```
cd admin
pip install -r requirements.txt
```

## Running it

Set a username and password as environment variables, then start the server:

```
ADMIN_USERNAME=youruser ADMIN_PASSWORD=yourpassword python3 app.py
```

Open http://localhost:5001/login in a browser, log in, then drag a photo
onto the relevant section (Gallery / Litters / My Kelpies), fill in the
caption/description fields, and click Upload.

Pick your own username/password — there is no default, and the tool refuses
to start without them. Don't commit them anywhere; set them fresh each time
you run it, or keep them in a local `admin/.env` file that you `source`
before running (that file is already git-ignored).

## What it does

- Saves the photo into the right folder (`assets/gallery-photos/`,
  `assets/litters-photos/` or `assets/kelpies-photos/`), renaming it if a
  file with that name already exists so nothing gets overwritten.
- Appends a matching row to the section's CSV file
  (`data/gallery.csv`, `data/litter-photos.csv` or `data/kelpies.csv`).
- Only accepts `.jpg`, `.jpeg`, `.png` or `.webp` files up to 8MB, and checks
  the file's actual contents (not just its name) look like a real image.

It only **adds** new rows — editing or removing an existing photo/row still
needs to be done by hand (or ask Cory/Claude to do it).

## Publishing uploads

This tool only writes files on the machine it runs on — it does **not**
commit or push to GitHub. After uploading, review the changes and commit/push
them the normal way (e.g. ask Claude Code to "commit and push").

**TODO, once we pick a real host for the live site:** wire this tool up to
auto-publish (e.g. commit + push automatically, or call the host's deploy
API) so uploads go live immediately instead of needing a manual push. Deferred
for now since hosting isn't decided yet.

## Deploying to cPanel (Phusion Passenger)

`admin/passenger_wsgi.py` is the entry point Passenger looks for — it imports
the Flask app from `app.py` as `application`. To set this up in cPanel:

1. cPanel → **Setup Python App** → create an app pointed at this `admin/`
   folder (as its own app, separate from the static site files in
   `public_html`).
2. Use cPanel's "Run Pip Install" (or the app's terminal) to install from
   `requirements.txt`.
3. In the app's **Environment variables**, set `ADMIN_USERNAME`,
   `ADMIN_PASSWORD`, and `ADMIN_SECRET_KEY` (a long random string). Setting
   `ADMIN_SECRET_KEY` explicitly matters here — without it, a random key is
   generated at process start, and Passenger periodically recycles app
   processes, which would silently log everyone out each time.
4. Restart the app from cPanel after any code or env var change.

The rest of the site (the plain HTML/CSS/JS files) stays a static deploy —
only this `admin/` folder needs the Python App setup.

## Before you deploy the site

If you ever move the admin tool to a host that *doesn't* support running a
Python app (e.g. plain static hosting, GitHub Pages), make sure that host's
deploy step **excludes the `admin/` folder** — it needs a real server to run,
and its source has no reason to be publicly downloadable there.
`robots.txt` and page-level `noindex` tags are in place as a backstop
regardless, but they only stop well-behaved crawlers, not someone who has
the URL — on a static host, excluding the folder from the deploy is the
real protection.

## Security notes

- Login is a single shared username/password checked on the server (not in
  JavaScript), with the session tracked via a signed, HTTP-only cookie.
- Failed logins are rate-limited (8 attempts per 5 minutes per IP).
- This is deliberately simple (one shared login, no per-user accounts) since
  it's a single-owner tool with no customer data behind it. If that changes,
  revisit with stronger auth.
