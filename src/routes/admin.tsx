import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useIsAdmin } from "@/hooks/use-auth";
import type { Entrepreneur } from "@/lib/vitrina";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { user, loading } = useAuth();
  const isAdmin = useIsAdmin(user?.id);
  const queryClient = useQueryClient();

  const pending = useQuery({
    queryKey: ["admin-pending"],
    enabled: Boolean(isAdmin),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entrepreneurs")
        .select(
          "*, categories:category_id(name,slug), comunas:comuna_id(name,slug)",
        )
        .eq("status", "pendiente")
        .order("created_at", { ascending: true });

      if (error) throw error;

      return (data ?? []) as unknown as Entrepreneur[];
    },
  });

  async function updateStatus(
    id: string,
    status: "aprobado" | "rechazado",
  ) {
    const { error } = await supabase
      .from("entrepreneurs")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(
      status === "aprobado"
        ? "Emprendimiento aprobado y publicado."
        : "Emprendimiento rechazado.",
    );

    queryClient.invalidateQueries({ queryKey: ["admin-pending"] });
    queryClient.invalidateQueries({ queryKey: ["entrepreneurs"] });
    queryClient.invalidateQueries({ queryKey: ["my-entrepreneurs"] });
  }

  if (loading) {
    return (
      <section className="container-page py-16">
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
      </section>
    );
  }

  if (!user || !isAdmin) {
    return (
      <section className="container-page py-20 text-center">
        <h1 className="font-display text-3xl font-semibold">
          Acceso restringido
        </h1>

        <p className="mt-3 text-muted-foreground">
          Esta sección es sólo para administradores.
        </p>

        <Button asChild className="mt-6">
          <Link to="/panel">Volver a mi panel</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="container-page py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            to="/panel"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al panel
          </Link>

          <p className="eyebrow mt-6">Administración</p>

          <h1 className="mt-2 font-display text-3xl font-semibold">
            Emprendimientos pendientes
          </h1>

          <p className="mt-2 text-muted-foreground">
            Revisa las solicitudes antes de publicarlas en La Vitrina.
          </p>
        </div>

        <Badge variant="secondary">
          {pending.data?.length ?? 0} pendientes
        </Badge>
      </div>

      <div className="mt-10 space-y-5">
        {pending.isLoading ? (
          <>
            <div className="h-48 animate-pulse rounded-2xl bg-muted" />
            <div className="h-48 animate-pulse rounded-2xl bg-muted" />
          </>
        ) : pending.data?.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="font-display text-xl font-semibold">
              No hay solicitudes pendientes
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Todos los emprendimientos han sido revisados.
            </p>
          </div>
        ) : (
          pending.data.map((e) => (
            <article
              key={e.id}
              className="rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <div className="flex flex-col gap-6 lg:flex-row">
                {e.photo_url ? (
                  <img
                    src={e.photo_url}
                    alt={e.business_name}
                    className="h-48 w-full rounded-xl object-cover lg:w-64"
                  />
                ) : null}

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                      {e.categories?.name ?? "Sin categoría"}
                    </Badge>

                    <span className="text-sm text-muted-foreground">
                      {e.comunas?.name ?? "Sin comuna"}
                    </span>
                  </div>

                  <h2 className="mt-3 font-display text-2xl font-semibold">
                    {e.business_name}
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Por {e.owner_name}
                  </p>

                  <p className="mt-4 text-sm text-foreground/85">
                    {e.short_description}
                  </p>

                  {e.about ? (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Historia
                      </p>
                      <p className="mt-1 whitespace-pre-line text-sm">
                        {e.about}
                      </p>
                    </div>
                  ) : null}

                  {e.value_prop ? (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Diferenciación
                      </p>
                      <p className="mt-1 text-sm">{e.value_prop}</p>
                    </div>
                  ) : null}

                  <div className="mt-6 flex flex-wrap gap-2">
                    <Button
                      variant="whatsapp"
                      onClick={() => updateStatus(e.id, "aprobado")}
                    >
                      <Check className="h-4 w-4" />
                      Aprobar y publicar
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => updateStatus(e.id, "rechazado")}
                    >
                      <X className="h-4 w-4" />
                      Rechazar
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}