import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/diagnosticos/$id")({
  head: () => ({
    meta: [
      { title: "Diagnóstico guardado" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: StoredDiagnosticPage,
});

function StoredDiagnosticPage() {
  const { id } = Route.useParams();

  const query = useQuery({
    queryKey: ["stored-diagnostic", id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("entrepreneur_diagnostics")
        .select(`
          id,score,sector,stage,answers,report,created_at,
          entrepreneurs:entrepreneur_id(
            id,business_name,owner_name,slug,
            comunas:comuna_id(name),
            categories:category_id(name)
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (query.isLoading) {
    return <div className="container-page py-10"><div className="h-48 animate-pulse rounded-xl bg-muted" /></div>;
  }

  if (query.isError || !query.data) {
    return (
      <div className="container-page py-10">
        <h1 className="page-title">Diagnóstico no disponible</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No existe, no tienes acceso o fue eliminado.
        </p>
      </div>
    );
  }

  const row: any = query.data;
  const report: any = row.report ?? {};
  const entrepreneur = row.entrepreneurs ?? {};
  const dimensions = (report.dimensions ?? []).slice(0, 8);
  const priorities = (report.priorities ?? []).slice(0, 3);
  const strengths = (report.strengths ?? []).slice(0, 3);
  const opportunities = (report.opportunities ?? []).slice(0, 3);
  const steps = [...(report.priorities ?? []), ...(report.opportunities ?? [])].slice(0, 5);

  const clean = (value: string) =>
    String(value ?? "")
      .replace(/[¿?]/g, "")
      .replace(/^¿/, "");

  const action = (value: string) =>
    String(value ?? "").split("Dónde gestionarlo:")[0].trim();

  const where = (value: string) => {
    const match = String(value ?? "").match(/Dónde gestionarlo:\s*(.*?)(?:\s+Apoyo sugerido:|$)/);
    return match?.[1]?.trim() ?? "";
  };

  return (
    <section className="container-page py-7">
      <style>{`
        @page { size:A4 portrait; margin:8mm; }
        @media print {
          header, footer, .no-print { display:none !important; }
          .stored-report { max-width:none !important; font-size:9px !important; }
          .stored-page { page-break-after:always !important; break-after:page !important; }
          .stored-page:last-child { page-break-after:auto !important; break-after:auto !important; }
          .stored-report section, .stored-report article { break-inside:avoid !important; }
        }
      `}</style>

      <div className="no-print mb-4 flex flex-wrap justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={() => history.back()}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Download className="h-4 w-4" /> Descargar PDF
        </Button>
      </div>

      <div className="stored-report mx-auto max-w-5xl">
        <div className="stored-page">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div>
              <p className="eyebrow">RESULTADO</p>
              <h1 className="mt-1 page-title">Diagnóstico del Emprendedor</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {entrepreneur.categories?.name ?? row.sector ?? "Emprendimiento"}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-secondary/15 px-5 py-3 text-right">
              <p className="text-[9px] font-semibold uppercase text-muted-foreground">Índice orientativo</p>
              <p className="font-display text-4xl font-semibold">{row.score}<span className="text-sm text-muted-foreground">/100</span></p>
            </div>
          </div>

          <section className="mt-3 rounded-xl border border-border bg-card p-3">
            <p className="eyebrow">IDENTIFICACIÓN DEL EMPRENDIMIENTO</p>
            <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10px] sm:grid-cols-3">
              <p><b>Emprendimiento:</b> {entrepreneur.business_name ?? "No informado"}</p>
              <p><b>Responsable:</b> {entrepreneur.owner_name ?? "No informado"}</p>
              <p><b>Rubro:</b> {entrepreneur.categories?.name ?? row.sector ?? "No informado"}</p>
              <p><b>Comuna:</b> {entrepreneur.comunas?.name ?? "No informada"}</p>
              <p><b>Etapa:</b> {row.stage ?? "No informada"}</p>
              <p><b>Fecha:</b> {new Intl.DateTimeFormat("es-CL").format(new Date(row.created_at))}</p>
            </div>
          </section>

          <section className="mt-3 rounded-xl border border-border bg-secondary/15 p-4">
            <p className="eyebrow">LECTURA EJECUTIVA</p>
            <p className="mt-2 text-[11px] leading-relaxed">
              Este resultado resume el estado del emprendimiento al momento de realizar el diagnóstico.
              Reconoce las fortalezas existentes y concentra la atención en las brechas y oportunidades
              que pueden generar mayor impacto en su orden, rentabilidad y capacidad de crecimiento.
            </p>
          </section>

          <section className="mt-3 grid gap-3 md:grid-cols-2">
            <article className="rounded-xl border border-border bg-card p-4">
              <p className="eyebrow">FORTALEZAS</p>
              <div className="mt-2 space-y-2">
                {strengths.map((s:any,i:number)=><p key={i} className="text-[10px] leading-relaxed">✓ {String(s)}</p>)}
              </div>
            </article>
            <article className="rounded-xl border border-border bg-card p-4">
              <p className="eyebrow">OPORTUNIDADES Y BRECHAS</p>
              <div className="mt-2 space-y-2">
                {[...priorities,...opportunities].slice(0,3).map((item:any,i:number)=>(
                  <div key={i}>
                    <p className="text-[11px] font-semibold">{i+1}. {clean(item.title)}</p>
                    <p className="text-[10px] text-muted-foreground">{action(item.detail)}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {dimensions.map((d:any)=>(
              <div key={d.name} className="rounded-lg border border-border bg-card px-2 py-2">
                <div className="flex justify-between gap-2 text-[9px]">
                  <span className="truncate font-medium">{d.name}</span>
                  <b>{d.score}%</b>
                </div>
              </div>
            ))}
          </section>
        </div>

        <div className="stored-page">
          <section className="rounded-xl border border-border bg-card p-5">
            <p className="eyebrow">PASO A PASO</p>
            <h2 className="mt-1 section-title">Qué hacer ahora</h2>
            <div className="mt-4 space-y-2.5">
              {steps.map((item:any,i:number)=>(
                <div key={i} className="rounded-lg border border-border bg-background p-3">
                  <p className="text-xs font-semibold">{i+1}. {clean(item.title)}</p>
                  <p className="mt-1 text-[11px]">{action(item.detail)}</p>
                  {where(item.detail) ? <p className="mt-1 text-[10px] text-muted-foreground"><b>Dónde:</b> {where(item.detail)}</p> : null}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="stored-page">
          <section className="rounded-xl border border-border bg-card p-5">
            <p className="eyebrow">HOJA DE RUTA</p>
            <h2 className="mt-1 section-title">De ordenar a crecer</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-border p-3"><b>0–30 días</b><p className="mt-1 text-[10px]">Resolver las prioridades habilitantes y dejar responsables y fechas definidas.</p></div>
              <div className="rounded-lg border border-border p-3"><b>31–60 días</b><p className="mt-1 text-[10px]">Medir ventas, costos, clientes y operación para conocer el avance real.</p></div>
              <div className="rounded-lg border border-border p-3"><b>61–90 días</b><p className="mt-1 text-[10px]">Evaluar crecimiento con demanda, capacidad, caja y brechas críticas controladas.</p></div>
            </div>
          </section>

          <section className="mt-4 rounded-xl border border-border bg-secondary/15 p-5">
            <p className="eyebrow">MENSAJE FINAL</p>
            <h2 className="mt-1 section-title">Avanza paso a paso.</h2>
            <p className="mt-2 text-xs leading-relaxed">
              Cada mejora fortalece tu emprendimiento y te acerca a un negocio más ordenado,
              rentable, sostenible y preparado para crecer.
            </p>
          </section>

          <section className="mt-4 border-t border-border pt-3 text-[9px] text-muted-foreground">
            <p>Herramienta de orientación. Los requisitos regulatorios deben validarse ante el organismo competente.</p>
            <p className="mt-2"><b>Metodología y desarrollo:</b> Álvaro Díaz Barros · <b>Asistencia tecnológica:</b> Inteligencia Artificial</p>
          </section>
        </div>
      </div>
    </section>
  );
}
