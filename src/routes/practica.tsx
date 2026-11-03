import { createFileRoute } from "@tanstack/react-router";
import { GameBoard, conceptIndexQuery } from "@/components/game/GameBoard";

export const Route = createFileRoute("/practica")({
  head: () => ({
    meta: [
      { title: "Práctica libre — Fisicazoa" },
      { name: "description", content: "Partidas ilimitadas con conceptos físicos aleatorios. No afectan tu desafío diario." },
      { property: "og:title", content: "Práctica libre — Fisicazoa" },
      { property: "og:description", content: "Partidas ilimitadas de descubrimiento de conceptos físicos." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(conceptIndexQuery);
  },
  component: PracticePage,
});

function PracticePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Práctica libre</p>
        <h1 className="text-3xl">Un concepto al azar, sin presión</h1>
      </div>
      <GameBoard mode="practice" />
    </main>
  );
}
