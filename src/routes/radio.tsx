import {
  createFileRoute,
} from "@tanstack/react-router";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  Radio,
} from "lucide-react";

import {
  fetchRadioItems,
} from "@/lib/vitrina";

export const Route =
  createFileRoute(
    "/radio",
  )({
    head: () => ({
      meta: [
        {
          title:
            "Espacio radial: historias de emprendedores | La Vitrina",
        },

        {
          name:
            "description",

          content:
            "Escucha programas, cápsulas y entrevistas con emprendedores del Maule Sur.",
        },

        {
          property:
            "og:title",

          content:
            "Espacio radial | La Vitrina",
        },

        {
          property:
            "og:description",

          content:
            "Programas y cápsulas con historias del Maule Sur.",
        },
      ],
    }),

    component:
      RadioPage,
  });

function RadioPage() {
  const items =
    useQuery({
      queryKey: [
        "radio",
      ],

      queryFn:
        fetchRadioItems,
    });

  return (
    <div className="container-page py-7 sm:py-8">
      {/* CABECERA */}

      <header className="max-w-2xl">
        <p className="eyebrow inline-flex items-center gap-1.5">
          <Radio className="h-3.5 w-3.5 text-primary" />
          AL AIRE
        </p>

        <h1 className="mt-1 page-title">
          Espacio radial
        </h1>

        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Cada semana, una voz del Maule Sur cuenta cómo partió,
          qué ofrece y hacia dónde va.
        </p>
      </header>

      {/* VACÍO */}

      {items.data?.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-border p-6 text-center">
          <p className="text-xs text-muted-foreground">
            Aún no hay episodios publicados.
          </p>
        </div>
      ) : null}

      {/* GRILLA */}

      <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {(items.data ?? []).map(
          (
            item,
          ) => (
            <article
              key={
                item.id
              }
              className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-card"
            >
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
                  <Radio className="h-6 w-6 text-muted-foreground/40" />
                </div>
              )}

              <div className="p-4">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-primary">
                  {
                    item.kind
                  }
                </span>

                <h2 className="mt-1 line-clamp-2 card-title">
                  {
                    item.title
                  }
                </h2>

                {item.description ? (
                  <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                    {
                      item.description
                    }
                  </p>
                ) : null}

                {item.media_url ? (
                  <audio
                    controls
                    preload="none"
                    src={
                      item.media_url
                    }
                    className="mt-3 w-full"
                  >
                    Tu navegador no soporta audio.
                  </audio>
                ) : null}
              </div>
            </article>
          ),
        )}
      </div>
    </div>
  );
}