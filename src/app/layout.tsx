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
    default: "FiniTax Guatemala — Contabilidad e Impuestos",
    template: "%s | FiniTax Guatemala",
  },
  description:
    "Plataforma integral de contabilidad, facturación FEL, planilla, impuestos y finanzas para empresas en Guatemala. ISR, IVA, ISO, IGSS, SAT.",
  keywords: [
    "contabilidad guatemala",
    "facturación electrónica FEL",
    "impuestos SAT",
    "planilla IGSS",
    "ISR Guatemala",
    "IVA Guatemala",
    "ISO Guatemala",
    "FiniTax",
  ],
  openGraph: {
    title: "FiniTax Guatemala — Contabilidad e Impuestos",
    description: "La plataforma #1 para gestionar contabilidad, FEL, planilla e impuestos en Guatemala.",
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
