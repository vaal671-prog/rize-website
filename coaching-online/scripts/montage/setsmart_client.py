"""
Sends the final result link to the prospect over WhatsApp via SetSmart
(https://setsmart.io) once their video/nutrition plan is ready.

Auth: SETSMART_API_KEY env var. Which WhatsApp template to send:
SETSMART_TEMPLATE_NAME env var — must be a template already created in the
SetSmart dashboard with this exact body (two variables, matching the
send_result_link call below):

  Voilà comme convenu la vidéo de ton analyse 👇
  {{1}}
  D'ailleurs tu as mis {{2}}, tu fais quoi comme job ?

(WhatsApp template validation rejects a body that's mostly/only variables
relative to its static text, so the message can't be composed as one big
variable — the static wording has to live in the template itself, with
{{1}}/{{2}} only carrying the short dynamic bits: the link and the
work-activity label.)

If either env var is missing, sending is silently skipped (so the pipeline
keeps working with just the Sheet link until SetSmart is configured).
"""

import json
import os
import re
import urllib.error
import urllib.request

API_URL = "https://setsmart.io/api/send-template"

# Mirrors ACTIVITY_LABELS in coaching-online/lib/results-data.ts, lowercased
# for mid-sentence use ("tu as mis modérément actif").
ACTIVITY_LABELS = {
    "sedentaire": "sédentaire",
    "modere": "modérément actif",
    "moderement": "modérément actif",
    "tres_actif": "très actif",
}


def normalize_phone_fr(raw: str) -> str:
    """"0033 6 12 34 56 78" / "06 12 34 56 78" / "+33612345678" -> "33612345678"."""
    digits = re.sub(r"\D", "", raw)
    if digits.startswith("0033"):
        digits = digits[2:]
    elif digits.startswith("0") and len(digits) == 10:
        digits = "33" + digits[1:]
    return digits


def send_result_link(phone: str, name: str, link: str, work_activity: str = "") -> None:
    api_key = os.environ.get("SETSMART_API_KEY")
    template_name = os.environ.get("SETSMART_TEMPLATE_NAME")
    if not api_key or not template_name:
        print("  SetSmart not configured (missing SETSMART_API_KEY/SETSMART_TEMPLATE_NAME) — skipping WhatsApp send.")
        return

    phone_normalized = normalize_phone_fr(phone)
    if not phone_normalized:
        print(f"  SetSmart: no usable phone number in {phone!r} — skipping WhatsApp send.")
        return

    activity_label = ACTIVITY_LABELS.get(work_activity, work_activity or "actif")

    body = json.dumps({
        "template_name": template_name,
        "phone": phone_normalized,
        "name": name,
        "create_if_missing": True,
        "schedule_type": "immediate",
        "variable_1": link,
        "variable_2": activity_label,
    }).encode()

    req = urllib.request.Request(
        API_URL, data=body, method="POST",
        headers={"x-api-key": api_key, "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read())
        print(f"  SetSmart: sent to {phone_normalized} -> {result}")
    except urllib.error.HTTPError as e:
        print(f"  SetSmart send failed ({e.code}): {e.read().decode(errors='replace')}")
