import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, CalendarDays, Radio, Search, Sparkles, Users } from "lucide-react";

import heroImage from "@/assets/hero-vitrina.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EntrepreneurCard } from "@/components/entrepreneur-card";
import { fetchEvents, fetchFeatured, fetchWeeklyFeature } from "@/lib/vitrina";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "La Vitrina — Comunidad de Emprendedores del Maule Sur" },
      {
        name: "description",
        content:
          "Descubre emprendimientos del Maule Sur, conecta con personas y encuentra nuevas oportunidades para hacer crecer tu negocio.",
      },
      { property: "og:title", content: "La Vitrina — Emprendedores del Maule Sur" },
      {
        property: "og:description",
        content: "Nos mostramos. Nos conectamos. Crecemos juntos.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");

  const featured = useQuery({ queryKey: ["featured"], queryFn: () => fetchFeatured(6) });
  const weekly = useQuery({ queryKey: ["weekly"], queryFn: fetchWeeklyFeature });
  const events = useQuery({ queryKey: ["events"], queryFn: fetchEvents });

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div className="container-page grid items-center gap-10 py-14 lg:grid-cols-[1.05fr_1fr] lg:py-20">
          <div>
            <p className="eyebrow">Maule Sur · Chile</p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
              LA VITRINA
            </h1>
            <p className="mt-3 font-display text-xl text-primary sm:text-2xl">
              La comunidad de emprendedores del Maule Sur
            </p>
            <p className="mt-5 max-w-xl text-base text-foreground/80 sm:text-lg">
              Descubre emprendimientos, conecta con personas y encuentra nuevas oportunidades para
              hacer crecer tu negocio.
            </p>

            <form
              className="mt-7 flex w-full max-w-xl flex-col gap-2 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                navigate({ to: "/emprendedores", search: term ? { q: term } : {} });
              }}
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Busca un producto, servicio o emprendimiento"
                  aria-label="Buscar emprendedores"
                  className="h-12 rounded-xl bg-card pl-9"
                />
              </div>
              <Button type="submit" size="lg" variant="hero" className="h-12 rounded-xl">
                Buscar
              </Button>
            </form>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <Link to="/emprendedores">
                  Explorar emprendedores <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="soft" className="rounded-xl">
                <Link to="/sumate">Quiero ser parte de La Vitrina</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <img
              src={heroImage}
              alt="Emprendedores del Maule Sur mostrando sus productos en una feria local"
              width={1600}
              height={1104}
              className="aspect-[4/3] w-full rounded-3xl object-cover shadow-lift"
            />
            <div className="absolute -bottom-5 left-5 hidden rounded-2xl border border-border bg-card px-5 py-4 shadow-card sm:block">
              <p className="font-display text-base font-semibold">
                “Tu emprendimiento tiene un lugar en La Vitrina.”
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Descubre</p>
            <h2 className="mt-1 font-display text-3xl font-semibold">Emprendedores destacados</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Historias reales de personas que están haciendo crecer el Maule Sur.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/emprendedores">Ver todos los emprendedores</Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-96 animate-pulse rounded-2xl bg-muted" />
              ))
            : featured.data?.map((e) => <EntrepreneurCard key={e.id} e={e} />)}
        </div>
      </section>

      {weekly.data?.entrepreneurs ? (
        <section className="border-y border-border bg-surface py-16">
          <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <img
              src={weekly.data.entrepreneurs.photo_url ?? ""}
              alt={`Emprendedor de la semana: ${weekly.data.entrepreneurs.business_name}`}
              loading="lazy"
              className="aspect-[4/3] w-full rounded-3xl object-cover shadow-card"
            />
            <div>
              <p className="eyebrow flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Emprendedor de la semana
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold">
                {weekly.data.entrepreneurs.business_name}
              </h2>
              <p className="text-muted-foreground">
                {weekly.data.entrepreneurs.owner_name} · {weekly.data.entrepreneurs.categories?.name}{" "}
                · {weekly.data.entrepreneurs.comunas?.name}
              </p>
              <p className="mt-4 text-foreground/85">{weekly.data.story}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <Link
                    to="/emprendedores/$slug"
                    params={{ slug: weekly.data.entrepreneurs.slug }}
                  >
                    Ver perfil
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/radio">Escuchar en La Vitrina Radio</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="container-page grid gap-6 py-16 md:grid-cols-3">
        {[
          {
            icon: Users,
            title: "Comunidad",
            text: "No solo mostramos emprendimientos: conectamos personas que pueden trabajar juntas.",
            to: "/comunidad" as const,
            cta: "Conocer la comunidad",
          },
          {
            icon: CalendarDays,
            title: "Eventos",
            text: "Ferias, talleres y encuentros de emprendedores del Maule Sur.",
            to: "/eventos" as const,
            cta: `Ver ${events.data?.length ?? ""} próximos eventos`.trim(),
          },
          {
            icon: Radio,
            title: "La Vitrina en Radio",
            text: "Programas, entrevistas y cápsulas con historias de emprendedores.",
            to: "/radio" as const,
            cta: "Ir a la sección radial",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="flex flex-col rounded-2xl border border-border bg-card p-7 shadow-card"
          >
            <card.icon className="h-6 w-6 text-primary" />
            <h3 className="mt-4 font-display text-xl font-semibold">{card.title}</h3>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{card.text}</p>
            <Link
              to={card.to}
              className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary"
            >
              {card.cta} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </section>

      <section className="container-page pb-20">
        <div className="rounded-3xl bg-primary px-8 py-14 text-center text-primary-foreground">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Nos mostramos. Nos conectamos. Crecemos juntos.
          </h2>
          <p className="mx-auto mt-3 max-w-xl opacity-90">
            El Maule Sur tiene talento. Hagámoslo visible.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-7 rounded-xl">
            <Link to="/sumate">Quiero ser parte de La Vitrina</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
