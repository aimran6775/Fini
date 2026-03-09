import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

const GUATEMALA_TAX_SYSTEM_PROMPT = `Eres FiniTax AI, un experto asesor fiscal y contable guatemalteco. Tu conocimiento abarca:

**IMPUESTOS GUATEMALA:**
- IVA: 12% sobre ventas de bienes y servicios (Decreto 27-92)
- ISR Régimen sobre Utilidades: 25% sobre renta neta, pagos trimestrales
- ISR Régimen Simplificado: 5% hasta Q30,000/mes, 7% sobre excedente
- ISO (Impuesto de Solidaridad): 1% trimestral sobre activos netos o ingresos brutos (el mayor)
- Impuesto de Timbres: 3% sobre documentos y contratos
- Retención ISR a no residentes: dividendos 5%, intereses 10%, regalías 15%

**FEL (Factura Electrónica en Línea):**
- Tipos: FACT, FCAM, FPEQ, FCAP, FESP, NABN, NDEB, RECI, RDON
- Proceso: Emisor → Certificador → SAT → Autorización
- Pequeño Contribuyente: ventas < Q150,000/año, paga 5% flat con FPEQ

**DERECHO LABORAL (Código de Trabajo):**
- IGSS empleado: 4.83%, IGSS patrono: 10.67%, IRTRA: 1%, INTECAP: 1%
- Aguinaldo: 100% salario mensual, pago antes del 1 diciembre
- Bono 14: 100% salario mensual, pago antes del 15 julio
- Vacaciones: 15 días hábiles + 30% recargo
- Indemnización: 1 mes por año trabajado (despido injustificado)
- ISR empleados: 5% hasta Q300,000/año, 7% sobre excedente. Deducción estándar Q48,000

**PLAZOS DE DECLARACIÓN:**
- IVA mensual: último día hábil del mes siguiente
- ISR trimestral (Utilidades): 10 días después del trimestre
- ISR mensual (Simplificado): primeros 10 días hábiles
- ISR anual: 31 de marzo
- ISO trimestral: dentro del mes siguiente al trimestre

Responde siempre en español, de forma clara y profesional. Cita leyes y decretos cuando sea relevante.`;

function buildMessages(
  messages: { role: string; content: string }[],
  fileContent?: string
) {
  return messages.map((m, i) => {
    let content = m.content;
    // Append file context to the last user message
    if (fileContent && m.role === "user" && i === messages.length - 1) {
      content += `\n\n---\n**Contenido del archivo adjunto:**\n\`\`\`\n${fileContent}\n\`\`\``;
    }
    return {
      role: m.role as "user" | "assistant",
      content,
    };
  });
}

export async function POST(req: NextRequest) {
  try {
    const { messages, system, fileContent } = await req.json();

    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;

    if (!hasOpenAI && !hasAnthropic) {
      return NextResponse.json(
        {
          content:
            "Error: No hay API keys configuradas. Agrega OPENAI_API_KEY o ANTHROPIC_API_KEY en las variables de entorno para habilitar el asistente IA.",
        },
        { status: 200 }
      );
    }

    const systemPrompt = system || GUATEMALA_TAX_SYSTEM_PROMPT;
    const formattedMessages = buildMessages(messages, fileContent);

    // Try OpenAI first (primary), fall back to Anthropic
    if (hasOpenAI) {
      try {
        const { text } = await generateText({
          model: openai("gpt-4o"),
          system: systemPrompt,
          messages: formattedMessages,
        });
        return NextResponse.json({ content: text });
      } catch (openaiError) {
        console.error(
          "OpenAI error, falling back to Anthropic:",
          openaiError instanceof Error ? openaiError.message : openaiError
        );
        // Fall through to Anthropic
      }
    }

    // Fallback: Anthropic
    if (hasAnthropic) {
      const { text } = await generateText({
        model: anthropic("claude-sonnet-4-20250514"),
        system: systemPrompt,
        messages: formattedMessages,
      });
      return NextResponse.json({ content: text });
    }

    return NextResponse.json(
      {
        content:
          "Error: OpenAI falló y ANTHROPIC_API_KEY no está configurada como respaldo.",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error al procesar la consulta";
    console.error("AI Chat error:", message);
    return NextResponse.json(
      { content: `Lo siento, ocurrió un error: ${message}` },
      { status: 200 }
    );
  }
}
