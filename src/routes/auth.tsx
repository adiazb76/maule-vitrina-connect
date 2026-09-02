import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Ingresar o crear cuenta — La Vitrina Conecta" },
      {
        name: "description",
        content:
          "Accede a tu cuenta de La Vitrina Conecta para publicar y administrar tu emprendimiento del Maule Sur.",
      },
      { property: "og:title", content: "Ingresar a La Vitrina Conecta" },
      {
        property: "og:description",
        content:
          "Inicia sesión o crea tu cuenta para sumarte a la comunidad del Maule Sur.",
      },
    ],
  }),
  component: AuthPage,
});

const COMMUNITY_RULES_VERSION = "1.0";
const PRIVACY_VERSION = "1.0";

const COMMUNITY_RULES_TEXT =
  "Me comprometo a entregar información veraz, respetar a otros usuarios y no publicar contenido ofensivo, engañoso, ilegal o ajeno al propósito de La Vitrina Conecta. Entiendo que La Vitrina Conecta puede moderar o retirar contenido que incumpla estas normas.";

const PRIVACY_TEXT =
  "Autorizo a La Vitrina Conecta a tratar los datos que entrego para gestionar mi registro, publicar mi perfil cuando corresponda, facilitar el contacto y administrar los servicios de la plataforma. Declaro haber sido informado del uso de mis datos y de mis derechos sobre ellos.";

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const [rulesOpen, setRulesOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/panel", replace: true });
  }, [loading, user, navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("¡Bienvenido de vuelta!");
    navigate({ to: "/panel" });
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    if (!rulesAccepted || !privacyAccepted) {
      toast.error(
        "Debes aceptar las normas y autorizar el tratamiento de tus datos.",
      );
      return;
    }

    setBusy(true);

    const acceptedAt = new Date().toISOString();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/panel`,
        data: {
          full_name: name,
          community_rules_accepted: true,
          community_rules_version: COMMUNITY_RULES_VERSION,
          community_rules_accepted_at: acceptedAt,
          privacy_accepted: true,
          privacy_version: PRIVACY_VERSION,
          privacy_accepted_at: acceptedAt,
        },
      },
    });

    setBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Cuenta creada. Revisa tu correo si te pedimos confirmación.");
    navigate({ to: "/panel" });
  }

  return (
    <section className="container-page flex justify-center py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <p className="eyebrow">Comunidad</p>

        <h1 className="mt-2 font-display text-3xl font-semibold">
          Ingresa a La Vitrina Conecta
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Publica tu emprendimiento, revisa tus visitas y conecta con otros del
          Maule Sur.
        </p>

        <Tabs defaultValue="in" className="mt-6">
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

              <div className="text-right">
                <Link
                  to="/recuperar"
                  className="text-xs text-primary underline-offset-4 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
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

              <div className="space-y-2">
                <Label htmlFor="pass-confirm-up">Confirmar contraseña</Label>
                <Input
                  id="pass-confirm-up"
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="space-y-3 rounded-xl border border-border bg-secondary/10 p-4">
                <div>
                  <p className="text-sm font-medium">Normas de convivencia</p>

                  <div className="mt-2 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setRulesOpen((value) => !value)}
                    >
                      {rulesOpen ? "Ocultar normas" : "Leer normas"}
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant={rulesAccepted ? "default" : "outline"}
                      onClick={() => setRulesAccepted((value) => !value)}
                    >
                      {rulesAccepted ? "Aceptado" : "Acepto"}
                    </Button>
                  </div>

                  {rulesOpen ? (
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                      {COMMUNITY_RULES_TEXT}
                    </p>
                  ) : null}
                </div>

                <div className="border-t border-border pt-3">
                  <p className="text-sm font-medium">
                    Privacidad y datos personales
                  </p>

                  <div className="mt-2 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPrivacyOpen((value) => !value)}
                    >
                      {privacyOpen ? "Ocultar política" : "Leer política"}
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant={privacyAccepted ? "default" : "outline"}
                      onClick={() => setPrivacyAccepted((value) => !value)}
                    >
                      {privacyAccepted ? "Autorizado" : "Autorizo"}
                    </Button>
                  </div>

                  {privacyOpen ? (
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                      {PRIVACY_TEXT}
                    </p>
                  ) : null}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={busy || !rulesAccepted || !privacyAccepted}
              >
                {busy ? "Creando…" : "Crear cuenta"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          ¿Aún no tienes emprendimiento publicado?{" "}
          <Link
            to="/sumate"
            className="text-primary underline-offset-4 hover:underline"
          >
            Súmate aquí
          </Link>
        </p>
      </div>
    </section>
  );
}
