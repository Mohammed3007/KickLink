import { CheckCircle2, XCircle } from "lucide-react";
import { db } from "@/lib/db";
import { consumeEmailVerificationToken } from "@/lib/tokens";
import { AuthStatusCard, GoldButtonLink } from "@/components/auth/auth-ui";

export const metadata = { title: "Verify email" };

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  let ok = false;
  if (token) {
    const userId = await consumeEmailVerificationToken(token);
    if (userId) {
      await db.user.update({
        where: { id: userId },
        data: { emailVerified: new Date() },
      });
      ok = true;
    }
  }

  return (
    <AuthStatusCard
      tone={ok ? "gold" : "bad"}
      icon={ok ? <CheckCircle2 className="size-[26px]" /> : <XCircle className="size-[26px]" />}
      title={ok ? "Email verified" : "Link invalid or expired"}
    >
      <p className="mb-5">
        {ok
          ? "Your account is active. Log in to pick your club."
          : "This verification link is no longer valid. Try logging in to get a fresh one."}
      </p>
      <GoldButtonLink href="/login">Go to login</GoldButtonLink>
    </AuthStatusCard>
  );
}
