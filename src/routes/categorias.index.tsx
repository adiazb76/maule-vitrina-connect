import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { fetchCategories, fetchComunas, fetchEntrepreneurs } from "@/lib/vitrina";

export const Route = createFileRoute("/categorias/")({
  head: () => ({
    meta: [
      { title: "Categorías de emprendimientos | La Vitrina Maule Sur" },
      {
        name: "description",
        content:
          "Explora los rubros de emprendedores del Maule Sur: gastronomía, artesanía, servicios, salud, turismo y más.",
      },
      { property: "og:title", content: "Categorías de emprendimientos | La Vitrina" },
      { property: "og:description", content: "Explora rubros y comunas del Maule Sur." },
    ],
  }),
  component: CategoriasPage,
});

function CategoriasPage() {
  const categories = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const comunas = useQuery({ queryKey: ["comunas"], queryFn: fetchComunas });
  const all = useQuery({ queryKey: ["all-entrepreneurs"], queryFn: () => fetchEntrepreneurs({}, 200) });

  const countBy = (key: "categories" | "comunas", slug: string) =>
    (all.data ?? []).filter((e) => e[key]?.slug === slug).length;

  return (
    <div className="container-page py-12 sm:py-16">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Categorías</h1>
        <p className="mt-3 text-muted-foreground">
          Encuentra emprendimientos por rubro o por comuna del Maule Sur.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Por rubro</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(categories.data ?? []).map((c) => (
            <Link
              key={c.id}
              to="/emprendedores"
              search={{ categoria: c.slug }}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-lift"
            >
              <span className="font-medium">{c.name}</span>
              <span className="text-sm text-muted-foreground">{countBy("categories", c.slug)}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold">Por comuna</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {(comunas.data ?? []).map((c) => (
            <Link
              key={c.id}
              to="/emprendedores"
              search={{ comuna: c.slug }}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm transition-colors hover:bg-secondary"
            >
              {c.name}
              <span className="ml-2 text-muted-foreground">{countBy("comunas", c.slug)}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
