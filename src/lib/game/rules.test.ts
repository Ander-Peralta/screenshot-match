import { describe, expect, it } from "vitest";
import { buildGraph } from "./graph";
import { computeHint, streaks } from "./game.server";

const cats = [
  { id: "fisica", name: "Física", parent_id: null, sort: 0 },
  { id: "a", name: "A", parent_id: "fisica", sort: 1 },
  { id: "a1", name: "A1", parent_id: "a", sort: 1 },
  { id: "b", name: "B", parent_id: "fisica", sort: 2 },
  { id: "b1", name: "B1", parent_id: "b", sort: 1 },
];
const g = buildGraph(
  [
    { id: "s", name: "S", category_id: "a1" },
    { id: "x", name: "X", category_id: "b1" },
    { id: "y", name: "Y", category_id: "b1" },
  ],
  cats,
  [{ source_id: "x", type_id: "inter", target_id: "s", context: "" }],
);

describe("hints", () => {
  it("reveal the next node from the closest guess, never the secret", () => {
    // y → cat:b1 → x → s ; closest known is y (3)
    const h = computeHint(g, "s", [{ id: "y", distance: 3 }], new Set(["y"]), "cat:a1", "cat:a");
    expect(h).toEqual({ nodeId: "cat:b1", distance: 2, kind: "step" });
  });
  it("reveal the secret's branch when only the secret is left", () => {
    const h = computeHint(g, "s", [{ id: "x", distance: 1 }], new Set(["x"]), "cat:a1", "cat:a");
    expect(h?.kind).toBe("branch");
    expect(h?.nodeId).not.toBe("s");
  });
});

describe("streaks", () => {
  it("count consecutive won days ending today or yesterday", () => {
    expect(streaks(["2026-10-28", "2026-10-29", "2026-10-30"], "2026-10-30")).toEqual({ current: 3, best: 3 });
    expect(streaks(["2026-10-25", "2026-10-29"], "2026-10-30")).toEqual({ current: 1, best: 1 });
    expect(streaks(["2026-10-20", "2026-10-21"], "2026-10-30").current).toBe(0);
  });
});
