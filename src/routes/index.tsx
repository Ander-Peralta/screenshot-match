import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fisicazoa — El juego de descubrir conceptos de física" },
      { name: "description", content: "Adivina el concepto físico secreto explorando las conexiones entre leyes, fenómenos y magnitudes. Desafío diario y práctica libre." },
      { property: "og:title", content: "Fisicazoa — Descubre el concepto físico secreto" },
      { property: "og:description", content: "Un juego diario de descubrimiento sobre las conexiones de la física." },
    ],
  }),
  component: Index,
});

const sample = [
  { name: "Física", cls: "bg-node-root text-node-fg", x: "50%", y: 0 },
  { name: "Electromagnetismo", cls: "bg-node-area text-node-fg", x: "28%", y: 70 },
  { name: "Física moderna", cls: "bg-node-area text-node-fg", x: "72%", y: 70 },
  { name: "ley de Faraday", cls: "bg-paper border-[1.5px] border-d2 text-d2", x: "16%", y: 150 },
  { name: "Inducción", cls: "bg-node-sub text-node-fg", x: "40%", y: 150 },
  { name: "fotón", cls: "bg-paper border-[1.5px] border-d3 text-d3", x: "64%", y: 150 },
  { name: "espín", cls: "bg-paper border-[1.5px] border-d4 text-d4", x: "86%", y: 150 },
];

function Index() {
  return (
    <main className="mx-auto max-w-5xl px-4">
      <section className="grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">Un juego de descubrimiento</p>
          <h1 className="mt-3 text-5xl leading-[1.05] md:text-6xl">
            Cada concepto de la física está <em className="text-primary">conectado</em>.
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">
            Hay un concepto secreto. Prueba leyes, fenómenos o magnitudes y descubre a cuántas conexiones estás. Tienes 20 intentos.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/diario">
                Desafío de hoy <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/practica">
                <Shuffle className="h-4 w-4" /> Práctica libre
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative h-[220px] rounded-xl border bg-card/60 shadow-card" aria-hidden>
          <Logo className="absolute -right-6 -top-8 h-24 w-24 animate-orbit opacity-30" />
          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 220">
            <path d="M50 34 C50 52 28 52 28 70" className="stroke-node-root" strokeWidth="1.2" fill="none" vectorEffect="non-scaling-stroke" />
            <path d="M50 34 C50 52 72 52 72 70" className="stroke-node-root" strokeWidth="1.2" fill="none" vectorEffect="non-scaling-stroke" />
            <path d="M28 104 C28 127 16 127 16 150" className="stroke-d2" strokeWidth="1" fill="none" vectorEffect="non-scaling-stroke" />
            <path d="M28 104 C28 127 40 127 40 150" className="stroke-node-area" strokeWidth="1" fill="none" vectorEffect="non-scaling-stroke" />
            <path d="M72 104 C72 127 64 127 64 150" className="stroke-d3" strokeWidth="1" fill="none" vectorEffect="non-scaling-stroke" />
            <path d="M72 104 C72 127 86 127 86 150" className="stroke-d4" strokeWidth="1" fill="none" vectorEffect="non-scaling-stroke" />
          </svg>
          {sample.map((s) => (
            <span
              key={s.name}
              className={`absolute -translate-x-1/2 whitespace-nowrap rounded-md px-2.5 py-1.5 font-mono text-xs shadow-node ${s.cls}`}
              style={{ left: s.x, top: s.y + 12 }}
            >
              {s.name}
            </span>
          ))}
        </div>
      </section>
      <section className="grid gap-4 border-t py-12 md:grid-cols-3">
        {[
          ["1 · Prueba", "Escribe cualquier concepto del banco: la ley de Ohm, entropía, fotón…"],
          ["2 · Mide", "Te decimos su distancia en conexiones y el punto de encuentro con el secreto."],
          ["3 · Descubre", "Las ramas crecen con cada intento hasta revelar la respuesta."],
        ].map(([t, d]) => (
          <div key={t} className="rounded-lg bg-card/70 p-5 shadow-card">
            <h3 className="text-lg">{t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
