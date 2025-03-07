import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import prisma from "./lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [Google],
	callbacks: {
		async signIn({ user }) {
			try {
				const { email, name, id } = user;

				// Ensure email exists
				if (!email) {
					throw new Error("Email not available from Google profile");
				}

				// Check if user exists, otherwise create it
				await prisma.user.upsert({
					where: { email },
					update: {}, // No changes if the user exists
					create: {
						id,
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
		async jwt({ token, user }) {
			// This runs when user signs in
			if (user?.email) {
				// Find user ID from database
				const dbUser = await prisma.user.findUnique({
					where: { email: user.email },
				});

				if (dbUser) {
					// Store ID in the token
					token.id = dbUser.id;
				}
			}
			return token;
		},
		async session({ session, token }) {
			// Add the user ID from the token to the session
			return {
				...session,
				user: {
					...session.user,
					id: token.id as string,
				},
			};
		},
	},
});
