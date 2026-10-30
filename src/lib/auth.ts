import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Staff Login",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@terraahotels.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Default concierge staff credentials
        if (
          credentials.email === "admin@terraahotels.com" &&
          (credentials.password === "terraa2026admin" || credentials.password === "admin123")
        ) {
          return {
            id: "admin_1",
            name: "Terraa Concierge Admin",
            email: credentials.email,
            role: "ADMIN",
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET || "terraa_super_secret_jwt_key_2026",
};
