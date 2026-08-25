import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Newspaper,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import heroImage from "@/assets/hero-vitrina.jpg";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EntrepreneurCard } from "@/components/entrepreneur-card";

import {
  fetchFeatured,
  fetchNewsItems,
  fetchSiteSettings,
  fetchSponsors,
  fetchWeeklyFeature,
  websiteLink,
  type NewsItem,
  type Sponsor,
} from "@/lib/vitrina";

type IndicatorValue = {
  codigo: string;
  nombre: string;
  unidad_medida: string;
  fecha: string;
  valor: number;
};

type EconomicIndicators = {
  fecha: string;
  uf?: IndicatorValue;
  utm?: IndicatorValue;
  dolar?: IndicatorValue;
  euro?: IndicatorValue;
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "La Vitrina | Emprendedores del Maule Sur",
      },
      {
        name: "description",
        content:
          "Emprendedores, historias, noticias y oportunidades del Maule Sur en un solo lugar.",
      },
      {
        property: "og:title",
        content: "La Vitrina | Emprendedores del Maule Sur",
      },
      {
        property: "og:description",
        content:
          "Descubre, conecta y conoce lo que está pasando en la comunidad emprendedora del Maule Sur.",
      },
    ],

    links: [
      {
        rel: "canonical",
        href: "/",
      },
    ],
  }),

  component: IndexPage,
});

async function fetchEconomicIndicators(): Promise<EconomicIndicators> {
  const response = await fetch("https://mindicador.cl/api");

  if (!response.ok) {
    throw new Error(
      "No pudimos obtener los indicadores económicos.",
    );
  }

  return response.json();
}

function IndexPage() {
  const navigate = useNavigate();

  const [term, setTerm] = useState("");

  const settings = useQuery({
    queryKey: ["site-settings"],
    queryFn: fetchSiteSettings,
  });

  const news = useQuery({
    queryKey: ["news-items"],
    queryFn: () => fetchNewsItems(3),
  });

  const featured = useQuery({
    queryKey: ["featured"],
    queryFn: () => fetchFeatured(4),
  });

  const weekly = useQuery({
    queryKey: ["weekly"],
    queryFn: fetchWeeklyFeature,
  });

  const sponsors = useQuery({
    queryKey: ["sponsors"],
    queryFn: fetchSponsors,
  });

  const indicators = useQuery({
    queryKey: ["economic-indicators"],
    queryFn: fetchEconomicIndicators,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  const heroSubtitle =
    settings.data?.hero_subtitle ||
    "Emprendedores del Maule Sur";

  const heroDescription =
    settings.data?.hero_description ||
    "Descubre emprendimientos, historias, oportunidades y contenido útil de nuestra comunidad.";

  const heroPhoto =
    settings.data?.hero_image_url ||
    heroImage;

  const highlighted =
    weekly.data?.entrepreneurs &&
    weekly.data.entrepreneurs.status === "aprobado" &&
    weekly.data.entrepreneurs.visible !== false
      ? weekly.data.entrepreneurs
      : null;

  const mainNews =
    news.data?.[0] ?? null;

  const secondaryNews =
    news.data?.slice(1, 3) ?? [];

  return (
    <>
      {/* INDICADORES ECONÓMICOS */}

      {indicators.data ? (
        <section className="border-b border-border bg-secondary/20">
          <div className="container-page">
            <div className="flex items-center gap-5 overflow-x-auto py-2">
              <div className="flex shrink-0 items-center gap-2 pr-1">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />

                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Indicadores
                </span>
              </div>

              <div className="h-5 w-px shrink-0 bg-border" />

              <Indicator
                label="UF"
                value={indicators.data.uf?.valor}
                decimals={2}
              />

              <Indicator
                label="UTM"
                value={indicators.data.utm?.valor}
                decimals={0}
              />

              <Indicator
                label="Dólar"
                value={indicators.data.dolar?.valor}
                decimals={2}
              />

              <Indicator
                label="Euro"
                value={indicators.data.euro?.valor}
                decimals={2}
              />

              <span className="ml-auto shrink-0 text-[9px] text-muted-foreground">
                Valores referenciales
              </span>
            </div>
          </div>
        </section>
      ) : null}

      {/* HERO */}

      <section className="border-b border-border bg-surface">
        <div className="container-page grid gap-6 py-7 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-9">
          <div>
            <p className="eyebrow">
              MAULE SUR · CHILE
            </p>

            <h1 className="mt-1 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              LA VITRINA
            </h1>

            <p className="mt-2 font-display text-xl text-primary">
              {heroSubtitle}
            </p>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-foreground/75 sm:text-base">
              {heroDescription}
            </p>

            <form
              className="mt-5 flex max-w-xl gap-2"
              onSubmit={(event) => {
                event.preventDefault();

                navigate({
                  to: "/comunidad",
                  search: {
                    q:
                      term.trim() ||
                      undefined,
                  },
                });
              }}
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={term}
                  onChange={(event) =>
                    setTerm(
                      event.target.value,
                    )
                  }
                  placeholder="¿Qué estás buscando?"
                  className="h-11 bg-card pl-9"
                />
              </div>

              <Button
                type="submit"
                className="h-11"
              >
                Buscar
              </Button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
              >
                <Link to="/comunidad">
                  Explorar comunidad
                </Link>
              </Button>

              <Button
                asChild
                variant="ghost"
                size="sm"
              >
                <Link to="/diagnostico">
                  Diagnóstico
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="ghost"
                size="sm"
              >
                <Link to="/sumate">
                  Quiero ser parte
                </Link>
              </Button>
            </div>
          </div>

          <div>
            <img
              src={heroPhoto}
              alt="La Vitrina - Emprendedores del Maule Sur"
              className="aspect-[16/10] w-full rounded-2xl object-cover shadow-card"
            />
          </div>
        </div>
      </section>

      {/* ACTUALIDAD + EMPRENDEDOR DESTACADO */}

      <section className="container-page py-8">
        <div className="grid gap-5 lg:grid-cols-2">

          {/* HOY EN LA VITRINA */}

          <article className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <p className="eyebrow inline-flex items-center gap-2">
                <Newspaper className="h-4 w-4" />
                ACTUALIDAD
              </p>

              <h2 className="mt-1 font-display text-2xl font-semibold">
                Hoy en La Vitrina
              </h2>
            </div>

            {news.isLoading ? (
              <div className="h-80 animate-pulse bg-muted" />
            ) : mainNews ? (
              <>
                {mainNews.image_url ? (
                  <img
                    src={mainNews.image_url}
                    alt={mainNews.title}
                    className="aspect-[16/7] w-full object-cover"
                  />
                ) : null}

                <div className="p-5">
                  {mainNews.featured ? (
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      Destacado
                    </p>
                  ) : null}

                  <h3 className="mt-1 font-display text-xl font-semibold leading-snug">
                    {mainNews.title}
                  </h3>

                  {mainNews.summary ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {mainNews.summary}
                    </p>
                  ) : null}

                  {mainNews.external_url ? (
                    <a
                      href={mainNews.external_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary"
                    >
                      Leer más
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>

                {secondaryNews.length > 0 ? (
                  <div className="border-t border-border">
                    {secondaryNews.map(
                      (item) => (
                        <SmallNews
                          key={item.id}
                          item={item}
                        />
                      ),
                    )}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Pronto encontrarás aquí las novedades de La Vitrina.
              </div>
            )}
          </article>

          {/* EMPRENDEDOR DESTACADO */}

          <article className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <p className="eyebrow inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                PROTAGONISTA
              </p>

              <h2 className="mt-1 font-display text-2xl font-semibold">
                Emprendedor destacado
              </h2>
            </div>

            {weekly.isLoading ? (
              <div className="h-80 animate-pulse bg-muted" />
            ) : highlighted ? (
              <>
                {highlighted.photo_url ? (
                  <img
                    src={highlighted.photo_url}
                    alt={highlighted.business_name}
                    className="aspect-[16/7] w-full object-cover"
                  />
                ) : null}

                <div className="p-5">
                  <p className="text-xs text-muted-foreground">
                    {highlighted.owner_name}

                    {highlighted.categories?.name
                      ? ` · ${highlighted.categories.name}`
                      : ""}

                    {highlighted.comunas?.name
                      ? ` · ${highlighted.comunas.name}`
                      : ""}
                  </p>

                  <h3 className="mt-1 font-display text-xl font-semibold">
                    {highlighted.business_name}
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {weekly.data?.story ||
                      highlighted.short_description}
                  </p>

                  <Button
                    asChild
                    size="sm"
                    className="mt-4"
                  >
                    <Link
                      to="/emprendedores/$slug"
                      params={{
                        slug:
                          highlighted.slug,
                      }}
                    >
                      Conocer su historia
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Próximamente conocerás aquí a un emprendedor destacado.
              </div>
            )}
          </article>
        </div>
      </section>

      {/* COMUNIDAD */}

      <section className="border-y border-border bg-surface">
        <div className="container-page py-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">
                COMUNIDAD
              </p>

              <h2 className="mt-1 font-display text-2xl font-semibold">
                Descubre el Maule que emprende
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Productos, servicios, historias y personas de nuestra comunidad.
              </p>
            </div>

            <Button
              asChild
              size="sm"
              variant="outline"
            >
              <Link to="/comunidad">
                Ver comunidad
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.isLoading
              ? Array.from({
                  length: 4,
                }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="h-80 animate-pulse rounded-2xl bg-muted"
                    />
                  ),
                )
              : featured.data?.map(
                  (entrepreneur) => (
                    <EntrepreneurCard
                      key={
                        entrepreneur.id
                      }
                      e={
                        entrepreneur
                      }
                    />
                  ),
                )}
          </div>
        </div>
      </section>

      {/* DIAGNÓSTICO */}

      <section className="container-page py-8">
        <div className="grid gap-5 overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex gap-4 p-6">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="eyebrow">
                DIAGNÓSTICO DEL EMPRENDEDOR
              </p>

              <h2 className="mt-1 font-display text-xl font-semibold">
                ¿Cómo está tu emprendimiento?
              </h2>

              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Descubre tus fortalezas, brechas y las principales áreas donde puedes avanzar.
              </p>
            </div>
          </div>

          <div className="px-6 pb-6 md:pb-0">
            <Button asChild>
              <Link to="/diagnostico">
                Hacer diagnóstico
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* AUSPICIADORES */}

      <section className="border-t border-border bg-surface">
        <div className="container-page py-7">
          <div>
            <p className="eyebrow">
              NOS APOYAN
            </p>

            <h2 className="mt-1 font-display text-lg font-semibold">
              Auspiciadores de La Vitrina
            </h2>
          </div>

          {sponsors.isLoading ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {Array.from({
                length: 5,
              }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="h-20 animate-pulse rounded-xl bg-muted"
                  />
                ),
              )}
            </div>
          ) : (sponsors.data?.length ??
              0) > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {sponsors.data?.map(
                (sponsor) => (
                  <SponsorCard
                    key={sponsor.id}
                    sponsor={sponsor}
                  />
                ),
              )}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
              Próximamente conocerás aquí a quienes apoyan La Vitrina.
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function Indicator({
  label,
  value,
  decimals = 2,
}: {
  label: string;
  value?: number;
  decimals?: number;
}) {
  if (
    typeof value !== "number"
  ) {
    return null;
  }

  const formatted =
    new Intl.NumberFormat(
      "es-CL",
      {
        minimumFractionDigits:
          decimals,
        maximumFractionDigits:
          decimals,
      },
    ).format(value);

  return (
    <div className="flex shrink-0 items-baseline gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>

      <span className="text-xs font-semibold">
        ${formatted}
      </span>
    </div>
  );
}

function SmallNews({
  item,
}: {
  item: NewsItem;
}) {
  const content = (
    <div className="flex gap-3 px-5 py-4 transition-colors hover:bg-secondary/20">
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.title}
          className="h-14 w-20 shrink-0 rounded-lg object-cover"
        />
      ) : null}

      <div className="min-w-0">
        <p className="font-display text-sm font-semibold leading-snug">
          {item.title}
        </p>

        {item.summary ? (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {item.summary}
          </p>
        ) : null}
      </div>
    </div>
  );

  if (!item.external_url) {
    return content;
  }

  return (
    <a
      href={item.external_url}
      target="_blank"
      rel="noreferrer"
      className="block border-t border-border first:border-t-0"
    >
      {content}
    </a>
  );
}

function SponsorCard({
  sponsor,
}: {
  sponsor: Sponsor;
}) {
  const url =
    websiteLink(
      sponsor.website_url,
    );

  const content = (
    <div className="flex h-20 items-center justify-center rounded-xl border border-border bg-card p-4">
      {sponsor.logo_url ? (
        <img
          src={sponsor.logo_url}
          alt={sponsor.name}
          className="max-h-12 max-w-full object-contain"
        />
      ) : (
        <p className="text-center font-display text-sm font-semibold">
          {sponsor.name}
        </p>
      )}
    </div>
  );

  if (!url) {
    return content;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label={`Visitar ${sponsor.name}`}
    >
      {content}
    </a>
  );
}