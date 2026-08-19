/**
 * VD Performance — submission handler for both funnels
 *
 * Receives:
 * 1) Questionnaire answers from "Ta Consultation Personnalisée" (coaching-online
 *    home page) → logged to a "Consultations" tab.
 * 2) Qualification answers from "/candidature" (the pre-Calendly questions
 *    reached from the results page's "Réserver un appel" button) → logged to
 *    a "Candidatures" tab. Distinguished by a `type: "candidature"` field in
 *    the payload — anything else is treated as a consultation submission.
 * Both send a notification email so you know a new one came in.
 *
 * SETUP (standalone project — use this if "Extensions → Apps Script" from
 * inside the Sheet fails to open)
 * 1. Go to https://script.google.com → New project.
 * 2. Delete whatever is in Code.gs and paste this file's contents in its place.
 * 3. Open (or create) the target Google Sheet, copy its ID out of the URL:
 *    https://docs.google.com/spreadsheets/d/THIS_PART_IS_THE_ID/edit
 * 4. Paste that ID into SHEET_ID below.
 * 5. Update NOTIFICATION_EMAIL below if it should go somewhere other than
 *    vaal671@gmail.com.
 * 6. Deploy → New deployment → select type "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 7. Click Deploy, authorize the permissions Google asks for, then copy the
 *    Web app URL (ends in /exec).
 * 8. Set that URL as NEXT_PUBLIC_SUBMIT_ENDPOINT in
 *    coaching-online/.env.local, e.g.:
 *      NEXT_PUBLIC_SUBMIT_ENDPOINT=https://script.google.com/macros/s/XXXXXXXX/exec
 *
 * (If "Extensions → Apps Script" from the Sheet works fine for you, that's
 * the simpler route — same setup, just leave SHEET_ID as "" below and skip
 * straight to step 6.)
 *
 * Re-deploying after edits: every time you change this script, you must
 * create a "New deployment" (or edit the existing deployment's version to
 * "New version") for the changes to take effect on the live URL.
 *
 * Sanity check: visiting the deployment URL directly in a browser (a GET
 * request) should show "VD Performance consultation endpoint is running." —
 * if it doesn't, the deployment isn't public or isn't live yet.
 *
 * Switching to a different backend later (e.g. Setsmart, Make, Zapier):
 * this script only needs to keep responding to the same JSON payload shapes
 * already sent (see FunnelApp.tsx submitAnswers() and
 * CandidaturePageClient.tsx complete()). Point NEXT_PUBLIC_SUBMIT_ENDPOINT
 * at the new URL and nothing else has to change.
 */

// Leave empty ("") when this script is bound to the Sheet via
// Extensions → Apps Script. Set to the Sheet's ID when running as a
// standalone project (see SETUP step 3-4 above).
const SHEET_ID = "13iOloB3jOApZ_r3DdQQlMOCB8zILwqsLevEzGmZ0Bkw";

const NOTIFICATION_EMAIL = "vaal671@gmail.com";

const CONSULTATION_SHEET_NAME = "Consultations";
const CONSULTATION_HEADERS = [
  "Submitted At",
  "Prénom",
  "Email",
  "WhatsApp",
  "Âge",
  "Taille (cm)",
  "Poids (kg)",
  "Activité travail",
  "Niveau sportif",
  "Fréquence / semaine",
  "Silhouette actuelle",
  "Silhouette cible",
  "Objectif",
  "Kg à perdre",
  "Vitesse de perte",
  "Sommeil (0-100)",
  "Stress (0-100)",
  "Métabolisme (0-100)",
  "Lien Résultats",
];

const CANDIDATURE_SHEET_NAME = "Candidatures";
const CANDIDATURE_HEADERS = [
  "Submitted At",
  "Prénom",
  "Email",
  "Téléphone",
  "Situation professionnelle",
  "Durée de recherche",
  "Principal blocage",
  "Prêt à changer",
  "Déclencheur",
  "Engagement",
];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.type === "updateVideoLink") {
      setResultLink(data.submittedAt, data.email, data.resultUrl);
    } else if (data.type === "candidature") {
      appendToSheet(CANDIDATURE_SHEET_NAME, CANDIDATURE_HEADERS, [
        data.submittedAt ? new Date(data.submittedAt) : new Date(),
        data.prenom || "",
        data.email || "",
        formatPhoneForSheet(data.phone),
        data.profession || "",
        data.duree || "",
        data.blocage || "",
        data.changement || "",
        data.declencheur || "",
        data.engagement || "",
      ]);
      sendNotificationEmail(
        "Nouvelle candidature — " + (data.prenom || "Inconnu"),
        [
          "Nouvelle candidature avant réservation d'appel :",
          "",
          "Prénom : " + (data.prenom || "—"),
          "Email : " + (data.email || "—"),
          "Téléphone : " + (data.phone || "—"),
          "Situation professionnelle : " + (data.profession || "—"),
          "Durée de recherche : " + (data.duree || "—"),
          "Principal blocage : " + (data.blocage || "—"),
          "Prêt à changer : " + (data.changement || "—"),
          "Déclencheur : " + (data.declencheur || "—"),
          "Engagement : " + (data.engagement || "—"),
          "",
          "Soumis le : " + (data.submittedAt || new Date().toISOString()),
        ].join("\n"),
        data.email
      );
    } else {
      appendToSheet(CONSULTATION_SHEET_NAME, CONSULTATION_HEADERS, [
        data.submittedAt ? new Date(data.submittedAt) : new Date(),
        data.firstName || "",
        data.email || "",
        formatPhoneForSheet(data.whatsapp),
        data.age || "",
        data.heightCm || "",
        data.weightKg || "",
        data.workActivity || "",
        data.sportLevel || "",
        data.frequencyPerWeek || "",
        data.currentSilhouette || "",
        data.targetSilhouette || "",
        data.goal || "",
        data.kgToLose || "",
        data.pace || "",
        data.sleepQuality != null ? data.sleepQuality : "",
        data.stressLevel != null ? data.stressLevel : "",
        data.metabolism != null ? data.metabolism : "",
        "", // Lien Résultats — filled in later by the montage pipeline via "updateVideoLink"
      ]);
      sendNotificationEmail(
        "Nouvelle consultation — " + (data.firstName || "Inconnu"),
        [
          "Nouvelle réponse au questionnaire de consultation VD Performance :",
          "",
          "Prénom : " + (data.firstName || "—"),
          "Email : " + (data.email || "—"),
          "WhatsApp : " + (data.whatsapp || "—"),
          "",
          "Âge : " + (data.age || "—"),
          "Taille : " + (data.heightCm || "—") + " cm",
          "Poids : " + (data.weightKg || "—") + " kg",
          "Activité travail : " + (data.workActivity || "—"),
          "Niveau sportif : " + (data.sportLevel || "—"),
          "Fréquence souhaitée : " + (data.frequencyPerWeek || "—") + " séances / semaine",
          "Silhouette actuelle : " + (data.currentSilhouette || "—"),
          "Silhouette cible : " + (data.targetSilhouette || "—"),
          "Objectif : " + (data.goal || "—"),
          "Kg à perdre : " + (data.kgToLose || "—"),
          "Vitesse de perte : " + (data.pace || "—"),
          "Sommeil : " + (data.sleepQuality != null ? data.sleepQuality : "—") + " / 100",
          "Stress : " + (data.stressLevel != null ? data.stressLevel : "—") + " / 100",
          "Métabolisme perçu : " + (data.metabolism != null ? data.metabolism : "—") + " / 100",
          "",
          "Soumis le : " + (data.submittedAt || new Date().toISOString()),
        ].join("\n"),
        data.email
      );
    }
    return jsonResponse({ success: true });
  } catch (error) {
    return jsonResponse({ success: false, error: String(error) });
  }
}

function doGet() {
  return ContentService.createTextOutput(
    "VD Performance consultation endpoint is running. (build: no-plus-phone-v3)"
  );
}

// Google Sheets tries to parse any value starting with "+" as a formula,
// which breaks phone numbers like "+33 6 12 34 56 78" (shows #ERROR!).
// Swapping the leading "+" for "00" (standard international dialing prefix)
// sidesteps this entirely, regardless of cell formatting.
function formatPhoneForSheet(value) {
  if (!value) return "";
  return value.startsWith("+") ? "00" + value.slice(1) : value;
}

// Called by the montage pipeline once a prospect's video is built and
// uploaded — finds their row (by email, falling back to submission time if
// the email match is ambiguous) and fills in the "Lien Résultats" column.
function setResultLink(submittedAt, email, resultUrl) {
  const sheet = getOrCreateSheet(CONSULTATION_SHEET_NAME, CONSULTATION_HEADERS);
  const values = sheet.getDataRange().getValues();
  const headerRow = values[0];
  const emailCol = headerRow.indexOf("Email");
  const submittedCol = headerRow.indexOf("Submitted At");
  const resultCol = headerRow.indexOf("Lien Résultats");

  let targetRow = -1;
  if (email) {
    const needle = String(email).trim().toLowerCase();
    for (let i = values.length - 1; i >= 1; i--) {
      const rowEmail = String(values[i][emailCol] || "").trim().toLowerCase();
      if (rowEmail === needle && !values[i][resultCol]) {
        targetRow = i;
        break;
      }
    }
  }

  if (targetRow === -1 && submittedAt) {
    const target = new Date(submittedAt).getTime();
    for (let i = values.length - 1; i >= 1; i--) {
      const cell = values[i][submittedCol];
      const rowTime = cell instanceof Date ? cell.getTime() : NaN;
      if (Math.abs(rowTime - target) < 5000) {
        targetRow = i;
        break;
      }
    }
  }

  if (targetRow === -1) {
    throw new Error("setResultLink: no matching row for email=" + email + " submittedAt=" + submittedAt);
  }

  sheet.getRange(targetRow + 1, resultCol + 1).setValue(resultUrl);
}

function appendToSheet(sheetName, headers, row) {
  const sheet = getOrCreateSheet(sheetName, headers);
  sheet.appendRow(row);
}

function getOrCreateSheet(sheetName, headers) {
  const spreadsheet = SHEET_ID
    ? SpreadsheetApp.openById(SHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);
  } else if (sheet.getLastColumn() < headers.length) {
    // Sheet already existed from before this header was added (e.g. "Lien
    // Résultats") — backfill just the new header cell(s) instead of leaving
    // the row 1 label missing forever.
    const existingCount = sheet.getLastColumn();
    const missing = headers.slice(existingCount);
    sheet.getRange(1, existingCount + 1, 1, missing.length).setValues([missing]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }

  // Column D is "WhatsApp" / "Téléphone" in both sheets. Force it to plain
  // text so Sheets never tries to parse phone numbers like "+33 6 12 34 56 78"
  // as a formula (which produces #ERROR!). Re-applied on every call since it
  // must also cover sheets created before this fix existed.
  sheet.getRange("D:D").setNumberFormat("@");

  return sheet;
}

function sendNotificationEmail(subject, body, replyTo) {
  MailApp.sendEmail({
    to: NOTIFICATION_EMAIL,
    replyTo: replyTo || NOTIFICATION_EMAIL,
    subject: subject,
    body: body,
  });
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
