import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeDollarSign,
  Search,
  ShoppingBag,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LikeButton } from "@/components/like-button";

import { supabase } from "@/integrations/supabase/client";

type MarketplaceAd = {
  id: string;
  entrepreneur_id: string;
  type: "vendo" | "compro";
  title: string;
  description: string;
  price: number | null;
  image_url: string | null;
  contact_url: string | null;
  status: string;
  visible: boolean;
  created_at: string;
  expires_at: string;
};

export const Route = createFileRoute("/compraventa")({
  head: () => ({
    meta: [
      {
        title: "Compraventa | La Vitrina Maule Sur",
      },
      {
        name: "description",
        content:
          "Avisos de compra y venta publicados por emprendedores de la comunidad de La Vitrina.",
      },
    ],
  }),

  component: CompraventaPage,
});

function CompraventaPage() {
  const [term, setTerm] = useState("");
  const [type, setType] =
    useState<"todos" | "vendo" | "compro">("todos");

  const ads = useQuery({
    queryKey: ["marketplace-ads"],

    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("marketplace_ads")
        .select("*")
        .eq("status", "aprobado")
        .eq("visible", true)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      return (data ?? []) as MarketplaceAd[];
    },
  });

  const filtered = useMemo(() => {
    const query =
      term.trim().toLowerCase();

    return (ads.data ?? []).filter((ad) => {
      const matchType =
        type === "todos" ||
        ad.type === type;

      const matchSearch =
        !query ||
        ad.title.toLowerCase().includes(query) ||
        ad.description.toLowerCase().includes(query);

      return matchType && matchSearch;
    });
  }, [ads.data, term, type]);

  return (
    <div className="container-page py-8 sm:py-10">
      {/* CABECERA */}

      <header className="max-w-2xl">
        <p className="eyebrow">
          COMUNIDAD
        </p>

        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Compraventa
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Oportunidades de compra y venta publicadas por emprendedores de La Vitrina.
        </p>
      </header>

      {/* BUSCADOR + FILTROS */}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={term}
            onChange={(event) =>
              setTerm(event.target.value)
            }
            placeholder="Buscar aviso..."
            className="h-10 pl-9"
          />
        </div>

        <div className="flex gap-2">
          <FilterButton
            active={type === "todos"}
            onClick={() =>
              setType("todos")
            }
          >
            Todos
          </FilterButton>

          <FilterButton
            active={type === "vendo"}
            onClick={() =>
              setType("vendo")
            }
          >
            Vendo
          </FilterButton>

          <FilterButton
            active={type === "compro"}
            onClick={() =>
              setType("compro")
            }
          >
            Compro
          </FilterButton>
        </div>
      </div>

      {/* CONTADOR */}

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {ads.isLoading
            ? "Cargando avisos..."
            : `${filtered.length} avisos vigentes`}
        </p>
      </div>

      {/* SIN AVISOS */}

      {!ads.isLoading &&
      filtered.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-border p-7 text-center">
          <ShoppingBag className="mx-auto h-6 w-6 text-muted-foreground/60" />

          <p className="mt-2 font-display text-base font-semibold">
            No hay avisos disponibles
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Prueba otra búsqueda o vuelve más tarde.
          </p>
        </div>
      ) : null}

      {/* GRILLA */}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ads.isLoading
          ? Array.from({
              length: 8,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-56 animate-pulse rounded-xl bg-muted"
                />
              ),
            )
          : filtered.map((ad) => (
              <MarketplaceCard
                key={ad.id}
                ad={ad}
              />
            ))}
      </div>
    </div>
  );
}

function MarketplaceCard({
  ad,
}: {
  ad: MarketplaceAd;
}) {
  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-card">
      {/* IMAGEN */}

      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {ad.image_url ? (
          <img
            src={ad.image_url}
            alt={ad.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="grid h-full place-items-center">
            <ShoppingBag className="h-7 w-7 text-muted-foreground/50" />
          </div>
        )}

        <div className="absolute left-2 top-2">
          <Badge
            variant={
              ad.type === "vendo"
                ? "default"
                : "secondary"
            }
            className="h-5 rounded-full px-2 text-[10px]"
          >
            {ad.type === "vendo"
              ? "Vendo"
              : "Compro"}
          </Badge>
        </div>

        <div className="absolute right-2 top-2">
          <LikeButton
            contentType="marketplace"
            contentId={ad.id}
            compact
          />
        </div>
      </div>

      {/* CONTENIDO */}

      <div className="p-3">
        <h2 className="line-clamp-2 font-display text-base font-semibold leading-tight">
          {ad.title}
        </h2>

        {ad.price != null ? (
          <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-primary">
            <BadgeDollarSign className="h-4 w-4" />

            {formatPrice(ad.price)}
          </p>
        ) : null}

        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-foreground/70">
          {ad.description}
        </p>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-[10px] text-muted-foreground">
            Hasta {formatDate(ad.expires_at)}
          </span>

          {ad.contact_url ? (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-[11px]"
            >
              <a
                href={normalizeContactUrl(
                  ad.contact_url,
                )}
                target="_blank"
                rel="noreferrer"
              >
                Contactar
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
          : "rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
      }
    >
      {children}
    </button>
  );
}

function formatPrice(
  value: number,
) {
  return new Intl.NumberFormat(
    "es-CL",
    {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    },
  ).format(value);
}

function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "es-CL",
    {
      day: "2-digit",
      month: "short",
    },
  ).format(
    new Date(value),
  );
}

function normalizeContactUrl(
  value: string,
) {
  const clean =
    value.trim();

  if (
    clean.startsWith(
      "http://",
    ) ||
    clean.startsWith(
      "https://",
    )
  ) {
    return clean;
  }

  const digits =
    clean.replace(
      /\D/g,
      "",
    );

  if (digits.length >= 8) {
    return `https://wa.me/${digits}`;
  }

  return clean;
}