declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

import { GOOGLE_ADS_CONVERSION_LABEL, GOOGLE_ADS_ID } from "@/lib/constants";

/** Fires a Meta Pixel custom event, no-op if the pixel isn't loaded. */
export function trackMetaEvent(
  event: string,
  params?: Record<string, unknown>,
) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", event, params);
}

/** Fires a GA4 / Google Ads event, no-op if gtag isn't loaded. */
export function trackGoogleEvent(
  event: string,
  params?: Record<string, unknown>,
) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", event, params);
}

/** Fires the questionnaire-started event on both pixels, if configured. */
export function trackQuizStarted() {
  trackMetaEvent("InitiateCheckout", { content_name: "consultation_quiz" });
  trackGoogleEvent("quiz_start");
}

/** Fires the lead-generated conversion event on both pixels, if configured. */
export function trackLeadSubmitted() {
  trackMetaEvent("Lead", { content_name: "consultation_personnalisee" });
  trackGoogleEvent("generate_lead");
  if (GOOGLE_ADS_ID && GOOGLE_ADS_CONVERSION_LABEL) {
    trackGoogleEvent("conversion", {
      send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`,
    });
  }
}
