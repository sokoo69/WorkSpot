import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db),
  trustedOrigins: ["https://work-spot-ten.vercel.app"],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }
  },
  plugins: [jwt()],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
      favorites: {
        type: "string[]",
        required: false,
        defaultValue: [],
      },
      phoneNumber: {
        type: "string",
        required: false,
      },
      isVerifiedOwner: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
    },
  },
});
