import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { buildExtractionPrompt, type ImportCategory } from "@/lib/import/schemas";

// ─── AI Data Extraction Endpoint ───────────────────────────────
// POST /api/ai/extract
// Body: { category: ImportCategory, content: string }
// Returns: { rows, warnings, confidence }

function parseAIResponse(text: string): {
  rows: Record<string, string>[];
  warnings: string[];
  confidence: number;
} {
  let jsonStr = text.trim();

  // Strip markdown code fences if present
  const fenceMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) jsonStr = fenceMatch[1].trim();

  // Find the outermost JSON object
  const braceStart = jsonStr.indexOf("{");
  const braceEnd = jsonStr.lastIndexOf("}");
  if (braceStart !== -1 && braceEnd > braceStart) {
    jsonStr = jsonStr.slice(braceStart, braceEnd + 1);
  }

  const parsed = JSON.parse(jsonStr);

  if (!parsed.rows || !Array.isArray(parsed.rows)) {
    throw new Error("Respuesta IA no contiene un array 'rows'");
  }

  // Normalize all values to strings
  const rows = parsed.rows.map((row: Record<string, unknown>) => {
    const normalized: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      normalized[key] = value == null ? "" : String(value);
    }
    return normalized;
  });

  return {
    rows,
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
    confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.8,
  };
}

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { category, content } = body as {
      category: ImportCategory;
      content: string;
    };

    if (!category || !content) {
      return NextResponse.json(
        { error: "Se requiere categoría y contenido" },
        { status: 400 }
      );
    }

    if (content.length > 100_000) {
      return NextResponse.json(
        { error: "El contenido excede el límite de 100,000 caracteres" },
        { status: 400 }
      );
    }

    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;

    if (!hasOpenAI && !hasAnthropic) {
      return NextResponse.json(
        {
          error:
            "No hay API keys configuradas. Agrega OPENAI_API_KEY o ANTHROPIC_API_KEY.",
        },
        { status: 500 }
      );
    }

    const systemPrompt = buildExtractionPrompt(category);
    const userMessage = `CONTENIDO A PROCESAR:\n---\n${content}\n---`;

    let aiText: string | null = null;

    // Try OpenAI first
    if (hasOpenAI) {
      try {
        const result = await generateText({
          model: openai("gpt-4o"),
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage }],
        });
        aiText = result.text;
      } catch (openaiError) {
        console.error(
          "OpenAI extraction error, trying Anthropic:",
          openaiError instanceof Error ? openaiError.message : openaiError
        );
      }
    }

    // Fallback to Anthropic
    if (!aiText && hasAnthropic) {
      try {
        const result = await generateText({
          model: anthropic("claude-sonnet-4-20250514"),
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage }],
        });
        aiText = result.text;
      } catch (anthropicError) {
        console.error(
          "Anthropic extraction error:",
          anthropicError instanceof Error
            ? anthropicError.message
            : anthropicError
        );
      }
    }

    if (!aiText) {
      return NextResponse.json(
        { error: "No se pudo obtener respuesta de la IA" },
        { status: 502 }
      );
    }

    // Parse the AI response
    const extracted = parseAIResponse(aiText);

    return NextResponse.json({
      rows: extracted.rows,
      warnings: extracted.warnings,
      confidence: extracted.confidence,
      rowCount: extracted.rows.length,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al procesar la extracción";
    console.error("AI Extract error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
