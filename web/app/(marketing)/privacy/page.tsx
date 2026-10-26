import { LegalPage, type LegalSection } from "@/components/marketing/legal-page";
import { contactLine, LEGAL } from "@/lib/legal";

export const metadata = { title: "Privacy policy" };

const sections: LegalSection[] = [
  {
    heading: "Who we are",
    body: [
      `KickLink is operated by ${LEGAL.operator}. This policy explains what personal information we collect when you use KickLink, why, and the choices you have. We handle personal information in line with Canada's Personal Information Protection and Electronic Documents Act (PIPEDA) and, for people in Quebec, the Act respecting the protection of personal information in the private sector (Law 25).`,
      `The person responsible for protecting personal information at KickLink is ${LEGAL.privacyOfficer}. To reach them, ${contactLine()}.`,
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
        "Anonymous usage statistics: the pages viewed and buttons tapped, the website that sent you (its domain only), your device type (phone, tablet or computer), and your country and province or state. To count visitors without identifying them, we combine your IP address and browser type with a random code that we replace every day and keep only the scrambled result. We never store the IP address itself, nothing is saved in your browser, and statistics are never linked to your account, so they can't be used to identify or follow you.",
        "Security records: to stop abuse such as repeated sign-in attempts, we briefly keep your IP address and, for sign-in and password reset, the email address entered. These records are deleted after 24 hours of inactivity.",
      ],
    ],
  },
  {
    heading: "How we use it",
    body: [
      [
        "To run your account and sign you in, including verification and password-reset emails, and to email you when a waitlist spot opens up for you.",
        "To let organizers manage their clubs: rosters, waitlists, attendance and payments.",
        "To process payments and refunds through Stripe.",
        "To protect the service, for example by rate limiting sign-in attempts.",
        "To understand, in aggregate, how KickLink is used so we can improve it.",
      ],
      "We only email you about your account and your games. We don't send marketing emails without your consent.",
      "We do not sell your personal information, use it for advertising, or build profiles of you.",
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
      "We use one cookie, which keeps you signed in. It is strictly necessary for the service to work. We don't use analytics, tracking or advertising cookies, and we don't store anything else in your browser.",
      "If your browser sends a Global Privacy Control or Do Not Track signal, we don't record usage statistics for your visits at all.",
    ],
  },
  {
    heading: "How long we keep it",
    body: [
      "We keep account and club data while your account is active. Payment and audit records are kept as long as needed for accounting and legal obligations. Anonymous usage statistics are deleted after 13 months, and security records after 24 hours of inactivity.",
    ],
  },
  {
    heading: "Your choices and rights",
    body: [
      `You can update your profile at any time from the Profile page. To request a copy of your data, a correction, or deletion of your account, ${contactLine()}. We will respond within 30 days. Some records, such as payments, may need to be retained after an account is deleted.`,
      "If you are not satisfied with our response, you can contact the Office of the Privacy Commissioner of Canada or, in Quebec, the Commission d'accès à l'information.",
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
