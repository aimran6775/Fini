export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-2xl gradient-primary animate-pulse-glow" />
          <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">F</div>
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Cargando Fini Tax...</p>
      </div>
    </div>
  );
}
