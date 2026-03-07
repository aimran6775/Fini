import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FiniTax Guatemala — Contabilidad e Impuestos",
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
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-GT" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
