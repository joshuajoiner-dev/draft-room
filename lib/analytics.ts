export type AnalyticsEventName =
  | "create_room"
  | "join_room"
  | "generate_quick_random"
  | "generate_balanced_teams"
  | "generate_captain_draft"
  | "copy_invite_link"
  | "view_qr_code"
  | "print_teams"
  | "complete_feature_interest"
  | "founder_access_interaction";

export type AnalyticsEventParameterValue = string | number | boolean;

export type AnalyticsEventParameters = Record<string, AnalyticsEventParameterValue>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const ANALYTICS_DEDUPE_PREFIX = "jdp_ga4:";

export function readFiniteNumber(value: string | null, fallback: number): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return parsed;
}

export function trackEvent(
  eventName: AnalyticsEventName,
  parameters?: AnalyticsEventParameters
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const gtag = window.gtag;

    if (typeof gtag !== "function") {
      return;
    }

    gtag("event", eventName, parameters ?? {});
  } catch {
    // Analytics must never interrupt the user workflow.
  }
}

export function trackEventOnce(
  dedupeKey: string,
  eventName: AnalyticsEventName,
  parameters?: AnalyticsEventParameters
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const storageKey = `${ANALYTICS_DEDUPE_PREFIX}${dedupeKey}`;

    if (window.sessionStorage.getItem(storageKey)) {
      return;
    }

    window.sessionStorage.setItem(storageKey, "1");
  } catch {
    // Continue without persistence if sessionStorage is unavailable.
  }

  trackEvent(eventName, parameters);
}

export function normalizeRoomMode(mode: string | null | undefined): string {
  if (!mode) {
    return "unset";
  }

  return mode;
}
