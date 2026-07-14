import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plexMono = IBM_Plex_Mono({ 
  weight: ["400", "700"],
  subsets: ["latin"], 
  variable: "--font-plex-mono" 
});

export const metadata: Metadata = {
  title: "WorkSpot - Find Your Perfect Workspace in Bangladesh",
  description: "Discover and book premium co-working spaces, private offices, and meeting rooms across Bangladesh.",
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const { children, params } = props;
  const { locale } = await params;
  const messages = await getMessages();
  return (
    <html lang={locale}>
      <body className={`${inter.variable} ${plexMono.variable} font-sans antialiased bg-[var(--base)] text-[var(--ink)] min-h-screen flex flex-col`}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <Navbar />
            <main className="flex-grow">
              {children}
          </main>
          <Footer />
          <Toaster 
            position="bottom-right" 
            toastOptions={{
              style: {
                background: 'var(--base)',
                color: 'var(--ink)',
                border: '1px solid var(--line)',
              },
            }} 
          />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
