import { createFileRoute } from "@tanstack/react-router";
import { GameBoard, conceptIndexQuery } from "@/components/game/GameBoard";

export const Route = createFileRoute("/diario")({
  head: () => ({
    meta: [
      { title: "Desafío diario — Fisicazoa" },
      { name: "description", content: "Descubre el concepto físico secreto de hoy en 20 intentos. El mismo reto para todos los jugadores." },
      { property: "og:title", content: "Desafío diario — Fisicazoa" },
      { property: "og:description", content: "El concepto físico secreto de hoy, el mismo para todos." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(conceptIndexQuery);
  },
  component: DailyPage,
});

function DailyPage() {
  const today = new Date().toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Desafío diario · {today} (UTC)</p>
        <h1 className="text-3xl">¿Qué concepto se esconde hoy?</h1>
      </div>
      <GameBoard mode="daily" />
    </main>
  );
}
