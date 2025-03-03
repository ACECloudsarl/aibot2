// app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import { nextAuthOptions } from './auth';

// Export the NextAuth handler as GET and POST
const handler = NextAuth(nextAuthOptions);
export { handler as GET, handler as POST };