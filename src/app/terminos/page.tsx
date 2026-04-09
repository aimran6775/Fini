import Link from "next/link";
import { FiniTaxLogo } from "@/components/logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos de Servicio — FiniTax GT",
  description: "Términos y condiciones de uso de la plataforma FiniTax Guatemala.",
};

export default function TerminosPage() {
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
        <h1 className="text-3xl font-bold tracking-tight mb-2">Términos de Servicio</h1>
        <p className="text-muted-foreground mb-8">Última actualización: 1 de abril de 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">1. Aceptación de los Términos</h2>
            <p>Al acceder o utilizar la plataforma FiniTax Guatemala (&quot;el Servicio&quot;), usted acepta cumplir con estos Términos de Servicio. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al Servicio.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">2. Descripción del Servicio</h2>
            <p>FiniTax Guatemala es una plataforma de contabilidad, facturación electrónica (FEL), planilla y gestión fiscal diseñada para empresas guatemaltecas. El Servicio incluye:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Emisión y gestión de facturas electrónicas FEL certificadas por la SAT</li>
              <li>Control de gastos e ingresos</li>
              <li>Gestión de planilla con cálculos de IGSS, IRTRA, INTECAP e ISR</li>
              <li>Cálculo automático de impuestos (IVA, ISR, ISO)</li>
              <li>Reportes financieros y contables</li>
              <li>Gestión de inventario y contactos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">3. Cuentas de Usuario</h2>
            <p>Para utilizar el Servicio, debe crear una cuenta proporcionando información precisa y actualizada. Usted es responsable de mantener la confidencialidad de su contraseña y de todas las actividades realizadas bajo su cuenta.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">4. Uso Aceptable</h2>
            <p>Usted se compromete a utilizar el Servicio únicamente para fines legales y de conformidad con las leyes de la República de Guatemala, incluyendo pero no limitado al Código de Comercio, la Ley del IVA, la Ley del ISR, y el Código Tributario.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">5. Datos y Privacidad</h2>
            <p>El tratamiento de sus datos personales y financieros se rige por nuestra <Link href="/privacidad" className="text-primary hover:underline">Política de Privacidad</Link>. Al utilizar el Servicio, usted consiente el procesamiento de sus datos de acuerdo con dicha política.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">6. Facturación Electrónica</h2>
            <p>FiniTax facilita la emisión de facturas electrónicas (FEL) a través de certificadores autorizados por la SAT. La empresa es la única responsable de la veracidad de los datos fiscales incluidos en sus facturas. FiniTax no se hace responsable por errores en los datos proporcionados por el usuario.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">7. Limitación de Responsabilidad</h2>
            <p>FiniTax proporciona herramientas de cálculo fiscal como referencia. Los cálculos de impuestos generados por la plataforma son estimaciones y no constituyen asesoría fiscal profesional. Recomendamos consultar con un contador público autorizado para la presentación de declaraciones fiscales.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">8. Disponibilidad del Servicio</h2>
            <p>Nos esforzamos por mantener el Servicio disponible las 24 horas del día, los 7 días de la semana. Sin embargo, no garantizamos disponibilidad ininterrumpida y nos reservamos el derecho de realizar mantenimiento programado.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">9. Propiedad Intelectual</h2>
            <p>Todo el contenido, diseño, código y funcionalidad del Servicio son propiedad de FiniTax Guatemala y están protegidos por las leyes de propiedad intelectual aplicables.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">10. Modificaciones</h2>
            <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor al ser publicadas en esta página. El uso continuado del Servicio después de cualquier modificación constituye su aceptación de los nuevos términos.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">11. Ley Aplicable</h2>
            <p>Estos términos se rigen por las leyes de la República de Guatemala. Cualquier disputa será resuelta ante los tribunales competentes de la ciudad de Guatemala.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">12. Contacto</h2>
            <p>Para consultas sobre estos términos, contáctenos a: <a href="mailto:legal@finitax.gt" className="text-primary hover:underline">legal@finitax.gt</a></p>
          </section>
        </div>
      </main>
    </div>
  );
}
