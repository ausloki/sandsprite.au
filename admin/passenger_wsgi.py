"""
Entry point for Phusion Passenger (cPanel "Setup Python App").

Passenger imports this module and looks for a WSGI-callable named
`application` — it does not run `app.run()` itself, so the
`if __name__ == "__main__"` block in app.py is only used for local testing.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from app import app as application  # noqa: E402
