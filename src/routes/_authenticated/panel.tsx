import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, MessageCircle, Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useIsAdmin } from "@/hooks/use-auth";
import type { Entrepreneur } from "@/lib/vitrina";

export const Route = createFileRoute("/_authenticated/panel")({
  head: () => ({
    meta: [
      { title: "Mi panel — La Vitrina" },
      {
        name: "description",
        content:
          "Revisa el estado, las visitas y los contactos de tu emprendimiento en La Vitrina.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PanelPage,
});

const STATUS_LABEL: Record<string, string> = {
  pendiente: "En revisión",
  aprobado: "Publicado",
  rechazado: "Necesita cambios",
};

function PanelPage() {
  const { user } = useAuth();
  const isAdmin = useIsAdmin(user?.id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mine = useQuery({
    queryKey: ["my-entrepreneurs", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entrepreneurs")
        .select(
          "*, categories:category_id(name,slug), comunas:comuna_id(name,slug)",
        )
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data ?? []) as unknown as Entrepreneur[];
    },
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const totals = (mine.data ?? []).reduce(
    (acc, e) => ({
      views: acc.views + e.views,
      contacts: acc.contacts + e.contacts,
    }),
    { views: 0, contacts: 0 },
  );

  return (
    <section className="container-page py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Mi panel</p>

          <h1 className="mt-2 font-display text-3xl font-semibold">
            Hola{user?.email ? `, ${user.email.split("@")[0]}` : ""}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          {isAdmin ? (
            <Button asChild variant="outline">
              <Link to="/admin">Administración</Link>
            </Button>
          ) : null}

          <Button asChild>
            <Link to="/sumate">
              <Plus className="h-4 w-4" />
              Nuevo emprendimiento
            </Link>
          </Button>

          <Button variant="ghost" onClick={signOut}>
            Cerrar sesión
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat
          label="Emprendimientos"
          value={mine.data?.length ?? 0}
        />
        <Stat label="Visitas totales" value={totals.views} />
        <Stat label="Contactos" value={totals.contacts} />
      </div>

      <div className="mt-10 space-y-4">
        {mine.isLoading ? (
          <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        ) : (mine.data?.length ?? 0) === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="font-display text-xl">
              Todavía no publicas tu emprendimiento
            </p>

            <Button asChild className="mt-5">
              <Link to="/sumate">Publicar ahora</Link>
            </Button>
          </div>
        ) : (
          mine.data?.map((e) => (
            <article
              key={e.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl font-semibold">
                    {e.business_name}
                  </h2>

                  <Badge
                    variant={
                      e.status === "aprobado"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {STATUS_LABEL[e.status]}
                  </Badge>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  {e.short_description}
                </p>

                <p className="mt-2 flex gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {e.views} visitas
                  </span>

                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {e.contacts} contactos
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                >
                  <Link
                    to="/editar/$id"
                    params={{ id: e.id }}
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Link>
                </Button>

                {e.status === "aprobado" ? (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                  >
                    <Link
                      to="/emprendedores/$slug"
                      params={{ slug: e.slug }}
                    >
                      Ver perfil público
                    </Link>
                  </Button>
                ) : null}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 font-display text-3xl font-semibold">
        {value}
      </p>
    </div>
  );
}