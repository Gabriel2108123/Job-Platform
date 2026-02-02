import type { Metadata } from "next";
import { Montserrat, Poppins, Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { ReactQueryProvider } from "@/lib/query-provider";

// Import brand fonts
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "YokeConnect - Hospitality hiring that actually moves",
  description: "Connect hospitality talent with opportunity. Faster hiring, safer process, clear value for employers and candidates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${poppins.variable} ${inter.variable}`}
    >
      <body className="antialiased flex flex-col min-h-screen">
        <ReactQueryProvider>
          <Navigation />
          <main className="flex-1">{children}</main>
          <Footer />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
