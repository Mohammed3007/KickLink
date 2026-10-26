// Operator details shown on the privacy policy and terms. Set these per
// deployment; the startup config check warns while they are missing.
export const LEGAL = {
  operator: process.env.NEXT_PUBLIC_LEGAL_NAME?.trim() || "KickLink",
  contactEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "",
  jurisdiction: process.env.NEXT_PUBLIC_LEGAL_JURISDICTION?.trim() || "Ontario, Canada",
  // Quebec's Law 25 requires publishing who is responsible for personal
  // information; a name or a title both work.
  privacyOfficer: process.env.NEXT_PUBLIC_PRIVACY_OFFICER?.trim() || "our Privacy Officer",
  effectiveDate: "2026-10-26",
};

export function contactLine() {
  return LEGAL.contactEmail
    ? `email ${LEGAL.contactEmail}`
    : "contact us through the email address listed on our website";
}
