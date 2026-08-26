import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Check,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { supabase } from "@/integrations/supabase/client";

type AdminEvent = {
  id: string;
  entrepreneur_id: string | null;
  slug: string;
  title: string;
  description: string | null;
  image_url: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  organizer: string | null;
  registration_url: string | null;
  published: boolean;
  visible: boolean;
  status: string;
  created_at: string;
};

export function EventAdmin() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    id: "",
    title: "",
    description: "",
    starts_at: "",
    ends_at: "",
    location: "",
    organizer: "",
    registration_url: "",
  });

  const events = useQuery({
    queryKey: ["events-admin"],

    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("events")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      return (data ?? []) as AdminEvent[];
    },
  });

  async function refresh() {
    await queryClient.invalidateQueries({
      queryKey: ["events-admin"],
    });

    await queryClient.invalidateQueries({
      queryKey: ["events"],
    });
  }

  async function approve(event: AdminEvent) {
    const { error } = await (supabase as any)
      .from("events")
      .update({
        status: "aprobado",
        visible: true,
        published: true,
      })
      .eq("id", event.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    await refresh();

    toast.success("Evento aprobado y publicado.");
  }

  async function reject(event: AdminEvent) {
    const { error } = await (supabase as any)
      .from("events")
      .update({
        status: "rechazado",
        visible: false,
      })
      .eq("id", event.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    await refresh();

    toast.success("Evento rechazado.");
  }

  async function toggleVisibility(event: AdminEvent) {
    const nextVisible = !event.visible;

    const { error } = await (supabase as any)
      .from("events")
      .update({
        visible: nextVisible,
      })
      .eq("id", event.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    await refresh();

    toast.success(
      nextVisible
        ? "Evento visible nuevamente."
        : "Evento ocultado.",
    );
  }

  async function remove(event: AdminEvent) {
    if (
      !window.confirm(
        `¿Eliminar el evento "${event.title}"?`,
      )
    ) {
      return;
    }

    const { error } = await (supabase as any)
      .from("events")
      .delete()
      .eq("id", event.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    await refresh();

    toast.success("Evento eliminado.");
  }

  async function saveAdminEvent() {
    if (!form.title.trim()) {
      toast.error("El título es obligatorio.");
      return;
    }

    if (!form.starts_at) {
      toast.error("La fecha de inicio es obligatoria.");
      return;
    }

    const startDate = new Date(form.starts_at);

    const endDate = form.ends_at
      ? new Date(form.ends_at)
      : new Date(
          startDate.getTime() +
            24 * 60 * 60 * 1000,
        );

    const payload = {
      title: form.title.trim(),

      description:
        form.description.trim() || null,

      starts_at:
        startDate.toISOString(),

      ends_at:
        endDate.toISOString(),

      location:
        form.location.trim() || null,

      organizer:
        form.organizer.trim() || "La Vitrina",

      registration_url:
        form.registration_url.trim() || null,

      status: "aprobado",

      published: true,

      visible: true,
    };

    let error;

    if (form.id) {
      ({ error } = await (supabase as any)
        .from("events")
        .update(payload)
        .eq("id", form.id));
    } else {
      const slug =
        `${form.title
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")}-${Date.now()
          .toString()
          .slice(-6)}`;

      ({ error } = await (supabase as any)
        .from("events")
        .insert({
          ...payload,
          slug,
          entrepreneur_id: null,
        }));
    }

    if (error) {
      toast.error(error.message);
      return;
    }

    setForm({
      id: "",
      title: "",
      description: "",
      starts_at: "",
      ends_at: "",
      location: "",
      organizer: "",
      registration_url: "",
    });

    await refresh();

    toast.success(
      form.id
        ? "Evento actualizado."
        : "Evento creado.",
    );
  }

  const rows =
    events.data ?? [];

  const pending =
    rows.filter(
      (event) =>
        event.status === "pendiente",
    );

  const published =
    rows.filter(
      (event) =>
        event.status === "aprobado" &&
        event.visible &&
        !isExpired(event),
    );

  const hidden =
    rows.filter(
      (event) =>
        !event.visible &&
        event.status !== "rechazado",
    );

  const finished =
    rows.filter(isExpired);

  return (
    <section className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
      <div className="mb-7">
        <p className="eyebrow inline-flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          EVENTOS
        </p>

        <h2 className="mt-1 font-display text-2xl font-semibold">
          Administración de eventos
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Administra eventos de La Vitrina y revisa los enviados por los emprendedores.
        </p>
      </div>

      {/* RESUMEN */}

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat
          label="Pendientes"
          value={pending.length}
        />

        <Stat
          label="Publicados"
          value={published.length}
        />

        <Stat
          label="Ocultos"
          value={hidden.length}
        />

        <Stat
          label="Finalizados"
          value={finished.length}
        />
      </div>

      {/* EVENTOS PENDIENTES */}

      <EventGroup
        title="Pendientes de aprobación"
        events={pending}
        empty="No hay eventos pendientes."
        onApprove={approve}
        onReject={reject}
        onVisibility={toggleVisibility}
        onEdit={setFormFromEvent}
        onDelete={remove}
      />

      {/* PUBLICADOS */}

      <EventGroup
        title="Publicados"
        events={published}
        empty="No hay eventos publicados."
        onApprove={approve}
        onReject={reject}
        onVisibility={toggleVisibility}
        onEdit={setFormFromEvent}
        onDelete={remove}
      />

      {/* OCULTOS */}

      <EventGroup
        title="Ocultos"
        events={hidden}
        empty="No hay eventos ocultos."
        onApprove={approve}
        onReject={reject}
        onVisibility={toggleVisibility}
        onEdit={setFormFromEvent}
        onDelete={remove}
      />

      {/* FINALIZADOS */}

      <EventGroup
        title="Finalizados"
        events={finished}
        empty="Todavía no hay eventos finalizados."
        onApprove={approve}
        onReject={reject}
        onVisibility={toggleVisibility}
        onEdit={setFormFromEvent}
        onDelete={remove}
      />

      {/* CREACIÓN ADMIN */}

      <div className="mt-10 border-t border-border pt-8">
        <p className="eyebrow">
          EVENTO DE LA VITRINA
        </p>

        <h3 className="mt-1 font-display text-xl font-semibold">
          {form.id
            ? "Editar evento"
            : "Crear evento institucional"}
        </h3>

        <div className="mt-5 grid gap-4">
          <Field label="Título">
            <Input
              value={form.title}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  title:
                    event.target.value,
                }))
              }
            />
          </Field>

          <Field label="Descripción">
            <Textarea
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  description:
                    event.target.value,
                }))
              }
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Inicio">
              <Input
                type="datetime-local"
                value={form.starts_at}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    starts_at:
                      event.target.value,
                  }))
                }
              />
            </Field>

            <Field label="Término">
              <Input
                type="datetime-local"
                value={form.ends_at}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    ends_at:
                      event.target.value,
                  }))
                }
              />
            </Field>

            <Field label="Lugar">
              <Input
                value={form.location}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    location:
                      event.target.value,
                  }))
                }
              />
            </Field>

            <Field label="Organizador">
              <Input
                value={form.organizer}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    organizer:
                      event.target.value,
                  }))
                }
              />
            </Field>
          </div>

          <Field label="Enlace / inscripción">
            <Input
              value={form.registration_url}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  registration_url:
                    event.target.value,
                }))
              }
            />
          </Field>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={saveAdminEvent}
            >
              {form.id
                ? "Actualizar evento"
                : "Crear evento"}
            </Button>

            {form.id ? (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setForm({
                    id: "",
                    title: "",
                    description: "",
                    starts_at: "",
                    ends_at: "",
                    location: "",
                    organizer: "",
                    registration_url: "",
                  })
                }
              >
                Cancelar edición
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );

  function setFormFromEvent(
    event: AdminEvent,
  ) {
    setForm({
      id: event.id,

      title:
        event.title,

      description:
        event.description ?? "",

      starts_at:
        toLocalInput(
          event.starts_at,
        ),

      ends_at:
        event.ends_at
          ? toLocalInput(
              event.ends_at,
            )
          : "",

      location:
        event.location ?? "",

      organizer:
        event.organizer ?? "",

      registration_url:
        event.registration_url ??
        "",
    });

    document
      .getElementById("eventos")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }
}

function EventGroup({
  title,
  events,
  empty,
  onApprove,
  onReject,
  onVisibility,
  onEdit,
  onDelete,
}: {
  title: string;
  events: AdminEvent[];
  empty: string;

  onApprove: (
    event: AdminEvent,
  ) => void;

  onReject: (
    event: AdminEvent,
  ) => void;

  onVisibility: (
    event: AdminEvent,
  ) => void;

  onEdit: (
    event: AdminEvent,
  ) => void;

  onDelete: (
    event: AdminEvent,
  ) => void;
}) {
  return (
    <section className="mt-8">
      <h3 className="font-display text-lg font-semibold">
        {title}
      </h3>

      {events.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
          {empty}
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {events.map(
            (event) => (
              <article
                key={event.id}
                className="rounded-2xl border border-border p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-lg font-semibold">
                        {event.title}
                      </p>

                      <StatusBadge
                        event={event}
                      />
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {event.organizer ||
                        "La Vitrina"}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(
                        event.starts_at,
                      )}

                      {event.ends_at
                        ? ` → ${formatDate(event.ends_at)}`
                        : ""}
                    </p>

                    {event.location ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {event.location}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {event.status !==
                    "aprobado" ? (
                      <Button
                        size="sm"
                        onClick={() =>
                          onApprove(
                            event,
                          )
                        }
                      >
                        <Check className="h-4 w-4" />
                        Aprobar
                      </Button>
                    ) : null}

                    {event.status !==
                    "rechazado" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          onReject(
                            event,
                          )
                        }
                      >
                        <X className="h-4 w-4" />
                        Rechazar
                      </Button>
                    ) : null}

                    {event.status ===
                    "aprobado" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          onVisibility(
                            event,
                          )
                        }
                      >
                        {event.visible ? (
                          <>
                            <EyeOff className="h-4 w-4" />
                            Ocultar
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" />
                            Mostrar
                          </>
                        )}
                      </Button>
                    ) : null}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        onEdit(event)
                      }
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        onDelete(event)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </article>
            ),
          )}
        </div>
      )}
    </section>
  );
}

function StatusBadge({
  event,
}: {
  event: AdminEvent;
}) {
  if (isExpired(event)) {
    return (
      <Badge variant="outline">
        Finalizado
      </Badge>
    );
  }

  if (
    event.status ===
    "pendiente"
  ) {
    return (
      <Badge variant="secondary">
        Pendiente
      </Badge>
    );
  }

  if (
    event.status ===
    "rechazado"
  ) {
    return (
      <Badge variant="destructive">
        Rechazado
      </Badge>
    );
  }

  if (!event.visible) {
    return (
      <Badge variant="outline">
        Oculto
      </Badge>
    );
  }

  return (
    <Badge>
      Publicado
    </Badge>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-secondary/10 p-4">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 font-display text-2xl font-semibold">
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function isExpired(
  event: AdminEvent,
) {
  const end =
    event.ends_at ||
    event.starts_at;

  return (
    new Date(end).getTime() <
    Date.now()
  );
}

function toLocalInput(
  value: string,
) {
  const date =
    new Date(value);

  const offset =
    date.getTimezoneOffset() *
    60000;

  return new Date(
    date.getTime() -
      offset,
  )
    .toISOString()
    .slice(0, 16);
}

function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "es-CL",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(
    new Date(value),
  );
}