import { Link } from "@tanstack/react-router";
import { useAuthUser } from "@/lib/game/client";

const links = [
  { to: "/diario", label: "Diario" },
  { to: "/practica", label: "Práctica" },
  { to: "/estadisticas", label: "Estadísticas" },
  { to: "/reglas", label: "Reglas" },
] as const;

export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="16" r="3" className="fill-primary" />
      <ellipse cx="16" cy="16" rx="13" ry="5" fill="none" className="stroke-primary" strokeWidth="1.6" />
      <ellipse cx="16" cy="16" rx="13" ry="5" fill="none" className="stroke-accent" strokeWidth="1.6" transform="rotate(60 16 16)" />
      <ellipse cx="16" cy="16" rx="13" ry="5" fill="none" className="stroke-node-sub" strokeWidth="1.6" transform="rotate(120 16 16)" />
    </svg>
  );
}

export function SiteHeader() {
  const { user } = useAuthUser();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <Logo className="h-7 w-7" />
          <span className="font-display text-xl font-semibold text-primary">Fisicazoa</span>
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto text-sm">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-2.5 py-1.5 text-muted-foreground hover:text-foreground"
              activeProps={{ className: "rounded-md px-2.5 py-1.5 bg-secondary text-foreground font-medium" }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/cuenta"
            className="ml-1 rounded-md border px-2.5 py-1.5 text-foreground hover:bg-secondary"
            activeProps={{ className: "ml-1 rounded-md border px-2.5 py-1.5 bg-secondary font-medium" }}
          >
            {user ? "Cuenta" : "Entrar"}
          </Link>
        </nav>
      </div>
    </header>
  );
}
