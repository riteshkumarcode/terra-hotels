import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Marcellus, Jost } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { BookingProvider } from "@/context/BookingContext";
import { Header } from "@/components/layout/Header";
import { NavDrawer } from "@/components/layout/NavDrawer";
import { Footer } from "@/components/layout/Footer";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { Toast } from "@/components/layout/Toast";
import { PlanStaySheet } from "@/components/shared/PlanStaySheet";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-display",
  display: "swap",
});

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-label",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://terraa-hotels.netlify.app"),
  title: "Terraa Hotels | Luxury Heritage & Boutique Hotels across India",
  description:
    "Eight houses across India, each one shaped by the place it stands in. Udaipur, Jaipur, Kumarakom, Goa, Manali, Agra, Varanasi, Munnar.",
  icons: {
    icon: "/img/mark.png",
  },
  openGraph: {
    title: "Terraa Hotels | Luxury Heritage & Boutique Hotels across India",
    description:
      "Eight houses across India, each one shaped by the place it stands in.",
    images: [{ url: "/img/hero-palace.jpg", width: 1200, height: 630 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0E1411",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${marcellus.variable} ${jost.variable}`}
    >
      <body className="antialiased min-h-screen bg-[var(--ivory)] text-[var(--ink)] flex flex-col">
        <BookingProvider>
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          <NavDrawer />
          <main className="flex-1">
            <Suspense fallback={null}>
              {children}
            </Suspense>
          </main>
          <Footer />
          <Suspense fallback={null}>
            <MobileTabBar />
          </Suspense>
          <PlanStaySheet />
          <Toast />
        </BookingProvider>
      </body>
    </html>
  );
}
