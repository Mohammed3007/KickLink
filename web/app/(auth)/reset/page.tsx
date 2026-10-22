import type { Metadata } from "next";
import { XCircle } from "lucide-react";
import { ResetForm } from "./reset-form";
import { AuthHeading, AuthStatusCard, GoldLink } from "@/components/auth/auth-ui";

export const metadata: Metadata = { title: "Set new password" };

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthStatusCard tone="bad" icon={<XCircle className="size-[26px]" />} title="Invalid link">
        This reset link is missing its token. <GoldLink href="/forgot">Request a new one</GoldLink>.
      </AuthStatusCard>
    );
  }

  return (
    <>
      <AuthHeading title="Set a new password" subtitle="Choose a strong password you'll remember." delay={0.05} />
      <ResetForm token={token} />
    </>
  );
}
