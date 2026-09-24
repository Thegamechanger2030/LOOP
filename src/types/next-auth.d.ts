// Extends NextAuth's built-in types with the fields our app actually
// puts on the session (see lib/auth.ts callbacks). Without this,
// session.user.role and session.user.workspaceId aren't recognised by
// TypeScript and every usage needs an `as any` cast.
import { Role } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      workspaceId: string;
    };
  }

  interface User {
    role: Role;
    workspaceId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    workspaceId: string;
  }
}
