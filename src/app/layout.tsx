import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
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
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-GT" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
