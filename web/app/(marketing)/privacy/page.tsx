import { LegalPage, type LegalSection } from "@/components/marketing/legal-page";
import { contactLine, LEGAL } from "@/lib/legal";

export const metadata = { title: "Privacy policy" };

const sections: LegalSection[] = [
  {
    heading: "Who we are",
    body: [
      `KickLink is operated by ${LEGAL.operator}. This policy explains what personal information we collect when you use KickLink, why, and the choices you have. We handle personal information in line with Canada's Personal Information Protection and Electronic Documents Act (PIPEDA).`,
    ],
  },
  {
    heading: "What we collect",
    body: [
      [
        "Account details: your name, email address, a hashed password (never the password itself), city, skill level and avatar colour. If you sign in with Google, we receive your name, email and profile picture from Google.",
        "Club activity: the clubs you join, games you register for, waitlist and cancellation history, attendance marked by organizers, and announcements and notifications sent to you.",
        "Payments: the amount, status and Stripe reference for each payment. Card details are entered on Stripe's checkout page and never reach our servers.",
        "Organizer applications: the club name, city, experience and expected players you submit when applying to organize.",
        "Usage analytics: pages viewed and buttons used, a random visitor ID stored in your browser, your browser's user-agent, and a one-way hash of your IP address. We do not store your raw IP address for analytics.",
      ],
    ],
  },
  {
    heading: "How we use it",
    body: [
      [
        "To run your account and sign you in, including verification and password-reset emails.",
        "To let organizers manage their clubs: rosters, waitlists, attendance and payments.",
        "To process payments and refunds through Stripe.",
        "To protect the service, for example by rate limiting sign-in attempts.",
        "To understand how KickLink is used so we can improve it.",
      ],
      "We do not sell your personal information or use it for third-party advertising.",
    ],
  },
  {
    heading: "Who can see your information",
    body: [
      "Members of a club can see the names and avatars of other players registered for that club's games. Club organizers can also see your email, registration and payment status, and attendance for their club. KickLink administrators can access data when needed to operate and support the service.",
      "We share data with service providers who process it on our behalf: Stripe (payments), Resend (email delivery), Google (if you choose Google sign-in), and our hosting and database providers. These providers may store data outside Canada, including in the United States.",
    ],
  },
  {
    heading: "Cookies and local storage",
    body: [
      "We use a session cookie to keep you signed in, and store a random analytics visitor ID in your browser's local storage. We do not use third-party advertising cookies.",
    ],
  },
  {
    heading: "How long we keep it",
    body: [
      "We keep account and club data while your account is active. Payment and audit records are kept as long as needed for accounting and legal obligations. Analytics events are kept for up to 13 months.",
    ],
  },
  {
    heading: "Your choices and rights",
    body: [
      `You can update your profile at any time from the Profile page. To request a copy of your data, a correction, or deletion of your account, ${contactLine()}. We will respond within 30 days. Some records, such as payments, may need to be retained after an account is deleted.`,
      "If you are not satisfied with our response, you can contact the Office of the Privacy Commissioner of Canada.",
    ],
  },
  {
    heading: "Changes",
    body: [
      "If we make material changes to this policy we will update the effective date above and, where appropriate, notify you in the app.",
    ],
  },
];

export default function PrivacyPage() {
  return <LegalPage title="Privacy policy" sections={sections} />;
}
