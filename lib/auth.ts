import PasswordResetEmail from "@/components/emails/reset-email";
import VerificationEmail from "@/components/emails/verification-email";
import { db } from "@/db/drizzle";
import { schema } from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const emailFrom = process.env.EMAIL_FROM || 'GeoKenistik <noteforge@orcdev.com>';

async function sendEmailOrThrow(payload: Parameters<typeof resend.emails.send>[0]) {
    const { error } = await resend.emails.send(payload);
    if (error) throw new Error(`Email delivery failed: ${error.message}`);
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
                from: emailFrom,
                to: [user.email],
                subject: 'Verify your email address',
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
                from: emailFrom,
                to: [user.email],
                subject: 'Reset your password',
                react: PasswordResetEmail({ userName: user.name, resetUrl: url, requestTime: new Date().toLocaleString() }),
            });
        },
    },
    // Every protected request checks the database so role changes and blocks
    // performed by an admin take effect immediately.
    session: { cookieCache: { enabled: false } },
    database: drizzleAdapter(db, {
        provider: "pg",
        schema
    }),
    plugins: [
        admin({
            defaultRole: "student",
            adminRoles: ["admin"],
            bannedUserMessage: "Бұл аккаунт бұғатталған. Админге хабарласыңыз.",
        }),
        nextCookies(),
    ]
});
