import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Handshake,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EntrepreneurCard } from "@/components/entrepreneur-card";

import {
  fetchCategories,
  fetchComunas,
  fetchEntrepreneurs,
  fetchWeeklyFeature,
  whatsappLink,
  type DirectoryFilters,
} from "@/lib/vitrina";

type SearchParams = {
  q?: string;
  categoria?: string;
  comuna?: string;
  orden?: DirectoryFilters["sort"];
};

export const Route = createFileRoute("/comunidad")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,

    categoria:
      typeof search["categoria"] === "string"
        ? search["categoria"]
        : undefined,

    comuna:
      typeof search["comuna"] === "string"
        ? search["comuna"]
        : undefined,

    orden: ["recientes", "visitados", "destacados", "alfabetico"].includes(
      String(search["orden"]),
    )
      ? (search["orden"] as DirectoryFilters["sort"])
      : undefined,
  }),

  head: () => ({
    meta: [
      {
        title: "Comunidad de emprendedores del Maule Sur | La Vitrina",
      },
      {
        name: "description",
        content:
          "Descubre, busca y conecta con emprendedores del Maule Sur por categoría, comuna y oportunidades de colaboración.",
      },
    ],
  }),

  component: ComunidadPage,
});

function ComunidadPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/comunidad" });

  const [term, setTerm] = useState(search.q ?? "");

  useEffect(() => {
    setTerm(search.q ?? "");
  }, [search.q]);

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const comunas = useQuery({
    queryKey: ["comunas"],
    queryFn: fetchComunas,
  });

  const weekly = useQuery({
    queryKey: ["weekly"],
    queryFn: fetchWeeklyFeature,
  });

  const filters: DirectoryFilters = {
    search: search.q,
    categorySlug: search.categoria,
    comunaSlug: search.comuna,
    sort: search.orden ?? "destacados",
  };

  const list = useQuery({
    queryKey: ["community-entrepreneurs", filters],
    queryFn: () => fetchEntrepreneurs(filters, 200),
  });

  const all = useQuery({
    queryKey: ["community-all-entrepreneurs"],
    queryFn: () => fetchEntrepreneurs({}, 200),
  });

  const update = (patch: Partial<SearchParams>) =>
    navigate({
      search: (previous: SearchParams) => ({
        ...previous,
        ...patch,
      }),
    });

  const collaborators = (all.data ?? []).filter(
    (entrepreneur) =>
      entrepreneur.collaboration_offering ||
      entrepreneur.collaboration_seeking,
  );

  const featured = weekly.data?.entrepreneurs ?? null;

  return (
    <>
      {/* CABECERA COMPACTA */}

      <section className="border-b border-border bg-surface">
        <div className="container-page py-10 sm:py-12">
          <p className="eyebrow">LA COMUNIDAD</p>

          <div className="mt-2 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Encuentra. Conoce. Conecta.
              </h1>

              <p className="mt-2 max-w-2xl text-muted-foreground">
                Emprendedores, productos, servicios y oportunidades del
                Maule Sur en un solo lugar.
              </p>
            </div>

            <Button asChild variant="outline">
              <Link to="/sumate">
                Quiero aparecer en La Vitrina
              </Link>
            </Button>
          </div>

          {/* BUSCADOR */}

          <form
            className="mt-7 flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();

              update({
                q: term.trim() || undefined,
              });
            }}
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="¿Qué estás buscando?"
                aria-label="Buscar en La Vitrina"
                className="h-12 rounded-xl bg-card pl-9"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="h-12 rounded-xl px-8"
            >
              Buscar
            </Button>
          </form>

          {/* FILTROS */}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />

            <Select
              value={search.categoria ?? "todas"}
              onValueChange={(value) =>
                update({
                  categoria:
                    value === "todas" ? undefined : value,
                })
              }
            >
              <SelectTrigger className="h-10 w-[190px] bg-card">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="todas">
                  Todas las categorías
                </SelectItem>

                {categories.data?.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={category.slug}
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={search.comuna ?? "todas"}
              onValueChange={(value) =>
                update({
                  comuna:
                    value === "todas" ? undefined : value,
                })
              }
            >
              <SelectTrigger className="h-10 w-[180px] bg-card">
                <SelectValue placeholder="Comuna" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="todas">
                  Todas las comunas
                </SelectItem>

                {comunas.data?.map((comuna) => (
                  <SelectItem
                    key={comuna.id}
                    value={comuna.slug}
                  >
                    {comuna.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={search.orden ?? "destacados"}
              onValueChange={(value) =>
                update({
                  orden: value as SearchParams["orden"],
                })
              }
            >
              <SelectTrigger className="h-10 w-[170px] bg-card">
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
            search.comuna ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  navigate({
                    search: {
                      q: undefined,
                      categoria: undefined,
                      comuna: undefined,
                      orden: search.orden,
                    },
                  })
                }
              >
                Limpiar filtros
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      {/* EMPRENDEDOR DESTACADO */}

      {featured ? (
        <section className="container-page pt-10">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="grid md:grid-cols-[0.8fr_1.2fr]">
              {featured.photo_url ? (
                <img
                  src={featured.photo_url}
                  alt={featured.business_name}
                  className="h-64 w-full object-cover md:h-full"
                />
              ) : null}

              <div className="p-6 sm:p-8">
                <p className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4" />
                  Emprendedor destacado
                </p>

                <h2 className="mt-2 font-display text-2xl font-semibold">
                  {featured.business_name}
                </h2>

                <p className="text-sm text-muted-foreground">
                  {featured.owner_name}
                </p>

                <p className="mt-3 max-w-2xl text-foreground/85">
                  {weekly.data?.story ??
                    featured.short_description}
                </p>

                <Button asChild className="mt-5">
                  <Link
                    to="/emprendedores/$slug"
                    params={{ slug: featured.slug }}
                  >
                    Conocer su historia
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* DIRECTORIO */}

      <section className="container-page py-10 sm:py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">DESCUBRE</p>

            <h2 className="mt-1 font-display text-2xl font-semibold">
              Emprendedores de la comunidad
            </h2>
          </div>

          <p className="text-sm text-muted-foreground">
            {list.isLoading
              ? "Buscando..."
              : `${list.data?.length ?? 0} emprendimientos`}
          </p>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-96 animate-pulse rounded-2xl bg-muted"
                />
              ))
            : list.data?.map((entrepreneur) => (
                <EntrepreneurCard
                  key={entrepreneur.id}
                  e={entrepreneur}
                />
              ))}
        </div>

        {!list.isLoading &&
        (list.data?.length ?? 0) === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="font-display text-xl">
              No encontramos resultados
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Prueba con otra búsqueda, categoría o comuna.
            </p>
          </div>
        ) : null}
      </section>

      {/* COLABORACIÓN */}

      <section className="border-y border-border bg-secondary/25">
        <div className="container-page py-10 sm:py-12">
          <div className="max-w-2xl">
            <p className="eyebrow">
              CONECTA
            </p>

            <h2 className="mt-1 inline-flex items-center gap-2 font-display text-2xl font-semibold">
              <Handshake className="h-5 w-5 text-primary" />
              Oportunidades de colaboración
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Emprendedores que buscan apoyo, alianzas,
              proveedores, conocimientos o que tienen algo
              que ofrecer a la comunidad.
            </p>
          </div>

          {collaborators.length === 0 &&
          !all.isLoading ? (
            <div className="mt-6 rounded-xl border border-dashed border-border bg-background p-8 text-center text-muted-foreground">
              Aún no hay oportunidades de colaboración publicadas.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {collaborators.slice(0, 6).map((entrepreneur) => {
                const whatsapp = whatsappLink(entrepreneur);

                return (
                  <article
                    key={entrepreneur.id}
                    className="rounded-2xl border border-border bg-card p-5"
                  >
                    <h3 className="font-display text-lg font-semibold">
                      <Link
                        to="/emprendedores/$slug"
                        params={{
                          slug: entrepreneur.slug,
                        }}
                      >
                        {entrepreneur.business_name}
                      </Link>
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {entrepreneur.categories?.name ??
                        "Emprendimiento"}
                      {entrepreneur.comunas?.name
                        ? ` · ${entrepreneur.comunas.name}`
                        : ""}
                    </p>

                    {entrepreneur.collaboration_seeking ? (
                      <div className="mt-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Busca
                        </p>

                        <p className="mt-1 text-sm">
                          {
                            entrepreneur.collaboration_seeking
                          }
                        </p>
                      </div>
                    ) : null}

                    {entrepreneur.collaboration_offering ? (
                      <div className="mt-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Puede aportar
                        </p>

                        <p className="mt-1 text-sm">
                          {
                            entrepreneur.collaboration_offering
                          }
                        </p>
                      </div>
                    ) : null}

                    {whatsapp ? (
                      <Button
                        asChild
                        variant="whatsapp"
                        size="sm"
                        className="mt-5"
                      >
                        <a
                          href={whatsapp}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Contactar
                        </a>
                      </Button>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* LLAMADO FINAL */}

      <section className="container-page py-12">
        <div className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-border bg-card p-7 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold">
              ¿Tienes un emprendimiento?
            </h2>

            <p className="mt-1 text-muted-foreground">
              Súmate a La Vitrina y hazte visible en la
              comunidad del Maule Sur.
            </p>
          </div>

          <Button asChild>
            <Link to="/sumate">
              Quiero ser parte
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}