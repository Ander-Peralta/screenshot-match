import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/reglas")({
  head: () => ({
    meta: [
      { title: "Cómo se juega — Fisicazoa" },
      { name: "description", content: "Reglas de Fisicazoa: distancias, puntos de encuentro, pistas y desafío diario." },
      { property: "og:title", content: "Cómo se juega — Fisicazoa" },
      { property: "og:description", content: "Reglas del juego de descubrimiento de conceptos físicos." },
    ],
  }),
  component: Rules,
});

const items: [string, string][] = [
  ["El objetivo", "Hay un concepto físico secreto: una ley, magnitud, fenómeno, partícula, modelo… Debes descubrirlo en un máximo de 20 intentos."],
  ["La distancia", "Cada concepto está unido a otros por relaciones como «es un tipo de», «se mide en», «es causado por» o «se conserva en», y también a su rama (p. ej. Electromagnetismo › Inducción). La distancia es el número mínimo de conexiones entre tu intento y el secreto. 1 significa conexión directa."],
  ["El punto de encuentro", "Para cada intento mostramos un nodo intermedio de la ruta más corta: puede ser una rama o un concepto. Te indica hacia dónde avanzar sin revelar la respuesta."],
  ["El árbol", "Tus intentos se dibujan como hojas en el árbol de la física. Su color indica cercanía: rojo intenso es muy cerca, tonos fríos están lejos. Las líneas punteadas unen un intento con su punto de encuentro en otra rama."],
  ["Pistas", "Puedes canjear 3 intentos por una pista: revela el siguiente nodo de una ruta mínima desde tu intento más cercano. Solo disponible si te quedan más de 3 intentos."],
  ["Desafío diario", "Todos juegan el mismo concepto cada día. El día cambia a las 00:00 UTC. Cuenta para tus rachas."],
  ["Práctica libre", "Partidas ilimitadas con conceptos al azar. No afectan al desafío diario."],
];

function Rules() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl">Cómo se juega</h1>
      <div className="mt-8 space-y-6">
        {items.map(([t, d]) => (
          <section key={t} className="border-l-2 border-primary/40 pl-4">
            <h2 className="text-xl">{t}</h2>
            <p className="mt-1 text-muted-foreground">{d}</p>
          </section>
        ))}
      </div>
      <Link to="/diario" className="mt-10 inline-block font-medium text-primary underline">
        Jugar el desafío de hoy →
      </Link>
    </main>
  );
}
