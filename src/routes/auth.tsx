import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Ingresar o crear cuenta — La Vitrina" },
      {
        name: "description",
        content:
          "Accede a tu cuenta de La Vitrina para publicar y administrar tu emprendimiento del Maule Sur.",
      },
      { property: "og:title", content: "Ingresar a La Vitrina" },
      {
        property: "og:description",
        content: "Inicia sesión o crea tu cuenta para sumarte a la comunidad del Maule Sur.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/panel", replace: true });
  }, [loading, user, navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("¡Bienvenido de vuelta!");
    navigate({ to: "/panel" });
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/panel`,
        data: { full_name: name },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Cuenta creada. Revisa tu correo si te pedimos confirmación.");
  }

  async function google() {
    try {
      await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No pudimos iniciar sesión con Google");
    }
  }

  return (
    <section className="container-page flex justify-center py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <p className="eyebrow">Comunidad</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">Ingresa a La Vitrina</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Publica tu emprendimiento, revisa tus visitas y conecta con otros del Maule Sur.
        </p>

        <Button variant="outline" className="mt-6 w-full" onClick={google}>
          Continuar con Google
        </Button>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> o con tu correo
          <span className="h-px flex-1 bg-border" />
        </div>

        <Tabs defaultValue="in">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="in">Ingresar</TabsTrigger>
            <TabsTrigger value="up">Crear cuenta</TabsTrigger>
          </TabsList>

          <TabsContent value="in">
            <form className="mt-4 space-y-4" onSubmit={signIn}>
              <div className="space-y-2">
                <Label htmlFor="email-in">Correo</Label>
                <Input
                  id="email-in"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pass-in">Contraseña</Label>
                <Input
                  id="pass-in"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Ingresando…" : "Ingresar"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="up">
            <form className="mt-4 space-y-4" onSubmit={signUp}>
              <div className="space-y-2">
                <Label htmlFor="name-up">Tu nombre</Label>
                <Input
                  id="name-up"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-up">Correo</Label>
                <Input
                  id="email-up"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pass-up">Contraseña</Label>
                <Input
                  id="pass-up"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Creando…" : "Crear cuenta"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          ¿Aún no tienes emprendimiento publicado?{" "}
          <Link to="/sumate" className="text-primary underline-offset-4 hover:underline">
            Súmate aquí
          </Link>
        </p>
      </div>
    </section>
  );
}
