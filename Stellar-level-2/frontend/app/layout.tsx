import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Outfit } from "next/font/google";
import Navbar from "../components/Navbar";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Buy Me a Coffee | Support on Stellar",
  description: "Send a coffee with XLM on Stellar. Transparent, on-chain support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} antialiased font-sans text-stone-100 bg-stone-950`}
        suppressHydrationWarning
      >
        <Navbar />
        <main className="min-h-screen relative z-0">
          {children}
          <Toaster position="bottom-right" theme="dark" richColors />
        </main>
      </body>
    </html>
  );
}
