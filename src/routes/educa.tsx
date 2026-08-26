import {
  createFileRoute,
} from "@tanstack/react-router";

import {
  useQuery,
} from "@tanstack/react-query";

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

export const Route =
  createFileRoute(
    "/educa",
  )({
    head: () => ({
      meta: [
        {
          title:
            "La Vitrina Educa | Herramientas para emprendedores",
        },

        {
          name:
            "description",

          content:
            "Cápsulas y herramientas prácticas para emprendedores del Maule Sur.",
        },
      ],
    }),

    component:
      EducaPage,
  });

function EducaPage() {
  const content =
    useQuery({
      queryKey: [
        "education-items",
      ],

      queryFn:
        fetchEducationItems,
    });

  const capsules =
    (
      content.data ??
      []
    ).filter(
      (
        item,
      ) =>
        item.kind ===
        "capsula",
    );

  const tools =
    (
      content.data ??
      []
    ).filter(
      (
        item,
      ) =>
        item.kind ===
        "herramienta",
    );

  return (
    <>
      {/* CABECERA */}

      <section className="border-b border-border bg-surface">
        <div className="container-page py-7 sm:py-8">
          <p className="eyebrow">
            LA VITRINA EDUCA
          </p>

          <h1 className="mt-1 page-title">
            Herramientas para avanzar
          </h1>

          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Aprende y encuentra recursos prácticos para fortalecer tu emprendimiento.
          </p>
        </div>
      </section>

      {/* CÁPSULAS */}

      <section className="container-page py-7 sm:py-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="eyebrow">
              APRENDE
            </p>

            <h2 className="mt-1 section-title">
              Cápsulas de La Vitrina
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Ideas breves, concretas y explicadas de forma simple.
            </p>
          </div>
        </div>

        {content.isLoading ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({
              length:
                3,
            }).map(
              (
                _,
                index,
              ) => (
                <div
                  key={
                    index
                  }
                  className="h-44 animate-pulse rounded-xl bg-muted"
                />
              ),
            )}
          </div>
        ) : capsules.length >
          0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {capsules.map(
              (
                item,
              ) => (
                <Capsule
                  key={
                    item.id
                  }
                  item={
                    item
                  }
                />
              ),
            )}
          </div>
        ) : (
          <EmptyMessage text="Pronto encontrarás aquí nuevas cápsulas de La Vitrina Educa." />
        )}
      </section>

      {/* HERRAMIENTAS */}

      <section className="border-y border-border bg-secondary/15">
        <div className="container-page py-7 sm:py-8">
          <div>
            <p className="eyebrow">
              HERRAMIENTAS
            </p>

            <h2 className="mt-1 section-title">
              Úsalas en tu emprendimiento
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Recursos simples para ordenar, medir y tomar mejores decisiones.
            </p>
          </div>

          {tools.length >
          0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {tools.map(
                (
                  item,
                ) => (
                  <Tool
                    key={
                      item.id
                    }
                    item={
                      item
                    }
                  />
                ),
              )}
            </div>
          ) : (
            <EmptyMessage text="Las primeras herramientas estarán disponibles próximamente." />
          )}
        </div>
      </section>
    </>
  );
}

function Capsule({
  item,
}: {
  item:
    EducationItem;
}) {
  const url =
    item.media_url ||
    item.external_url;

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-card">
      {item.image_url ? (
        <img
          src={
            item.image_url
          }
          alt={
            item.title
          }
          loading="lazy"
          className="aspect-[16/8] w-full object-cover"
        />
      ) : (
        <div className="grid aspect-[16/8] place-items-center bg-muted">
          <PlayCircle className="h-6 w-6 text-muted-foreground/40" />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <PlayCircle className="h-4 w-4 text-primary" />

          <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            {item.category ||
              "Educa"}
          </span>
        </div>

        <h3 className="mt-2 line-clamp-2 card-title">
          {
            item.title
          }
        </h3>

        {item.author_name ||
        item.author_role ? (
          <p className="mt-1 line-clamp-1 text-[10px] font-medium text-primary">
            {[
              item.author_name,
              item.author_role,
            ]
              .filter(
                Boolean,
              )
              .join(
                " · ",
              )}
          </p>
        ) : null}

        {item.summary ? (
          <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
            {
              item.summary
            }
          </p>
        ) : null}

        {url ? (
          <a
            href={
              url
            }
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary"
          >
            Ver cápsula

            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>
    </article>
  );
}

function Tool({
  item,
}: {
  item:
    EducationItem;
}) {
  const url =
    item.external_url ||
    item.media_url;

  const Icon =
    item.tool_type ===
    "calculadora"
      ? Calculator
      : item.tool_type ===
          "plantilla"
        ? FileText
        : item.tool_type ===
            "indicador"
          ? BarChart3
          : BookOpen;

  const content = (
    <article className="flex h-full items-start gap-3 rounded-xl border border-border bg-card p-3.5 transition-shadow hover:shadow-sm">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary">
        <Icon className="h-4 w-4 text-primary" />
      </div>

      <div className="min-w-0">
        <p className="line-clamp-2 text-sm font-semibold">
          {
            item.title
          }
        </p>

        {item.summary ? (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {
              item.summary
            }
          </p>
        ) : null}

        {url ? (
          <p className="mt-2 text-[11px] font-medium text-primary">
            Abrir herramienta →
          </p>
        ) : null}
      </div>
    </article>
  );

  if (!url) {
    return content;
  }

  return (
    <a
      href={
        url
      }
      target="_blank"
      rel="noreferrer"
      className="block h-full"
    >
      {content}
    </a>
  );
}

function EmptyMessage({
  text,
}: {
  text:
    string;
}) {
  return (
    <div className="mt-4 rounded-xl border border-dashed border-border bg-card p-6 text-center text-xs text-muted-foreground">
      {text}
    </div>
  );
}