import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

import { FirestoreAdapter } from "@auth/firebase-adapter"

import { db } from "./firebase"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  adapter: FirestoreAdapter(db),
})