import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./db/schema.ts",
    out: "./migrations-geokenistik",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
