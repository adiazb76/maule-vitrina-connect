import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Handshake,
  Radio,
  Search,
  Sparkles,
  Users,
} from "lucide-react";

import heroImage from "@/assets/hero-vitrina.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EntrepreneurCard } from "@/components/entrepreneur-card";
import { fetchEvents, fetchFeatured, fetchWeeklyFeature } from "@/lib/vitrina";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "La Vitrina | Comunidad de Emprendedores del Maule Sur",
      },
      {
        name: "description",
        content:
          "La comunidad de emprendedores del Maule Sur. Descubre negocios locales, conecta, participa y haz visible tu emprendimiento.",
      },
      {
        property: "og:title",
        content: "La Vitrina | Emprendedores del Maule Sur",
      },
      {
        property: "og:description",
        content:
          "Nos mostramos. Nos conectamos. Crecemos juntos.",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");

  const featured = useQuery({
    queryKey: ["featured"],
    queryFn: () => fetchFeatured(6),
  });

  const weekly = useQuery({
    queryKey: ["weekly"],
    queryFn: fetchWeeklyFeature,
  });

  const events = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div className="container-page grid items-center gap-10 py-14 lg:grid-cols-[1.05fr_1fr] lg:py-20">
          <div>
            <p className="eyebrow">MAULE SUR · CHILE</p>

            <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
              LA VITRINA
            </h1>

            <p className="mt-3 font-display text-xl text-primary sm:text-2xl">
              La comunidad de emprendedores del Maule Sur
            </p>

            <p className="mt-5 max-w-xl text-base text-foreground/80 sm:text-lg">
              Un espacio para mostrar tu emprendimiento, descubrir negocios
              locales, conectar con otras personas y encontrar nuevas
              oportunidades.
            </p>

            <form
              className="mt-7 flex w-full max-w-xl flex-col gap-2 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();

                navigate({
                  to: "/emprendedores",
                  search: term ? { q: term } : {},
                });
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

              <Button
                type="submit"
                size="lg"
                variant="hero"
                className="h-12 rounded-xl"
              >
                Buscar
              </Button>
            </form>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <Link to="/emprendedores">
                  Descubrir emprendedores
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button asChild size="lg" variant="soft" className="rounded-xl">
                <Link to="/sumate">Sé parte de La Vitrina</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <img
              src={heroImage}
              alt="Emprendedores del Maule Sur"
              width={1600}
              height={1104}
              className="aspect-[4/3] w-full rounded-3xl object-cover shadow-lift"
            />

            <div className="absolute -bottom-5 left-5 hidden rounded-2xl border border-border bg-card px-5 py-4 shadow-card sm:block">
              <p className="font-display text-base font-semibold">
                Tu emprendimiento tiene un lugar en La Vitrina.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* EMPRENDEDORES */}
      <section className="container-page py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">CONOCE LA COMUNIDAD</p>

            <h2 className="mt-1 font-display text-3xl font-semibold">
              Emprendedores que están haciendo crecer el Maule Sur
            </h2>

            <p className="mt-2 max-w-xl text-muted-foreground">
              Descubre negocios locales, conoce sus historias y contacta
              directamente con quienes están detrás de cada emprendimiento.
            </p>
          </div>

          <Button asChild variant="outline">
            <Link to="/emprendedores">
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-96 animate-pulse rounded-2xl bg-muted"
                />
              ))
            : featured.data?.map((e) => (
                <EntrepreneurCard key={e.id} e={e} />
              ))}
        </div>
      </section>

      {/* EMPRENDEDOR DE LA SEMANA */}
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
                <Sparkles className="h-4 w-4" />
                EMPRENDEDOR DE LA SEMANA
              </p>

              <h2 className="mt-2 font-display text-3xl font-semibold">
                {weekly.data.entrepreneurs.business_name}
              </h2>

              <p className="text-muted-foreground">
                {weekly.data.entrepreneurs.owner_name} ·{" "}
                {weekly.data.entrepreneurs.categories?.name} ·{" "}
                {weekly.data.entrepreneurs.comunas?.name}
              </p>

              <p className="mt-4 text-foreground/85">
                {weekly.data.story}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <Link
                    to="/emprendedores/$slug"
                    params={{
                      slug: weekly.data.entrepreneurs.slug,
                    }}
                  >
                    Ver perfil
                  </Link>
                </Button>

                <Button asChild variant="outline">
                  <Link to="/radio">
                    Escuchar en La Vitrina Radio
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* PROPUESTA DE VALOR */}
      <section className="container-page py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Users,
              title: "Una comunidad",
              text: "Emprendedores del Maule Sur conectados en un mismo espacio.",
              to: "/comunidad" as const,
              cta: "Conocer la comunidad",
            },
            {
              icon: Radio,
              title: "Una voz en la radio",
              text: "Historias, entrevistas y cápsulas que ayudan a visibilizar el emprendimiento local.",
              to: "/radio" as const,
              cta: "Conocer La Vitrina Radio",
            },
            {
              icon: Handshake,
              title: "Más oportunidades",
              text: "Eventos, campañas y conexiones que pueden transformar una conversación en una oportunidad.",
              to: "/eventos" as const,
              cta: "Ver actividades",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="flex flex-col rounded-2xl border border-border bg-card p-7 shadow-card"
            >
              <card.icon className="h-6 w-6 text-primary" />

              <h3 className="mt-4 font-display text-xl font-semibold">
                {card.title}
              </h3>

              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                {card.text}
              </p>

              <Link
                to={card.to}
                className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary"
              >
                {card.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* RADIO + COMUNIDAD */}
      <section className="border-y border-border bg-surface py-16">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow flex items-center gap-2">
              <Radio className="h-4 w-4" />
              LA VITRINA EN RADIO
            </p>

            <h2 className="mt-2 font-display text-3xl font-semibold">
              Una comunidad que también tiene voz
            </h2>

            <p className="mt-4 max-w-xl text-muted-foreground">
              La Vitrina nació desde la radio para conversar sobre
              emprendimiento, compartir historias y dar visibilidad a quienes
              están construyendo sus propios proyectos.
            </p>

            <Button asChild className="mt-6">
              <Link to="/radio">
                Conocer el programa
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div>
            <p className="eyebrow">PARTE DE ALGO MÁS GRANDE</p>

            <h2 className="mt-2 font-display text-3xl font-semibold">
              Tu aporte ayuda a mantener La Vitrina
            </h2>

            <p className="mt-4 text-muted-foreground">
              Formar parte de la comunidad tendrá un aporte simbólico. La idea
              es que juntos podamos mantener este espacio, darle visibilidad a
              los emprendedores y seguir llevando sus historias a la radio.
            </p>

            <Button asChild variant="outline" className="mt-6">
              <Link to="/sumate">
                Quiero ser parte
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* AUSPICIADORES */}
      <section className="container-page py-16">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-card sm:p-10">
          <div className="max-w-2xl">
            <p className="eyebrow">EMPRESAS QUE APOYAN</p>

            <h2 className="mt-2 font-display text-3xl font-semibold">
              Los auspiciadores ayudan a hacer crecer la comunidad
            </h2>

            <p className="mt-4 text-muted-foreground">
              Empresas y marcas pueden apoyar La Vitrina, participar en
              campañas, eventos y acciones especiales, y tener una presencia
              destacada dentro de la comunidad.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {["Auspiciador principal", "Empresa amiga", "Aliado de La Vitrina"].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-dashed border-border p-6 text-center"
                >
                  <p className="font-display font-semibold">{item}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Espacio disponible
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* EVENTOS */}
      <section className="container-page pb-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              ACTIVIDADES
            </p>

            <h2 className="mt-2 font-display text-3xl font-semibold">
              Eventos y campañas
            </h2>

            <p className="mt-2 text-muted-foreground">
              Ferias, encuentros, campañas y oportunidades para participar.
            </p>
          </div>

          <Button asChild variant="outline">
            <Link to="/eventos">
              Ver eventos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="container-page pb-20">
        <div className="rounded-3xl bg-primary px-8 py-14 text-center text-primary-foreground">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Nos mostramos. Nos conectamos. Crecemos juntos.
          </h2>

          <p className="mx-auto mt-3 max-w-xl opacity-90">
            El Maule Sur tiene talento. Hagámoslo visible.
          </p>

          <Button
            asChild
            size="lg"
            variant="secondary"
            className="mt-7 rounded-xl"
          >
            <Link to="/sumate">
              Quiero ser parte de La Vitrina
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}