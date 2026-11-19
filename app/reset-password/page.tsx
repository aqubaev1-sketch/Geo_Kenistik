import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { Suspense } from "react";

export default async function Page() {
  return (
    <div className="auth-screen flex min-h-svh w-full items-center justify-center p-6 pt-28 md:p-10 md:pt-32">
      <div className="auth-panel w-full max-w-xl">
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
