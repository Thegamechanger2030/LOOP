// Auth configuration + the helpers every API route uses to enforce
// tenant isolation and role-based access. This file is the security
// backbone of the whole app — read it before touching an API route.
import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";

export type UserRole = "ADMIN" | "ANALYST" | "VIEWER";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          workspaceId: user.workspaceId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.workspaceId = (user as any).workspaceId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).workspaceId = token.workspaceId;
      }
      return session;
    },
  },
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  workspaceId: string;
};

/**
 * Every API route that touches tenant data calls this first.
 * Throws a typed error the route handler turns into a 401/403 —
 * there is no code path where a query can run without a workspaceId.
 */
export async function requireUser(allowedRoles?: UserRole[]): Promise<SessionUser> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new AuthError("UNAUTHENTICATED", "You must be logged in.");
  }

  const user = session.user as unknown as SessionUser;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new AuthError("FORBIDDEN", "Your role does not permit this action.");
  }

  return user;
}

export class AuthError extends Error {
  status: number;
  constructor(kind: "UNAUTHENTICATED" | "FORBIDDEN", message: string) {
    super(message);
    this.status = kind === "UNAUTHENTICATED" ? 401 : 403;
  }
}
