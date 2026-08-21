#!/usr/bin/env python3
"""
Standalone test for the SetSmart WhatsApp send — skips the full video
pipeline (~5-6 min) to check delivery quickly once the "resultatvideo"
template is approved.

Reads SETSMART_API_KEY / SETSMART_TEMPLATE_NAME from a local .env (same
loader convention as upload_r2.py) since this is meant to run locally, not
in CI. Usage: python3 test_setsmart.py <phone> [work_activity]
"""

import os
import sys
from pathlib import Path

ENV_PATH = Path(__file__).parent / ".env"
for line in ENV_PATH.read_text().splitlines():
    line = line.strip()
    if not line or line.startswith("#") or "=" not in line:
        continue
    key, value = line.split("=", 1)
    os.environ.setdefault(key.strip(), value.strip())

from setsmart_client import send_result_link

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 test_setsmart.py <phone> [work_activity]")
        sys.exit(1)
    phone = sys.argv[1]
    work_activity = sys.argv[2] if len(sys.argv) > 2 else "modere"
    send_result_link(phone, "Test", "https://vd-performance-bilan.netlify.app/resultats?prenom=Test", work_activity)
