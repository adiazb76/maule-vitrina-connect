import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/diagnostico")({
  head: () => ({
    meta: [
      {
        title: "Diagnóstico del Emprendedor | La Vitrina",
      },
      {
        name: "description",
        content:
          "Evalúa las principales áreas de tu emprendimiento y descubre tus fortalezas y prioridades.",
      },
    ],
  }),

  component: DiagnosticoPage,
});

function DiagnosticoPage() {
  return (
    <>
      <section className="border-b border-border bg-surface">
        <div className="container-page py-9 sm:py-12">
          <p className="eyebrow">
            LA VITRINA
          </p>

          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Diagnóstico del Emprendedor
          </h1>

          <p className="mt-3 max-w-2xl text-muted-foreground">
            Una mirada simple y práctica para entender cómo está tu emprendimiento y dónde conviene concentrar tus próximos esfuerzos.
          </p>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-border bg-card p-7">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-secondary">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>

              <div>
                <h2 className="font-display text-2xl font-semibold">
                  ¿Cómo está tu emprendimiento?
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  El diagnóstico evaluará cinco dimensiones principales.
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
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

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                disabled
              >
                Comenzar diagnóstico
              </Button>

              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock3 className="h-4 w-4" />
                Aproximadamente 3 minutos
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-secondary/20 p-7">
            <p className="eyebrow">
              TU RESULTADO
            </p>

            <h2 className="mt-1 font-display text-xl font-semibold">
              Al terminar conocerás
            </h2>

            <div className="mt-6 space-y-5">
              <Result text="Tu nivel general de desarrollo." />

              <Result text="Tus principales fortalezas." />

              <Result text="Las áreas donde tienes mayores brechas." />

              <Result text="Tres prioridades concretas para avanzar." />
            </div>

            <p className="mt-7 text-sm text-muted-foreground">
              Estamos preparando esta herramienta para incorporarla próximamente a La Vitrina.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <Button
            asChild
            variant="outline"
          >
            <Link to="/educa">
              Volver a La Vitrina Educa
            </Link>
          </Button>
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
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="font-semibold">
        {title}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
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
    <div className="flex gap-3">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

      <p className="text-sm">
        {text}
      </p>
    </div>
  );
}