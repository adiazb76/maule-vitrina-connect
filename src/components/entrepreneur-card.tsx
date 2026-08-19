import { Link } from "@tanstack/react-router";
import { MapPin, MessageCircle, Instagram, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  instagramLink,
  logInteraction,
  websiteLink,
  whatsappLink,
  type Entrepreneur,
} from "@/lib/vitrina";

export function EntrepreneurCard({ e }: { e: Entrepreneur }) {
  const wa = whatsappLink(e);
  const ig = instagramLink(e.instagram);
  const web = websiteLink(e.website);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-shadow hover:shadow-lift">
      <Link
        to="/emprendedores/$slug"
        params={{ slug: e.slug }}
        className="relative block aspect-[4/3] overflow-hidden bg-muted"
      >
        {e.photo_url ? (
          <img
            src={e.photo_url}
            alt={`${e.business_name}, emprendimiento de ${e.comunas?.name ?? "el Maule Sur"}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
        {e.featured ? (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
            Destacado
          </span>
        ) : null}
        {e.logo_url ? (
          <img
            src={e.logo_url}
            alt={`Logo de ${e.business_name}`}
            loading="lazy"
            className="absolute bottom-3 right-3 h-12 w-12 rounded-full border-2 border-card object-cover"
          />
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {e.categories?.name ? (
            <Badge variant="secondary" className="rounded-full font-medium">
              {e.categories.name}
            </Badge>
          ) : null}
          {e.comunas?.name ? (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {e.comunas.name}
            </span>
          ) : null}
        </div>

        <h3 className="mt-3 font-display text-lg font-semibold leading-snug">
          <Link to="/emprendedores/$slug" params={{ slug: e.slug }}>
            {e.business_name}
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground">{e.owner_name}</p>
        <p className="mt-2 line-clamp-3 text-sm text-foreground/80">{e.short_description}</p>

        {e.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {e.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-5 flex items-center gap-2 pt-1">
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link to="/emprendedores/$slug" params={{ slug: e.slug }}>
              Ver perfil
            </Link>
          </Button>
          {wa ? (
            <Button asChild size="sm" variant="whatsapp" className="flex-1">
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                onClick={() => logInteraction(e.id, "whatsapp")}
              >
                <MessageCircle className="h-4 w-4" />
                Contactar
              </a>
            </Button>
          ) : null}
          {ig ? (
            <a
              href={ig}
              target="_blank"
              rel="noreferrer"
              aria-label={`Instagram de ${e.business_name}`}
              onClick={() => logInteraction(e.id, "instagram")}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
            >
              <Instagram className="h-4 w-4" />
            </a>
          ) : null}
          {web ? (
            <a
              href={web}
              target="_blank"
              rel="noreferrer"
              aria-label={`Sitio web de ${e.business_name}`}
              onClick={() => logInteraction(e.id, "website")}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
            >
              <Globe className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
