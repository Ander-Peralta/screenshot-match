import { describe, expect, it } from "vitest";
import { bfs, buildGraph, dailySecret, eligibleSecrets, meetingIndex, normalize, pathToSource, shortestPath } from "./graph";

const cats = [
  { id: "fisica", name: "Física", parent_id: null, sort: 0 },
  { id: "a", name: "A", parent_id: "fisica", sort: 1 },
];
const concepts = ["n1", "n2", "n3", "n4", "n5"].map((id) => ({ id, name: id, category_id: "a" }));
// Graph without categories for pure relation tests
const plain = buildGraph(
  [...concepts, { id: "iso", name: "iso", category_id: "zz" }],
  [],
  [
    { source_id: "n1", type_id: "inter", target_id: "n2", context: "" },
    { source_id: "n2", type_id: "inter", target_id: "n3", context: "" },
    { source_id: "n1", type_id: "inter", target_id: "n4", context: "" },
    { source_id: "n4", type_id: "inter", target_id: "n3", context: "" },
    { source_id: "n3", type_id: "inter", target_id: "n5", context: "" },
  ],
);

describe("proximity algorithm", () => {
  it("direct connection has distance 1", () => {
    expect(bfs(plain, "n2").dist.get("n1")).toBe(1);
  });
  it("relations are traversable in both directions", () => {
    expect(shortestPath(plain, "n5", "n1")).toEqual(shortestPath(plain, "n1", "n5")!.slice().reverse());
    expect(bfs(plain, "n5").dist.get("n1")).toBe(3);
  });
  it("multiple intermediaries give the minimum distance", () => {
    expect(shortestPath(plain, "n1", "n5")!.length - 1).toBe(3);
  });
  it("ties resolve deterministically (lowest id first)", () => {
    // n1→n3 via n2 or n4: always n2
    expect(shortestPath(plain, "n1", "n3")).toEqual(["n1", "n2", "n3"]);
    expect(shortestPath(plain, "n1", "n3")).toEqual(["n1", "n2", "n3"]);
  });
  it("disconnected nodes return null", () => {
    expect(pathToSource(bfs(plain, "n1"), "iso")).toBeNull();
  });
  it("category membership links concepts through their branch", () => {
    const g = buildGraph(concepts, cats, []);
    expect(shortestPath(g, "n1", "n5")).toEqual(["n1", "cat:a", "n5"]);
  });
});

describe("game rules", () => {
  it("meeting point is never the secret for distance ≥ 2", () => {
    expect(meetingIndex(1)).toBe(1);
    expect(meetingIndex(2)).toBe(1);
    expect(meetingIndex(5)).toBe(2);
  });
  it("daily secret is the same for the same date", () => {
    const e = ["a", "b", "c", "d", "e", "f", "g"];
    expect(dailySecret(e, "2026-10-30", "s")).toBe(dailySecret(e, "2026-10-30", "s"));
    const days = new Set(Array.from({ length: 30 }, (_, i) => dailySecret(e, `2026-10-${String(i + 1).padStart(2, "0")}`, "s")));
    expect(days.size).toBeGreaterThan(1);
  });
  it("units are never eligible secrets", () => {
    const g = buildGraph(
      [...concepts, { id: "u", name: "u", category_id: "a" }],
      cats,
      ["n1", "n2", "n3"].map((t) => ({ source_id: "u", type_id: "mide", target_id: t, context: "" })),
    );
    expect(eligibleSecrets(g, new Map([["u", "unidad"]]))).not.toContain("u");
  });
  it("search normalization ignores accents and case", () => {
    expect(normalize("Óptica  Geométrica")).toBe("optica geometrica");
  });
});
