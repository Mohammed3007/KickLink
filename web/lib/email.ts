import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM || "KickLink <onboarding@resend.dev>";
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
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
  await resend.emails.send({ from: FROM, to, subject, html, text });
}

function shell(title: string, body: string, cta: { href: string; label: string }) {
  return `<!doctype html><html><body style="margin:0;background:#f7f6fb;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
  <div style="max-width:480px;margin:0 auto;padding:32px 20px">
    <div style="font-size:22px;font-weight:800;color:#15131c;margin-bottom:24px">Kick<span style="color:#6e3bd8">Link</span></div>
    <div style="background:#fff;border-radius:16px;padding:28px;border:1px solid #e9e7f0">
      <h1 style="font-size:20px;color:#15131c;margin:0 0 12px">${title}</h1>
      <p style="font-size:15px;line-height:1.6;color:#5c5a66;margin:0 0 24px">${body}</p>
      <a href="${cta.href}" style="display:inline-block;background:#6e3bd8;color:#fff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:12px">${cta.label}</a>
      <p style="font-size:12px;color:#8e8c99;margin:24px 0 0">If the button doesn't work, copy this link:<br>${cta.href}</p>
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
