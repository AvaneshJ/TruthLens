import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { findUserByCredentials } from "../../../lib/userStore"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = findUserByCredentials(credentials.email, credentials.password)
        if (user) {
          return { id: user.email, name: user.name, email: user.email }
        }
        return null
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || "truthlens-dev-secret-change-in-production",
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.name  = user.name
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name  = token.name  as string
        session.user.email = token.email as string
      }
      return session
    },
  },
})

export { handler as GET, handler as POST }
