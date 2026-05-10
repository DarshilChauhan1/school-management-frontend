import { Suspense } from "react";
import { VerifyEmailScreen } from "@/modules/auth/components/verify-email-screen";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailScreen />
    </Suspense>
  );
}
