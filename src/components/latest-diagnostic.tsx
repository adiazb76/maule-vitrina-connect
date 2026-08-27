import { useQuery } from "@tanstack/react-query";
import { FileText, History } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function LatestDiagnostic({
  entrepreneurId,
}: {
  entrepreneurId: string;
}) {
  const query = useQuery({
    queryKey: ["latest-diagnostic", entrepreneurId],
    queryFn: async () => {
      const { data, error, count } = await (supabase as any)
        .from("entrepreneur_diagnostics")
        .select("id,score,sector,stage,created_at", { count: "exact" })
        .eq("entrepreneur_id", entrepreneurId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      return {
        latest: data?.[0] ?? null,
        count: count ?? 0,
      };
    },
  });

  if (query.isLoading) {
    return <div className="h-24 animate-pulse rounded-xl bg-muted" />;
  }

  const latest = query.data?.latest;

  return (
    <section className="rounded-xl border border-border bg-secondary/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">DIAGNÓSTICO DEL EMPRENDEDOR</p>
          <h3 className="mt-1 text-sm font-semibold">
            {latest ? `Último resultado: ${latest.score}/100` : "Sin diagnóstico realizado"}
          </h3>

          {latest ? (
            <p className="mt-1 text-[11px] text-muted-foreground">
              {new Intl.DateTimeFormat("es-CL", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).format(new Date(latest.created_at))}
              {" · "}
              {query.data?.count ?? 0} diagnóstico{(query.data?.count ?? 0) === 1 ? "" : "s"} en total
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Realiza tu primer diagnóstico para obtener una hoja de ruta personalizada.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {latest ? (
            <Button asChild size="sm" variant="outline">
              <Link to="/diagnosticos/$id" params={{ id: latest.id }}>
                <FileText className="h-4 w-4" />
                Ver / descargar
              </Link>
            </Button>
          ) : null}

          <Button asChild size="sm">
            <Link to="/diagnostico">
              <History className="h-4 w-4" />
              {latest ? "Nuevo diagnóstico" : "Comenzar"}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
