// Operator details shown on the privacy policy and terms. Set these per
// deployment; the startup config check warns while they are missing.
export const LEGAL = {
  operator: process.env.NEXT_PUBLIC_LEGAL_NAME?.trim() || "KickLink",
  contactEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "",
  jurisdiction: process.env.NEXT_PUBLIC_LEGAL_JURISDICTION?.trim() || "Ontario, Canada",
  effectiveDate: "2026-10-22",
};

export function contactLine() {
  return LEGAL.contactEmail
    ? `email ${LEGAL.contactEmail}`
    : "contact us through the email address listed on our website";
}
