#!/usr/bin/env python3
"""
Full VD Performance montage pipeline, meant to run unattended (GitHub
Actions cron). For every "Consultations" row that has a Prénom but no
"Lien Résultats" yet: build the montage, upload it to R2, compute nutrition
targets, and write the final /resultats link back into the sheet.

Requires GOOGLE_SERVICE_ACCOUNT_FILE (path to the service-account JSON) and
the R2_* vars (see .env / upload_r2.py) in the environment.
"""

import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlencode

from nutrition import compute_macros
from setsmart_client import send_result_link
from sheets_client import read_rows, write_result_link

HERE = Path(__file__).parent
VENV_PY = sys.executable
RESULTS_BASE = "https://vd-performance-bilan.netlify.app/resultats"


def slugify_email(email: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", email.strip().lower()).strip("-")


def process_row(row: dict) -> None:
    prenom = row["Prénom"]
    email = row["Email"]
    print(f"Processing {prenom!r} ({email})...")

    answers = {
        "age": row["Âge"],
        "workActivity": row["Activité travail"],
        "sportLevel": row["Niveau sportif"],
        "frequencyPerWeek": row["Fréquence / semaine"],
        "currentSilhouette": row["Silhouette actuelle"],
        "targetSilhouette": row["Silhouette cible"],
        "goal": row["Objectif"],
        "kgToLose": row["Kg à perdre"],
        "pace": row["Vitesse de perte"],
        "sleepQuality": float(row["Sommeil (0-100)"] or 0),
        "stressLevel": float(row["Stress (0-100)"] or 0),
        "metabolism": float(row["Métabolisme (0-100)"] or 0),
    }
    answers_path = HERE / f"answers-row{row['_row']}.json"
    answers_path.write_text(__import__("json").dumps(answers))

    out_path = HERE / f"output-row{row['_row']}.mp4"
    subprocess.run(
        [str(VENV_PY), "build_montage.py", "--answers", str(answers_path),
         "--out", str(out_path), "--cache-dir", str(HERE / "cache")],
        check=True, cwd=HERE,
    )

    slug = slugify_email(email) or f"row{row['_row']}"
    video_url = subprocess.run(
        [str(VENV_PY), "upload_r2.py", "--file", str(out_path), "--key", f"videos/{slug}.mp4"],
        check=True, cwd=HERE, capture_output=True, text=True,
    ).stdout.strip()

    macros = compute_macros({
        "age": row["Âge"],
        "weightKg": row["Poids (kg)"],
        "heightCm": row["Taille (cm)"],
        "frequencyPerWeek": row["Fréquence / semaine"],
        "workActivity": row["Activité travail"],
        "goal": row["Objectif"],
        "pace": row["Vitesse de perte"],
    })

    phone = row["WhatsApp"]
    if phone.startswith("00"):
        phone = phone
    params = {
        "prenom": prenom,
        "age": row["Âge"],
        "silhouette": row["Silhouette actuelle"],
        "goalSilhouette": row["Silhouette cible"],
        "niveau": row["Niveau sportif"],
        "activity": row["Activité travail"],
        "seances": row["Fréquence / semaine"],
        "taille": row["Taille (cm)"],
        "poids": row["Poids (kg)"],
        "objectif": row["Objectif"],
        "goalKg": row["Kg à perdre"],
        "approche": row["Vitesse de perte"],
        "videoUrl": video_url,
        "sommeil": row["Sommeil (0-100)"],
        "stress": row["Stress (0-100)"],
        "metabolisme": row["Métabolisme (0-100)"],
        "calories": macros["calories"],
        "maintenance": macros["maintenance"],
        "proteines": macros["proteines"],
        "glucides": macros["glucides"],
        "lipides": macros["lipides"],
        "phone": phone,
        "email": email,
    }
    final_url = f"{RESULTS_BASE}?{urlencode(params)}"

    write_result_link(row["_row"], final_url)
    print(f"  -> wrote result link for row {row['_row']}: {final_url}")

    try:
        send_result_link(phone, prenom, final_url, row["Activité travail"])
    except Exception as e:
        print(f"  WhatsApp send failed (non-fatal, link is still saved in the Sheet): {e}", file=sys.stderr)

    answers_path.unlink(missing_ok=True)
    out_path.unlink(missing_ok=True)


def main() -> int:
    rows = read_rows()
    todo = [r for r in rows if r["Prénom"].strip() and not r["Lien Résultats"].strip()]

    if not todo:
        print("Nothing to process.")
        return 0

    failures = 0
    for row in todo:
        try:
            process_row(row)
        except Exception as e:
            failures += 1
            print(f"  FAILED on row {row['_row']} ({row.get('Prénom')}): {e}", file=sys.stderr)

    print(f"Done: {len(todo) - failures}/{len(todo)} succeeded.")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
