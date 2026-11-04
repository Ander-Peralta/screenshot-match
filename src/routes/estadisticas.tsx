import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { fetchStats } from "@/lib/game/game.functions";
import { getGuestId, useAuthUser } from "@/lib/game/client";
import type { StatsView } from "@/lib/game/types";

export const Route = createFileRoute("/estadisticas")({
  head: () => ({
    meta: [
      { title: "Estadísticas — Fisicazoa" },
      { name: "description", content: "Tus rachas, partidas ganadas y distribución de intentos en Fisicazoa." },
      { property: "og:title", content: "Estadísticas — Fisicazoa" },
      { property: "og:description", content: "Rachas e historial de desafíos diarios." },
    ],
  }),
  component: StatsPage,
});

function StatsPage() {
  const { user, ready } = useAuthUser();
  const get = useServerFn(fetchStats);
  const [stats, setStats] = useState<StatsView | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!ready) return;
    get({ data: { guestId: getGuestId() } }).then(setStats, (e) => setError(e instanceof Error ? e.message : "Error"));
  }, [ready, user?.id, get]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl">Estadísticas</h1>
      {error && <p className="mt-4 text-destructive">{error}</p>}
      {!stats && !error && (
        <div className="flex items-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Calculando…
        </div>
      )}
      {stats && (
        <div className="mt-6 space-y-10">
          {!stats.signedIn && (
            <p className="rounded-lg bg-secondary p-3 text-sm">
              Estas estadísticas se guardan solo en este dispositivo.{" "}
              <Link to="/cuenta" className="underline">
                Crea una cuenta
              </Link>{" "}
              para conservarlas.
            </p>
          )}
          <section>
            <h2 className="text-xl">Desafío diario</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-6">
              <Big label="Racha actual" v={stats.daily.currentStreak} />
              <Big label="Mejor racha" v={stats.daily.bestStreak} />
              <Big label="Jugadas" v={stats.daily.played} />
              <Big label="Ganadas" v={stats.daily.won} />
              <Big label="% éxito" v={`${stats.daily.winRate}%`} />
              <Big label="Prom. intentos" v={stats.daily.avgAttempts || "—"} />
            </div>
            <Dist d={stats.daily.distribution} />
          </section>
          <section>
            <h2 className="text-xl">Práctica libre</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Big label="Jugadas" v={stats.practice.played} />
              <Big label="Ganadas" v={stats.practice.won} />
              <Big label="% éxito" v={`${stats.practice.winRate}%`} />
              <Big label="Prom. intentos" v={stats.practice.avgAttempts || "—"} />
            </div>
            <Dist d={stats.practice.distribution} />
          </section>
          <section>
            <h2 className="text-xl">Historial diario</h2>
            {stats.history.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Aún no terminas ningún desafío diario.</p>
            ) : (
              <ul className="mt-3 divide-y rounded-lg border bg-card">
                {stats.history.map((h) => (
                  <li key={h.date} className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <span className="font-mono">{h.date}</span>
                    <span className="flex-1 px-4">{h.answer}</span>
                    <span className={h.status === "won" ? "text-success" : "text-destructive"}>
                      {h.status === "won" ? `✓ ${h.attempts} intentos` : "✗ perdida"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

function Big({ label, v }: { label: string; v: string | number }) {
  return (
    <div className="rounded-lg bg-card p-4 shadow-card">
      <div className="font-display text-3xl text-primary">{v}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function Dist({ d }: { d: { label: string; count: number }[] }) {
  const max = Math.max(1, ...d.map((x) => x.count));
  return (
    <div className="mt-4 space-y-1.5">
      {d.map((x) => (
        <div key={x.label} className="flex items-center gap-3 text-sm">
          <span className="w-16 font-mono text-xs text-muted-foreground">{x.label}</span>
          <div className="h-5 flex-1 rounded-sm bg-muted">
            <div className={`h-5 rounded-sm ${x.label === "Perdidas" ? "bg-d6" : "bg-primary"}`} style={{ width: `${(x.count / max) * 100}%`, minWidth: x.count ? 20 : 0 }} />
          </div>
          <span className="w-6 text-right font-mono text-xs">{x.count}</span>
        </div>
      ))}
    </div>
  );
}
