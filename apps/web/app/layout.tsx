import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GlobalProviders } from "~/providers/global";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HoliForm — Form builder",
  description: "Build beautiful Typeform-style surveys and share them instantly.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.WEB_APP_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  );
}
