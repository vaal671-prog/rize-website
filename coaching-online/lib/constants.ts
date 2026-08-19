export const BRAND_NAME = "VD Performance";

// Set this in .env.local (NEXT_PUBLIC_SUBMIT_ENDPOINT) once the Google Apps
// Script Web App is deployed (see google-apps-script/Code.gs). Left empty
// during development so submission fails loudly instead of posting nowhere.
// If you later move to another CRM (e.g. Setsmart) or a Make/Zapier webhook,
// just point this at that URL instead — the payload shape in FunnelApp.tsx
// stays the same, only the receiving endpoint changes.
export const SUBMIT_ENDPOINT = process.env.NEXT_PUBLIC_SUBMIT_ENDPOINT ?? "";

// Optional ad-tracking pixels. Leave unset in .env.local to skip loading them.
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? "";
// Optional conversion label for a Google Ads "Lead" conversion action,
// e.g. "AbCdEfGhIjKlMnOp123". Only used if GOOGLE_ADS_ID is also set.
export const GOOGLE_ADS_CONVERSION_LABEL =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL ?? "";

export const WHATSAPP_DEFAULT_COUNTRY_CODE = "+33";

// Used at the end of the /candidature flow — Calendly supports ?name=&email=
// prefill natively, which buildBookingUrl() already appends.
export const CALENDLY_URL = "https://calendly.com/valito-trainer/starter-session-clone";

// Shown to candidates who answer "non" to the final engagement question —
// they're not redirected to Calendly, just invited to follow along instead.
export const INSTAGRAM_URL = "https://instagram.com/valito.trainer";
