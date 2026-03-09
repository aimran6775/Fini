"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Send, User, Sparkles, Paperclip, X, FileText } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `Eres un experto contador y asesor fiscal guatemalteco. Tu conocimiento incluye:

IMPUESTOS GUATEMALA:
- IVA: 12% (Decreto 27-92). Débito fiscal en ventas, crédito fiscal en compras. Declaración mensual ante SAT, vence día 15 del mes siguiente.
- ISR Régimen sobre Utilidades: 25% sobre renta neta (Decreto 10-2012, Art. 36). Pagos trimestrales.
- ISR Régimen Simplificado: 5% sobre primeros Q30,000/mes, 7% sobre excedente. Retención definitiva mensual.
- ISO: 1% trimestral sobre el mayor entre activos netos o ingresos brutos del trimestre anterior (Decreto 04-2012).
- Timbre Fiscal: 3% sobre documentos no afectos al IVA.

RETENCIONES ISR:
- 5% servicios profesionales
- 6.5% compra de bienes a contribuyentes que no emiten factura
- 15% pagos a no domiciliados

PLANILLA / LABORAL:
- IGSS empleado: 4.83%, patronal: 10.67%
- IRTRA: 1% patronal
- INTECAP: 1% patronal
- Aguinaldo: 1 salario mensual (50% dic, 50% ene)
- Bono 14: 1 salario mensual (pagadero en julio)
- Vacaciones: 15 días hábiles + 30% recargo
- Indemnización: 1 salario por año trabajado
- Jornadas: Diurna (8h), Mixta (7h), Nocturna (6h)

FACTURACIÓN FEL:
- Obligatorio desde 2022. Certificador autorizado por SAT.
- Tipos: FACT, FCAM, FPEQ, FCAP, FESP, NABN, NDEB, RECI, RDON.
- NIT formato: XXXXXXXX-X

DEPRECIACIÓN FISCAL (Decreto 10-2012):
- Edificios: 5%
- Maquinaria: 20%
- Vehículos: 20%
- Equipo de cómputo: 33.33%
- Mobiliario: 20%
- Herramientas: 25%

Responde en español, de forma clara y precisa. Cita artículos de ley cuando sea relevante.`;

const suggestions = [
  "¿Cómo calculo el IVA mensual?",
  "¿Cuáles son las tasas de IGSS?",
  "¿Cuándo vence la declaración ISR trimestral?",
  "Explícame el régimen simplificado de ISR",
  "¿Cómo funciona el ISO?",
  "¿Qué prestaciones laborales son obligatorias?",
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; content: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedFile({ name: file.name, content: ev.target?.result as string });
    };
    reader.readAsText(file);
    // Reset input so the same file can be re-uploaded
    e.target.value = "";
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;

    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          system: SYSTEM_PROMPT,
          fileContent: uploadedFile?.content || undefined,
        }),
      });

      if (!response.ok) throw new Error("Error en la respuesta");

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content || "No pude generar una respuesta." },
      ]);
      // Clear uploaded file after sending
      setUploadedFile(null);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Lo siento, hubo un error procesando tu consulta. Por favor intenta de nuevo. Asegúrate de que la clave de API de Anthropic esté configurada en ANTHROPIC_API_KEY.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bot className="h-7 w-7 text-primary" />
          Asistente IA Fiscal
        </h1>
        <p className="text-muted-foreground">
          Pregunta sobre impuestos, contabilidad y leyes fiscales de Guatemala
        </p>
      </div>

      <Card className="flex flex-col h-[calc(100vh-16rem)]">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Sparkles className="h-12 w-12 text-primary/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">¿En qué puedo ayudarte?</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md">
                Soy tu asistente fiscal especializado en leyes tributarias de Guatemala. Pregúntame sobre IVA, ISR, ISO, IGSS, planilla, FEL y más.
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {suggestions.map((s) => (
                  <Button
                    key={s}
                    variant="outline"
                    size="sm"
                    className="text-left justify-start h-auto py-2 px-3"
                    onClick={() => sendMessage(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary"><Bot className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                  {msg.role === "user" && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-blue-100 text-blue-700"><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary"><Bot className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-4 py-3">
                    <Spinner size="sm" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4">
          {/* File attachment indicator */}
          {uploadedFile && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/10 px-3 py-2 text-sm">
              <FileText className="h-4 w-4 text-primary" />
              <span className="flex-1 truncate text-muted-foreground">{uploadedFile.name}</span>
              <button onClick={() => setUploadedFile(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-2"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.csv,.json,.xml,.pdf,.doc,.docx,.xls,.xlsx"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              title="Adjuntar archivo"
              className="flex-shrink-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta fiscal..."
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={!input.trim() || loading} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
