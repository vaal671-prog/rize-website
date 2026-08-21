"""
Sends the final result link to the prospect over WhatsApp via SetSmart
(https://setsmart.io) once their video/nutrition plan is ready.

Auth: SETSMART_API_KEY env var. Which WhatsApp template to send:
SETSMART_TEMPLATE_NAME env var — must be a template already created in the
SetSmart dashboard whose body is JUST a single {{1}} variable and nothing
else. SetSmart's API only exposes one variable per send, so the full
personalized message (link + a follow-up question referencing their
"Activité travail" answer) is composed here in Python and sent as that one
variable, rather than being split across multiple template variables.

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


def build_message(link: str, work_activity: str) -> str:
    message = f"Voilà comme convenu la vidéo de ton analyse 👇\n{link}"
    activity_label = ACTIVITY_LABELS.get(work_activity)
    if activity_label:
        message += f"\n\nD'ailleurs tu as mis {activity_label}, tu fais quoi comme job ?"
    return message


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

    message = build_message(link, work_activity)
    body = json.dumps({
        "template_name": template_name,
        "phone": phone_normalized,
        "name": name,
        "create_if_missing": True,
        "schedule_type": "immediate",
        "variable_1": message,
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
