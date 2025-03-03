import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import prisma from "./lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ user }) {
      try {
        const { email, name } = user;

        // Ensure email exists
        if (!email) {
          throw new Error("Email not available from Google profile");
        }

        // Check if admin exists, otherwise create it
        await prisma.user.upsert({
          where: { email },
          update: {}, // No changes if the user exists
          create: {
            email,
            name: name || "Unknown", // Default name if not provided
          },
        });

        return true;
      } catch (error) {
        console.error("Error during sign-in:", error);
        return false;
      }
    },
  },
});
