"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export const signInUser = async (email: string, password: string) => {
    try {
        await auth.api.signInEmail({
            body: {
                email,
                password
            },
        });

        return { success: true, message: "Signed in successfully" };
    } catch (error) {
        const e = error as Error;
        return { success: false, message: e.message || "Failed to sign in" };
    }
};

export const signUpUser = async (email: string, password: string, name: string, requestedRole: "student" | "teacher") => {
    try {
        if (requestedRole !== "student" && requestedRole !== "teacher") {
            return { success: false, message: "Рөл қате таңдалған" };
        }
        const normalizedEmail = email.trim().toLowerCase();
        const result = await auth.api.signUpEmail({
            body: {
                email: normalizedEmail,
                password,
                name: name.trim(),
                callbackURL: "/login?verified=1",
            },
        });

        await db.update(user).set({
            requestedRole,
            teacherStatus: requestedRole === "teacher" ? "pending" : "not_requested",
        }).where(eq(user.id, result.user.id));

        return {
            success: true,
            message: requestedRole === "teacher"
                ? "Email-ды растағаннан кейін мұғалім өтінімі админге жіберіледі"
                : "Аккаунт құрылды. Email-ды растаңыз",
            email: normalizedEmail,
        };
    } catch (error) {
        const e = error as Error;
        return { success: false, message: e.message || "Failed to sign up" };
    }
};
