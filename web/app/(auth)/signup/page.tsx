import type { Metadata } from "next";
import { SignupForm } from "./signup-form";
import { GoogleButton } from "@/components/auth/google-button";
import { AuthFooter, AuthHeading, AuthPill, GoldLink, OrDivider } from "@/components/auth/auth-ui";
import { isGoogleEnabled } from "@/lib/flags";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  const google = isGoogleEnabled();
  return (
    <>
      <AuthPill>Free forever · No card needed</AuthPill>
      <AuthHeading
        title="Create your account"
        subtitle="Join a club, find games, and never chase an e-transfer again."
      />

      {google && (
        <>
          <GoogleButton label="Sign up with Google" />
          <OrDivider />
        </>
      )}
      <SignupForm delay={google ? 0.38 : 0.26} />

      <AuthFooter>
        Already have an account? <GoldLink href="/login">Log in</GoldLink>
      </AuthFooter>
    </>
  );
}
