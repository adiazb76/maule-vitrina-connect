import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeDollarSign,
  Eye,
  Image as ImageIcon,
  Save,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { supabase } from "@/integrations/supabase/client";
import type { Entrepreneur } from "@/lib/vitrina";

type MarketplaceAd = {
  id: string;
  entrepreneur_id: string;
  type: "vendo" | "compro";
  title: string;
  description: string;
  price: number | null;
  image_url: string | null;
  contact_url: string | null;
  status: "pendiente" | "aprobado" | "rechazado";
  visible: boolean;
  created_at: string;
  expires_at: string;
};

export function MyMarketplaceAdmin({
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
    type: "vendo" as "vendo" | "compro",
    title: "",
    description: "",
    price: "",
    contact_url: "",
    image_url: "",
  });

  const myAd = useQuery({
    queryKey: [
      "my-marketplace-ad",
      entrepreneur.id,
    ],

    queryFn: async () => {
      const { data, error } =
        await (supabase as any)
          .from("marketplace_ads")
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

      return data as MarketplaceAd | null;
    },
  });

  useEffect(() => {
    if (!myAd.data) return;

    const ad =
      myAd.data;

    setForm({
      id:
        ad.id,

      type:
        ad.type,

      title:
        ad.title ?? "",

      description:
        ad.description ?? "",

      price:
        ad.price != null
          ? String(ad.price)
          : "",

      contact_url:
        ad.contact_url ?? "",

      image_url:
        ad.image_url ?? "",
    });

    setImagePreview(
      ad.image_url ?? "",
    );
  }, [myAd.data]);

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
      file.size > 20 * 1024 * 1024
    ) {
      toast.error(
        "La imagen original no puede superar los 20 MB.",
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
      `marketplace/${entrepreneur.id}/${Date.now()}-${Math.random()
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
    if (
      !form.title.trim()
    ) {
      toast.error(
        "El título es obligatorio.",
      );

      return;
    }

    if (
      !form.description.trim()
    ) {
      toast.error(
        "Agrega una descripción breve.",
      );

      return;
    }

    if (
      form.description.trim()
        .length > 240
    ) {
      toast.error(
        "La descripción puede tener máximo 240 caracteres.",
      );

      return;
    }

    if (
      form.title.trim()
        .length > 80
    ) {
      toast.error(
        "El título puede tener máximo 80 caracteres.",
      );

      return;
    }

    setBusy(true);

    try {
      const imageUrl =
        await uploadImage();

      const payload = {
        entrepreneur_id:
          entrepreneur.id,

        type:
          form.type,

        title:
          form.title.trim(),

        description:
          form.description.trim(),

        price:
          form.price.trim()
            ? Number(
                form.price,
              )
            : null,

        image_url:
          imageUrl,

        contact_url:
          form.contact_url.trim() ||
          null,

        status:
          "pendiente",

        visible:
          true,
      };

      let error;

      if (
        form.id
      ) {
        ({ error } =
          await (supabase as any)
            .from(
              "marketplace_ads",
            )
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
            .from(
              "marketplace_ads",
            )
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

      await queryClient.invalidateQueries({
        queryKey: [
          "my-marketplace-ad",
          entrepreneur.id,
        ],
      });

      await queryClient.invalidateQueries({
        queryKey: [
          "marketplace-ads",
        ],
      });

      toast.success(
        form.id
          ? "Aviso actualizado y enviado nuevamente a revisión."
          : "Aviso enviado a revisión.",
      );
    } catch (error) {
      console.error(
        "Error guardando aviso:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "No pudimos guardar el aviso.",
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
        "¿Seguro que quieres eliminar este aviso?",
      )
    ) {
      return;
    }

    const { error } =
      await (supabase as any)
        .from(
          "marketplace_ads",
        )
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
      type: "vendo",
      title: "",
      description: "",
      price: "",
      contact_url: "",
      image_url: "",
    });

    setImagePreview("");
    setImageFile(null);

    await queryClient.invalidateQueries({
      queryKey: [
        "my-marketplace-ad",
        entrepreneur.id,
      ],
    });

    await queryClient.invalidateQueries({
      queryKey: [
        "marketplace-ads",
      ],
    });

    toast.success(
      "Aviso eliminado.",
    );
  }

  const current =
    myAd.data;

  const expired =
    current
      ? new Date(
          current.expires_at,
        ).getTime() <
        Date.now()
      : false;

  return (
    <section className="mt-4 rounded-xl border border-border bg-secondary/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow inline-flex items-center gap-1.5">
            <ShoppingBag className="h-3.5 w-3.5" />
            COMPRAVENTA
          </p>

          <h3 className="mt-1 font-display text-base font-semibold">
            Mi aviso
          </h3>

          <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
            Publica un artículo que quieras vender o comprar.
            Puedes mantener un aviso vigente por 7 días.
          </p>
        </div>

        {current ? (
          <Status
            status={
              current.status
            }
            visible={
              current.visible
            }
            expired={
              expired
            }
          />
        ) : null}
      </div>

      <div className="mt-4 grid gap-3">
        <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
          <div>
            <Label className="text-xs">
              Tipo
            </Label>

            <Select
              value={
                form.type
              }
              onValueChange={(
                value,
              ) =>
                setForm(
                  (
                    previous,
                  ) => ({
                    ...previous,

                    type:
                      value as
                        | "vendo"
                        | "compro",
                  }),
                )
              }
            >
              <SelectTrigger className="mt-1 h-9">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="vendo">
                  Vendo
                </SelectItem>

                <SelectItem value="compro">
                  Compro
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Field label="Título">
            <Input
              value={
                form.title
              }
              maxLength={80}
              onChange={(
                event,
              ) =>
                setForm(
                  (
                    previous,
                  ) => ({
                    ...previous,

                    title:
                      event
                        .target
                        .value,
                  }),
                )
              }
              placeholder="Ej: Vendo horno eléctrico"
              className="h-9"
            />
          </Field>
        </div>

        <Field label="Descripción breve">
          <Textarea
            rows={2}
            maxLength={240}
            value={
              form.description
            }
            onChange={(
              event,
            ) =>
              setForm(
                (
                  previous,
                ) => ({
                  ...previous,

                  description:
                    event
                      .target
                      .value,
                }),
              )
            }
            placeholder="Características principales, estado, medidas, etc."
          />

          <p className="text-[10px] text-muted-foreground">
            {
              form.description.length
            }
            /240 caracteres
          </p>
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Precio (opcional)">
            <div className="relative">
              <BadgeDollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                type="number"
                min="0"
                value={
                  form.price
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      previous,
                    ) => ({
                      ...previous,

                      price:
                        event
                          .target
                          .value,
                    }),
                  )
                }
                placeholder="Ej: 25000"
                className="h-9 pl-9"
              />
            </div>
          </Field>

          <Field label="Contacto o enlace">
            <Input
              value={
                form.contact_url
              }
              onChange={(
                event,
              ) =>
                setForm(
                  (
                    previous,
                  ) => ({
                    ...previous,

                    contact_url:
                      event
                        .target
                        .value,
                  }),
                )
              }
              placeholder="WhatsApp o https://..."
              className="h-9"
            />
          </Field>
        </div>

        <Field label="Foto">
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
            className="h-9"
          />

          {imagePreview ? (
            <div className="mt-2 flex items-start gap-3">
              <img
                src={
                  imagePreview
                }
                alt="Vista previa del aviso"
                className="h-28 w-28 rounded-lg border border-border object-cover"
              />

              <div className="pt-1 text-xs text-muted-foreground">
                <p>
                  Esta será la imagen principal del aviso.
                </p>

                <p className="mt-1">
                  En la vista pública aparecerá en formato compacto.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              Una imagen es suficiente.
            </div>
          )}
        </Field>

        {current &&
        !expired ? (
          <p className="text-xs text-muted-foreground">
            Vigente hasta{" "}
            <strong>
              {formatDate(
                current.expires_at,
              )}
            </strong>
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            onClick={
              save
            }
            disabled={
              busy
            }
          >
            <Save className="h-4 w-4" />

            {busy
              ? "Guardando..."
              : form.id
                ? "Actualizar aviso"
                : "Enviar aviso"}
          </Button>

          {form.id ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={
                remove
              }
            >
              <Trash2 className="h-4 w-4" />

              Eliminar
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Status({
  status,
  visible,
  expired,
}: {
  status: string;
  visible: boolean;
  expired: boolean;
}) {
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
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${className}`}
    >
      <Eye className="h-3 w-3" />

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
    <div className="space-y-1">
      <Label className="text-xs">
        {label}
      </Label>

      {children}
    </div>
  );
}

function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "es-CL",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(
    new Date(value),
  );
}