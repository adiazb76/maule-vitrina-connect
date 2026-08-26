import { Link } from "@tanstack/react-router";
import {
  Globe,
  Instagram,
  MapPin,
  MessageCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LikeButton } from "@/components/like-button";

import {
  instagramLink,
  logInteraction,
  websiteLink,
  whatsappLink,
  type Entrepreneur,
} from "@/lib/vitrina";

export function EntrepreneurCard({
  e,
}: {
  e: Entrepreneur;
}) {
  const wa = whatsappLink(e);
  const ig = instagramLink(e.instagram);
  const web = websiteLink(e.website);

  return (
    <article className="group flex overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-card">
      {/* IMAGEN COMPACTA */}

      <Link
        to="/emprendedores/$slug"
        params={{
          slug: e.slug,
        }}
        className="relative block w-28 shrink-0 overflow-hidden bg-muted sm:w-32"
      >
        {e.photo_url ? (
          <img
            src={e.photo_url}
            alt={e.business_name}
            loading="lazy"
            className="h-full min-h-36 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="h-full min-h-36 w-full bg-muted" />
        )}

        {e.featured ? (
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-semibold text-primary-foreground">
            Destacado
          </span>
        ) : null}
      </Link>

      {/* CONTENIDO */}

      <div className="flex min-w-0 flex-1 flex-col p-3">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="line-clamp-2 font-display text-base font-semibold leading-tight">
              <Link
                to="/emprendedores/$slug"
                params={{
                  slug: e.slug,
                }}
              >
                {e.business_name}
              </Link>
            </h3>

            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {e.owner_name}
            </p>
          </div>

          <LikeButton
            contentType="entrepreneur"
            contentId={e.id}
            compact
          />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {e.categories?.name ? (
            <Badge
              variant="secondary"
              className="h-5 rounded-full px-2 text-[10px] font-medium"
            >
              {e.categories.name}
            </Badge>
          ) : null}

          {e.comunas?.name ? (
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {e.comunas.name}
            </span>
          ) : null}
        </div>

        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-foreground/75">
          {e.short_description}
        </p>

        {e.tags.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {e.tags
              .slice(0, 2)
              .map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border px-1.5 py-0.5 text-[9px] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
          </div>
        ) : null}

        {/* ACCIONES */}

        <div className="mt-auto flex items-center gap-1.5 pt-3">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="h-8 px-2.5 text-xs"
          >
            <Link
              to="/emprendedores/$slug"
              params={{
                slug: e.slug,
              }}
            >
              Ver perfil
            </Link>
          </Button>

          {wa ? (
            <Button
              asChild
              size="sm"
              variant="whatsapp"
              className="h-8 px-2.5 text-xs"
            >
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  logInteraction(
                    e.id,
                    "whatsapp",
                  )
                }
              >
                <MessageCircle className="h-3.5 w-3.5" />
              </a>
            </Button>
          ) : null}

          {ig ? (
            <a
              href={ig}
              target="_blank"
              rel="noreferrer"
              aria-label={`Instagram de ${e.business_name}`}
              onClick={() =>
                logInteraction(
                  e.id,
                  "instagram",
                )
              }
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
            >
              <Instagram className="h-3.5 w-3.5" />
            </a>
          ) : null}

          {web ? (
            <a
              href={web}
              target="_blank"
              rel="noreferrer"
              aria-label={`Sitio web de ${e.business_name}`}
              onClick={() =>
                logInteraction(
                  e.id,
                  "website",
                )
              }
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
            >
              <Globe className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}