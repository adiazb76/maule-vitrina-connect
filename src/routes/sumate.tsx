import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  useMemo,
  useState,
} from "react";

import {
  toast,
} from "sonner";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  Textarea,
} from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  supabase,
} from "@/integrations/supabase/client";

import {
  useAuth,
} from "@/hooks/use-auth";

import {
  fetchActivities,
  fetchCategories,
  fetchComunas,
  slugify,
} from "@/lib/vitrina";

export const Route =
  createFileRoute(
    "/sumate",
  )({
    head: () => ({
      meta: [
        {
          title:
            "Súmate a La Vitrina — Publica tu emprendimiento",
        },

        {
          name:
            "description",

          content:
            "Registra tu emprendimiento del Maule Sur: rubro, actividad, comuna y formas de contacto.",
        },
      ],
    }),

    component:
      SumatePage,
  });

function SumatePage() {
  const {
    user,
    loading,
  } =
    useAuth();

  const navigate =
    useNavigate();

  
  const existingEntrepreneur =
    useQuery({
      queryKey: ["existing-entrepreneur", user?.id],
      enabled: Boolean(user?.id),
      queryFn: async () => {
        const { data, error } = await (supabase as any)
          .from("entrepreneurs")
          .select("id,business_name,slug")
          .eq("user_id", user!.id)
          .maybeSingle();

        if (error) throw error;
        return data ?? null;
      },
    });
const categories =
    useQuery({
      queryKey: [
        "categories",
      ],

      queryFn:
        fetchCategories,
    });

  const comunas =
    useQuery({
      queryKey: [
        "comunas",
      ],

      queryFn:
        fetchComunas,
    });

  const [
    busy,
    setBusy,
  ] =
    useState(
      false,
    );

  const [
    photoFile,
    setPhotoFile,
  ] =
    useState<File | null>(
      null,
    );

  const [
    photoPreview,
    setPhotoPreview,
  ] =
    useState("");

  const [
    form,
    setForm,
  ] =
    useState({
      business_name:
        "",

      owner_name:
        "",

      category_id:
        "",

      activity_id:
        "",

      comuna_id:
        "",

      short_description:
        "",

      about:
        "",

      value_prop:
        "",

      tags:
        "",

      whatsapp:
        "",

      phone:
        "",

      email:
        "",

      instagram:
        "",

      facebook:
        "",

      website:
        "",
    });

  const selectedCategory =
    useMemo(
      () =>
        categories.data?.find(
          (
            category,
          ) =>
            category.id ===
            form.category_id,
        ) ??
        null,

      [
        categories.data,
        form.category_id,
      ],
    );

  const activities =
    useQuery({
      queryKey: [
        "activities",
        selectedCategory?.id ??
          "none",
      ],

      queryFn: () =>
        fetchActivities(
          selectedCategory?.id,
        ),

      enabled:
        Boolean(
          selectedCategory?.id,
        ),
    });

  useEffect(() => {
    if (existingEntrepreneur.data && !existingEntrepreneur.isLoading) {
      navigate({ to: "/panel", replace: true });
    }
  }, [existingEntrepreneur.data, existingEntrepreneur.isLoading, navigate]);

  const set =
    (
      key:
        keyof typeof form,
    ) =>
    (
      value:
        string,
    ) =>
      setForm(
        (
          previous,
        ) => ({
          ...previous,

          [key]:
            value,
        }),
      );

  function selectPhoto(
    file?: File,
  ) {
    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/",
      )
    ) {
      toast.error(
        "Selecciona un archivo de imagen.",
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

    setPhotoFile(
      file,
    );

    const reader =
      new FileReader();

    reader.onload =
      () =>
        setPhotoPreview(
          String(
            reader.result,
          ),
        );

    reader.readAsDataURL(
      file,
    );
  }

  async function uploadPhoto() {
    if (
      !photoFile ||
      !user
    ) {
      return null;
    }

    const extension =
      photoFile.name
        .split(".")
        .pop()
        ?.toLowerCase() ||
      "jpg";

    const fileName =
      `${user.id}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(
          2,
          8,
        )}.${extension}`;

    const {
      error:
        uploadError,
    } =
      await supabase.storage
        .from(
          "Entrepreneur-images",
        )
        .upload(
          fileName,
          photoFile,
          {
            cacheControl:
              "3600",

            upsert:
              false,

            contentType:
              photoFile.type,
          },
        );

    if (
      uploadError
    ) {
      throw uploadError;
    }

    const {
      data,
    } =
      supabase.storage
        .from(
          "Entrepreneur-images",
        )
        .getPublicUrl(
          fileName,
        );

    return data.publicUrl;
  }

  async function submit(
    event:
      React.FormEvent,
  ) {
    event.preventDefault();

    if (!user) {
      return;
    }

    if (existingEntrepreneur.data) {
      toast.error(
        "Ya tienes un emprendimiento registrado. Puedes editarlo desde Mi panel.",
      );
      navigate({ to: "/panel" });
      return;
    }

    if (
      !form.category_id
    ) {
      toast.error(
        "Selecciona un rubro.",
      );

      return;
    }

    if (
      !form.activity_id
    ) {
      toast.error(
        "Selecciona una actividad.",
      );

      return;
    }

    if (
      !form.comuna_id
    ) {
      toast.error(
        "Selecciona una comuna.",
      );

      return;
    }

    setBusy(
      true,
    );

    try {
      const photoUrl =
        await uploadPhoto();

      const slug =
        `${slugify(
          form.business_name,
        )}-${Math.random()
          .toString(36)
          .slice(
            2,
            6,
          )}`;

      const payload = {
        user_id:
          user.id,

        slug,

        business_name:
          form.business_name.trim(),

        owner_name:
          form.owner_name.trim(),

        category_id:
          form.category_id,

        activity_id:
          form.activity_id,

        comuna_id:
          form.comuna_id,

        short_description:
          form.short_description.trim(),

        about:
          form.about.trim() ||
          null,

        value_prop:
          form.value_prop.trim() ||
          null,

        photo_url:
          photoUrl,

        tags:
          form.tags
            .split(",")
            .map(
              (
                tag,
              ) =>
                tag.trim(),
            )
            .filter(
              Boolean,
            ),

        whatsapp:
          form.whatsapp.trim() ||
          null,

        phone:
          form.phone.trim() ||
          null,

        email:
          form.email.trim() ||
          user.email ||
          null,

        instagram:
          form.instagram.trim() ||
          null,

        facebook:
          form.facebook.trim() ||
          null,

        website:
          form.website.trim() ||
          null,
      };

      const {
        error,
      } =
        await (supabase as any)
          .from(
            "entrepreneurs",
          )
          .insert(
            payload,
          );

      if (error) {
        throw error;
      }

      toast.success(
        "¡Listo! Tu emprendimiento quedó en revisión.",
      );

      navigate({
        to:
          "/panel",
      });
    } catch (
      error
    ) {
      console.error(
        error,
      );

      toast.error(
        error instanceof
          Error
          ? error.message
          : "No pudimos guardar el emprendimiento.",
      );
    } finally {
      setBusy(
        false,
      );
    }
  }

  return (
    <>
      {/* CABECERA */}

      <section className="border-b border-border bg-surface">
        <div className="container-page py-8 sm:py-10">
          <p className="eyebrow">
            SÚMATE
          </p>

          <h1 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
            Publica tu emprendimiento
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Cuéntanos qué haces,
            dónde estás y cómo
            podemos encontrarte.
          </p>
        </div>
      </section>

      {/* FORMULARIO */}

      <section className="container-page py-8 sm:py-10">
        {loading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-muted" />
        ) : !user ? (
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="font-display text-lg font-semibold">
              Primero crea tu cuenta
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              La necesitarás
              para administrar
              tu ficha, evento,
              Compra-venta y
              métricas.
            </p>

            <Button
              asChild
              className="mt-5"
            >
              <Link to="/auth">
                Ingresar o registrarme
              </Link>
            </Button>
          </div>
        ) : (
          <form
            className="mx-auto grid max-w-3xl gap-5"
            onSubmit={
              submit
            }
          >
            {/* IDENTIFICACIÓN */}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Nombre del emprendimiento"
                required
              >
                <Input
                  required
                  value={
                    form.business_name
                  }
                  onChange={(
                    event,
                  ) =>
                    set(
                      "business_name",
                    )(
                      event
                        .target
                        .value,
                    )
                  }
                />
              </Field>

              <Field
                label="Tu nombre"
                required
              >
                <Input
                  required
                  value={
                    form.owner_name
                  }
                  onChange={(
                    event,
                  ) =>
                    set(
                      "owner_name",
                    )(
                      event
                        .target
                        .value,
                    )
                  }
                />
              </Field>
            </div>

            {/* CLASIFICACIÓN */}

            <div className="rounded-xl border border-border bg-secondary/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Clasificación
              </p>

              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Rubro"
                  required
                >
                  <Select
                    value={
                      form.category_id
                    }
                    onValueChange={(
                      value,
                    ) => {
                      setForm(
                        (
                          previous,
                        ) => ({
                          ...previous,

                          category_id:
                            value,

                          activity_id:
                            "",
                        }),
                      );
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu rubro" />
                    </SelectTrigger>

                    <SelectContent>
                      {categories.data?.map(
                        (
                          category,
                        ) => (
                          <SelectItem
                            key={
                              category.id
                            }
                            value={
                              category.id
                            }
                          >
                            {
                              category.name
                            }
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </Field>

                <Field
                  label="Actividad principal"
                  required
                >
                  <Select
                    value={
                      form.activity_id
                    }
                    disabled={
                      !form.category_id
                    }
                    onValueChange={
                      set(
                        "activity_id",
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          form.category_id
                            ? "Selecciona tu actividad"
                            : "Primero selecciona un rubro"
                        }
                      />
                    </SelectTrigger>

                    <SelectContent>
                      {activities.data?.map(
                        (
                          activity,
                        ) => (
                          <SelectItem
                            key={
                              activity.id
                            }
                            value={
                              activity.id
                            }
                          >
                            {
                              activity.name
                            }
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="mt-4">
                <Field
                  label="Comuna"
                  required
                >
                  <Select
                    value={
                      form.comuna_id
                    }
                    onValueChange={
                      set(
                        "comuna_id",
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu comuna" />
                    </SelectTrigger>

                    <SelectContent>
                      {comunas.data?.map(
                        (
                          comuna,
                        ) => (
                          <SelectItem
                            key={
                              comuna.id
                            }
                            value={
                              comuna.id
                            }
                          >
                            {
                              comuna.name
                            }
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>

            {/* DESCRIPCIÓN */}

            <Field
              label="Descripción corta"
              required
            >
              <Input
                required
                maxLength={
                  160
                }
                value={
                  form.short_description
                }
                onChange={(
                  event,
                ) =>
                  set(
                    "short_description",
                  )(
                    event
                      .target
                      .value,
                  )
                }
                placeholder="En una frase, ¿qué haces?"
              />
            </Field>

            {/* FOTO */}

            <Field label="Foto principal">
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(
                  event,
                ) =>
                  selectPhoto(
                    event
                      .target
                      .files?.[0],
                  )
                }
              />

              <p className="text-xs text-muted-foreground">
                JPG, PNG o WebP.
                Máximo 5 MB.
              </p>

              {photoPreview ? (
                <div className="mt-3 flex items-start gap-3">
                  <img
                    src={
                      photoPreview
                    }
                    alt="Vista previa"
                    className="h-28 w-28 rounded-xl border border-border object-cover"
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPhotoFile(
                        null,
                      );

                      setPhotoPreview(
                        "",
                      );
                    }}
                  >
                    Quitar
                  </Button>
                </div>
              ) : null}
            </Field>

            {/* HISTORIA */}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tu historia">
                <Textarea
                  rows={
                    4
                  }
                  value={
                    form.about
                  }
                  onChange={(
                    event,
                  ) =>
                    set(
                      "about",
                    )(
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="¿Cómo nació tu emprendimiento?"
                />
              </Field>

              <Field label="¿Qué te hace diferente?">
                <Textarea
                  rows={
                    4
                  }
                  value={
                    form.value_prop
                  }
                  onChange={(
                    event,
                  ) =>
                    set(
                      "value_prop",
                    )(
                      event
                        .target
                        .value,
                    )
                  }
                />
              </Field>
            </div>

            <Field label="Palabras clave">
              <Input
                value={
                  form.tags
                }
                onChange={(
                  event,
                ) =>
                  set(
                    "tags",
                  )(
                    event
                      .target
                      .value,
                  )
                }
                placeholder="Ej: música, matrimonios, eventos"
              />

              <p className="text-xs text-muted-foreground">
                Sepáralas por coma.
              </p>
            </Field>

            {/* CONTACTO */}

            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Contacto
              </p>

              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <Field label="WhatsApp">
                  <Input
                    value={
                      form.whatsapp
                    }
                    onChange={(
                      event,
                    ) =>
                      set(
                        "whatsapp",
                      )(
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="+56 9..."
                  />
                </Field>

                <Field label="Teléfono">
                  <Input
                    value={
                      form.phone
                    }
                    onChange={(
                      event,
                    ) =>
                      set(
                        "phone",
                      )(
                        event
                          .target
                          .value,
                      )
                    }
                  />
                </Field>

                <Field label="Correo">
                  <Input
                    type="email"
                    value={
                      form.email
                    }
                    onChange={(
                      event,
                    ) =>
                      set(
                        "email",
                      )(
                        event
                          .target
                          .value,
                      )
                    }
                  />
                </Field>

                <Field label="Instagram">
                  <Input
                    value={
                      form.instagram
                    }
                    onChange={(
                      event,
                    ) =>
                      set(
                        "instagram",
                      )(
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="@tuemprendimiento"
                  />
                </Field>

                <Field label="Facebook">
                  <Input
                    value={
                      form.facebook
                    }
                    onChange={(
                      event,
                    ) =>
                      set(
                        "facebook",
                      )(
                        event
                          .target
                          .value,
                      )
                    }
                  />
                </Field>

                <Field label="Sitio web">
                  <Input
                    value={
                      form.website
                    }
                    onChange={(
                      event,
                    ) =>
                      set(
                        "website",
                      )(
                        event
                          .target
                          .value,
                      )
                    }
                  />
                </Field>
              </div>
            </div>

            <Button
              type="submit"
              disabled={
                busy
              }
              className="justify-self-start"
            >
              {busy
                ? "Enviando..."
                : "Enviar para revisión"}
            </Button>
          </form>
        )}
      </section>
    </>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label:
    string;

  required?:
    boolean;

  children:
    React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}

        {required ? (
          <span className="text-primary">
            {" "}*
          </span>
        ) : null}
      </Label>

      {children}
    </div>
  );
}
