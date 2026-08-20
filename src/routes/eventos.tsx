import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { fetchEvents } from "@/lib/vitrina";

export const Route = createFileRoute("/eventos")({
  head: () => ({
    meta: [
      { title: "Eventos y ferias de emprendedores | La Vitrina Maule Sur" },
      {
        name: "description",
        content:
          "Ferias, talleres y encuentros de la comunidad de emprendedores del Maule Sur. Revisa fechas, lugares e inscripción.",
      },
      { property: "og:title", content: "Eventos de la comunidad | La Vitrina" },
      { property: "og:description", content: "Ferias, talleres y encuentros del Maule Sur." },
    ],
  }),
  component: EventosPage,
});

const fmt = new Intl.DateTimeFormat("es-CL", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

function EventosPage() {
  const events = useQuery({ queryKey: ["events"], queryFn: fetchEvents });
  const now = Date.now();
  const upcoming = (events.data ?? []).filter((e) => new Date(e.starts_at).getTime() >= now);
  const past = (events.data ?? []).filter((e) => new Date(e.starts_at).getTime() < now).reverse();

  return (
    <div className="container-page py-12 sm:py-16">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Eventos</h1>
        <p className="mt-3 text-muted-foreground">
          Ferias, talleres y encuentros donde la comunidad se muestra y se conecta.
        </p>
      </header>

      {upcoming.length === 0 && !events.isLoading ? (
        <p className="mt-10 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
          No hay eventos próximos publicados. ¡Vuelve pronto!
        </p>
      ) : null}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {upcoming.map((e) => (
          <article key={e.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            {e.image_url ? (
              <img src={e.image_url} alt={e.title} loading="lazy" className="aspect-[16/9] w-full object-cover" />
            ) : null}
            <div className="p-6">
              <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                <CalendarDays className="h-4 w-4" />
                {fmt.format(new Date(e.starts_at))}
              </p>
              <h2 className="mt-2 font-display text-xl font-semibold">{e.title}</h2>
              {e.description ? <p className="mt-2 text-sm text-foreground/80">{e.description}</p> : null}
              <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                {e.location ? (
                  <p className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> {e.location}
                  </p>
                ) : null}
                {e.organizer ? (
                  <p className="inline-flex items-center gap-1.5">
                    <User className="h-4 w-4" /> {e.organizer}
                  </p>
                ) : null}
              </div>
              {e.registration_url ? (
                <Button asChild className="mt-5">
                  <a href={e.registration_url} target="_blank" rel="noreferrer">
                    Inscribirme
                  </a>
                </Button>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      {past.length > 0 ? (
        <section className="mt-14">
          <h2 className="font-display text-xl font-semibold">Eventos anteriores</h2>
          <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
            {past.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                <span className="font-medium">{e.title}</span>
                <span className="text-sm text-muted-foreground">{fmt.format(new Date(e.starts_at))}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
