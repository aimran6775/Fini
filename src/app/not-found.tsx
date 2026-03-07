import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <FileQuestion className="mx-auto h-16 w-16 text-muted-foreground/50" />
        <h1 className="text-3xl font-bold">404</h1>
        <p className="text-muted-foreground">Página no encontrada</p>
        <Button asChild>
          <Link href="/dashboard">Volver al Panel</Link>
        </Button>
      </div>
    </div>
  );
}
