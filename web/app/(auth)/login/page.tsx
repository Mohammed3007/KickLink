import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import { GoogleButton } from "@/components/auth/google-button";
import { AuthFooter, AuthHeading, GoldLink, OrDivider } from "@/components/auth/auth-ui";
import { isGoogleEnabled } from "@/lib/flags";

export const metadata: Metadata = { title: "Log in" };

function safeReturnPath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/home";
  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const returnTo = safeReturnPath(params.from);
  const google = isGoogleEnabled();
  return (
    <>
      <AuthHeading title="Welcome back" subtitle="Log in to see your games, clubs and payments." delay={0.05} />

      {google && (
        <>
          <GoogleButton label="Continue with Google" delay={0.18} />
          <OrDivider delay={0.24} />
        </>
      )}
      <LoginForm returnTo={returnTo} delay={google ? 0.3 : 0.18} />

      <AuthFooter delay={0.42}>
        New to KickLink? <GoldLink href="/signup">Create an account</GoldLink>
      </AuthFooter>
    </>
  );
}
