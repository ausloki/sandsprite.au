"""
Local admin tool for adding photos to the Sandsprite site.

Not part of the public static site — run this locally (or on a private
port) whenever you want to add a Gallery, Litter or My Kelpies photo. It
writes the image file and a matching CSV row directly into the project
folder; you still need to `git add / commit / push` afterwards for the
change to go live (see README "Publishing uploads").

Usage:
    cd admin
    pip install -r requirements.txt
    ADMIN_USERNAME=youruser ADMIN_PASSWORD=yourpassword python3 app.py
    Then open http://localhost:5001/login
"""

import csv
import hmac
import os
import secrets
import time
from datetime import date
from pathlib import Path

from functools import wraps

from flask import Flask, abort, redirect, render_template, request, session, url_for
from werkzeug.utils import secure_filename

BASE_DIR = Path(__file__).resolve().parent
SITE_ROOT = BASE_DIR.parent

ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_CONTENT_LENGTH = 8 * 1024 * 1024  # 8 MB per upload

# Magic-byte signatures so a renamed non-image file can't slip through.
FILE_SIGNATURES = {
    b"\xff\xd8\xff": ".jpg",
    b"\x89PNG\r\n\x1a\n": ".png",
    b"RIFF": ".webp",  # followed by "WEBP" at offset 8, checked separately
}

SECTIONS = {
    "gallery": {
        "label": "Gallery",
        "csv": SITE_ROOT / "data" / "gallery.csv",
        "photo_dir": SITE_ROOT / "assets" / "gallery-photos",
        "fields": ["File", "Date", "Caption", "Alt", "Description"],
    },
    "litters": {
        "label": "Litters",
        "csv": SITE_ROOT / "data" / "litter-photos.csv",
        "photo_dir": SITE_ROOT / "assets" / "litters-photos",
        "fields": ["File", "Caption", "Alt", "Description"],
    },
    "kelpies": {
        "label": "Some of our dogs (My Kelpies)",
        "csv": SITE_ROOT / "data" / "kelpies.csv",
        "photo_dir": SITE_ROOT / "assets" / "kelpies-photos",
        "fields": ["File", "Name", "Title", "Description"],
    },
}

app = Flask(__name__)
app.secret_key = os.environ.get("ADMIN_SECRET_KEY", secrets.token_hex(32))
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

_login_attempts = {}  # ip -> (count, first_attempt_timestamp)
LOGIN_WINDOW_SECONDS = 300
LOGIN_MAX_ATTEMPTS = 8


@app.after_request
def add_robot_headers(response):
    response.headers["X-Robots-Tag"] = "noindex, nofollow, noarchive"
    return response


def _rate_limited(ip):
    count, first = _login_attempts.get(ip, (0, time.time()))
    if time.time() - first > LOGIN_WINDOW_SECONDS:
        return False
    return count >= LOGIN_MAX_ATTEMPTS


def _record_failed_login(ip):
    count, first = _login_attempts.get(ip, (0, time.time()))
    if time.time() - first > LOGIN_WINDOW_SECONDS:
        count, first = 0, time.time()
    _login_attempts[ip] = (count + 1, first)


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("logged_in"):
            return redirect(url_for("login"))
        return view(*args, **kwargs)
    return wrapped


@app.route("/login", methods=["GET", "POST"])
def login():
    if not ADMIN_USERNAME or not ADMIN_PASSWORD:
        return (
            "ADMIN_USERNAME / ADMIN_PASSWORD environment variables are not set. "
            "Set them before starting this tool — see admin/README.md.",
            500,
        )

    error = None
    if request.method == "POST":
        ip = request.remote_addr or "unknown"
        if _rate_limited(ip):
            error = "Too many attempts. Try again in a few minutes."
        else:
            username = request.form.get("username", "")
            password = request.form.get("password", "")
            user_ok = hmac.compare_digest(username, ADMIN_USERNAME)
            pass_ok = hmac.compare_digest(password, ADMIN_PASSWORD)
            if user_ok and pass_ok:
                session.clear()
                session["logged_in"] = True
                session["csrf_token"] = secrets.token_hex(16)
                return redirect(url_for("dashboard"))
            _record_failed_login(ip)
            error = "Incorrect username or password."

    return render_template("login.html", error=error)


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


@app.route("/")
@login_required
def dashboard():
    if "csrf_token" not in session:
        session["csrf_token"] = secrets.token_hex(16)
    return render_template("dashboard.html", sections=SECTIONS, csrf_token=session["csrf_token"])


def _check_csrf():
    token = request.form.get("csrf_token", "")
    if not token or not hmac.compare_digest(token, session.get("csrf_token", "")):
        abort(400, "Invalid or missing CSRF token — refresh the page and try again.")


def _validate_image(file_storage):
    filename = secure_filename(file_storage.filename or "")
    ext = Path(filename).suffix.lower()
    if not filename or ext not in ALLOWED_EXTENSIONS:
        abort(400, "Only .jpg, .jpeg, .png or .webp files are allowed.")

    header = file_storage.stream.read(12)
    file_storage.stream.seek(0)
    is_jpeg = header.startswith(b"\xff\xd8\xff")
    is_png = header.startswith(b"\x89PNG\r\n\x1a\n")
    is_webp = header.startswith(b"RIFF") and header[8:12] == b"WEBP"
    if not (is_jpeg or is_png or is_webp):
        abort(400, "That file doesn't look like a valid image.")

    return filename, ext


def _unique_path(photo_dir, filename):
    target = photo_dir / filename
    if not target.exists():
        return target
    stem, ext = Path(filename).stem, Path(filename).suffix
    n = 1
    while (photo_dir / f"{stem}-{n}{ext}").exists():
        n += 1
    return photo_dir / f"{stem}-{n}{ext}"


def _append_csv_row(csv_path, fields, row):
    is_new = not csv_path.exists()
    with csv_path.open("a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        if is_new:
            writer.writerow(fields)
        writer.writerow(row)


@app.route("/upload/<section>", methods=["POST"])
@login_required
def upload(section):
    _check_csrf()

    if section not in SECTIONS:
        abort(404)
    cfg = SECTIONS[section]

    file_storage = request.files.get("photo")
    if not file_storage or not file_storage.filename:
        abort(400, "No photo was selected.")

    filename, _ext = _validate_image(file_storage)
    cfg["photo_dir"].mkdir(parents=True, exist_ok=True)
    target_path = _unique_path(cfg["photo_dir"], filename)
    file_storage.save(target_path)

    if section == "gallery":
        row = [
            target_path.name,
            request.form.get("date") or date.today().isoformat(),
            request.form.get("caption", ""),
            request.form.get("alt", ""),
            request.form.get("description", ""),
        ]
    elif section == "litters":
        row = [
            target_path.name,
            request.form.get("caption", ""),
            request.form.get("alt", ""),
            request.form.get("description", ""),
        ]
    else:  # kelpies
        row = [
            target_path.name,
            request.form.get("name") or "TBC",
            request.form.get("title") or "TBC",
            request.form.get("description", ""),
        ]

    _append_csv_row(cfg["csv"], cfg["fields"], row)

    return redirect(url_for("dashboard", uploaded=section))


if __name__ == "__main__":
    if not ADMIN_USERNAME or not ADMIN_PASSWORD:
        print(
            "Set ADMIN_USERNAME and ADMIN_PASSWORD environment variables before "
            "starting this tool. See admin/README.md."
        )
    app.run(host="127.0.0.1", port=5001, debug=False)
