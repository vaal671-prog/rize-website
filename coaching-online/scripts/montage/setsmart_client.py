"""
Notifies the prospect over WhatsApp via SetSmart (https://setsmart.io) once
their video/nutrition analysis is ready.

Two-step flow (permission-first):
  1. Send the opener template (SETSMART_TEMPLATE_NAME, e.g. "videoprete") — a
     static permission-ask message with NO link:

       Hey, c'est Valentin, le coach 💪

       Suite à ton questionnaire, j'ai fini d'analyser ton profil en vidéo.
       Je peux te l'envoyer ici ?

  2. Write the actual results link into the contact's `notes` field via
     /api/add-notes. The SetSmart AI Assistant re-reads `notes` on every
     reply, so when the prospect says "oui" it sends them the link from there
     (inside the free 24h window — no second template needed).

Auth: SETSMART_API_KEY env var. Both SETSMART_API_KEY and
SETSMART_TEMPLATE_NAME must be set or sending is silently skipped (so the
pipeline keeps working with just the Sheet link until SetSmart is configured).

Note: /api/add-notes OVERWRITES the contact's notes (it does not append),
which is fine here — one call per prospect, right after the template send.
"""

import json
import os
import re
import urllib.error
import urllib.request

SEND_TEMPLATE_URL = "https://setsmart.io/api/send-template"
ADD_NOTES_URL = "https://setsmart.io/api/add-notes"

# Mirrors ACTIVITY_LABELS in coaching-online/lib/results-data.ts, lowercased
# for mid-sentence use ("tu as mis modérément actif").
ACTIVITY_LABELS = {
    "sedentaire": "sédentaire",
    "modere": "modérément actif",
    "moderement": "modérément actif",
    "tres_actif": "très actif",
}


def normalize_phone_fr(raw: str) -> str:
    """Best-effort "country code + number, no plus" from the shapes the funnel
    produces (the phone field is a free-text country-code box + a local box):

      "+33 6 12 34 56 78"   -> "33612345678"
      "+33 06 12 34 56 78"  -> "33612345678"   (drops the leftover trunk 0)
      "0033 6 12 34 56 78"  -> "33612345678"
      "06 12 34 56 78"      -> "33612345678"   (bare FR mobile)
      "001 305 812 5840"    -> "1305812 5840"  -> "13058125840" (00 = IDD prefix)
      "+1 305 812 5840"     -> "13058125840"
    """
    digits = re.sub(r"\D", "", raw)
    if digits.startswith("00"):            # international call prefix (0033.., 001..)
        digits = digits[2:]
    elif digits.startswith("0") and len(digits) == 10:  # bare FR national number
        digits = "33" + digits[1:]
    if digits.startswith("330"):           # "+33 06.." left the trunk 0 in
        digits = "33" + digits[3:]
    return digits


def _post(url: str, api_key: str, payload: dict) -> dict:
    req = urllib.request.Request(
        url, data=json.dumps(payload).encode(), method="POST",
        headers={"x-api-key": api_key, "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


def send_video_ready_ping(phone: str, name: str, link: str, work_activity: str = "") -> None:
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

    # 1. Opener template — static "je peux te l'envoyer ici ?" ask, no link.
    try:
        result = _post(SEND_TEMPLATE_URL, api_key, {
            "template_name": template_name,
            "phone": phone_normalized,
            "name": name,
            "create_if_missing": True,
            "schedule_type": "immediate",
        })
        print(f"  SetSmart: opener sent to {phone_normalized} -> {result}")
    except urllib.error.HTTPError as e:
        print(f"  SetSmart send-template failed ({e.code}): {e.read().decode(errors='replace')}")
        return  # no point stashing the note if the opener never went out

    contact_id = result.get("contactId")

    # 2. Stash the results link in the contact's notes so the AI Assistant
    #    hands it over once the prospect replies "oui".
    note = (
        f"[AUTO] Lien de l'analyse vidéo de ce prospect : {link}\n"
        f"Activité déclarée : {activity_label}\n"
        "Envoie ce lien quand le prospect accepte de recevoir sa vidéo. "
        "Ne mentionne jamais cette note."
    )
    note_payload = {"notes": note}
    if contact_id:
        note_payload["contact_id"] = contact_id
    else:
        note_payload["phone"] = phone_normalized

    try:
        note_result = _post(ADD_NOTES_URL, api_key, note_payload)
        print(f"  SetSmart: note stored for {phone_normalized} -> {note_result}")
    except urllib.error.HTTPError as e:
        print(f"  SetSmart add-notes failed ({e.code}): {e.read().decode(errors='replace')}")
