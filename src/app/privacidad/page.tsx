import Link from "next/link";
import { FiniTaxLogo } from "@/components/logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad — FiniTax GT",
  description: "Política de privacidad y protección de datos de FiniTax Guatemala.",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-4 sm:px-6 py-4">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <FiniTaxLogo size={28} textSize="text-base" />
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Política de Privacidad</h1>
        <p className="text-muted-foreground mb-8">Última actualización: 1 de abril de 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">1. Información que Recopilamos</h2>
            <p>Al utilizar FiniTax Guatemala, recopilamos la siguiente información:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Datos de cuenta:</strong> nombre, correo electrónico, contraseña cifrada</li>
              <li><strong>Datos fiscales:</strong> NIT, razón social, dirección fiscal, régimen de ISR</li>
              <li><strong>Datos de empleados:</strong> nombre, DPI, número de IGSS, salario (para cálculos de planilla)</li>
              <li><strong>Datos financieros:</strong> facturas, gastos, transacciones bancarias, partidas contables</li>
              <li><strong>Datos de uso:</strong> páginas visitadas, acciones realizadas (para auditoría interna)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">2. Cómo Usamos la Información</h2>
            <p>Utilizamos su información para:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Proveer y mantener el Servicio de contabilidad y facturación</li>
              <li>Calcular impuestos (IVA, ISR, ISO, IGSS) según la legislación guatemalteca</li>
              <li>Generar reportes financieros y declaraciones fiscales</li>
              <li>Emitir facturas electrónicas FEL a través de certificadores autorizados</li>
              <li>Enviar notificaciones sobre vencimientos fiscales y actividad importante</li>
              <li>Mejorar y optimizar el Servicio</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">3. Almacenamiento y Seguridad</h2>
            <p>Sus datos se almacenan en servidores seguros con cifrado en tránsito (TLS 1.3) y en reposo (AES-256). Implementamos las siguientes medidas de seguridad:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Autenticación segura con tokens JWT</li>
              <li>Aislamiento de datos por organización (multi-tenancy)</li>
              <li>Control de acceso basado en roles (RBAC)</li>
              <li>Bitácora de auditoría de todas las acciones</li>
              <li>Backups automáticos diarios</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">4. Compartir Información</h2>
            <p>No vendemos ni compartimos sus datos personales o financieros con terceros, excepto en los siguientes casos:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Certificadores FEL:</strong> compartimos datos de facturación con el certificador autorizado por SAT para la emisión de DTE</li>
              <li><strong>Requerimiento legal:</strong> cuando la ley o una autoridad competente lo requiera</li>
              <li><strong>Proveedores de infraestructura:</strong> utilizamos servicios de hosting que procesan datos bajo acuerdos de confidencialidad</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">5. Sus Derechos</h2>
            <p>Usted tiene derecho a:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Acceder a sus datos personales almacenados en la plataforma</li>
              <li>Solicitar la corrección de datos incorrectos</li>
              <li>Solicitar la eliminación de su cuenta y datos asociados</li>
              <li>Exportar sus datos en formatos estándar (Excel, PDF)</li>
              <li>Revocar su consentimiento en cualquier momento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">6. Retención de Datos</h2>
            <p>Conservamos sus datos financieros y fiscales por el período mínimo requerido por la legislación guatemalteca (4 años según el Código Tributario, Artículo 47). Al eliminar su cuenta, los datos fiscales se conservan de forma anonimizada por el período legal requerido.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">7. Cookies</h2>
            <p>Utilizamos cookies estrictamente necesarias para el funcionamiento del Servicio (autenticación de sesión). No utilizamos cookies de seguimiento ni publicidad.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">8. Menores de Edad</h2>
            <p>El Servicio está destinado a personas mayores de 18 años. No recopilamos deliberadamente información de menores de edad.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">9. Cambios a esta Política</h2>
            <p>Podemos actualizar esta política periódicamente. Le notificaremos de cambios significativos a través de la plataforma o por correo electrónico.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">10. Contacto</h2>
            <p>Para consultas sobre privacidad: <a href="mailto:privacidad@finitax.gt" className="text-primary hover:underline">privacidad@finitax.gt</a></p>
          </section>
        </div>
      </main>
    </div>
  );
}
