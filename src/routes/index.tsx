import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  ArrowRight,
  Newspaper,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import heroImage from "@/assets/hero-vitrina.jpg";

import {
  Button,
} from "@/components/ui/button";

import {
  supabase,
} from "@/integrations/supabase/client";

import {
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

export const Route =
  createFileRoute("/")({
    head: () => ({
      meta: [
        {
          title:
            "La Vitrina | Emprendedores del Maule Sur",
        },

        {
          name:
            "description",

          content:
            "Emprendedores, noticias, eventos y herramientas del Maule Sur en un solo lugar.",
        },

        {
          property:
            "og:title",

          content:
            "La Vitrina | Emprendedores del Maule Sur",
        },

        {
          property:
            "og:description",

          content:
            "Descubre lo que está pasando en la comunidad emprendedora del Maule Sur.",
        },
      ],

      links: [
        {
          rel:
            "canonical",

          href:
            "/",
        },
      ],
    }),

    component:
      IndexPage,
  });

async function fetchEconomicIndicators(): Promise<EconomicIndicators> {
  const response =
    await fetch(
      "https://mindicador.cl/api",
    );

  if (!response.ok) {
    throw new Error(
      "No pudimos obtener los indicadores económicos.",
    );
  }

  return response.json();
}

function IndexPage() {
  const settings =
    useQuery({
      queryKey: [
        "site-settings",
      ],

      queryFn:
        fetchSiteSettings,
    });

  const news =
    useQuery({
      queryKey: [
        "news-items",
      ],

      queryFn: () =>
        fetchNewsItems(
          3,
        ),
    });

  const weekly =
    useQuery({
      queryKey: [
        "weekly",
      ],

      queryFn:
        fetchWeeklyFeature,
    });

  const sponsors =
    useQuery({
      queryKey: [
        "sponsors",
      ],

      queryFn:
        fetchSponsors,
    });

  const publicMetrics =
    useQuery({
      queryKey: ["public-home-metrics"],

      queryFn: async () => {
        const [e, d, a] = await Promise.all([
          (supabase as any)
            .from("entrepreneurs")
            .select("id,views,contacts,comuna_id")
            .eq("status", "aprobado")
            .neq("visible", false),

          (supabase as any)
            .from("entrepreneur_diagnostics")
            .select("id"),

          (supabase as any)
            .from("marketplace_ads")
            .select("id")
            .eq("status", "aprobado"),
        ]);

        if (e.error) throw e.error;
        if (d.error) throw d.error;
        if (a.error) throw a.error;

        const rows = e.data ?? [];

        return {
          entrepreneurs: rows.length,
          views: rows.reduce((s: number, r: any) => s + Number(r.views ?? 0), 0),
          contacts: rows.reduce((s: number, r: any) => s + Number(r.contacts ?? 0), 0),
          diagnostics: (d.data ?? []).length,
          ads: (a.data ?? []).length,
          comunas: new Set(rows.map((r: any) => r.comuna_id).filter(Boolean)).size,
        };
      },

      staleTime: 1000 * 60 * 5,
    });

  const indicators =
    useQuery({
      queryKey: [
        "economic-indicators",
      ],

      queryFn:
        fetchEconomicIndicators,

      staleTime:
        1000 *
        60 *
        30,

      retry:
        1,
    });

  const heroSubtitle =
    settings.data
      ?.hero_subtitle ||
    "Emprendedores del Maule Sur";

  const heroDescription =
    settings.data
      ?.hero_description ||
    "Un espacio para descubrir emprendedores, conocer lo que está pasando y encontrar herramientas para avanzar.";

  const heroPhoto =
    settings.data
      ?.hero_image_url ||
    heroImage;

  const highlighted =
    weekly.data
      ?.entrepreneurs &&
    weekly.data
      .entrepreneurs
      .status ===
      "aprobado" &&
    weekly.data
      .entrepreneurs
      .visible !==
      false
      ? weekly.data
          .entrepreneurs
      : null;

  const mainNews =
    news.data?.[0] ??
    null;

  const secondaryNews =
    news.data?.slice(
      1,
      3,
    ) ?? [];

  return (
    <>
      {/* INDICADORES */}

      {indicators.data ? (
        <section className="border-b border-border bg-secondary/20">
          <div className="container-page">
            <div className="flex items-center gap-5 overflow-x-auto py-2">
              <div className="flex shrink-0 items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />

                <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Indicadores
                </span>
              </div>

              <div className="h-4 w-px shrink-0 bg-border" />

              <Indicator
                label="UF"
                value={
                  indicators
                    .data
                    .uf
                    ?.valor
                }
                decimals={2}
              />

              <Indicator
                label="UTM"
                value={
                  indicators
                    .data
                    .utm
                    ?.valor
                }
                decimals={0}
              />

              <Indicator
                label="Dólar"
                value={
                  indicators
                    .data
                    .dolar
                    ?.valor
                }
                decimals={2}
              />

              <Indicator
                label="Euro"
                value={
                  indicators
                    .data
                    .euro
                    ?.valor
                }
                decimals={2}
              />

              <span className="ml-auto shrink-0 text-[9px] text-muted-foreground">
                Referenciales
              </span>
            </div>
          </div>
        </section>
      ) : null}

      {/* HERO */}

      <section className="border-b border-border bg-surface">
        <div className="container-page grid gap-5 py-6 md:grid-cols-[1.05fr_0.95fr] md:items-center lg:py-7">
          <div>
            <p className="eyebrow">
              MAULE SUR · CHILE
            </p>

            <h1 className="mt-1 font-display text-3xl font-semibold leading-tight sm:text-4xl">
              LA VITRINA
            </h1>

            <p className="mt-1.5 font-display text-lg font-medium text-primary sm:text-xl">
              {heroSubtitle}
            </p>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/75">
              {heroDescription}
            </p>

            {/* ÚNICOS 3 CTA PRINCIPALES */}

            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                asChild
                size="sm"
              >
                <Link to="/comunidad">
                  Explorar comunidad
                </Link>
              </Button>

              <Button
                asChild
                size="sm"
                className="bg-primary text-primary-foreground"
              >
                <Link to="/diagnostico">
                  Diagnóstico
                </Link>
              </Button>

              <Button
                asChild
                size="sm"
                className="bg-primary text-primary-foreground"
              >
                <Link to="/sumate">
                  Quiero ser parte
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <img
              src={
                heroPhoto
              }
              alt="La Vitrina - Emprendedores del Maule Sur"
              className="aspect-[16/9] w-full rounded-xl object-cover shadow-sm"
            />

            <div className="absolute inset-x-2 top-2 rounded-lg border border-white/20 bg-background/88 px-3 py-2 shadow-sm backdrop-blur-md sm:inset-x-3 sm:top-3 sm:px-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-foreground">
                  La Vitrina en números
                </p>

                <p className="shrink-0 text-[8px] text-muted-foreground">
                  {new Intl.DateTimeFormat(
                    "es-CL",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    },
                  ).format(
                    new Date(),
                  )}
                </p>
              </div>

              {publicMetrics.isLoading ? (
                <div className="mt-2 h-8 animate-pulse rounded-md bg-muted" />
              ) : publicMetrics.data ? (
                <div className="mt-2 grid grid-cols-6 divide-x divide-border/70">
                  <HeroPublicMetric value={publicMetrics.data.entrepreneurs} label="Emprend." />
                  <HeroPublicMetric value={publicMetrics.data.views} label="Vistas" />
                  <HeroPublicMetric value={publicMetrics.data.contacts} label="Contactos" />
                  <HeroPublicMetric value={publicMetrics.data.diagnostics} label="Diagnóst." />
                  <HeroPublicMetric value={publicMetrics.data.ads} label="Avisos" />
                  <HeroPublicMetric value={publicMetrics.data.comunas} label="Comunas" />
                </div>
              ) : (
                <p className="mt-2 text-[9px] text-muted-foreground">
                  Cifras en actualización.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ACTUALIDAD + PROTAGONISTA */}

      <section className="container-page py-6">
        <div className="grid gap-4 lg:grid-cols-2">
          {/* ACTUALIDAD */}

          <article className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <p className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Newspaper className="h-3.5 w-3.5 text-primary" />

                  Actualidad
                </p>

                <h2 className="mt-0.5 font-display text-base font-semibold">
                  Hoy en La Vitrina
                </h2>
              </div>
            </div>

            {news.isLoading ? (
              <div className="h-48 animate-pulse bg-muted" />
            ) : mainNews ? (
              <div>
                <div className="flex gap-3 p-4">
                  {mainNews.image_url ? (
                    <img
                      src={
                        mainNews.image_url
                      }
                      alt={
                        mainNews.title
                      }
                      className="h-24 w-28 shrink-0 rounded-lg object-cover sm:h-28 sm:w-36"
                    />
                  ) : null}

                  <div className="min-w-0">
                    {mainNews.featured ? (
                      <p className="text-[9px] font-semibold uppercase tracking-wide text-primary">
                        Destacado
                      </p>
                    ) : null}

                    <h3 className="mt-0.5 line-clamp-2 font-display text-sm font-semibold leading-snug sm:text-base">
                      {
                        mainNews.title
                      }
                    </h3>

                    {mainNews.summary ? (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {
                          mainNews.summary
                        }
                      </p>
                    ) : null}

                    {mainNews.external_url ? (
                      <a
                        href={
                          mainNews.external_url
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary"
                      >
                        Leer más

                        <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                  </div>
                </div>

                {secondaryNews.length >
                0 ? (
                  <div className="border-t border-border">
                    {secondaryNews.map(
                      (
                        item,
                      ) => (
                        <SmallNews
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
                ) : null}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-muted-foreground">
                Pronto encontrarás aquí las novedades de La Vitrina.
              </div>
            )}
          </article>

          {/* PROTAGONISTA */}

          <article className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <p className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />

                Protagonista
              </p>

              <h2 className="mt-0.5 font-display text-base font-semibold">
                Emprendedor destacado
              </h2>
            </div>

            {weekly.isLoading ? (
              <div className="h-48 animate-pulse bg-muted" />
            ) : highlighted ? (
              <div className="flex gap-3 p-4">
                {highlighted.photo_url ? (
                  <img
                    src={
                      highlighted.photo_url
                    }
                    alt={
                      highlighted.business_name
                    }
                    className="h-28 w-28 shrink-0 rounded-lg object-cover sm:h-32 sm:w-36"
                  />
                ) : null}

                <div className="min-w-0">
                  <p className="line-clamp-1 text-[10px] text-muted-foreground">
                    {
                      highlighted.owner_name
                    }

                    {highlighted.categories
                      ?.name
                      ? ` · ${highlighted.categories.name}`
                      : ""}

                    {highlighted.activities
                      ?.name
                      ? ` · ${highlighted.activities.name}`
                      : ""}
                  </p>

                  <h3 className="mt-1 line-clamp-1 font-display text-base font-semibold">
                    {
                      highlighted.business_name
                    }
                  </h3>

                  <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                    {weekly.data
                      ?.story ||
                      highlighted.short_description}
                  </p>

                  <Link
                    to="/emprendedores/$slug"
                    params={{
                      slug:
                        highlighted.slug,
                    }}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary"
                  >
                    Ver perfil

                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-muted-foreground">
                Próximamente conocerás aquí a un emprendedor destacado.
              </div>
            )}
          </article>
        </div>
      </section>

      {/* ACCESOS COMPLEMENTARIOS */}

      <section className="border-y border-border bg-secondary/10">
        <div className="container-page flex flex-wrap items-center gap-x-5 gap-y-2 py-3">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            También en La Vitrina
          </span>

          <TextLink
            to="/eventos"
            label="Eventos"
          />

          <TextLink
            to="/educa"
            label="Educa"
          />

          <TextLink
            to="/radio"
            label="Radio"
          />

          <TextLink
            to="/compraventa"
            label="Compra-venta"
          />
        </div>
      </section>

      {/* AUSPICIADORES */}

      <section className="container-page py-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
              Nos apoyan
            </p>

            <h2 className="mt-0.5 font-display text-base font-semibold">
              Auspiciadores y aliados
            </h2>
          </div>
        </div>

        {sponsors.isLoading ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({
              length:
                4,
            }).map(
              (
                _,
                index,
              ) => (
                <div
                  key={
                    index
                  }
                  className="h-20 animate-pulse rounded-xl bg-muted"
                />
              ),
            )}
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {(sponsors.data ??
              []).map(
              (
                sponsor,
              ) => (
                <SponsorCard
                  key={
                    sponsor.id
                  }
                  sponsor={
                    sponsor
                  }
                />
              ),
            )}
          </div>
        )}
      </section>
    </>
  );
}

function HeroPublicMetric({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="min-w-0 px-1 text-center sm:px-1.5">
      <p className="truncate font-display text-[11px] font-semibold leading-none text-foreground sm:text-xs">
        {new Intl.NumberFormat("es-CL").format(value)}
      </p>

      <p className="mt-1 truncate text-[7px] uppercase tracking-wide text-muted-foreground sm:text-[8px]">
        {label}
      </p>
    </div>
  );
}

function Indicator({
  label,
  value,
  decimals,
}: {
  label: string;
  value?: number;
  decimals: number;
}) {
  if (
    value ===
    undefined
  ) {
    return null;
  }

  return (
    <div className="flex shrink-0 items-baseline gap-1.5">
      <span className="text-[9px] font-semibold uppercase text-muted-foreground">
        {label}
      </span>

      <span className="text-xs font-semibold">
        $
        {new Intl.NumberFormat(
          "es-CL",
          {
            minimumFractionDigits:
              decimals,

            maximumFractionDigits:
              decimals,
          },
        ).format(
          value,
        )}
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
    <div className="flex items-center gap-3 px-4 py-3">
      {item.image_url ? (
        <img
          src={
            item.image_url
          }
          alt=""
          className="h-10 w-12 shrink-0 rounded-md object-cover"
        />
      ) : null}

      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-xs font-medium">
          {
            item.title
          }
        </p>

        {item.summary ? (
          <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">
            {
              item.summary
            }
          </p>
        ) : null}
      </div>

      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
    </div>
  );

  if (
    item.external_url
  ) {
    return (
      <a
        href={
          item.external_url
        }
        target="_blank"
        rel="noreferrer"
        className="block border-b border-border last:border-b-0 hover:bg-secondary/20"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="border-b border-border last:border-b-0">
      {content}
    </div>
  );
}

function TextLink({
  to,
  label,
}: {
  to:
    "/eventos" |
    "/educa" |
    "/radio" |
    "/compraventa";

  label:
    string;
}) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 text-xs font-medium text-foreground/75 hover:text-primary"
    >
      {label}

      <ArrowRight className="h-3 w-3" />
    </Link>
  );
}

function SponsorCard({
  sponsor,
}: {
  sponsor:
    Sponsor;
}) {
  const web =
    websiteLink(
      sponsor.website_url,
    );

  const content = (
    <div className="flex h-full min-h-20 items-center justify-center rounded-xl border border-border bg-card p-3">
      {sponsor.logo_url ? (
        <img
          src={
            sponsor.logo_url
          }
          alt={
            sponsor.name
          }
          loading="lazy"
          className="max-h-10 max-w-full object-contain"
        />
      ) : (
        <span className="text-center text-xs font-semibold">
          {
            sponsor.name
          }
        </span>
      )}
    </div>
  );

  if (web) {
    return (
      <a
        href={web}
        target="_blank"
        rel="noreferrer"
        aria-label={
          sponsor.name
        }
      >
        {content}
      </a>
    );
  }

  return content;
}