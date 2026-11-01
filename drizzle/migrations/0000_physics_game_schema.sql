CREATE TABLE public.categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  parent_id text REFERENCES public.categories(id),
  sort int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.relation_types (
  id text PRIMARY KEY,
  label text NOT NULL,
  inverse_label text NOT NULL
);
GRANT SELECT ON public.relation_types TO anon, authenticated;
GRANT ALL ON public.relation_types TO service_role;
ALTER TABLE public.relation_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "relation types public read" ON public.relation_types FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.concepts (
  id text PRIMARY KEY,
  name text NOT NULL,
  kind text NOT NULL,
  category_id text NOT NULL REFERENCES public.categories(id),
  definition text NOT NULL,
  formula text NOT NULL DEFAULT '',
  units text NOT NULL DEFAULT '',
  synonyms text[] NOT NULL DEFAULT '{}',
  conditions text NOT NULL DEFAULT '',
  level text NOT NULL DEFAULT 'basico'
);
GRANT SELECT ON public.concepts TO anon, authenticated;
GRANT ALL ON public.concepts TO service_role;
ALTER TABLE public.concepts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "concepts public read" ON public.concepts FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.relations (
  id serial PRIMARY KEY,
  source_id text NOT NULL REFERENCES public.concepts(id),
  type_id text NOT NULL REFERENCES public.relation_types(id),
  target_id text NOT NULL REFERENCES public.concepts(id),
  context text NOT NULL DEFAULT '',
  UNIQUE (source_id, type_id, target_id)
);
GRANT SELECT ON public.relations TO anon, authenticated;
GRANT ALL ON public.relations TO service_role;
ALTER TABLE public.relations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "relations public read" ON public.relations FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.app_secrets (
  key text PRIMARY KEY,
  value text NOT NULL
);
GRANT ALL ON public.app_secrets TO service_role;
ALTER TABLE public.app_secrets ENABLE ROW LEVEL SECURITY;
INSERT INTO public.app_secrets(key, value) VALUES ('daily_salt', encode(extensions.gen_random_bytes(24), 'hex'));

CREATE TABLE public.games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  guest_id uuid,
  mode text NOT NULL CHECK (mode IN ('daily','practice')),
  puzzle_date date,
  secret_id text NOT NULL REFERENCES public.concepts(id),
  guesses jsonb NOT NULL DEFAULT '[]',
  hints jsonb NOT NULL DEFAULT '[]',
  attempts_used int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'playing' CHECK (status IN ('playing','won','lost')),
  created_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  CHECK (user_id IS NOT NULL OR guest_id IS NOT NULL)
);
GRANT ALL ON public.games TO service_role;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX games_daily_user ON public.games(user_id, puzzle_date) WHERE mode = 'daily' AND user_id IS NOT NULL;
CREATE UNIQUE INDEX games_daily_guest ON public.games(guest_id, puzzle_date) WHERE mode = 'daily' AND user_id IS NULL;
CREATE INDEX games_user ON public.games(user_id, created_at DESC);
CREATE INDEX games_guest ON public.games(guest_id, created_at DESC);