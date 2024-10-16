// types/next-auth.d.ts

import { Role } from "@repo/db/models/user";
declare module "next-auth" {
  interface User {
    name: string | null;
    email: string | null;
    image: string | null;
    _id: string | null;
    role: Role | null;
  }
  interface Session {
    user: {
      name: string | null;
      email: string | null;
      image: string | null;
      _id: string | null;
      role: Role | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    name: string | null;
    email: string | null;
    image: string | null;
    _id: string | null;
    role: Role | null;
  }
}

export declare module "next-auth" {}
