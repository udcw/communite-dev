import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

const handler = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'github') {
        await connectDB();
        const existingUser = await User.findOne({ email: user.email });
        
        if (!existingUser) {
          await User.create({
            email: user.email,
            name: user.name,
            githubId: account.providerAccountId,
          });
        }
      }
      return true;
    },
    async session({ session }) {
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };