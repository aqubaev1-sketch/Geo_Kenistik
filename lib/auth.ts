import PasswordResetEmail from "@/components/emails/reset-email";
import VerificationEmail from "@/components/emails/verification-email";
import { db } from "@/db/drizzle";
import { schema } from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import type { ReactElement } from "react";

const smtpPort = Number(process.env.SMTP_PORT || "465");
const smtpTransport = nodemailer.createTransport({
  pool: true,
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS?.replace(/\s/g, ""),
  },
  maxConnections: 2,
  maxMessages: 50,
});

async function sendEmailOrThrow({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: ReactElement;
}) {
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPassword = process.env.SMTP_PASS?.replace(/\s/g, "");
  // Gmail SMTP only accepts the authenticated mailbox as the envelope sender.
  // Keeping this tied to SMTP_USER prevents 501 "sender address must match".
  const senderAddress = smtpUser;
  const senderName = process.env.EMAIL_SENDER_NAME?.trim() || "GeoKenistik";

  if (!smtpUser || !smtpPassword || !senderAddress) {
    throw new Error("SMTP configuration is incomplete");
  }

  const [html, text] = await Promise.all([
    render(react),
    render(react, { plainText: true }),
  ]);

  await smtpTransport.sendMail({
    from: { name: senderName, address: senderAddress },
    to,
    subject,
    html,
    text,
  });
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_BASE_URL,
    "http://localhost:3001",
  ].filter((origin): origin is string => Boolean(origin)),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "student",
        input: false,
      },
      requestedRole: {
        type: "string",
        required: false,
        defaultValue: "student",
        input: false,
      },
      teacherStatus: {
        type: "string",
        required: false,
        defaultValue: "not_requested",
        input: false,
      },
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmailOrThrow({
        to: user.email,
        subject: "GeoKenistik: email мекенжайын растау",
        react: VerificationEmail({ userName: user.name, verificationUrl: url }),
      });
    },
    sendOnSignUp: true,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmailOrThrow({
        to: user.email,
        subject: "GeoKenistik: құпиясөзді қалпына келтіру",
        react: PasswordResetEmail({
          userName: user.name,
          resetUrl: url,
          requestTime: new Date().toLocaleString(),
        }),
      });
    },
  },
  // Every protected request checks the database so role changes and blocks
  // performed by an admin take effect immediately.
  session: { cookieCache: { enabled: false } },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  plugins: [
    admin({
      defaultRole: "student",
      adminRoles: ["admin"],
      bannedUserMessage: "Бұл аккаунт бұғатталған. Админге хабарласыңыз.",
    }),
    nextCookies(),
  ],
});
