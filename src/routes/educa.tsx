import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calculator,
  FileText,
  PlayCircle,
} from "lucide-react";

import {
  fetchEducationItems,
  type EducationItem,
} from "@/lib/vitrina";

export const Route = createFileRoute("/educa")({
  head: () => ({
    meta: [
      {
        title: "La Vitrina Educa | Herramientas para emprendedores",
      },
      {
        name: "description",
        content:
          "Cápsulas y herramientas prácticas para emprendedores del Maule Sur.",
      },
    ],
  }),

  component: EducaPage,
});

function EducaPage() {
  const content = useQuery({
    queryKey: ["education-items"],
    queryFn: fetchEducationItems,
  });

  const capsules = (content.data ?? []).filter(
    (item) => item.kind === "capsula",
  );

  const tools = (content.data ?? []).filter(
    (item) => item.kind === "herramienta",
  );

  return (
    <>
      <section className="border-b border-border bg-surface">
        <div className="container-page py-7 sm:py-8">
          <p className="eyebrow">LA VITRINA EDUCA</p>

          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            Herramientas para avanzar
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Aprende y encuentra herramientas prácticas para fortalecer
            tu emprendimiento.
          </p>
        </div>
      </section>

      <section className="container-page py-8 sm:py-10">
        <div>
          <p className="eyebrow">APRENDE</p>

          <h2 className="mt-1 font-display text-2xl font-semibold">
            Cápsulas de La Vitrina
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Ideas breves, concretas y explicadas por personas que saben.
          </p>
        </div>

        {content.isLoading ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-52 animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        ) : capsules.length > 0 ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {capsules.map((item) => (
              <Capsule key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyMessage text="Pronto encontrarás aquí nuevas cápsulas de La Vitrina Educa." />
        )}
      </section>

      <section className="border-y border-border bg-secondary/20">
        <div className="container-page py-8 sm:py-10">
          <div>
            <p className="eyebrow">HERRAMIENTAS</p>

            <h2 className="mt-1 font-display text-2xl font-semibold">
              Úsalas en tu emprendimiento
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Recursos simples para ordenar, medir y tomar mejores decisiones.
            </p>
          </div>

          {tools.length > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {tools.map((item) => (
                <Tool key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <EmptyMessage text="Las primeras herramientas estarán disponibles próximamente." />
          )}
        </div>
      </section>
    </>
  );
}

function Capsule({ item }: { item: EducationItem }) {
  const url = item.media_url || item.external_url;

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.title}
          className="aspect-[16/9] w-full object-cover"
        />
      ) : null}

      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <PlayCircle className="h-5 w-5 text-primary" />

          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {item.category || "Educa"}
          </span>
        </div>

        <h3 className="mt-3 font-display text-lg font-semibold">
          {item.title}
        </h3>

        {item.author_name || item.author_role ? (
          <p className="mt-1 text-xs font-medium text-primary">
            {[item.author_name, item.author_role]
              .filter(Boolean)
              .join(" · ")}
          </p>
        ) : null}

        {item.summary ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {item.summary}
          </p>
        ) : null}

        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary"
          >
            Ver cápsula
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>
    </article>
  );
}

function Tool({ item }: { item: EducationItem }) {
  const url = item.external_url || item.media_url;

  const Icon =
    item.tool_type === "calculadora"
      ? Calculator
      : item.tool_type === "plantilla"
        ? FileText
        : item.tool_type === "indicador"
          ? BarChart3
          : BookOpen;

  const content = (
    <article className="flex h-full items-start gap-3 rounded-xl border border-border bg-card p-4">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

      <div>
        <p className="font-semibold">{item.title}</p>

        {item.summary ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {item.summary}
          </p>
        ) : null}

        {url ? (
          <p className="mt-2 text-xs font-medium text-primary">
            Abrir herramienta →
          </p>
        ) : null}
      </div>
    </article>
  );

  if (!url) return content;

  return (
    <a href={url} target="_blank" rel="noreferrer">
      {content}
    </a>
  );
}

function EmptyMessage({ text }: { text: string }) {
  return (
    <div className="mt-5 rounded-xl border border-dashed border-border bg-card p-7 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}