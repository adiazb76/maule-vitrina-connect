import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Handshake, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { fetchEntrepreneurs, fetchWeeklyFeature, whatsappLink } from "@/lib/vitrina";

export const Route = createFileRoute("/comunidad")({
  head: () => ({
    meta: [
      { title: "Comunidad y colaboración entre emprendedores | La Vitrina" },
      {
        name: "description",
        content:
          "Descubre qué ofrece y qué busca cada emprendedor del Maule Sur para generar alianzas, trueques y proyectos en conjunto.",
      },
      { property: "og:title", content: "Comunidad y colaboración | La Vitrina" },
      { property: "og:description", content: "Alianzas y colaboración entre emprendedores del Maule Sur." },
    ],
  }),
  component: ComunidadPage,
});

function ComunidadPage() {
  const weekly = useQuery({ queryKey: ["weekly"], queryFn: fetchWeeklyFeature });
  const list = useQuery({ queryKey: ["all-entrepreneurs"], queryFn: () => fetchEntrepreneurs({}, 200) });

  const collaborators = (list.data ?? []).filter(
    (e) => e.collaboration_offering || e.collaboration_seeking,
  );

  const featured = weekly.data?.entrepreneurs ?? null;

  return (
    <div className="container-page py-12 sm:py-16">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Comunidad</h1>
        <p className="mt-3 text-muted-foreground">
          La Vitrina no es sólo un catálogo: es una red donde los emprendimientos se apoyan, se recomiendan y crecen
          juntos.
        </p>
      </header>

      {featured ? (
        <section className="mt-10 overflow-hidden rounded-2xl border border-border bg-secondary/40">
          <div className="grid md:grid-cols-[1fr_1.2fr]">
            {featured.photo_url ? (
              <img
                src={featured.photo_url}
                alt={`Emprendedor de la semana: ${featured.business_name}`}
                className="h-full w-full object-cover"
              />
            ) : null}
            <div className="p-6 sm:p-8">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" /> Emprendedor de la semana
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold">{featured.business_name}</h2>
              <p className="text-muted-foreground">{featured.owner_name}</p>
              <p className="mt-3 text-foreground/85">{weekly.data?.story ?? featured.short_description}</p>
              <Button asChild className="mt-5">
                <Link to="/emprendedores/$slug" params={{ slug: featured.slug }}>
                  Conocer su historia
                </Link>
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-14">
        <h2 className="inline-flex items-center gap-2 font-display text-xl font-semibold">
          <Handshake className="h-5 w-5 text-primary" /> Muro de colaboración
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Qué ofrece y qué necesita cada emprendimiento. Si algo calza contigo, escríbele directo.
        </p>

        {collaborators.length === 0 && !list.isLoading ? (
          <p className="mt-6 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
            Aún no hay propuestas de colaboración publicadas.
          </p>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {collaborators.map((e) => {
            const wa = whatsappLink(e);
            return (
              <article key={e.id} className="rounded-2xl border border-border bg-card p-5">
                <h3 className="font-display text-lg font-semibold">
                  <Link to="/emprendedores/$slug" params={{ slug: e.slug }}>
                    {e.business_name}
                  </Link>
                </h3>
                <p className="text-sm text-muted-foreground">
                  {e.categories?.name} · {e.comunas?.name}
                </p>
                {e.collaboration_offering ? (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ofrece</p>
                    <p className="text-sm text-foreground/85">{e.collaboration_offering}</p>
                  </div>
                ) : null}
                {e.collaboration_seeking ? (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Busca</p>
                    <p className="text-sm text-foreground/85">{e.collaboration_seeking}</p>
                  </div>
                ) : null}
                {wa ? (
                  <Button asChild size="sm" variant="whatsapp" className="mt-4">
                    <a href={wa} target="_blank" rel="noreferrer">
                      Proponer alianza
                    </a>
                  </Button>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-14 rounded-2xl border border-border bg-card p-8 text-center">
        <Search className="mx-auto h-6 w-6 text-primary" />
        <h2 className="mt-3 font-display text-2xl font-semibold">¿Aún no estás en La Vitrina?</h2>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
          Postula tu emprendimiento, cuéntanos tu historia y súmate a la red del Maule Sur.
        </p>
        <Button asChild className="mt-5">
          <Link to="/sumate">Quiero ser parte</Link>
        </Button>
      </section>
    </div>
  );
}
