import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Lightbulb, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConceptSearch } from "./ConceptSearch";
import { PhysicsTree } from "./PhysicsTree";
import { getGuestId, useAuthUser } from "@/lib/game/client";
import { listConcepts, requestHint, startDaily, startPractice, submitGuess } from "@/lib/game/game.functions";
import type { GameView, GuessView } from "@/lib/game/types";

export const conceptIndexQuery = { queryKey: ["concept-index"], queryFn: () => listConcepts(), staleTime: 60 * 60_000 };

const distBadge = (d: number) =>
  d <= 1 ? "bg-d1" : d === 2 ? "bg-d2" : d === 3 ? "bg-d3" : d === 4 ? "bg-d4" : d === 5 ? "bg-d5" : "bg-d6";

export function GameBoard({ mode }: { mode: "daily" | "practice" }) {
  const { data: index } = useQuery(conceptIndexQuery);
  const { user, ready } = useAuthUser();
  const daily = useServerFn(startDaily);
  const practice = useServerFn(startPractice);
  const guessFn = useServerFn(submitGuess);
  const hintFn = useServerFn(requestHint);
  const [game, setGame] = useState<GameView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    async (fresh = false) => {
      setError(null);
      setBusy(true);
      try {
        const guestId = getGuestId();
        setGame(mode === "daily" ? await daily({ data: { guestId } }) : await practice({ data: { guestId, fresh } }));
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo cargar la partida.");
      } finally {
        setBusy(false);
      }
    },
    [mode, daily, practice],
  );

  useEffect(() => {
    if (ready) load();
  }, [ready, user?.id, load]);

  const used = useMemo(() => new Set(game?.guesses.map((g) => g.concept.id) ?? []), [game]);

  const onGuess = async (conceptId: string) => {
    if (!game || busy) return;
    setBusy(true);
    try {
      const next = await guessFn({ data: { guestId: getGuestId(), gameId: game.id, conceptId } });
      setGame(next);
      if (next.status === "won") toast.success("¡Lo descubriste!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo registrar el intento.");
    } finally {
      setBusy(false);
    }
  };

  const onHint = async () => {
    if (!game || busy) return;
    setBusy(true);
    try {
      setGame(await hintFn({ data: { guestId: getGuestId(), gameId: game.id } }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo obtener la pista.");
    } finally {
      setBusy(false);
    }
  };

  if (error)
    return (
      <div className="rounded-xl border bg-card p-8 text-center shadow-card">
        <p className="text-destructive">{error}</p>
        <Button className="mt-4" onClick={() => load()}>
          Reintentar
        </Button>
      </div>
    );
  if (!game || !index)
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Preparando el universo…
      </div>
    );

  const remaining = game.maxAttempts - game.attemptsUsed;
  const finished = game.status !== "playing";
  const ordered = [...game.guesses].reverse();
  const best = game.guesses.filter((g) => g.distance >= 0).reduce<number | null>((m, g) => (m === null || g.distance < m ? g.distance : m), null);

  return (
    <div className="space-y-6">
      {finished && game.secret && <EndPanel game={game} onNew={mode === "practice" ? () => load(true) : undefined} signedIn={!!user} />}

      {!finished && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-3">
              <AttemptDots used={game.attemptsUsed} max={game.maxAttempts} />
              <span className="font-mono text-muted-foreground">
                {remaining} {remaining === 1 ? "intento" : "intentos"}
              </span>
              {best !== null && <span className="font-mono text-muted-foreground">· mejor: {best}</span>}
            </div>
            <Button variant="outline" size="sm" disabled={!game.canHint || busy} onClick={onHint} title={`Cuesta ${game.hintCost} intentos`}>
              <Lightbulb className="h-4 w-4" /> Pista (−{game.hintCost})
            </Button>
          </div>
          <ConceptSearch concepts={index.concepts} used={used} disabled={busy} onPick={onGuess} />
        </div>
      )}

      {game.guesses.length === 0 && game.hints.length === 0 && !finished ? (
        <div className="rounded-xl border border-dashed bg-card/50 p-10 text-center">
          <p className="font-display text-xl">El árbol está vacío.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Escribe cualquier concepto físico. Te diremos a cuántas conexiones está del concepto secreto y dónde se encuentran sus ramas.
          </p>
        </div>
      ) : (
        <PhysicsTree game={game} index={index} />
      )}

      {game.hints.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Pistas</h3>
          {game.hints.map((h, i) => (
            <div key={i} className="flex gap-3 rounded-lg border border-accent/40 bg-card p-3 text-sm">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <div>
                <span className="font-mono font-semibold">{h.node.name}</span>{" "}
                <span className="text-muted-foreground">
                  — {h.kind === "branch" ? "el concepto secreto pertenece a esta rama" : `a ${h.distance} ${h.distance === 1 ? "conexión" : "conexiones"} del secreto`}
                </span>
                <p className="mt-1 text-muted-foreground">{h.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {ordered.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Intentos</h3>
          {ordered.map((g, i) => (
            <GuessCard key={g.concept.id} g={g} n={game.guesses.length - i} />
          ))}
        </div>
      )}
      {!user && ready && (
        <p className="text-center text-xs text-muted-foreground">
          Juegas como visitante.{" "}
          <Link to="/cuenta" className="underline">
            Crea una cuenta
          </Link>{" "}
          para guardar rachas en cualquier dispositivo.
        </p>
      )}
    </div>
  );
}

function AttemptDots({ used, max }: { used: number; max: number }) {
  return (
    <div className="flex gap-[3px]" aria-label={`${used} de ${max} intentos usados`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`h-2.5 w-1.5 rounded-full ${i < used ? "bg-primary" : "bg-border"}`} />
      ))}
    </div>
  );
}

function GuessCard({ g, n }: { g: GuessView; n: number }) {
  return (
    <div className="animate-node-in rounded-lg border bg-card p-4 shadow-card">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-9 min-w-9 items-center justify-center rounded-md px-2 font-mono text-sm font-bold text-node-fg ${g.correct ? "bg-success" : distBadge(g.distance < 0 ? 9 : g.distance)}`}
          title="Distancia al concepto secreto"
        >
          {g.correct ? "✓" : g.distance < 0 ? "∞" : g.distance}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-mono font-semibold">{g.concept.name}</span>
            <span className="text-xs text-muted-foreground">
              #{n} · {g.areaName} › {g.categoryName}
            </span>
          </div>
          <p className="mt-1 text-sm">{g.connection}</p>
          {g.route.length > 1 && (
            <div className="mt-2 flex flex-wrap items-center gap-1 font-mono text-xs">
              {g.route.map((s, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className={`rounded-sm border px-1.5 py-0.5 ${s.node.isCategory ? "border-node-sub bg-node-sub text-node-fg" : s.node.id === "?" ? "border-dashed border-primary text-primary" : "bg-paper"}`}>
                    {s.node.name}
                  </span>
                  {s.relToNext && <span className="text-muted-foreground">— {s.relToNext.label} →</span>}
                </span>
              ))}
            </div>
          )}
          {g.meeting && (
            <div className="mt-3 rounded-md bg-secondary/70 p-3 text-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Punto de encuentro</div>
              <div className="mt-0.5 font-mono font-semibold">
                {g.meeting.node.name} <span className="font-sans text-xs font-normal text-muted-foreground">· {g.meeting.categoryName}</span>
              </div>
              <p className="mt-1 text-muted-foreground">{g.meeting.description}</p>
            </div>
          )}
          {g.route.some((s) => s.relToNext?.context) && (
            <p className="mt-2 text-xs italic text-muted-foreground">
              {g.route
                .map((s) => s.relToNext?.context)
                .filter(Boolean)
                .join(" ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function EndPanel({ game, onNew, signedIn }: { game: GameView; onNew?: () => void; signedIn: boolean }) {
  const s = game.secret!;
  const won = game.status === "won";
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-card">
      <div className={`px-6 py-5 ${won ? "bg-success text-success-foreground" : "bg-node-root text-node-fg"}`}>
        <p className="text-sm uppercase tracking-widest opacity-90">{won ? "¡Felicidades!" : "Fin de la partida"}</p>
        <h2 className="mt-1 text-3xl">{s.name}</h2>
        <p className="mt-1 text-sm opacity-90">
          {won ? `Lo descubriste en ${game.attemptsUsed} de ${game.maxAttempts} intentos.` : "Se agotaron los 20 intentos. Este era el concepto secreto."}
        </p>
      </div>
      <div className="grid gap-6 p-6 md:grid-cols-[2fr_1fr]">
        <div className="space-y-3 text-sm">
          <p className="text-base">{s.definition}</p>
          {s.formula && (
            <p>
              <span className="text-muted-foreground">Fórmula: </span>
              <span className="font-mono">{s.formula}</span>
            </p>
          )}
          {s.units && (
            <p>
              <span className="text-muted-foreground">Unidades: </span>
              <span className="font-mono">{s.units}</span>
            </p>
          )}
          {s.conditions && (
            <p>
              <span className="text-muted-foreground">Condiciones: </span>
              {s.conditions}
            </p>
          )}
          <p className="text-muted-foreground">
            {s.areaName} › {s.categoryName} · {s.kind} · nivel {s.level}
          </p>
          {s.related.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {s.related.map((r, i) => (
                <span key={i} className="rounded-sm border bg-paper px-2 py-0.5 font-mono text-xs">
                  {r.label} {r.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-2 rounded-lg bg-secondary/60 p-4 text-sm">
          <Stat label="Intentos usados" value={game.attemptsUsed} />
          <Stat label="Conceptos probados" value={game.guesses.length} />
          <Stat label="Pistas" value={game.hints.length} />
          <div className="flex flex-col gap-2 pt-2">
            {onNew && (
              <Button onClick={onNew}>
                <RotateCcw className="h-4 w-4" /> Nueva partida
              </Button>
            )}
            {!onNew && (
              <Button asChild variant="default">
                <Link to="/practica">Jugar práctica libre</Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link to="/estadisticas">Ver estadísticas</Link>
            </Button>
            {!signedIn && <p className="text-xs text-muted-foreground">Crea una cuenta para conservar tus rachas.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-semibold">{value}</span>
    </div>
  );
}
