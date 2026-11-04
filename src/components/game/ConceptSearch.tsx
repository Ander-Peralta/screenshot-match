import { useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { normalize } from "@/lib/game/graph";
import type { ConceptIndex } from "@/lib/game/types";

type Item = ConceptIndex["concepts"][number];

export function ConceptSearch({
  concepts,
  used,
  disabled,
  onPick,
}: {
  concepts: Item[];
  used: Set<string>;
  disabled?: boolean;
  onPick: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const index = useMemo(
    () => concepts.map((c) => ({ c, keys: [c.name, ...c.synonyms].map(normalize) })),
    [concepts],
  );

  const results = useMemo(() => {
    const n = normalize(q);
    if (!n) return [];
    const scored: { c: Item; score: number; syn: string | undefined }[] = [];
    for (const { c, keys } of index) {
      let best = -1;
      let syn: string | undefined;
      keys.forEach((k, i) => {
        let s = -1;
        if (k === n) s = 100;
        else if (k.startsWith(n)) s = 80;
        else if (k.split(" ").some((w) => w.startsWith(n))) s = 60;
        else if (k.includes(n)) s = 40;
        if (s > best) {
          best = s;
          syn = i > 0 ? c.synonyms[i - 1] : undefined;
        }
      });
      if (best >= 0) scored.push({ c, score: best - (syn ? 5 : 0), syn });
    }
    return scored.sort((a, b) => b.score - a.score || a.c.name.localeCompare(b.c.name)).slice(0, 8);
  }, [q, index]);

  const pick = (it: Item) => {
    if (used.has(it.id)) return;
    onPick(it.id);
    setQ("");
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-lg border-2 border-primary/30 bg-paper px-3 shadow-node focus-within:border-primary">
        <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
        <input
          ref={inputRef}
          value={q}
          disabled={disabled}
          aria-label="Buscar concepto físico"
          placeholder={disabled ? "Partida terminada" : "Escribe un concepto, ley, fenómeno…"}
          className="h-12 w-full bg-transparent font-mono text-base outline-none placeholder:text-muted-foreground/70 disabled:cursor-not-allowed"
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter" && results[active]) {
              e.preventDefault();
              pick(results[active].c);
            } else if (e.key === "Escape") setOpen(false);
          }}
        />
      </div>
      {open && q && (
        <ul role="listbox" className="absolute z-30 mt-1 max-h-80 w-full overflow-auto rounded-lg border bg-popover p-1 shadow-card">
          {results.length === 0 && (
            <li className="px-3 py-3 text-sm text-muted-foreground">No está en el banco de conceptos. Prueba otro nombre o sinónimo.</li>
          )}
          {results.map((r, i) => {
            const isUsed = used.has(r.c.id);
            return (
              <li
                key={r.c.id}
                role="option"
                aria-selected={i === active}
                aria-disabled={isUsed}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(r.c);
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-baseline justify-between gap-3 rounded-md px-3 py-2 ${
                  i === active ? "bg-secondary" : ""
                } ${isUsed ? "cursor-not-allowed opacity-45" : ""}`}
              >
                <span className="font-mono text-sm">
                  {r.c.name}
                  {r.syn && <span className="ml-2 text-xs text-muted-foreground">({r.syn})</span>}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">{isUsed ? "ya probado" : r.c.areaName}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
