import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";

import {
  BarChart3,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

export const Route =
  createFileRoute(
    "/diagnostico",
  )({
    head: () => ({
      meta: [
        {
          title:
            "Diagnóstico del Emprendedor | La Vitrina",
        },

        {
          name:
            "description",

          content:
            "Evalúa las principales áreas de tu emprendimiento y descubre tus fortalezas y prioridades.",
        },
      ],
    }),

    component:
      DiagnosticoPage,
  });

function DiagnosticoPage() {
  return (
    <>
      {/* CABECERA */}

      <section className="border-b border-border bg-surface">
        <div className="container-page py-7 sm:py-8">
          <p className="eyebrow">
            LA VITRINA
          </p>

          <h1 className="mt-1 page-title">
            Diagnóstico del Emprendedor
          </h1>

          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Una mirada simple y práctica para entender cómo está tu emprendimiento
            y dónde conviene concentrar tus próximos esfuerzos.
          </p>
        </div>
      </section>

      {/* CONTENIDO */}

      <section className="container-page py-7 sm:py-8">
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          {/* DIAGNÓSTICO */}

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary">
                <BarChart3 className="h-4.5 w-4.5 text-primary" />
              </div>

              <div>
                <h2 className="section-title">
                  ¿Cómo está tu emprendimiento?
                </h2>

                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  El diagnóstico evaluará cinco dimensiones principales.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              <Dimension
                title="Comercial"
                text="Clientes, ventas y propuesta de valor."
              />

              <Dimension
                title="Finanzas"
                text="Costos, margen y control."
              />

              <Dimension
                title="Digital"
                text="Presencia y canales."
              />

              <Dimension
                title="Gestión"
                text="Orden, planificación y seguimiento."
              />

              <Dimension
                title="Formalización"
                text="Aspectos básicos para operar."
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                size="sm"
                disabled
              >
                Comenzar diagnóstico
              </Button>

              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" />
                Aproximadamente 3 minutos
              </span>
            </div>
          </div>

          {/* RESULTADO */}

          <div className="rounded-xl border border-border bg-secondary/15 p-5">
            <p className="eyebrow">
              TU RESULTADO
            </p>

            <h2 className="mt-1 section-title">
              Al terminar conocerás
            </h2>

            <div className="mt-4 space-y-3">
              <Result text="Tu nivel general de desarrollo." />

              <Result text="Tus principales fortalezas." />

              <Result text="Las áreas donde tienes mayores brechas." />

              <Result text="Tres prioridades concretas para avanzar." />
            </div>

            <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
              Estamos preparando esta herramienta para incorporarla próximamente
              a La Vitrina.
            </p>
          </div>
        </div>

        {/* RETORNO */}

        <div className="mt-5">
          <Link
            to="/educa"
            className="text-xs font-medium text-muted-foreground hover:text-primary"
          >
            ← Volver a La Vitrina Educa
          </Link>
        </div>
      </section>
    </>
  );
}

function Dimension({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3.5">
      <p className="text-sm font-semibold">
        {title}
      </p>

      <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
        {text}
      </p>
    </div>
  );
}

function Result({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex gap-2.5">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

      <p className="text-xs leading-relaxed">
        {text}
      </p>
    </div>
  );
}