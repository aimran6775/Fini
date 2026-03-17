import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { LanguageProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://finitaxgt.com"),
  title: {
    default: "Fini Tax GT — Impuestos y Contabilidad para Guatemala",
    template: "%s | Fini Tax GT",
  },
  description:
    "QuickBooks + TurboTax para Guatemala. Calcula impuestos personales o gestiona tu empresa: facturación FEL, ISR, IVA, ISO, planilla, IGSS y SAT.",
  keywords: [
    "impuestos guatemala",
    "contabilidad guatemala",
    "facturación electrónica FEL",
    "ISR personal guatemala",
    "planilla IGSS",
    "IVA Guatemala",
    "ISO Guatemala",
    "quickbooks guatemala",
    "turbotax guatemala",
    "Fini Tax",
  ],
  openGraph: {
    title: "Fini Tax GT — Impuestos y Contabilidad para Guatemala",
    description: "QuickBooks + TurboTax para Guatemala. Impuestos personales, facturación FEL, contabilidad, planilla y más.",
    type: "website",
    locale: "es_GT",
    siteName: "Fini Tax GT",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Fini Tax GT — Impuestos y Contabilidad para Guatemala",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fini Tax GT — Impuestos y Contabilidad para Guatemala",
    description: "QuickBooks + TurboTax para Guatemala. Facturación FEL, ISR, IVA, ISO, planilla y más.",
    images: ["/images/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-GT" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans">
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme:dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`}
        </Script>
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
