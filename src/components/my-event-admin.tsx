import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Eye,
  MapPin,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { supabase } from "@/integrations/supabase/client";
import {
  slugify,
  type Entrepreneur,
} from "@/lib/vitrina";

type MyEvent = {
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
  status: string;
  visible: boolean;
  published: boolean;
  created_at: string;
};

export function MyEventAdmin({
  entrepreneur,
}: {
  entrepreneur: Entrepreneur;
}) {
  const queryClient = useQueryClient();

  const [busy, setBusy] = useState(false);

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const [form, setForm] = useState({
    id: "",
    slug: "",
    title: "",
    description: "",
    starts_at: "",
    ends_at: "",
    location: "",
    registration_url: "",
    image_url: "",
  });

  const myEvent = useQuery({
    queryKey: [
      "my-event",
      entrepreneur.id,
    ],

    queryFn: async () => {
      const { data, error } =
        await (supabase as any)
          .from("events")
          .select("*")
          .eq(
            "entrepreneur_id",
            entrepreneur.id,
          )
          .order(
            "created_at",
            {
              ascending: false,
            },
          )
          .limit(1)
          .maybeSingle();

      if (error) throw error;

      return data as MyEvent | null;
    },
  });

  useEffect(() => {
    if (!myEvent.data) return;

    const event =
      myEvent.data;

    setForm({
      id:
        event.id,

      slug:
        event.slug ?? "",

      title:
        event.title ?? "",

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

      registration_url:
        event.registration_url ??
        "",

      image_url:
        event.image_url ?? "",
    });

    setImagePreview(
      event.image_url ?? "",
    );
  }, [myEvent.data]);

  function selectImage(
    file?: File,
  ) {
    if (!file) return;

    if (
      !file.type.startsWith(
        "image/",
      )
    ) {
      toast.error(
        "Selecciona una imagen válida.",
      );

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      toast.error(
        "La imagen no puede superar los 5 MB.",
      );

      return;
    }

    setImageFile(file);

    const reader =
      new FileReader();

    reader.onload = () => {
      setImagePreview(
        String(
          reader.result,
        ),
      );
    };

    reader.readAsDataURL(
      file,
    );
  }

  async function uploadImage() {
    if (!imageFile) {
      return (
        form.image_url ||
        null
      );
    }

    const extension =
      imageFile.name
        .split(".")
        .pop()
        ?.toLowerCase() ||
      "jpg";

    const fileName =
      `events/${entrepreneur.id}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(
          2,
          8,
        )}.${extension}`;

    const { error } =
      await supabase.storage
        .from(
          "Entrepreneur-images",
        )
        .upload(
          fileName,
          imageFile,
          {
            cacheControl:
              "3600",

            upsert: false,

            contentType:
              imageFile.type,
          },
        );

    if (error) {
      throw error;
    }

    const { data } =
      supabase.storage
        .from(
          "Entrepreneur-images",
        )
        .getPublicUrl(
          fileName,
        );

    return data.publicUrl;
  }

  async function save() {
    if (!form.title.trim()) {
      toast.error(
        "El título es obligatorio.",
      );

      return;
    }

    if (!form.starts_at) {
      toast.error(
        "La fecha de inicio es obligatoria.",
      );

      return;
    }

    if (!form.ends_at) {
      toast.error(
        "La fecha de término es obligatoria.",
      );

      return;
    }

    const startDate =
      new Date(
        form.starts_at,
      );

    const endDate =
      new Date(
        form.ends_at,
      );

    if (
      endDate.getTime() <=
      startDate.getTime()
    ) {
      toast.error(
        "La fecha de término debe ser posterior al inicio.",
      );

      return;
    }

    setBusy(true);

    try {
      const imageUrl =
        await uploadImage();

      const eventSlug =
        form.slug ||
        `${slugify(
          form.title,
        )}-${Date.now()
          .toString()
          .slice(-6)}`;

      const payload = {
        entrepreneur_id:
          entrepreneur.id,

        slug:
          eventSlug,

        title:
          form.title.trim(),

        description:
          form.description.trim() ||
          null,

        image_url:
          imageUrl,

        starts_at:
          startDate.toISOString(),

        ends_at:
          endDate.toISOString(),

        location:
          form.location.trim() ||
          null,

        organizer:
          entrepreneur.business_name,

        registration_url:
          form.registration_url.trim() ||
          null,

        status:
          "pendiente",

        visible:
          true,

        published:
          true,
      };

      let error;

      if (form.id) {
        ({ error } =
          await (supabase as any)
            .from("events")
            .update(
              payload,
            )
            .eq(
              "id",
              form.id,
            )
            .eq(
              "entrepreneur_id",
              entrepreneur.id,
            ));
      } else {
        ({ error } =
          await (supabase as any)
            .from("events")
            .insert(
              payload,
            ));
      }

      if (error) {
        throw error;
      }

      setImageFile(
        null,
      );

      setForm(
        (previous) => ({
          ...previous,
          slug:
            eventSlug,
        }),
      );

      await queryClient.invalidateQueries({
        queryKey: [
          "my-event",
          entrepreneur.id,
        ],
      });

      await queryClient.invalidateQueries({
        queryKey: [
          "events",
        ],
      });

      toast.success(
        form.id
          ? "Evento actualizado y enviado nuevamente a revisión."
          : "Evento enviado a revisión.",
      );
    } catch (error) {
      console.error(
        "Error guardando evento:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "No pudimos guardar el evento.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!form.id) {
      return;
    }

    if (
      !window.confirm(
        "¿Seguro que quieres eliminar este evento?",
      )
    ) {
      return;
    }

    const { error } =
      await (supabase as any)
        .from("events")
        .delete()
        .eq(
          "id",
          form.id,
        )
        .eq(
          "entrepreneur_id",
          entrepreneur.id,
        );

    if (error) {
      toast.error(
        error.message,
      );

      return;
    }

    setForm({
      id: "",
      slug: "",
      title: "",
      description: "",
      starts_at: "",
      ends_at: "",
      location: "",
      registration_url: "",
      image_url: "",
    });

    setImageFile(null);
    setImagePreview("");

    await queryClient.invalidateQueries({
      queryKey: [
        "my-event",
        entrepreneur.id,
      ],
    });

    await queryClient.invalidateQueries({
      queryKey: [
        "events",
      ],
    });

    toast.success(
      "Evento eliminado.",
    );
  }

  const current =
    myEvent.data;

  return (
    <section className="mt-5 rounded-2xl border border-border bg-secondary/10 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            MI EVENTO
          </p>

          <h3 className="mt-1 font-display text-lg font-semibold">
            Publica una actividad de{" "}
            {
              entrepreneur.business_name
            }
          </h3>

          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Puedes mantener un solo evento vigente. Cuando lo crees o
            modifiques, quedará pendiente de aprobación antes de aparecer
            públicamente.
          </p>
        </div>

        {current ? (
          <EventStatus
            status={
              current.status
            }
            visible={
              current.visible
            }
            endsAt={
              current.ends_at
            }
          />
        ) : null}
      </div>

      <div className="mt-5 grid gap-4">
        <Field label="Título del evento">
          <Input
            value={
              form.title
            }
            onChange={(
              event,
            ) =>
              setForm(
                (previous) => ({
                  ...previous,

                  title:
                    event
                      .target
                      .value,
                }),
              )
            }
            placeholder="Ej: Feria de productos locales"
          />
        </Field>

        <Field label="Descripción">
          <Textarea
            rows={3}
            value={
              form.description
            }
            onChange={(
              event,
            ) =>
              setForm(
                (previous) => ({
                  ...previous,

                  description:
                    event
                      .target
                      .value,
                }),
              )
            }
            placeholder="Cuenta brevemente de qué se trata."
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Inicio">
            <Input
              type="datetime-local"
              value={
                form.starts_at
              }
              onChange={(
                event,
              ) =>
                setForm(
                  (previous) => ({
                    ...previous,

                    starts_at:
                      event
                        .target
                        .value,
                  }),
                )
              }
            />
          </Field>

          <Field label="Término">
            <Input
              type="datetime-local"
              value={
                form.ends_at
              }
              onChange={(
                event,
              ) =>
                setForm(
                  (previous) => ({
                    ...previous,

                    ends_at:
                      event
                        .target
                        .value,
                  }),
                )
              }
            />
          </Field>
        </div>

        <Field label="Lugar">
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={
                form.location
              }
              onChange={(
                event,
              ) =>
                setForm(
                  (previous) => ({
                    ...previous,

                    location:
                      event
                        .target
                        .value,
                  }),
                )
              }
              placeholder="Lugar o dirección"
              className="pl-9"
            />
          </div>
        </Field>

        <Field label="Enlace / inscripción / WhatsApp">
          <Input
            value={
              form.registration_url
            }
            onChange={(
              event,
            ) =>
              setForm(
                (previous) => ({
                  ...previous,

                  registration_url:
                    event
                      .target
                      .value,
                }),
              )
            }
            placeholder="https://..."
          />
        </Field>

        <Field label="Imagen">
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(
              event,
            ) =>
              selectImage(
                event
                  .target
                  .files?.[0],
              )
            }
          />

          {imagePreview ? (
            <img
              src={
                imagePreview
              }
              alt="Vista previa del evento"
              className="mt-3 aspect-[16/9] w-full max-w-lg rounded-xl object-cover"
            />
          ) : null}
        </Field>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={save}
            disabled={busy}
          >
            <Save className="h-4 w-4" />

            {busy
              ? "Guardando..."
              : form.id
                ? "Actualizar evento"
                : "Enviar evento"}
          </Button>

          {form.id ? (
            <Button
              type="button"
              variant="outline"
              onClick={
                remove
              }
            >
              <Trash2 className="h-4 w-4" />

              Eliminar evento
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function EventStatus({
  status,
  visible,
  endsAt,
}: {
  status: string;
  visible: boolean;
  endsAt: string | null;
}) {
  const expired =
    Boolean(endsAt) &&
    new Date(
      endsAt!,
    ).getTime() <
      Date.now();

  let label =
    "Pendiente";

  let className =
    "border-amber-200 bg-amber-50 text-amber-700";

  if (expired) {
    label =
      "Finalizado";

    className =
      "border-border bg-muted text-muted-foreground";
  } else if (
    status ===
      "aprobado" &&
    visible
  ) {
    label =
      "Publicado";

    className =
      "border-emerald-200 bg-emerald-50 text-emerald-700";
  } else if (
    status ===
    "rechazado"
  ) {
    label =
      "Necesita cambios";

    className =
      "border-red-200 bg-red-50 text-red-700";
  } else if (
    !visible
  ) {
    label =
      "Oculto";

    className =
      "border-border bg-muted text-muted-foreground";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${className}`}
    >
      <Eye className="h-3.5 w-3.5" />

      {label}
    </span>
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
      <Label>
        {label}
      </Label>

      {children}
    </div>
  );
}

function toLocalInput(
  value: string,
) {
  const date =
    new Date(value);

  const timezoneOffset =
    date.getTimezoneOffset() *
    60000;

  return new Date(
    date.getTime() -
      timezoneOffset,
  )
    .toISOString()
    .slice(0, 16);
}