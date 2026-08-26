import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  MapPin,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { LikeButton } from "@/components/like-button";
import { fetchEvents } from "@/lib/vitrina";

export const Route = createFileRoute("/eventos")({
  head: () => ({
    meta: [
      {
        title:
          "Eventos y ferias de emprendedores | La Vitrina Maule Sur",
      },
      {
        name: "description",
        content:
          "Ferias, talleres y encuentros de la comunidad de emprendedores del Maule Sur.",
      },
      {
        property: "og:title",
        content:
          "Eventos de la comunidad | La Vitrina",
      },
      {
        property: "og:description",
        content:
          "Ferias, talleres y encuentros del Maule Sur.",
      },
    ],
  }),

  component: EventosPage,
});

const fmt =
  new Intl.DateTimeFormat(
    "es-CL",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

function EventosPage() {
  const events = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  const now =
    Date.now();

  const upcoming =
    (events.data ?? [])
      .filter((event) => {
        const end =
          event.ends_at ??
          event.starts_at;

        return (
          new Date(end).getTime() >=
          now
        );
      })
      .sort(
        (a, b) =>
          new Date(
            a.starts_at,
          ).getTime() -
          new Date(
            b.starts_at,
          ).getTime(),
      );

  return (
    <div className="container-page py-8 sm:py-10">
      {/* CABECERA */}

      <header className="max-w-2xl">
        <p className="eyebrow">
          AGENDA
        </p>

        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Eventos
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Ferias, talleres y encuentros donde la comunidad se muestra y se conecta.
        </p>
      </header>

      {/* CONTADOR */}

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {events.isLoading
            ? "Cargando eventos..."
            : `${upcoming.length} eventos vigentes`}
        </p>
      </div>

      {/* SIN EVENTOS */}

      {upcoming.length === 0 &&
      !events.isLoading ? (
        <div className="mt-5 rounded-xl border border-dashed border-border p-7 text-center">
          <p className="font-display text-base font-semibold">
            No hay eventos vigentes
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Vuelve pronto para conocer nuevas actividades.
          </p>
        </div>
      ) : null}

      {/* LISTADO */}

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {events.isLoading
          ? Array.from({
              length: 4,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-40 animate-pulse rounded-xl bg-muted"
                />
              ),
            )
          : upcoming.map(
              (event) => (
                <EventCard
                  key={event.id}
                  event={event}
                />
              ),
            )}
      </div>
    </div>
  );
}

function EventCard({
  event,
}: {
  event: any;
}) {
  return (
    <article className="group flex min-h-36 overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-card">
      {/* IMAGEN */}

      <div className="w-28 shrink-0 bg-muted sm:w-36">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            loading="lazy"
            className="h-full min-h-36 w-full object-cover"
          />
        ) : (
          <div className="grid h-full min-h-36 place-items-center">
            <CalendarDays className="h-6 w-6 text-muted-foreground/50" />
          </div>
        )}
      </div>

      {/* CONTENIDO */}

      <div className="flex min-w-0 flex-1 flex-col p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
              <CalendarDays className="h-3 w-3" />

              {fmt.format(
                new Date(
                  event.starts_at,
                ),
              )}
            </p>

            <h2 className="mt-1 line-clamp-2 font-display text-base font-semibold leading-tight">
              {event.title}
            </h2>
          </div>

          <LikeButton
            contentType="event"
            contentId={event.id}
            compact
          />
        </div>

        {event.description ? (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-foreground/70">
            {event.description}
          </p>
        ) : null}

        <div className="mt-2 space-y-1 text-[10px] text-muted-foreground">
          {event.location ? (
            <p className="flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />

              <span className="truncate">
                {event.location}
              </span>
            </p>
          ) : null}

          {event.organizer ? (
            <p className="flex items-center gap-1">
              <User className="h-3 w-3 shrink-0" />

              <span className="truncate">
                {event.organizer}
              </span>
            </p>
          ) : null}
        </div>

        {event.registration_url ? (
          <div className="mt-auto pt-2">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-[11px]"
            >
              <a
                href={
                  event.registration_url
                }
                target="_blank"
                rel="noreferrer"
              >
                Más información
              </a>
            </Button>
          </div>
        ) : null}
      </div>
    </article>
  );
}