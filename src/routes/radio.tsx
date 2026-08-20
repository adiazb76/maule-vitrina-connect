import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Radio } from "lucide-react";

import { fetchRadioItems } from "@/lib/vitrina";

export const Route = createFileRoute("/radio")({
  head: () => ({
    meta: [
      { title: "Espacio radial: historias de emprendedores | La Vitrina" },
      {
        name: "description",
        content:
          "Escucha los programas, cápsulas y entrevistas radiales donde los emprendedores del Maule Sur cuentan su historia.",
      },
      { property: "og:title", content: "Espacio radial | La Vitrina" },
      { property: "og:description", content: "Programas y cápsulas con historias del Maule Sur." },
    ],
  }),
  component: RadioPage,
});

function RadioPage() {
  const items = useQuery({ queryKey: ["radio"], queryFn: fetchRadioItems });

  return (
    <div className="container-page py-12 sm:py-16">
      <header className="max-w-2xl">
        <p className="inline-flex items-center gap-2 text-sm font-medium text-primary">
          <Radio className="h-4 w-4" /> Al aire
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Espacio radial</h1>
        <p className="mt-3 text-muted-foreground">
          Cada semana, una voz del Maule Sur cuenta cómo partió, qué ofrece y hacia dónde va.
        </p>
      </header>

      {items.data?.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
          Aún no hay episodios publicados.
        </p>
      ) : null}

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(items.data ?? []).map((item) => (
          <article key={item.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            {item.image_url ? (
              <img src={item.image_url} alt={item.title} loading="lazy" className="aspect-[16/9] w-full object-cover" />
            ) : null}
            <div className="flex flex-1 flex-col p-5">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">{item.kind}</span>
              <h2 className="mt-1 font-display text-lg font-semibold">{item.title}</h2>
              {item.description ? (
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{item.description}</p>
              ) : null}
              {item.media_url ? (
                <audio controls preload="none" src={item.media_url} className="mt-4 w-full">
                  Tu navegador no soporta audio.
                </audio>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
