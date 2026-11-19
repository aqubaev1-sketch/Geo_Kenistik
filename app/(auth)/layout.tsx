
import AuthTabs from "@/components/auth/AuthTabs";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-screen flex min-h-svh w-full justify-center px-6 pb-16 pt-28 md:px-10 md:pt-36">
      <div className="auth-panel w-full max-w-xl">
        {/* Кнопки остаются на одном месте */}
        <AuthTabs />

        {/* Форма входа или регистрации */}
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
