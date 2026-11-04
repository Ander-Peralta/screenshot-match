import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import "@lovable.dev/cloud-auth-js/styles.css";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getGuestId, useAuthUser } from "@/lib/game/client";
import { claimGuestProgress } from "@/lib/game/game.functions";

export const Route = createFileRoute("/cuenta")({
  head: () => ({
    meta: [
      { title: "Cuenta — Fisicazoa" },
      { name: "description", content: "Inicia sesión o crea una cuenta para guardar tus rachas y estadísticas en Fisicazoa." },
      { property: "og:title", content: "Cuenta — Fisicazoa" },
      { property: "og:description", content: "Guarda tu progreso en cualquier dispositivo." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, ready } = useAuthUser();
  const qc = useQueryClient();
  const claim = useServerFn(claimGuestProgress);
  const [moving, setMoving] = useState(false);

  if (!ready) return <main className="mx-auto max-w-md px-4 py-16" />;

  if (user)
    return (
      <main className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-3xl">Tu cuenta</h1>
        <p className="mt-2 text-muted-foreground">{user.email}</p>
        <div className="mt-6 space-y-3 rounded-xl border bg-card p-5 shadow-card">
          <p className="text-sm">¿Jugaste antes como visitante en este dispositivo? Pasa esas partidas a tu cuenta.</p>
          <Button
            variant="outline"
            disabled={moving}
            onClick={async () => {
              setMoving(true);
              try {
                const r = await claim({ data: { guestId: getGuestId() } });
                toast.success(r.moved ? `${r.moved} partidas añadidas a tu cuenta.` : "No había partidas de visitante pendientes.");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Error");
              } finally {
                setMoving(false);
              }
            }}
          >
            Importar progreso de visitante
          </Button>
        </div>
        <Button
          className="mt-6"
          variant="ghost"
          onClick={async () => {
            await qc.cancelQueries();
            await supabase.auth.signOut();
            toast("Sesión cerrada.");
          }}
        >
          Cerrar sesión
        </Button>
      </main>
    );

  return <AuthForm onSignedIn={async () => claim({ data: { guestId: getGuestId() } }).catch(() => null)} />;
}

function AuthForm({ onSignedIn }: { onSignedIn: () => Promise<unknown> }) {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "up") {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/cuenta` } });
        if (error) throw error;
        if (!data.session) toast.success("Revisa tu correo para confirmar la cuenta.");
        else await onSignedIn();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await onSignedIn();
        toast.success("¡Bienvenido de vuelta!");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo continuar.");
    } finally {
      setBusy(false);
    }
  };

  const oauth = async (p: "google" | "lovable") => {
    const r = await lovable.auth.signInWithOAuth(p, { redirect_uri: `${window.location.origin}/cuenta` });
    if (r.error) toast.error(r.error.message ?? "No se pudo iniciar sesión.");
    else if (!r.redirected) await onSignedIn();
  };

  return (
    <main className="mx-auto grid max-w-4xl gap-10 px-4 py-12 md:grid-cols-2">
      <div>
        <h1 className="text-3xl">Guarda tu progreso</h1>
        <p className="mt-3 text-muted-foreground">Puedes jugar sin cuenta. Si te registras obtienes:</p>
        <ul className="mt-4 space-y-2 text-sm">
          <li>• Rachas y estadísticas en cualquier dispositivo.</li>
          <li>• Historial completo de desafíos diarios.</li>
          <li>• Tus partidas de visitante en este dispositivo se añaden a tu cuenta.</li>
        </ul>
      </div>
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="mb-4 flex gap-2 text-sm">
          <Button variant={mode === "in" ? "default" : "ghost"} size="sm" onClick={() => setMode("in")}>
            Iniciar sesión
          </Button>
          <Button variant={mode === "up" ? "default" : "ghost"} size="sm" onClick={() => setMode("up")}>
            Crear cuenta
          </Button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label htmlFor="email">Correo</Label>
            <Input id="email" type="email" required maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="pw">Contraseña</Label>
            <Input id="pw" type="password" required minLength={6} maxLength={72} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {mode === "in" ? "Entrar" : "Crear cuenta"}
          </Button>
        </form>
        <div className="my-4 text-center text-xs text-muted-foreground">o</div>
        <div className="space-y-2">
          <Button variant="outline" className="w-full" onClick={() => oauth("google")}>
            Continuar con Google
          </Button>
          <button type="button" className="lovable-auth-button w-full" onClick={() => oauth("lovable")}>
            Continue with Lovable
          </button>
        </div>
      </div>
    </main>
  );
}
