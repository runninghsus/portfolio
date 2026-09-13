import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import AskPanel from "@/components/AskPanel";
import { Analytics } from "@vercel/analytics/next";
import { site } from "@/data/site";
import { THEME_BOOT } from "@/lib/theme";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Data Science & ML Leadership`,
    template: `%s · ${site.shortName}`,
  },
  description: site.tagline,
  openGraph: {
    title: `${site.name} — Data Science & ML Leadership`,
    description: site.tagline,
    url: site.url,
    siteName: site.shortName,
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sourceSans.variable} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        <main className="flex-1">{children}</main>
        <Footer />
        <AskPanel />
        <Analytics />
      </body>
    </html>
  );
}
