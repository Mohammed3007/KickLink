import { LegalPage, type LegalSection } from "@/components/marketing/legal-page";
import { contactLine, LEGAL } from "@/lib/legal";
import { DEFAULT_REFUND_POLICY } from "@/lib/refund-policy";

export const metadata = { title: "Terms of service" };

const sections: LegalSection[] = [
  {
    heading: "The service",
    body: [
      `KickLink, operated by ${LEGAL.operator}, is a tool that helps organizers run private pickup sports clubs and helps players join their games. By creating an account or using KickLink you agree to these terms.`,
    ],
  },
  {
    heading: "Accounts",
    body: [
      "You must provide accurate information and keep your password secure. You are responsible for activity on your account. You must be at least 13 years old, and old enough to enter a binding contract where you live, or have a parent or guardian's permission.",
    ],
  },
  {
    heading: "Clubs and organizers",
    body: [
      "Clubs are run by independent organizers, not by KickLink. Organizers set game times, venues, prices and rules, and are responsible for running their games safely and for their own obligations, including any facility rules, insurance and taxes.",
      "Organizers must be approved before creating a club and must not use KickLink to collect money for games they do not intend to run.",
    ],
  },
  {
    heading: "Payments and refunds",
    body: [
      "Online payments are processed by Stripe and paid out to the organizer's connected Stripe account. KickLink may charge a platform fee, which is included in the price shown at checkout.",
      `Unless a game states otherwise: ${DEFAULT_REFUND_POLICY} If an organizer removes you from a game, or a payment arrives after a game has filled, your card payment is refunded in full. Refunds go back to the original payment method and usually appear within 5 to 10 business days.`,
      "Payments made to an organizer in person are between you and the organizer.",
    ],
  },
  {
    heading: "Acceptable use",
    body: [
      [
        "Don't harass other players or organizers, or post unlawful or offensive content.",
        "Don't try to access clubs, accounts or data you aren't authorized to see.",
        "Don't interfere with the service, for example by automated scraping or attempting to bypass rate limits.",
      ],
      "We may suspend or close accounts that break these terms.",
    ],
  },
  {
    heading: "Participation risk",
    body: [
      "Sports involve a risk of injury. You take part in games at your own risk. KickLink does not run games, inspect venues or supervise play.",
    ],
  },
  {
    heading: "Disclaimers and liability",
    body: [
      "KickLink is provided \"as is\". To the fullest extent permitted by law, we are not liable for indirect or consequential losses, or for the acts of organizers or other players. Our total liability for any claim is limited to the fees you paid to KickLink in the 12 months before the claim.",
    ],
  },
  {
    heading: "Changes and contact",
    body: [
      `We may update these terms; continued use after an update means you accept the new terms. These terms are governed by the laws of ${LEGAL.jurisdiction}. For questions, ${contactLine()}.`,
    ],
  },
];

export default function TermsPage() {
  return <LegalPage title="Terms of service" sections={sections} />;
}
