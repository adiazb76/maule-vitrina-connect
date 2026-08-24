import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

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
  type DirectoryFilters,
} from "@/lib/vitrina";

type SearchParams = {
  q?: string | undefined;
  categoria?: string | undefined;
  comuna?: string | undefined;
  orden?: DirectoryFilters["sort"];
};

export const Route = createFileRoute("/emprendedores/")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    categoria:
      typeof search["categoria"] === "string"
        ? search["categoria"]
        : undefined,
    comuna:
      typeof search["comuna"] === "string" ? search["comuna"] : undefined,
    orden: ["recientes", "visitados", "destacados", "alfabetico"].includes(
      String(search["orden"]),
    )
      ? (search["orden"] as DirectoryFilters["sort"])
      : undefined,
  }),

  head: () => ({
    meta: [
      {
        title: "Emprendedores del Maule Sur | La Vitrina",
      },
      {
        name: "description",
        content:
          "Descubre y contacta emprendedores del Maule Sur. Busca por nombre, producto, servicio, categoría o comuna.",
      },
      {
        property: "og:title",
        content: "Comunidad de emprendedores del Maule Sur",
      },
      {
        property: "og:description",
        content:
          "Descubre, conoce y contacta emprendedores de tu zona en La Vitrina.",
      },
    ],
    links: [{ rel: "canonical", href: "/emprendedores" }],
  }),

  component: Directory,
});

function Directory() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/emprendedores/" });

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

  const filters: DirectoryFilters = {
    search: search.q,
    categorySlug: search.categoria,
    comunaSlug: search.comuna,
    sort: search.orden ?? "destacados",
  };

  const list = useQuery({
    queryKey: ["entrepreneurs", filters],
    queryFn: () => fetchEntrepreneurs(filters),
  });

  const update = (patch: Partial<SearchParams>) =>
    navigate({
      search: (prev: SearchParams) => ({
        ...prev,
        ...patch,
      }),
    });

  return (
    <>
      {/* ENCABEZADO */}
      <section className="border-b border-border bg-surface">
        <div className="container-page py-12">
          <p className="eyebrow">LA COMUNIDAD</p>

          <h1 className="mt-2 font-display text-4xl font-semibold">
            Emprendedores del Maule Sur
          </h1>

          <p className="mt-2 max-w-2xl text-muted-foreground">
            Descubre negocios locales, conoce sus historias y contacta
            directamente con quienes están detrás de cada emprendimiento.
          </p>

          {/* BUSCADOR */}
          <form
            className="mt-6 flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              update({
                q: term || undefined,
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
              className="h-12 rounded-xl"
            >
              Buscar
            </Button>
          </form>

          {/* FILTROS */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />

            <Select
              value={search.categoria ?? "todas"}
              onValueChange={(v) =>
                update({
                  categoria: v === "todas" ? undefined : v,
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

                {categories.data?.map((c) => (
                  <SelectItem key={c.id} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={search.comuna ?? "todas"}
              onValueChange={(v) =>
                update({
                  comuna: v === "todas" ? undefined : v,
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

                {comunas.data?.map((c) => (
                  <SelectItem key={c.id} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={search.orden ?? "destacados"}
              onValueChange={(v) =>
                update({
                  orden: v as SearchParams["orden"],
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

            {search.q || search.categoria || search.comuna ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  navigate({
                    search: (prev: SearchParams) => ({
                      ...prev,
                      q: undefined,
                      categoria: undefined,
                      comuna: undefined,
                    }),
                  })
                }
              >
                Limpiar filtros
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      {/* RESULTADOS */}
      <section className="container-page py-12">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {list.isLoading
              ? "Buscando..."
              : `${list.data?.length ?? 0} emprendimientos encontrados`}
          </p>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-96 animate-pulse rounded-2xl bg-muted"
                />
              ))
            : list.data?.map((e) => (
                <EntrepreneurCard key={e.id} e={e} />
              ))}
        </div>

        {!list.isLoading && (list.data?.length ?? 0) === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="font-display text-xl">
              Todavía no encontramos resultados
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Prueba con otra búsqueda, categoría o comuna.
              La comunidad crece cada semana.
            </p>

            <Button
              asChild
              variant="outline"
              className="mt-5"
            >
              <a href="/sumate">
                ¿Quieres aparecer en La Vitrina?
              </a>
            </Button>
          </div>
        ) : null}
      </section>
    </>
  );
}