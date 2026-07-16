import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: "ADMIN" | "USER";
    canReopenWorkOrder: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "USER";
      canReopenWorkOrder: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "USER";
    canReopenWorkOrder: boolean;
  }
}
