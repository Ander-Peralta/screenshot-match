import { getRequestHeader } from "@tanstack/react-start/server";
import {
  bfs,
  buildGraph,
  catId,
  dailySecret,
  eligibleSecrets,
  HINT_COST,
  MAX_ATTEMPTS,
  meetingIndex,
  pathToSource,
  utcDate,
  type CategoryRow,
  type ConceptRow,
  type Graph,
  type RelationTypeRow,
} from "./graph";
import type { GameView, GuessView, HintView, NodeRef, StatsView } from "./types";

type KB = {
  concepts: Map<string, ConceptRow>;
  categories: Map<string, CategoryRow>;
  relTypes: Map<string, RelationTypeRow>;
  graph: Graph;
  eligible: string[];
  salt: string;
  loadedAt: number;
};

let kbCache: KB | null = null;

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export async function loadKB(): Promise<KB> {
  if (kbCache && Date.now() - kbCache.loadedAt < 10 * 60_000) return kbCache;
  const db = await admin();
  const [c, k, r, t, s] = await Promise.all([
    db.from("concepts").select("*").range(0, 9999),
    db.from("categories").select("*"),
    db.from("relations").select("source_id,type_id,target_id,context").range(0, 49999),
    db.from("relation_types").select("*"),
    db.from("app_secrets").select("value").eq("key", "daily_salt").single(),
  ]);
  for (const res of [c, k, r, t, s]) if (res.error) throw new Error(res.error.message);
  const concepts = c.data as ConceptRow[];
  const categories = k.data as CategoryRow[];
  const graph = buildGraph(concepts, categories, r.data!);
  const kinds = new Map(concepts.map((x) => [x.id, x.kind]));
  kbCache = {
    concepts: new Map(concepts.map((x) => [x.id, x])),
    categories: new Map(categories.map((x) => [x.id, x])),
    relTypes: new Map((t.data as RelationTypeRow[]).map((x) => [x.id, x])),
    graph,
    eligible: eligibleSecrets(graph, kinds),
    salt: s.data!.value,
    loadedAt: Date.now(),
  };
  return kbCache;
}

export type Owner = { userId: string | null; guestId: string | null };

export async function resolveOwner(guestId: string | null | undefined): Promise<Owner> {
  const auth = getRequestHeader("authorization");
  if (auth?.startsWith("Bearer ")) {
    const db = await admin();
    const { data } = await db.auth.getUser(auth.slice(7));
    if (data.user) return { userId: data.user.id, guestId: null };
  }
  if (!guestId) throw new Error("Falta el identificador de visitante.");
  return { userId: null, guestId };
}

type StoredGuess = { conceptId: string; distance: number; at: string };
type StoredHint = { nodeId: string; distance: number; kind: "step" | "branch" };
type GameRow = {
  id: string;
  user_id: string | null;
  guest_id: string | null;
  mode: "daily" | "practice";
  puzzle_date: string | null;
  secret_id: string;
  guesses: StoredGuess[];
  hints: StoredHint[];
  attempts_used: number;
  status: "playing" | "won" | "lost";
  created_at: string;
  finished_at: string | null;
};

function ownerFilter<T extends { eq: (c: string, v: string) => T; is: (c: string, v: null) => T }>(q: T, o: Owner): T {
  return o.userId ? q.eq("user_id", o.userId) : q.eq("guest_id", o.guestId!).is("user_id", null);
}

// ---------- view building ----------

function areaOf(kb: KB, categoryId: string): CategoryRow | undefined {
  let c = kb.categories.get(categoryId);
  while (c && c.parent_id && c.parent_id !== "fisica") c = kb.categories.get(c.parent_id);
  return c;
}

function nodeRef(kb: KB, id: string): NodeRef {
  const n = kb.graph.nodes.get(id)!;
  if (n.isCategory) {
    const cat = kb.categories.get(id.slice(4))!;
    return { id, name: cat.name, isCategory: true, parentId: cat.parent_id ? catId(cat.parent_id) : null };
  }
  const c = kb.concepts.get(id)!;
  return { id, name: c.name, isCategory: false, parentId: catId(c.category_id), kind: c.kind };
}

function mask(text: string, secretName: string) {
  if (!text) return text;
  const esc = secretName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp(esc, "gi"), "el concepto secreto");
}

function edgeText(kb: KB, a: string, b: string): { label: string; context: string } {
  const e = kb.graph.adj.get(a)?.find((x) => x.to === b);
  if (!e) return { label: "se relaciona con", context: "" };
  if (e.type === "pertenece") return { label: e.forward ? "pertenece a" : "incluye", context: "" };
  const t = kb.relTypes.get(e.type);
  return { label: (e.forward ? t?.label : t?.inverse_label) ?? e.type, context: e.context };
}

function describeNode(kb: KB, id: string): string {
  const n = kb.graph.nodes.get(id)!;
  if (n.isCategory) {
    const cat = kb.categories.get(id.slice(4))!;
    const parent = cat.parent_id ? kb.categories.get(cat.parent_id) : null;
    return parent ? `Rama de ${parent.name} que agrupa conceptos de ${cat.name.toLowerCase()}.` : "Raíz de todas las ramas de la física.";
  }
  return kb.concepts.get(id)!.definition;
}

function buildGuessView(kb: KB, g: StoredGuess, path: string[] | null, secret: string): GuessView {
  const c = kb.concepts.get(g.conceptId)!;
  const secretName = kb.concepts.get(secret)!.name;
  const correct = g.conceptId === secret;
  const base = {
    concept: nodeRef(kb, g.conceptId),
    categoryName: kb.categories.get(c.category_id)?.name ?? "",
    areaName: areaOf(kb, c.category_id)?.name ?? "",
    distance: g.distance,
    correct,
  };
  if (correct || !path) return { ...base, meeting: null, route: [], connection: correct ? "¡Es el concepto secreto!" : "Sin conexión conocida en el grafo." };
  const mi = meetingIndex(g.distance);
  const route = path.slice(0, mi + 1).map((id, i, arr) => {
    const isSecret = id === secret;
    const ref = isSecret ? { id: "?", name: "Concepto secreto", isCategory: false, parentId: null } : nodeRef(kb, id);
    const rel = i < arr.length - 1 ? edgeText(kb, id, arr[i + 1]) : null;
    return { node: ref, relToNext: rel ? { label: rel.label, context: mask(rel.context, secretName) } : null };
  });
  if (g.distance === 1) {
    const rel = edgeText(kb, g.conceptId, secret);
    return {
      ...base,
      meeting: null,
      route,
      connection: `Conexión directa: ${c.name} ${rel.label} el concepto secreto.${rel.context ? " " + mask(rel.context, secretName) : ""}`,
    };
  }
  const mid = path[mi];
  const mref = nodeRef(kb, mid);
  const steps = route
    .slice(0, -1)
    .map((s) => `${s.node.name} ${s.relToNext!.label}`)
    .join(" → ");
  return {
    ...base,
    meeting: {
      node: mref,
      categoryName: mref.isCategory ? kb.categories.get(kb.categories.get(mid.slice(4))!.parent_id ?? "")?.name ?? "Física" : kb.categories.get(kb.concepts.get(mid)!.category_id)!.name,
      description: mask(describeNode(kb, mid), secretName),
      remaining: g.distance - mi,
    },
    route,
    connection: `${steps} ${mref.name}, que está a ${g.distance - mi} ${g.distance - mi === 1 ? "conexión" : "conexiones"} del concepto secreto.`,
  };
}

export function buildView(kb: KB, row: GameRow): GameView {
  const r = bfs(kb.graph, row.secret_id);
  const secretName = kb.concepts.get(row.secret_id)!.name;
  const guesses = row.guesses.map((g) => buildGuessView(kb, g, pathToSource(r, g.conceptId), row.secret_id));
  const hints: HintView[] = row.hints.map((h) => ({
    node: nodeRef(kb, h.nodeId),
    distance: h.distance,
    kind: h.kind,
    description: mask(describeNode(kb, h.nodeId), secretName),
  }));
  const finished = row.status !== "playing";
  const s = kb.concepts.get(row.secret_id)!;
  const remaining = MAX_ATTEMPTS - row.attempts_used;
  return {
    id: row.id,
    mode: row.mode,
    puzzleDate: row.puzzle_date,
    status: row.status,
    attemptsUsed: row.attempts_used,
    maxAttempts: MAX_ATTEMPTS,
    hintCost: HINT_COST,
    canHint: !finished && remaining > HINT_COST,
    guesses,
    hints,
    secret: finished
      ? {
          node: nodeRef(kb, s.id),
          name: s.name,
          kind: s.kind,
          definition: s.definition,
          formula: s.formula,
          units: s.units,
          conditions: s.conditions,
          level: s.level,
          categoryName: kb.categories.get(s.category_id)?.name ?? "",
          areaName: areaOf(kb, s.category_id)?.name ?? "",
          related: (kb.graph.adj.get(s.id) ?? [])
            .filter((e) => e.type !== "pertenece")
            .slice(0, 8)
            .map((e) => ({ name: kb.concepts.get(e.to)?.name ?? e.to, label: edgeText(kb, s.id, e.to).label })),
        }
      : null,
  };
}

// ---------- game actions ----------

export async function getOrCreateDaily(o: Owner): Promise<GameView> {
  const kb = await loadKB();
  const db = await admin();
  const date = utcDate();
  const existing = await ownerFilter(db.from("games").select("*").eq("mode", "daily").eq("puzzle_date", date), o).maybeSingle();
  if (existing.error) throw new Error(existing.error.message);
  if (existing.data) return buildView(kb, existing.data as unknown as GameRow);
  const secret = dailySecret(kb.eligible, date, kb.salt);
  const ins = await db
    .from("games")
    .insert({ user_id: o.userId, guest_id: o.guestId, mode: "daily", puzzle_date: date, secret_id: secret })
    .select("*")
    .single();
  if (ins.error) {
    // Concurrent creation: read the winner.
    const again = await ownerFilter(db.from("games").select("*").eq("mode", "daily").eq("puzzle_date", date), o).single();
    if (again.error) throw new Error(ins.error.message);
    return buildView(kb, again.data as unknown as GameRow);
  }
  return buildView(kb, ins.data as unknown as GameRow);
}

export async function getOrCreatePractice(o: Owner, fresh: boolean): Promise<GameView> {
  const kb = await loadKB();
  const db = await admin();
  if (!fresh) {
    const cur = await ownerFilter(db.from("games").select("*").eq("mode", "practice").eq("status", "playing"), o)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (cur.data) return buildView(kb, cur.data as unknown as GameRow);
  } else {
    // Abandon any unfinished practice game.
    await ownerFilter(
      db.from("games").update({ status: "lost", finished_at: new Date().toISOString() }).eq("mode", "practice").eq("status", "playing"),
      o,
    );
  }
  const recent = await ownerFilter(db.from("games").select("secret_id"), o).order("created_at", { ascending: false }).limit(60);
  const avoid = new Set((recent.data ?? []).map((x) => x.secret_id));
  const today = dailySecret(kb.eligible, utcDate(), kb.salt);
  avoid.add(today);
  let pool = kb.eligible.filter((id) => !avoid.has(id));
  if (pool.length === 0) pool = kb.eligible.filter((id) => id !== today);
  const secret = pool[Math.floor(Math.random() * pool.length)];
  const ins = await db.from("games").insert({ user_id: o.userId, guest_id: o.guestId, mode: "practice", secret_id: secret }).select("*").single();
  if (ins.error) throw new Error(ins.error.message);
  return buildView(kb, ins.data as unknown as GameRow);
}

async function loadOwned(o: Owner, gameId: string): Promise<GameRow> {
  const db = await admin();
  const res = await ownerFilter(db.from("games").select("*").eq("id", gameId), o).maybeSingle();
  if (!res.data) throw new Error("Partida no encontrada.");
  return res.data as unknown as GameRow;
}

async function save(row: GameRow, prevAttempts: number) {
  const db = await admin();
  // Optimistic concurrency: only apply if nobody changed the game meanwhile.
  const res = await db
    .from("games")
    .update({ guesses: row.guesses, hints: row.hints, attempts_used: row.attempts_used, status: row.status, finished_at: row.finished_at })
    .eq("id", row.id)
    .eq("attempts_used", prevAttempts)
    .eq("status", "playing")
    .select("id");
  if (res.error) throw new Error(res.error.message);
  if (!res.data?.length) throw new Error("La partida cambió en otra pestaña. Recarga la página.");
}

export async function makeGuess(o: Owner, gameId: string, conceptId: string): Promise<GameView> {
  const kb = await loadKB();
  const row = await loadOwned(o, gameId);
  if (row.status !== "playing") throw new Error("La partida ya terminó.");
  if (!kb.concepts.has(conceptId)) throw new Error("Ese concepto no está en el banco de conceptos.");
  if (row.guesses.some((g) => g.conceptId === conceptId)) throw new Error("Ya probaste ese concepto.");
  const prev = row.attempts_used;
  const dist = bfs(kb.graph, row.secret_id).dist.get(conceptId) ?? -1;
  row.guesses = [...row.guesses, { conceptId, distance: dist, at: new Date().toISOString() }];
  row.attempts_used += 1;
  if (conceptId === row.secret_id) {
    row.status = "won";
    row.finished_at = new Date().toISOString();
  } else if (row.attempts_used >= MAX_ATTEMPTS) {
    row.status = "lost";
    row.finished_at = new Date().toISOString();
  }
  await save(row, prev);
  return buildView(kb, row);
}

/** Deterministic hint: next node on the shortest path from the closest known node. */
export function computeHint(kbGraph: Graph, secret: string, known: { id: string; distance: number }[], revealed: Set<string>, secretCategory: string, secretArea: string | null): StoredHint | null {
  const r = bfs(kbGraph, secret);
  const candidates = known.filter((k) => k.distance > 0);
  let start = candidates.sort((a, b) => a.distance - b.distance)[0]?.id ?? catId("fisica");
  let next = r.parent.get(start);
  // Walk forward if the next node was already revealed.
  while (next && next !== secret && revealed.has(next)) {
    start = next;
    next = r.parent.get(start);
  }
  if (next && next !== secret) return { nodeId: next, distance: r.dist.get(next)!, kind: "step" };
  // Only the secret is left on the path: reveal its branch instead.
  for (const b of [secretArea, secretCategory]) {
    if (b && !revealed.has(b)) return { nodeId: b, distance: r.dist.get(b) ?? 1, kind: "branch" };
  }
  return null;
}

export async function takeHint(o: Owner, gameId: string): Promise<GameView> {
  const kb = await loadKB();
  const row = await loadOwned(o, gameId);
  if (row.status !== "playing") throw new Error("La partida ya terminó.");
  if (MAX_ATTEMPTS - row.attempts_used <= HINT_COST) throw new Error(`Necesitas más de ${HINT_COST} intentos restantes para pedir una pista.`);
  const s = kb.concepts.get(row.secret_id)!;
  const area = areaOf(kb, s.category_id);
  const known = [
    ...row.guesses.filter((g) => g.distance >= 0).map((g) => ({ id: g.conceptId, distance: g.distance })),
    ...row.hints.map((h) => ({ id: h.nodeId, distance: h.distance })),
  ];
  const revealed = new Set([...row.guesses.map((g) => g.conceptId), ...row.hints.map((h) => h.nodeId)]);
  const hint = computeHint(kb.graph, row.secret_id, known, revealed, catId(s.category_id), area ? catId(area.id) : null);
  if (!hint) throw new Error("Ya no quedan pistas que no revelen la respuesta.");
  const prev = row.attempts_used;
  row.hints = [...row.hints, hint];
  row.attempts_used += HINT_COST;
  await save(row, prev);
  return buildView(kb, row);
}

// ---------- stats ----------

function summarize(rows: GameRow[]) {
  const finished = rows.filter((r) => r.status !== "playing");
  const won = finished.filter((r) => r.status === "won");
  const buckets = [
    { label: "1–5", min: 1, max: 5 },
    { label: "6–10", min: 6, max: 10 },
    { label: "11–15", min: 11, max: 15 },
    { label: "16–20", min: 16, max: 20 },
  ];
  return {
    played: finished.length,
    won: won.length,
    winRate: finished.length ? Math.round((won.length / finished.length) * 100) : 0,
    avgAttempts: won.length ? Math.round((won.reduce((a, r) => a + r.attempts_used, 0) / won.length) * 10) / 10 : 0,
    distribution: [
      ...buckets.map((b) => ({ label: b.label, count: won.filter((r) => r.attempts_used >= b.min && r.attempts_used <= b.max).length })),
      { label: "Perdidas", count: finished.length - won.length },
    ],
  };
}

export function streaks(wonDates: string[], today: string) {
  const set = new Set(wonDates);
  const sorted = [...set].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of sorted) {
    run = prev && dayDiff(prev, d) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  let current = 0;
  let cursor = set.has(today) ? today : addDays(today, -1);
  while (set.has(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }
  return { current, best };
}
function addDays(d: string, n: number) {
  const t = new Date(d + "T00:00:00Z");
  t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
}
function dayDiff(a: string, b: string) {
  return Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 86_400_000);
}

export async function getStats(o: Owner): Promise<StatsView> {
  const kb = await loadKB();
  const db = await admin();
  const res = await ownerFilter(db.from("games").select("*"), o).order("created_at", { ascending: false }).limit(2000);
  if (res.error) throw new Error(res.error.message);
  const rows = res.data as unknown as GameRow[];
  const daily = rows.filter((r) => r.mode === "daily");
  const practice = rows.filter((r) => r.mode === "practice" && !(r.status === "lost" && r.attempts_used < MAX_ATTEMPTS && r.guesses.length === 0));
  const s = streaks(daily.filter((r) => r.status === "won").map((r) => r.puzzle_date!), utcDate());
  return {
    daily: { ...summarize(daily), currentStreak: s.current, bestStreak: s.best },
    practice: summarize(practice),
    history: daily
      .filter((r) => r.status !== "playing")
      .slice(0, 60)
      .map((r) => ({ date: r.puzzle_date!, status: r.status, attempts: r.attempts_used, answer: kb.concepts.get(r.secret_id)?.name ?? "" })),
    signedIn: !!o.userId,
  };
}

export async function claimGuest(userId: string, guestId: string): Promise<number> {
  const db = await admin();
  const guestRows = await db.from("games").select("id,mode,puzzle_date").eq("guest_id", guestId).is("user_id", null);
  const userDaily = await db.from("games").select("puzzle_date").eq("user_id", userId).eq("mode", "daily");
  const taken = new Set((userDaily.data ?? []).map((x) => x.puzzle_date));
  const ids = (guestRows.data ?? []).filter((g) => g.mode !== "daily" || !taken.has(g.puzzle_date)).map((g) => g.id);
  if (!ids.length) return 0;
  const up = await db.from("games").update({ user_id: userId }).in("id", ids);
  if (up.error) throw new Error(up.error.message);
  return ids.length;
}

export async function listConceptsPublic() {
  const kb = await loadKB();
  return {
    concepts: [...kb.concepts.values()].map((c) => ({
      id: c.id,
      name: c.name,
      synonyms: c.synonyms,
      kind: c.kind,
      categoryId: catId(c.category_id),
      areaName: areaOf(kb, c.category_id)?.name ?? "",
    })),
    categories: [...kb.categories.values()].map((c) => ({ id: catId(c.id), name: c.name, parentId: c.parent_id ? catId(c.parent_id) : null, sort: c.sort })),
  };
}
