import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { db } from "@/lib/db";
import { consumeEmailVerificationToken } from "@/lib/tokens";
import { Button } from "@/components/ui/button";

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
    <div className="text-center">
      <span
        className={
          "mx-auto flex size-14 items-center justify-center rounded-2xl " +
          (ok ? "bg-ok-bg text-ok" : "bg-bad-bg text-bad")
        }
      >
        {ok ? <CheckCircle2 className="size-7" /> : <XCircle className="size-7" />}
      </span>
      <h1 className="mt-5 text-2xl font-bold tracking-[-0.02em] text-ink">
        {ok ? "Email verified" : "Link invalid or expired"}
      </h1>
      <p className="mt-2 text-ink-2">
        {ok
          ? "Your account is active. You can log in now."
          : "This verification link is no longer valid. Try logging in to get a fresh one."}
      </p>
      <Link href="/login" className="mt-6 inline-block">
        <Button size="lg">Go to login</Button>
      </Link>
    </div>
  );
}
