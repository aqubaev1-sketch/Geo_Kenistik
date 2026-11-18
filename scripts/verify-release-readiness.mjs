import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const mode = process.argv[2];
const read = (file) => readFileSync(resolve(process.cwd(), file), "utf8");
const expect = (condition, message) => { if (!condition) throw new Error(message); };

if (mode === "mobile") {
  const css = read("app/globals.css");
  const intro = read("components/platform/PageIntro.tsx");
  const header = read("components/header/Header.tsx");
  expect(!read("app/layout.tsx").includes("user-scalable=no"), "zoom must not be disabled");
  expect(intro.includes("text-[clamp(") && intro.includes("break-words"), "page headings must scale and wrap");
  expect(header.includes("text-[clamp(") && header.includes("truncate"), "header must survive narrow screens and long names");
  expect(css.includes("prefers-reduced-motion") && css.includes("overflow-wrap: anywhere"), "global responsive safeguards missing");
  console.log("mobile readiness verification passed");
} else if (mode === "overflow") {
  const css = read("app/globals.css");
  expect(css.includes(".katex-display") && css.includes("overflow-x: auto"), "KaTeX overflow guard missing");
  for (const file of ["components/courses/LessonContentRenderer.tsx","components/courses/StudentAssignments.tsx","components/teacher/LessonBlockEditor.tsx","components/teacher/AssignmentBuilder.tsx"]) {
    expect(read(file).includes("overflow-x-auto"), `${file} must scroll long formulas locally`);
  }
  expect(css.includes("main pre") && css.includes("overflow-wrap: anywhere"), "long prose and code safeguards missing");
  console.log("overflow verification passed");
} else if (mode === "states") {
  for (const file of ["app/loading.tsx","app/error.tsx","app/global-error.tsx","app/not-found.tsx"]) expect(existsSync(resolve(process.cwd(), file)), `${file} missing`);
  expect(read("app/error.tsx").includes("reset") && read("app/error.tsx").includes('"use client"'), "route error must offer retry");
  expect(read("app/loading.tsx").includes("PageLoader"), "loading state must be meaningful");
  console.log("state page verification passed");
} else if (mode === "admin-security") {
  const page = read("app/admin/page.tsx");
  const actions = read("app/admin/actions.ts");
  const authz = read("lib/authorization.ts");
  const auth = read("lib/auth.ts");
  const config = read("next.config.ts");
  expect(page.includes("requireRole(['admin'])"), "admin page lacks server authorization");
  expect(actions.includes("assertAdmin()") && actions.includes("isUserRole") && actions.includes("db.delete(session)"), "admin mutations lack authorization, validation, or session revocation");
  expect(authz.includes("auth.api.getSession") && authz.includes("allowed.includes(role)"), "server role guard missing");
  expect(auth.includes("cookieCache: { enabled: false }"), "revoked admin-managed sessions may remain cached");
  for (const header of ["X-Content-Type-Options","X-Frame-Options","Referrer-Policy","Permissions-Policy"]) expect(config.includes(header), `${header} missing`);
  console.log("admin security verification passed");
} else {
  throw new Error("Expected mobile, overflow, states, or admin-security");
}
