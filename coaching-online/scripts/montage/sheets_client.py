"""
Thin wrapper around the Google Sheets API for the "Consultations" tab —
used instead of the Apps Script webhook so the pipeline can run
server-to-server (GitHub Actions) without needing a browser to work around
Apps Script's POST-redirect quirks.

Auth: a service account JSON key, path given via GOOGLE_SERVICE_ACCOUNT_FILE
env var (GitHub Actions writes the secret to a file and sets this). The
sheet must be shared with the service account's email (found in the JSON's
"client_email" field) as an Editor.
"""

import os
from google.oauth2 import service_account
from googleapiclient.discovery import build

SHEET_ID = "13iOloB3jOApZ_r3DdQQlMOCB8zILwqsLevEzGmZ0Bkw"
TAB_NAME = "Consultations"
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

HEADERS = [
    "Submitted At", "Prénom", "Email", "WhatsApp", "Âge", "Taille (cm)",
    "Poids (kg)", "Activité travail", "Niveau sportif", "Fréquence / semaine",
    "Silhouette actuelle", "Silhouette cible", "Objectif", "Kg à perdre",
    "Vitesse de perte", "Sommeil (0-100)", "Stress (0-100)",
    "Métabolisme (0-100)", "Lien Résultats",
]
RESULT_COL_LETTER = "S"  # 19th column, matches HEADERS above


def _client():
    creds_path = os.environ["GOOGLE_SERVICE_ACCOUNT_FILE"]
    creds = service_account.Credentials.from_service_account_file(creds_path, scopes=SCOPES)
    return build("sheets", "v4", credentials=creds)


def read_rows() -> list[dict]:
    """Returns one dict per data row (1-indexed sheet row in "_row"), keyed by header name."""
    service = _client()
    result = service.spreadsheets().values().get(
        spreadsheetId=SHEET_ID, range=f"{TAB_NAME}!A2:S1000"
    ).execute()
    values = result.get("values", [])
    rows = []
    for i, row in enumerate(values):
        padded = row + [""] * (len(HEADERS) - len(row))
        d = dict(zip(HEADERS, padded))
        d["_row"] = i + 2  # sheet row number (1-indexed, header is row 1)
        rows.append(d)
    return rows


def write_result_link(row_number: int, url: str) -> None:
    service = _client()
    service.spreadsheets().values().update(
        spreadsheetId=SHEET_ID,
        range=f"{TAB_NAME}!{RESULT_COL_LETTER}{row_number}",
        valueInputOption="RAW",
        body={"values": [[url]]},
    ).execute()
