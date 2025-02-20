import { betterAuth } from "better-auth";
import client from "./mongo";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const db = client.db()

export const auth = betterAuth({
    database: mongodbAdapter(db),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }
    }
})