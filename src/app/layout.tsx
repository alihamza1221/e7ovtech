import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "./api/auth/[...nextauth]/authOptions";
import AuthProvider from "@repo/providers/nextAuthProvider";
import { DM_Sans } from "next/font/google";
import { Toaster } from "@repo/components/ui/toaster";

const dmSans = DM_Sans({ subsets: ["latin"] });

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "E7ovTech",
  description: "Your all-in-one workspace to build Productive teams",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(nextAuthOptions);

  return (
    <html lang="en">
      <body className={`${dmSans.className} ${geistMono.variable} antialiased`}>
        <AuthProvider session={session}>
          {children} <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
