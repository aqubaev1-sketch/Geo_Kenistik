import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (file) => readFileSync(resolve(process.cwd(), file), "utf8");
const expect = (condition, message) => { if (!condition) throw new Error(message); };

const auth = read("lib/auth.ts");
const users = read("server/users.ts");
const signup = read("components/forms/signup-form.tsx");
const login = read("components/forms/login-form.tsx");
const forgot = read("components/forms/forgot-password-form.tsx");
const reset = read("components/forms/reset-password-form.tsx");
const password = read("components/profile/PasswordSettings.tsx");
const header = read("components/header/Header.tsx");
const admin = read("app/admin/actions.ts");
const guard = read("lib/authorization.ts");

expect(auth.includes("requireEmailVerification: true"), "email verification must be required");
expect(auth.includes("sendEmailOrThrow") && auth.includes("if (error) throw"), "Resend errors must fail visibly");
expect(users.includes('requestedRole !== "student"') && users.includes('requestedRole !== "teacher"'), "registration role must be validated server-side");
expect(users.includes('teacherStatus: requestedRole === "teacher" ? "pending"'), "teacher registration must create a pending request");
expect(signup.includes("sendVerificationEmail") && signup.includes("Email-ды растаңыз"), "registration must show verification and resend UI");
expect(login.includes("authClient.signIn.email") && login.includes("EMAIL_NOT_VERIFIED") && login.includes("window.location.assign"), "login must enforce verification and refresh session UI");
expect(forgot.includes("requestPasswordReset") && forgot.includes('redirectTo: "/reset-password"'), "password recovery request is incomplete");
expect(reset.includes("authClient.resetPassword") && reset.includes("Сілтеме жарамсыз"), "password reset must handle tokens");
expect(password.includes("authClient.changePassword") && password.includes("revokeOtherSessions: true"), "authenticated password change is incomplete");
expect(header.includes("authClient.signOut") && header.includes("window.location.assign('/')"), "logout must clear and refresh the header");
expect(header.includes("isAdmin") && header.includes("isTeacher") && header.includes("Админ-панель") && header.includes("Мұғалім"), "role-aware header links are incomplete");
expect(admin.includes("approveTeacher") && admin.includes("teacherStatus: 'approved'"), "teacher approval is incomplete");
expect(guard.includes("allowed.includes(role)") && guard.includes("redirect('/profile')"), "role guard is incomplete");

console.log("authentication verification passed");

if (process.argv.includes("--live")) {
  const { Resend } = await import("resend");
  const key = process.env.RESEND_API_KEY || "";
  expect(key.startsWith("re_") && key.length > 20, "RESEND_API_KEY is missing or looks like a placeholder");
  const result = await new Resend(key).domains.list();
  expect(!result.error, `Resend rejected the configured API key: ${result.error?.message || "unknown error"}`);
  console.log("live authentication services passed");
}
