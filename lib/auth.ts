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
            await resend.emails.send({
                from: 'NoteForge <noteforge@orcdev.com>',
                to: [user.email],
                subject: 'Verify your email address',
                react: VerificationEmail({ userName: user.name, verificationUrl: url }),
            });
        },
        sendOnSignUp: true,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
            await resend.emails.send({
                from: 'NoteForge <noteforge@orcdev.com>',
                to: [user.email],
                subject: 'Reset your password',
                react: PasswordResetEmail({ userName: user.name, resetUrl: url, requestTime: new Date().toLocaleString() }),
            });
        },
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // 5 минут: в это время getSession не ходит в БД
        },
    },
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
