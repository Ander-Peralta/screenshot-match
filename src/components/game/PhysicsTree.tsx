import { useMemo } from "react";
import type { ConceptIndex, GameView } from "@/lib/game/types";

type Role = { guess?: number; meeting?: boolean; hint?: boolean; secret?: boolean };
type TNode = { id: string; name: string; isCategory: boolean; depth: number; children: TNode[]; role: Role; x: number; y: number; w: number };

const ROW = 78;
const H = 34;
const GAP = 18;

const distClass = (d: number) =>
  d <= 1 ? "border-d1 text-d1" : d === 2 ? "border-d2 text-d2" : d === 3 ? "border-d3 text-d3" : d === 4 ? "border-d4 text-d4" : d === 5 ? "border-d5 text-d5" : "border-d6 text-d6";
const distStroke = (d: number) =>
  d <= 1 ? "stroke-d1" : d === 2 ? "stroke-d2" : d === 3 ? "stroke-d3" : d === 4 ? "stroke-d4" : d === 5 ? "stroke-d5" : "stroke-d6";

export function PhysicsTree({ game, index }: { game: GameView; index: ConceptIndex }) {
  const layout = useMemo(() => buildLayout(game, index), [game, index]);
  if (!layout) return null;
  const { nodes, edges, links, width, height } = layout;

  return (
    <div className="relative overflow-auto rounded-xl border bg-card/60 shadow-card" style={{ maxHeight: 640 }}>
      <div className="relative" style={{ width, height }}>
        <svg className="absolute inset-0" width={width} height={height} aria-hidden>
          {edges.map((e) => (
            <path
              key={e.key}
              d={curve(e.x1, e.y1, e.x2, e.y2)}
              fill="none"
              strokeLinecap="round"
              className={e.cls}
              strokeWidth={e.thick ? 4 : 1.6}
            />
          ))}
          {links.map((l) => (
            <path key={l.key} d={`M${l.x1},${l.y1 + H / 2} C${l.x1},${l.y1 + H / 2 + 40} ${l.x2},${l.y2 + H / 2 + 40} ${l.x2},${l.y2 + H / 2}`} fill="none" strokeDasharray="5 5" strokeWidth={1.4} className={l.cls} />
          ))}
        </svg>
        {nodes.map((n) => (
          <div
            key={n.id}
            title={n.role.guess !== undefined ? `Distancia: ${n.role.guess}` : n.role.meeting ? "Punto de encuentro" : n.role.hint ? "Pista" : undefined}
            className={`absolute flex animate-node-in items-center justify-center whitespace-nowrap px-3 font-mono text-[13px] shadow-node ${nodeClass(n)}`}
            style={{ left: n.x - n.w / 2, top: n.y, width: n.w, height: H }}
          >
            {n.role.secret ? `★ ${n.name}` : n.name}
            {n.role.guess !== undefined && !n.role.secret && (
              <span className="ml-2 rounded-sm bg-current/10 px-1 text-[11px] font-semibold">{n.role.guess < 0 ? "∞" : n.role.guess}</span>
            )}
            {n.role.meeting && n.isCategory && <span className="ml-1.5 text-[10px] opacity-80">◎</span>}
            {n.role.hint && <span className="ml-1.5 text-[10px] opacity-80">✦</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function nodeClass(n: TNode) {
  if (n.role.secret) return "rounded-md bg-success text-success-foreground font-semibold";
  if (n.isCategory) {
    const ring = n.role.meeting || n.role.hint ? " ring-2 ring-offset-2 ring-offset-background ring-accent" : "";
    const base = n.depth === 0 ? "bg-node-root" : n.depth === 1 ? "bg-node-area" : "bg-node-sub";
    return `rounded-md ${base} text-node-fg font-semibold${ring}`;
  }
  if (n.role.guess !== undefined) return `rounded-sm border-[1.5px] bg-paper ${distClass(n.role.guess < 0 ? 9 : n.role.guess)}`;
  return "rounded-sm border-[1.5px] border-dashed border-accent bg-paper text-accent";
}

function curve(x1: number, y1: number, x2: number, y2: number) {
  const my = (y1 + y2) / 2;
  return `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`;
}

function buildLayout(game: GameView, index: ConceptIndex) {
  const cats = new Map(index.categories.map((c) => [c.id, c]));
  const concepts = new Map(index.concepts.map((c) => [c.id, c]));
  const roles = new Map<string, Role>();
  const role = (id: string) => roles.get(id) ?? (roles.set(id, {}), roles.get(id)!);

  for (const g of game.guesses) role(g.concept.id).guess = g.distance;
  for (const g of game.guesses) if (g.meeting) role(g.meeting.node.id).meeting = true;
  for (const h of game.hints) role(h.node.id).hint = true;
  if (game.secret) {
    role(game.secret.node.id).secret = true;
  }
  const map = new Map<string, TNode>();
  const get = (id: string): TNode | null => {
    if (map.has(id)) return map.get(id)!;
    const cat = cats.get(id);
    const con = concepts.get(id);
    if (!cat && !con) return null;
    const node: TNode = { id, name: cat?.name ?? con!.name, isCategory: !!cat, depth: 0, children: [], role: roles.get(id) ?? {}, x: 0, y: 0, w: 0 };
    map.set(id, node);
    const parentId = cat ? cat.parentId : con!.categoryId;
    if (parentId) {
      const p = get(parentId);
      p?.children.push(node);
    }
    return node;
  };
  const root = get("cat:fisica");
  if (!root) return null;
  for (const id of roles.keys()) get(id);

  const sortKey = (n: TNode) => (n.isCategory ? `0${String(cats.get(n.id)?.sort ?? 0).padStart(3, "0")}` : `1${n.name}`);
  const nodes: TNode[] = [];
  const setDepth = (n: TNode, d: number) => {
    n.depth = d;
    n.y = 16 + d * ROW;
    n.w = Math.max(70, n.name.length * 8 + (n.role.guess !== undefined ? 52 : 30));
    n.children.sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
    nodes.push(n);
    n.children.forEach((c) => setDepth(c, d + 1));
  };
  setDepth(root, 0);

  // Tidy-ish layout: leaves left-to-right, parents centered over children.
  let cursor = GAP;
  const place = (n: TNode): [number, number] => {
    if (!n.children.length) {
      n.x = cursor + n.w / 2;
      cursor += n.w + GAP;
      return [n.x - n.w / 2, n.x + n.w / 2];
    }
    const start = cursor;
    const spans = n.children.map(place);
    n.x = (n.children[0]!.x + n.children[n.children.length - 1]!.x) / 2;
    const left = Math.min(spans[0]![0], n.x - n.w / 2);
    if (n.x - n.w / 2 < start) {
      // Parent wider than its children: shift subtree right.
      const dx = start - (n.x - n.w / 2);
      shift(n, dx);
      cursor += dx;
    }
    cursor = Math.max(cursor, n.x + n.w / 2 + GAP);
    return [left, n.x + n.w / 2];
  };
  const shift = (n: TNode, dx: number) => {
    n.x += dx;
    n.children.forEach((c) => shift(c, dx));
  };
  place(root);

  const width = Math.max(cursor + GAP, 320);
  const height = Math.max(...nodes.map((n) => n.y)) + H + 64;

  const edges: { key: string; x1: number; y1: number; x2: number; y2: number; cls: string; thick: boolean }[] = [];
  for (const n of nodes)
    for (const c of n.children) {
      const cls = c.isCategory
        ? c.depth === 1 ? "stroke-node-root" : "stroke-node-area"
        : c.role.guess !== undefined ? distStroke(c.role.guess < 0 ? 9 : c.role.guess) : "stroke-node-sub";
      edges.push({ key: `${n.id}>${c.id}`, x1: n.x, y1: n.y + H, x2: c.x, y2: c.y, cls, thick: c.isCategory });
    }

  // Cross-branch links: guess → meeting point (when it is not one of its ancestors).
  const links: typeof edges = [];
  for (const g of game.guesses) {
    if (!g.meeting) continue;
    const a = map.get(g.concept.id);
    const b = map.get(g.meeting.node.id);
    if (!a || !b || isAncestor(map, b.id, a, concepts, cats)) continue;
    links.push({ key: `${a.id}~${b.id}`, x1: a.x, y1: a.y + H / 2, x2: b.x, y2: b.y + H / 2, cls: "stroke-accent", thick: false });
  }
  return { nodes, edges, links, width, height };
}

function isAncestor(
  _map: Map<string, TNode>,
  ancestorId: string,
  n: TNode,
  concepts: Map<string, { categoryId: string }>,
  cats: Map<string, { parentId: string | null }>,
) {
  let cur: string | null = concepts.get(n.id)?.categoryId ?? cats.get(n.id)?.parentId ?? null;
  while (cur) {
    if (cur === ancestorId) return true;
    cur = cats.get(cur)?.parentId ?? null;
  }
  return false;
}
