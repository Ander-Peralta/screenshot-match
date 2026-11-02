export type NodeRef = { id: string; name: string; isCategory: boolean; parentId: string | null; kind?: string };

export type GuessView = {
  concept: NodeRef;
  categoryName: string;
  areaName: string;
  distance: number;
  correct: boolean;
  meeting: { node: NodeRef; categoryName: string; description: string; remaining: number } | null;
  route: { node: NodeRef; relToNext: { label: string; context: string } | null }[];
  connection: string;
};

export type HintView = { node: NodeRef; distance: number; kind: "step" | "branch"; description: string };

export type GameView = {
  id: string;
  mode: "daily" | "practice";
  puzzleDate: string | null;
  status: "playing" | "won" | "lost";
  attemptsUsed: number;
  maxAttempts: number;
  hintCost: number;
  canHint: boolean;
  guesses: GuessView[];
  hints: HintView[];
  secret: null | {
    node: NodeRef;
    name: string;
    kind: string;
    definition: string;
    formula: string;
    units: string;
    conditions: string;
    level: string;
    categoryName: string;
    areaName: string;
    related: { name: string; label: string }[];
  };
};

type Summary = {
  played: number;
  won: number;
  winRate: number;
  avgAttempts: number;
  distribution: { label: string; count: number }[];
};

export type StatsView = {
  daily: Summary & { currentStreak: number; bestStreak: number };
  practice: Summary;
  history: { date: string; status: string; attempts: number; answer: string }[];
  signedIn: boolean;
};

export type ConceptIndex = {
  concepts: { id: string; name: string; synonyms: string[]; kind: string; categoryId: string; areaName: string }[];
  categories: { id: string; name: string; parentId: string | null; sort: number }[];
};
