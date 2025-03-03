// app/layout.js
import { Inter, Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import Providers from './providers';
import "./globals.css";

// Font setup
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
}); 

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ['latin'] });

// Metadata
export const metadata = {
  title: "AI Chat App",
  description: "Chat with AI models and generate images",
};

// Root layout (server component)
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.className} ${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}