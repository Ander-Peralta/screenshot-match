// Pure, deterministic graph logic for the physics discovery game.
// Shared by server functions and tests. Never import secrets here.

export type ConceptRow = {
  id: string;
  name: string;
  kind: string;
  category_id: string;
  definition: string;
  formula: string;
  units: string;
  synonyms: string[];
  conditions: string;
  level: string;
};
export type CategoryRow = { id: string; name: string; parent_id: string | null; sort: number };
export type RelationRow = { source_id: string; type_id: string; target_id: string; context: string };
export type RelationTypeRow = { id: string; label: string; inverse_label: string };

export type Edge = {
  to: string;
  type: string;
  /** true when the stored relation goes from this node to `to` */
  forward: boolean;
  context: string;
};

export type GraphNode = {
  id: string;
  name: string;
  isCategory: boolean;
  /** category id (for concepts: subcategory; for categories: parent) */
  parent: string | null;
};

export type Graph = {
  nodes: Map<string, GraphNode>;
  adj: Map<string, Edge[]>;
};

export const catId = (id: string) => `cat:${id}`;

export function buildGraph(
  concepts: Pick<ConceptRow, "id" | "name" | "category_id">[],
  categories: CategoryRow[],
  relations: RelationRow[],
): Graph {
  const nodes = new Map<string, GraphNode>();
  const adj = new Map<string, Edge[]>();
  const add = (a: string, b: string, type: string, context = "") => {
    if (!nodes.has(a) || !nodes.has(b) || a === b) return;
    adj.get(a)!.push({ to: b, type, forward: true, context });
    adj.get(b)!.push({ to: a, type, forward: false, context });
  };
  for (const c of categories) {
    const id = catId(c.id);
    nodes.set(id, { id, name: c.name, isCategory: true, parent: c.parent_id ? catId(c.parent_id) : null });
    adj.set(id, []);
  }
  for (const c of concepts) {
    nodes.set(c.id, { id: c.id, name: c.name, isCategory: false, parent: catId(c.category_id) });
    adj.set(c.id, []);
  }
  for (const n of nodes.values()) if (n.parent) add(n.id, n.parent, "pertenece");
  for (const r of relations) add(r.source_id, r.target_id, r.type_id, r.context);
  // Deterministic neighbour order: by node id, then relation type.
  for (const list of adj.values())
    list.sort((x, y) => (x.to < y.to ? -1 : x.to > y.to ? 1 : x.type < y.type ? -1 : x.type > y.type ? 1 : 0));
  return { nodes, adj };
}

export type BfsResult = { dist: Map<string, number>; parent: Map<string, string> };

/** Unweighted BFS from `source`; parent pointers lead back toward `source`. */
export function bfs(g: Graph, source: string): BfsResult {
  const dist = new Map<string, number>([[source, 0]]);
  const parent = new Map<string, string>();
  const queue = [source];
  for (let i = 0; i < queue.length; i++) {
    const u = queue[i]!;
    for (const e of g.adj.get(u) ?? []) {
      if (dist.has(e.to)) continue;
      dist.set(e.to, dist.get(u)! + 1);
      parent.set(e.to, u);
      queue.push(e.to);
    }
  }
  return { dist, parent };
}

/**
 * Shortest path from `from` to the BFS source (e.g. the secret).
 * Returns null when disconnected. Tie-break: the deterministic BFS discovery order.
 */
export function pathToSource(r: BfsResult, from: string): string[] | null {
  if (!r.dist.has(from)) return null;
  const path = [from];
  let cur = from;
  while (r.parent.has(cur)) {
    cur = r.parent.get(cur)!;
    path.push(cur);
  }
  return path;
}

export function shortestPath(g: Graph, a: string, b: string): string[] | null {
  return pathToSource(bfs(g, b), a);
}

export function edgeBetween(g: Graph, a: string, b: string): Edge | undefined {
  return g.adj.get(a)?.find((e) => e.to === b);
}

/** Meeting point index on a guess→secret path (never the secret itself unless direct). */
export function meetingIndex(distance: number): number {
  if (distance <= 1) return distance;
  return Math.max(1, Math.floor(distance / 2));
}

/** Concepts eligible as secrets: well connected (≥3 non-structural relations) and not units/constants. */
export function eligibleSecrets(g: Graph, kinds: Map<string, string>): string[] {
  const out: string[] = [];
  for (const n of g.nodes.values()) {
    if (n.isCategory) continue;
    const k = kinds.get(n.id);
    if (k === "unidad" || k === "constante") continue;
    const deg = (g.adj.get(n.id) ?? []).filter((e) => e.type !== "pertenece").length;
    if (deg >= 3) out.push(n.id);
  }
  return out.sort();
}

/** FNV-1a 32-bit hash: deterministic and fast. */
export function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export function utcDate(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function dailySecret(eligible: string[], date: string, salt: string): string {
  return eligible[hash32(`${salt}:${date}`) % eligible.length]!;
}

export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9ñ ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const MAX_ATTEMPTS = 20;
export const HINT_COST = 3;
