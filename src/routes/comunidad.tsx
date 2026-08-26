import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  EntrepreneurCard,
} from "@/components/entrepreneur-card";

import {
  fetchActivities,
  fetchCategories,
  fetchComunas,
  fetchEntrepreneurs,
  fetchWeeklyFeature,
  type DirectoryFilters,
} from "@/lib/vitrina";

type SearchParams = {
  q?: string;
  categoria?: string;
  actividad?: string;
  comuna?: string;
  orden?: DirectoryFilters["sort"];
};

export const Route =
  createFileRoute(
    "/comunidad",
  )({
    validateSearch: (
      search:
        Record<
          string,
          unknown
        >,
    ): SearchParams => ({
      q:
        typeof search["q"] ===
        "string"
          ? search["q"]
          : undefined,

      categoria:
        typeof search[
          "categoria"
        ] ===
        "string"
          ? search[
              "categoria"
            ]
          : undefined,

      actividad:
        typeof search[
          "actividad"
        ] ===
        "string"
          ? search[
              "actividad"
            ]
          : undefined,

      comuna:
        typeof search[
          "comuna"
        ] ===
        "string"
          ? search[
              "comuna"
            ]
          : undefined,

      orden: [
        "recientes",
        "visitados",
        "destacados",
        "alfabetico",
      ].includes(
        String(
          search["orden"],
        ),
      )
        ? (search[
            "orden"
          ] as DirectoryFilters["sort"])
        : undefined,
    }),

    head: () => ({
      meta: [
        {
          title:
            "Comunidad de emprendedores del Maule Sur | La Vitrina",
        },

        {
          name:
            "description",

          content:
            "Descubre emprendedores del Maule Sur por rubro, actividad y comuna.",
        },
      ],
    }),

    component:
      ComunidadPage,
  });

function ComunidadPage() {
  const search =
    Route.useSearch();

  const navigate =
    useNavigate({
      from:
        "/comunidad",
    });

  const [
    term,
    setTerm,
  ] =
    useState(
      search.q ??
        "",
    );

  useEffect(() => {
    setTerm(
      search.q ??
        "",
    );
  }, [search.q]);

  const categories =
    useQuery({
      queryKey: [
        "categories",
      ],

      queryFn:
        fetchCategories,
    });

  const comunas =
    useQuery({
      queryKey: [
        "comunas",
      ],

      queryFn:
        fetchComunas,
    });

  const weekly =
    useQuery({
      queryKey: [
        "weekly",
      ],

      queryFn:
        fetchWeeklyFeature,
    });

  const selectedCategory =
    useMemo(
      () =>
        categories.data?.find(
          (
            category,
          ) =>
            category.slug ===
            search.categoria,
        ) ??
        null,

      [
        categories.data,
        search.categoria,
      ],
    );

  const activities =
    useQuery({
      queryKey: [
        "activities",
        selectedCategory?.id ??
          "all",
      ],

      queryFn: () =>
        fetchActivities(
          selectedCategory?.id,
        ),

      enabled:
        Boolean(
          selectedCategory?.id,
        ),
    });

  const filters:
    DirectoryFilters = {
      search:
        search.q,

      categorySlug:
        search.categoria,

      activitySlug:
        search.actividad,

      comunaSlug:
        search.comuna,

      sort:
        search.orden ??
        "destacados",
    };

  const list =
    useQuery({
      queryKey: [
        "community-entrepreneurs",
        filters,
      ],

      queryFn: () =>
        fetchEntrepreneurs(
          filters,
          200,
        ),
    });

  const update = (
    patch:
      Partial<SearchParams>,
  ) =>
    navigate({
      search: (
        previous:
          SearchParams,
      ) => ({
        ...previous,
        ...patch,
      }),
    });

  const featured =
    weekly.data
      ?.entrepreneurs ??
    null;

  return (
    <>
      {/* CABECERA */}

      <section className="border-b border-border bg-surface">
        <div className="container-page py-7 sm:py-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">
                LA COMUNIDAD
              </p>

              <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                Encuentra. Conoce. Conecta.
              </h1>

              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Emprendedores,
                productos y
                servicios del
                Maule Sur.
              </p>
            </div>

            <Button
              asChild
              variant="outline"
              size="sm"
            >
              <Link to="/sumate">
                Quiero aparecer
              </Link>
            </Button>
          </div>

          {/* BUSCADOR */}

          <form
            className="mt-5 flex gap-2"
            onSubmit={(
              event,
            ) => {
              event.preventDefault();

              update({
                q:
                  term.trim() ||
                  undefined,
              });
            }}
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={
                  term
                }
                onChange={(
                  event,
                ) =>
                  setTerm(
                    event
                      .target
                      .value,
                  )
                }
                placeholder="¿Qué estás buscando?"
                className="h-10 bg-card pl-9"
              />
            </div>

            <Button
              type="submit"
              size="sm"
              className="h-10 px-5"
            >
              Buscar
            </Button>
          </form>

          {/* FILTROS */}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />

            {/* RUBRO */}

            <Select
              value={
                search.categoria ??
                "todos"
              }

              onValueChange={(
                value,
              ) => {
                update({
                  categoria:
                    value ===
                    "todos"
                      ? undefined
                      : value,

                  actividad:
                    undefined,
                });
              }}
            >
              <SelectTrigger className="h-9 w-[180px] bg-card text-xs">
                <SelectValue placeholder="Rubro" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="todos">
                  Todos los rubros
                </SelectItem>

                {categories.data?.map(
                  (
                    category,
                  ) => (
                    <SelectItem
                      key={
                        category.id
                      }
                      value={
                        category.slug
                      }
                    >
                      {
                        category.name
                      }
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>

            {/* ACTIVIDAD */}

            <Select
              value={
                search.actividad ??
                "todas"
              }

              disabled={
                !selectedCategory
              }

              onValueChange={(
                value,
              ) =>
                update({
                  actividad:
                    value ===
                    "todas"
                      ? undefined
                      : value,
                })
              }
            >
              <SelectTrigger className="h-9 w-[220px] bg-card text-xs">
                <SelectValue
                  placeholder={
                    selectedCategory
                      ? "Actividad"
                      : "Primero elige un rubro"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="todas">
                  Todas las actividades
                </SelectItem>

                {activities.data?.map(
                  (
                    activity,
                  ) => (
                    <SelectItem
                      key={
                        activity.id
                      }
                      value={
                        activity.slug
                      }
                    >
                      {
                        activity.name
                      }
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>

            {/* COMUNA */}

            <Select
              value={
                search.comuna ??
                "todas"
              }

              onValueChange={(
                value,
              ) =>
                update({
                  comuna:
                    value ===
                    "todas"
                      ? undefined
                      : value,
                })
              }
            >
              <SelectTrigger className="h-9 w-[155px] bg-card text-xs">
                <SelectValue placeholder="Comuna" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="todas">
                  Todas las comunas
                </SelectItem>

                {comunas.data?.map(
                  (
                    comuna,
                  ) => (
                    <SelectItem
                      key={
                        comuna.id
                      }
                      value={
                        comuna.slug
                      }
                    >
                      {
                        comuna.name
                      }
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>

            {/* ORDEN */}

            <Select
              value={
                search.orden ??
                "destacados"
              }

              onValueChange={(
                value,
              ) =>
                update({
                  orden:
                    value as SearchParams["orden"],
                })
              }
            >
              <SelectTrigger className="h-9 w-[145px] bg-card text-xs">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="destacados">
                  Destacados
                </SelectItem>

                <SelectItem value="recientes">
                  Más nuevos
                </SelectItem>

                <SelectItem value="visitados">
                  Más visitados
                </SelectItem>

                <SelectItem value="alfabetico">
                  A - Z
                </SelectItem>
              </SelectContent>
            </Select>

            {search.q ||
            search.categoria ||
            search.actividad ||
            search.comuna ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 text-xs"
                onClick={() =>
                  navigate({
                    search: {
                      q:
                        undefined,

                      categoria:
                        undefined,

                      actividad:
                        undefined,

                      comuna:
                        undefined,

                      orden:
                        search.orden,
                    },
                  })
                }
              >
                Limpiar
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      {/* DESTACADO */}

      {featured ? (
        <section className="container-page pt-6">
          <div className="flex overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {featured.photo_url ? (
              <img
                src={
                  featured.photo_url
                }
                alt={
                  featured.business_name
                }
                className="hidden w-40 shrink-0 object-cover sm:block"
              />
            ) : null}

            <div className="min-w-0 flex-1 p-4">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                <Sparkles className="h-3.5 w-3.5" />

                Destacado
              </p>

              <h2 className="mt-1 font-display text-lg font-semibold">
                {
                  featured.business_name
                }
              </h2>

              <p className="text-xs text-muted-foreground">
                {
                  featured.owner_name
                }
              </p>

              <p className="mt-1.5 line-clamp-2 max-w-3xl text-xs leading-relaxed text-foreground/75">
                {weekly.data
                  ?.story ??
                  featured.short_description}
              </p>

              <Button
                asChild
                size="sm"
                variant="outline"
                className="mt-3 h-8 text-xs"
              >
                <Link
                  to="/emprendedores/$slug"
                  params={{
                    slug:
                      featured.slug,
                  }}
                >
                  Ver perfil
                </Link>
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {/* DIRECTORIO */}

      <section className="container-page py-7 sm:py-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="eyebrow">
              DESCUBRE
            </p>

            <h2 className="mt-1 font-display text-xl font-semibold">
              Emprendedores
            </h2>
          </div>

          <p className="text-xs text-muted-foreground">
            {list.isLoading
              ? "Buscando..."
              : `${list.data?.length ?? 0} disponibles`}
          </p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.isLoading
            ? Array.from({
                length:
                  6,
              }).map(
                (
                  _,
                  index,
                ) => (
                  <div
                    key={
                      index
                    }
                    className="h-40 animate-pulse rounded-xl bg-muted"
                  />
                ),
              )
            : list.data?.map(
                (
                  entrepreneur,
                ) => (
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

        {!list.isLoading &&
        (list.data
          ?.length ??
          0) === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-border p-7 text-center">
            <p className="font-display text-base font-semibold">
              No encontramos resultados
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Prueba con otro rubro,
              actividad o comuna.
            </p>
          </div>
        ) : null}
      </section>

      {/* CIERRE */}

      <section className="border-t border-border">
        <div className="container-page py-7">
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">
                ¿Tienes un emprendimiento?
              </h2>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Súmate a La Vitrina y hazte visible.
              </p>
            </div>

            <Button
              asChild
              size="sm"
            >
              <Link to="/sumate">
                Quiero ser parte
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}