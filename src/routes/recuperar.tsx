import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/recuperar")({
  head: () => ({
    meta: [
      { title: "Recuperar contraseña — La Vitrina Conecta" },
      {
        name: "description",
        content:
          "Recupera el acceso a tu cuenta de La Vitrina Conecta.",
      },
    ],
  }),
  component: RecuperarPage,
});

function RecuperarPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const [recoveryMode, setRecoveryMode] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;

    if (
      hash.includes("type=recovery") ||
      search.includes("type=recovery")
    ) {
      setRecoveryMode(true);
    }

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryMode(true);
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  async function sendRecovery(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Ingresa tu correo.");
      return;
    }

    setBusy(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/recuperar`,
      },
    );

    setBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(
      "Te enviamos un correo para recuperar tu contraseña.",
    );
  }

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    setBusy(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Contraseña actualizada correctamente.");

    navigate({
      to: "/panel",
      replace: true,
    });
  }

  return (
    <section className="container-page flex justify-center py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <p className="eyebrow">Cuenta</p>

        <h1 className="mt-2 font-display text-3xl font-semibold">
          {recoveryMode ? "Nueva contraseña" : "Recuperar contraseña"}
        </h1>

        {recoveryMode ? (
          <form className="mt-6 space-y-4" onSubmit={updatePassword}>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva contraseña</Label>
              <Input
                id="new-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">
                Confirmar contraseña
              </Label>
              <Input
                id="confirm-new-password"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Guardando…" : "Guardar nueva contraseña"}
            </Button>
          </form>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
            </p>

            <form className="mt-6 space-y-4" onSubmit={sendRecovery}>
              <div className="space-y-2">
                <Label htmlFor="recovery-email">Correo</Label>
                <Input
                  id="recovery-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Enviando…" : "Enviar enlace de recuperación"}
              </Button>
            </form>

            <div className="mt-5 text-center">
              <Link
                to="/auth"
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Volver a ingresar
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
