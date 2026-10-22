import type { Metadata } from "next";
import { ForgotForm } from "./forgot-form";
import { AuthFooter, AuthHeading, GoldLink } from "@/components/auth/auth-ui";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPage() {
  return (
    <>
      <AuthHeading
        title="Reset your password"
        subtitle="Enter your email and we'll send you a reset link."
        delay={0.05}
      />
      <ForgotForm />
      <AuthFooter delay={0.3}>
        Remembered it? <GoldLink href="/login">Back to login</GoldLink>
      </AuthFooter>
    </>
  );
}
