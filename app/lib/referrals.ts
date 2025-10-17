export const REFERRAL_STORAGE_KEY = "uncap_pending_referral_code";

export function normalizeReferralCode(value: string) {
  return value.replace(/\s+/g, "").toUpperCase();
}

