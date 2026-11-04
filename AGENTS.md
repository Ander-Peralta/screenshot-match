<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Game secrets (daily salt, games.secret_id) are read only in `src/lib/game/game.server.ts` via the service client; the games and app_secrets tables have no anon/authenticated grants, so answers never reach the browser.
- Proximity logic lives in pure `src/lib/game/graph.ts` (BFS, deterministic tie-break by sorted neighbour ids) and is unit-tested; categories are graph nodes (`cat:<id>`) linked by "pertenece".
- The physics knowledge base source is `scripts/kb/data.py`; `scripts/kb/gen.py` produces the SQL inserts. Extend the base there, not in app code.
- Guests are identified by a random UUID in localStorage; signed-in users by the bearer token checked in `resolveOwner`.
