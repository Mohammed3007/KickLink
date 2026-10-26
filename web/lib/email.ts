import { Resend } from "resend";
import { publicAppUrl } from "@/lib/runtime";

const FROM = process.env.EMAIL_FROM || "KickLink <onboarding@resend.dev>";
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export function appUrl() {
  return publicAppUrl();
}

type Mail = { to: string; subject: string; html: string; text: string };

async function send({ to, subject, html, text }: Mail) {
  if (!resend) {
    // Dev fallback: no email provider configured — log so the flow still works.
    console.log(
      `\n📧 [dev email — set RESEND_API_KEY to send for real]\n  To: ${to}\n  Subject: ${subject}\n  ${text}\n`
    );
    return;
  }
  // Resend reports failures in the result rather than throwing.
  const { error } = await resend.emails.send({ from: FROM, to, subject, html, text });
  if (error) {
    console.error(JSON.stringify({ level: "error", msg: "email_send_failed", subject, error }));
    throw new Error(`Email send failed: ${error.message}`);
  }
}

function shell(title: string, body: string, cta: { href: string; label: string }) {
  return `<!doctype html><html><body style="margin:0;background:#08080a;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
  <div style="max-width:480px;margin:0 auto;padding:32px 20px">
    <div style="font-size:22px;font-weight:700;color:#f5f3ef;margin-bottom:24px">Kick<span style="color:#e7b95a">Link</span></div>
    <div style="background:#141418;border-radius:18px;padding:28px;border:1px solid rgba(231,185,90,0.2)">
      <h1 style="font-size:20px;color:#f7f5f0;margin:0 0 12px">${title}</h1>
      <p style="font-size:15px;line-height:1.6;color:#a29a8c;margin:0 0 24px">${body}</p>
      <a href="${cta.href}" style="display:inline-block;background:#e7b95a;background-image:linear-gradient(135deg,#f4d78b,#e7b95a 55%,#b8862e);color:#1a1304;text-decoration:none;font-weight:700;padding:13px 24px;border-radius:14px">${cta.label}</a>
      <p style="font-size:12px;color:#7e796e;margin:24px 0 0">If the button doesn't work, copy this link:<br><span style="color:#b6b0a4;word-break:break-all">${cta.href}</span></p>
    </div>
  </div></body></html>`;
}

export async function sendVerificationEmail(to: string, token: string) {
  const href = `${appUrl()}/verify?token=${token}`;
  await send({
    to,
    subject: "Verify your KickLink email",
    text: `Confirm your email: ${href}`,
    html: shell(
      "Confirm your email",
      "Welcome to KickLink! Tap below to verify your email and start joining games.",
      { href, label: "Verify email" }
    ),
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const href = `${appUrl()}/reset?token=${token}`;
  await send({
    to,
    subject: "Reset your KickLink password",
    text: `Reset your password: ${href}`,
    html: shell(
      "Reset your password",
      "We received a request to reset your password. This link expires in 1 hour. If you didn't ask for this, you can ignore this email.",
      { href, label: "Reset password" }
    ),
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendSpotOfferEmail(opts: {
  to: string;
  gameId: string;
  gameTitle: string;
  gameWhen: string;
  deadline: string;
}) {
  const href = `${appUrl()}/games/${opts.gameId}`;
  const intro = `You're next on the waitlist for ${opts.gameTitle} (${opts.gameWhen}).`;
  const deadline = `Claim it by ${opts.deadline}, or it goes to the next player.`;
  await send({
    to: opts.to,
    subject: `A spot opened up: ${opts.gameTitle}`,
    text: `${intro} ${deadline}\n\nClaim your spot: ${href}`,
    html: shell(
      "A spot opened up",
      `${escapeHtml(intro)} ${escapeHtml(deadline)}`,
      { href, label: "Claim your spot" }
    ),
  });
}
