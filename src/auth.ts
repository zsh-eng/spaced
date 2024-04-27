import db from "@/db";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import { Provider } from "next-auth/providers";
import GitHub from "next-auth/providers/github";

const providers: Provider[] = [GitHub];

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers,
});
