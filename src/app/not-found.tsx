import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="text-center space-y-6 animate-fade-in-up">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
          <FileQuestion className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <div>
          <h1 className="text-6xl font-extrabold tracking-tight gradient-text">404</h1>
          <p className="mt-2 text-lg text-muted-foreground">Página no encontrada</p>
          <p className="mt-1 text-sm text-muted-foreground/60">La página que buscas no existe o fue movida.</p>
        </div>
        <Button asChild className="rounded-xl">
          <Link href="/dashboard">
            Volver al Panel
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
