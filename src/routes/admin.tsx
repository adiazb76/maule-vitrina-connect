import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Check,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Pencil,
  Radio,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { NewsAdmin } from "@/components/admin/news-admin";
import { EducationAdmin } from "@/components/admin/education-admin";
import { ContactAdmin } from "@/components/admin/contact-admin";
import { EventAdmin } from "@/components/admin/event-admin";
import { MarketplaceAdmin } from "@/components/admin/marketplace-admin";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useAuth, useIsAdmin } from "@/hooks/use-auth";

import {
  fetchRadioItems,
  fetchSiteSettings,
  fetchWeeklyFeature,
  type Entrepreneur,
  type RadioItem,
} from "@/lib/vitrina";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type Sponsor = {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  level: string;
  visible: boolean;
  sort_order: number;
};

const ADMIN_NAV = [
  { href: "#portada", label: "Portada" },
  { href: "#destacado", label: "Destacado" },
  { href: "#emprendedores", label: "Emprendedores" },
  { href: "#noticias", label: "Noticias" },
  { href: "#educa", label: "Educa" },
  { href: "#eventos", label: "Eventos" },
  { href: "#compraventa", label: "Compraventa" },
  { href: "#radio", label: "Radio" },
  { href: "#auspiciadores", label: "Auspiciadores" },
  { href: "#contacto", label: "Contacto y Redes" },
];

function AdminPage() {
  const { user, loading } = useAuth();

  const isAdmin =
    useIsAdmin(user?.id);

  const queryClient =
    useQueryClient();

  const [savingHome, setSavingHome] =
    useState(false);

  const [heroFile, setHeroFile] =
    useState<File | null>(null);

  const [heroPreview, setHeroPreview] =
    useState("");

  const [homeForm, setHomeForm] = useState({
    hero_subtitle: "",
    hero_description: "",
    hero_image_url: "",
  });

  const [
    weeklyEntrepreneurId,
    setWeeklyEntrepreneurId,
  ] = useState("");

  const [
    weeklyStory,
    setWeeklyStory,
  ] = useState("");

  const [radioForm, setRadioForm] = useState({
    id: "",
    title: "",
    kind: "programa",
    description: "",
    media_url: "",
    image_url: "",
  });

  const [sponsorForm, setSponsorForm] =
    useState({
      id: "",
      name: "",
      website_url: "",
      description: "",
      level: "aliado",
      sort_order: "0",
      logo_url: "",
    });

  const [
    sponsorLogoFile,
    setSponsorLogoFile,
  ] = useState<File | null>(null);

  const siteSettings = useQuery({
    queryKey: ["site-settings"],
    enabled: Boolean(isAdmin),
    queryFn: fetchSiteSettings,
  });

  const weekly = useQuery({
    queryKey: ["weekly"],
    enabled: Boolean(isAdmin),
    queryFn: fetchWeeklyFeature,
  });

  const radioItems = useQuery({
    queryKey: ["radio"],
    enabled: Boolean(isAdmin),
    queryFn: fetchRadioItems,
  });

  const sponsors = useQuery({
    queryKey: ["sponsors-admin"],

    enabled:
      Boolean(isAdmin),

    queryFn: async () => {
      const { data, error } =
        await (supabase as any)
          .from("sponsors")
          .select("*")
          .order(
            "sort_order",
            {
              ascending: true,
            },
          );

      if (error) throw error;

      return (
        data ?? []
      ) as Sponsor[];
    },
  });

  const entrepreneurs = useQuery({
    queryKey: ["admin-entrepreneurs"],

    enabled:
      Boolean(isAdmin),

    queryFn: async () => {
      const { data, error } =
        await supabase
          .from("entrepreneurs")
          .select(
            "*, categories:category_id(name,slug), comunas:comuna_id(name,slug)",
          )
          .order(
            "created_at",
            {
              ascending: false,
            },
          );

      if (error) throw error;

      return (
        data ?? []
      ) as unknown as Entrepreneur[];
    },
  });

  useEffect(() => {
    if (!siteSettings.data) return;

    setHomeForm({
      hero_subtitle:
        siteSettings.data.hero_subtitle ??
        "",

      hero_description:
        siteSettings.data.hero_description ??
        "",

      hero_image_url:
        siteSettings.data.hero_image_url ??
        "",
    });

    setHeroPreview(
      siteSettings.data.hero_image_url ??
        "",
    );
  }, [siteSettings.data]);

  useEffect(() => {
    if (!weekly.data) return;

    setWeeklyEntrepreneurId(
      weekly.data.entrepreneurs?.id ??
        "",
    );

    setWeeklyStory(
      weekly.data.story ??
        "",
    );
  }, [weekly.data]);

  const pending =
    (entrepreneurs.data ?? []).filter(
      (entrepreneur) =>
        entrepreneur.status ===
        "pendiente",
    );

  const approved =
    (entrepreneurs.data ?? []).filter(
      (entrepreneur) =>
        entrepreneur.status ===
        "aprobado",
    );

  const rejected =
    (entrepreneurs.data ?? []).filter(
      (entrepreneur) =>
        entrepreneur.status ===
        "rechazado",
    );

  const hidden =
    approved.filter(
      (entrepreneur) =>
        !entrepreneur.visible,
    );

  const publishedEntrepreneurs =
    useMemo(
      () =>
        (
          entrepreneurs.data ?? []
        ).filter(
          (entrepreneur) =>
            entrepreneur.status ===
              "aprobado" &&
            entrepreneur.visible,
        ),

      [entrepreneurs.data],
    );

  async function refreshEntrepreneurs() {
    await queryClient.invalidateQueries({
      queryKey: ["admin-entrepreneurs"],
    });

    await queryClient.invalidateQueries({
      queryKey: ["entrepreneurs"],
    });

    await queryClient.invalidateQueries({
      queryKey: ["featured"],
    });

    await queryClient.invalidateQueries({
      queryKey: ["my-entrepreneurs"],
    });

    await queryClient.invalidateQueries({
      queryKey: [
        "community-entrepreneurs",
      ],
    });

    await queryClient.invalidateQueries({
      queryKey: [
        "community-all-entrepreneurs",
      ],
    });
  }

  async function updateStatus(
    id: string,
    status:
      | "aprobado"
      | "rechazado"
      | "pendiente",
  ) {
    const { error } =
      await supabase
        .from("entrepreneurs")
        .update({
          status,
        })
        .eq("id", id);

    if (error) {
      toast.error(
        error.message,
      );

      return;
    }

    toast.success(
      status === "aprobado"
        ? "Emprendimiento aprobado y publicado."
        : status === "rechazado"
          ? "Emprendimiento rechazado."
          : "Emprendimiento enviado nuevamente a revisión.",
    );

    await refreshEntrepreneurs();
  }

  async function toggleVisibility(
    entrepreneur: Entrepreneur,
  ) {
    const nextVisible =
      !entrepreneur.visible;

    const { error } =
      await (supabase as any)
        .from("entrepreneurs")
        .update({
          visible:
            nextVisible,
        })
        .eq(
          "id",
          entrepreneur.id,
        );

    if (error) {
      toast.error(
        error.message,
      );

      return;
    }

    toast.success(
      nextVisible
        ? "Emprendimiento visible nuevamente."
        : "Emprendimiento ocultado de La Vitrina.",
    );

    await refreshEntrepreneurs();
  }

  async function removeEntrepreneur(
    id: string,
    businessName: string,
  ) {
    const confirmed =
      window.confirm(
        `¿Seguro que quieres eliminar "${businessName}"? Esta acción no se puede deshacer.`,
      );

    if (!confirmed) return;

    const { error } =
      await supabase
        .from("entrepreneurs")
        .delete()
        .eq("id", id);

    if (error) {
      toast.error(
        error.message,
      );

      return;
    }

    toast.success(
      "Emprendimiento eliminado.",
    );

    await refreshEntrepreneurs();
  }

  function selectHero(
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

    setHeroFile(file);

    const reader =
      new FileReader();

    reader.onload = () =>
      setHeroPreview(
        String(
          reader.result,
        ),
      );

    reader.readAsDataURL(
      file,
    );
  }

  async function uploadToBucket(
    file: File,
    prefix: string,
  ) {
    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase() ||
      "jpg";

    const fileName =
      `${prefix}/${Date.now()}-${Math.random()
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
          file,
          {
            cacheControl:
              "3600",

            upsert: false,

            contentType:
              file.type,
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

  async function saveHome(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    setSavingHome(true);

    try {
      let imageUrl =
        homeForm.hero_image_url ||
        null;

      if (heroFile) {
        imageUrl =
          await uploadToBucket(
            heroFile,
            "site",
          );
      }

      const { error } =
        await (supabase as any)
          .from(
            "site_settings",
          )
          .update({
            hero_subtitle:
              homeForm.hero_subtitle,

            hero_description:
              homeForm.hero_description,

            hero_image_url:
              imageUrl,

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            "home",
          );

      if (error) {
        throw error;
      }

      setHomeForm(
        (previous) => ({
          ...previous,

          hero_image_url:
            imageUrl ?? "",
        }),
      );

      setHeroFile(null);

      await queryClient.invalidateQueries({
        queryKey: [
          "site-settings",
        ],
      });

      toast.success(
        "Portada actualizada.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No pudimos actualizar la portada.",
      );
    } finally {
      setSavingHome(false);
    }
  }

  async function saveWeekly() {
    if (
      !weeklyEntrepreneurId
    ) {
      toast.error(
        "Selecciona un emprendedor.",
      );

      return;
    }

    const weekStart =
      new Date()
        .toISOString()
        .slice(0, 10);

    const { error } =
      await (supabase as any)
        .from(
          "weekly_features",
        )
        .upsert(
          {
            entrepreneur_id:
              weeklyEntrepreneurId,

            story:
              weeklyStory ||
              null,

            week_start:
              weekStart,
          },
          {
            onConflict:
              "week_start",
          },
        );

    if (error) {
      toast.error(
        error.message,
      );

      return;
    }

    await queryClient.invalidateQueries({
      queryKey: ["weekly"],
    });

    toast.success(
      "Emprendedor destacado actualizado.",
    );
  }

  async function saveRadio() {
    if (!radioForm.title) {
      toast.error(
        "El título es obligatorio.",
      );

      return;
    }

    const payload = {
      title:
        radioForm.title,

      kind:
        radioForm.kind,

      description:
        radioForm.description ||
        null,

      media_url:
        radioForm.media_url ||
        null,

      image_url:
        radioForm.image_url ||
        null,

      published: true,

      published_at:
        new Date().toISOString(),
    };

    let error;

    if (radioForm.id) {
      ({ error } =
        await (supabase as any)
          .from(
            "radio_items",
          )
          .update(payload)
          .eq(
            "id",
            radioForm.id,
          ));
    } else {
      ({ error } =
        await (supabase as any)
          .from(
            "radio_items",
          )
          .insert(payload));
    }

    if (error) {
      toast.error(
        error.message,
      );

      return;
    }

    setRadioForm({
      id: "",
      title: "",
      kind: "programa",
      description: "",
      media_url: "",
      image_url: "",
    });

    await queryClient.invalidateQueries({
      queryKey: ["radio"],
    });

    toast.success(
      "Contenido radial guardado.",
    );
  }

  async function deleteRadio(
    id: string,
  ) {
    if (
      !window.confirm(
        "¿Eliminar este contenido radial?",
      )
    ) {
      return;
    }

    const { error } =
      await (supabase as any)
        .from(
          "radio_items",
        )
        .delete()
        .eq(
          "id",
          id,
        );

    if (error) {
      toast.error(
        error.message,
      );

      return;
    }

    await queryClient.invalidateQueries({
      queryKey: ["radio"],
    });

    toast.success(
      "Contenido radial eliminado.",
    );
  }

  async function saveSponsor() {
    if (
      !sponsorForm.name
    ) {
      toast.error(
        "El nombre es obligatorio.",
      );

      return;
    }

    let logoUrl =
      sponsorForm.logo_url ||
      null;

    try {
      if (
        sponsorLogoFile
      ) {
        logoUrl =
          await uploadToBucket(
            sponsorLogoFile,
            "sponsors",
          );
      }

      const payload = {
        name:
          sponsorForm.name,

        website_url:
          sponsorForm.website_url ||
          null,

        description:
          sponsorForm.description ||
          null,

        level:
          sponsorForm.level,

        sort_order:
          Number(
            sponsorForm.sort_order,
          ) || 0,

        logo_url:
          logoUrl,

        visible: true,
      };

      let error;

      if (
        sponsorForm.id
      ) {
        ({ error } =
          await (supabase as any)
            .from(
              "sponsors",
            )
            .update(
              payload,
            )
            .eq(
              "id",
              sponsorForm.id,
            ));
      } else {
        ({ error } =
          await (supabase as any)
            .from(
              "sponsors",
            )
            .insert(
              payload,
            ));
      }

      if (error) {
        throw error;
      }

      setSponsorForm({
        id: "",
        name: "",
        website_url: "",
        description: "",
        level: "aliado",
        sort_order: "0",
        logo_url: "",
      });

      setSponsorLogoFile(
        null,
      );

      await queryClient.invalidateQueries({
        queryKey: [
          "sponsors-admin",
        ],
      });

      await queryClient.invalidateQueries({
        queryKey: [
          "sponsors",
        ],
      });

      toast.success(
        "Auspiciador guardado.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No pudimos guardar el auspiciador.",
      );
    }
  }

  async function toggleSponsorVisibility(
    sponsor: Sponsor,
  ) {
    const { error } =
      await (supabase as any)
        .from(
          "sponsors",
        )
        .update({
          visible:
            !sponsor.visible,
        })
        .eq(
          "id",
          sponsor.id,
        );

    if (error) {
      toast.error(
        error.message,
      );

      return;
    }

    await queryClient.invalidateQueries({
      queryKey: [
        "sponsors-admin",
      ],
    });

    await queryClient.invalidateQueries({
      queryKey: [
        "sponsors",
      ],
    });
  }

  async function deleteSponsor(
    id: string,
  ) {
    if (
      !window.confirm(
        "¿Eliminar este auspiciador?",
      )
    ) {
      return;
    }

    const { error } =
      await (supabase as any)
        .from(
          "sponsors",
        )
        .delete()
        .eq(
          "id",
          id,
        );

    if (error) {
      toast.error(
        error.message,
      );

      return;
    }

    await queryClient.invalidateQueries({
      queryKey: [
        "sponsors-admin",
      ],
    });

    await queryClient.invalidateQueries({
      queryKey: [
        "sponsors",
      ],
    });

    toast.success(
      "Auspiciador eliminado.",
    );
  }

  if (loading) {
    return (
      <section className="container-page py-16">
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
      </section>
    );
  }

  if (
    !user ||
    !isAdmin
  ) {
    return (
      <section className="container-page py-20 text-center">
        <h1 className="font-display text-3xl font-semibold">
          Acceso restringido
        </h1>

        <p className="mt-3 text-muted-foreground">
          Esta sección está disponible solo para administradores.
        </p>

        <Button
          asChild
          className="mt-6"
        >
          <Link to="/panel">
            Volver a mi panel
          </Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="container-page py-10">
      <Link
        to="/panel"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al panel
      </Link>

      <div className="mt-5">
        <p className="eyebrow">
          Administración
        </p>

        <h1 className="mt-1 font-display text-3xl font-semibold">
          La Vitrina
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Administra el contenido y la comunidad desde un solo lugar.
        </p>
      </div>

      {/* CENTRO DE INTELIGENCIA */}

      <Link
        to="/metricas"
        className="group mt-5 flex items-center justify-between gap-4 rounded-xl border border-primary/20 bg-secondary/20 p-4 transition-colors hover:border-primary/40 hover:bg-secondary/30"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <BarChart3 className="h-4.5 w-4.5" />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              Inteligencia de gestión
            </p>

            <h2 className="mt-0.5 font-display text-base font-semibold">
              Métricas y Gestión
            </h2>

            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              Dashboard ejecutivo · Evolución · Rankings · Datos · Informes
            </p>
          </div>
        </div>

        <span className="hidden shrink-0 text-xs font-semibold text-primary sm:block">
          Ver dashboard →
        </span>
      </Link>

      <div className="sticky top-16 z-30 -mx-2 mt-6 overflow-x-auto border-y border-border bg-background px-2 py-3">
        <div className="flex min-w-max gap-2">
          {ADMIN_NAV.map(
            (item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </a>
            ),
          )}
        </div>
      </div>

      <AdminBlock
        id="portada"
        icon={
          <ImageIcon className="h-5 w-5 text-primary" />
        }
        eyebrow="Portada"
        title="Editar portada"
      >
        <form
          className="grid gap-6"
          onSubmit={saveHome}
        >
          <Field label="Bajada principal">
            <Input
              value={homeForm.hero_subtitle}
              onChange={(event) =>
                setHomeForm(
                  (previous) => ({
                    ...previous,
                    hero_subtitle:
                      event.target.value,
                  }),
                )
              }
            />
          </Field>

          <Field label="Texto introductorio">
            <Textarea
              rows={4}
              value={homeForm.hero_description}
              onChange={(event) =>
                setHomeForm(
                  (previous) => ({
                    ...previous,
                    hero_description:
                      event.target.value,
                  }),
                )
              }
            />
          </Field>

          <Field label="Imagen principal">
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) =>
                selectHero(
                  event.target.files?.[0],
                )
              }
            />

            {heroPreview ? (
              <img
                src={heroPreview}
                alt="Portada"
                className="mt-3 aspect-[4/3] w-full max-w-xl rounded-2xl object-cover"
              />
            ) : null}
          </Field>

          <Button
            type="submit"
            disabled={savingHome}
            className="justify-self-start"
          >
            <Save className="h-4 w-4" />

            {savingHome
              ? "Guardando..."
              : "Guardar portada"}
          </Button>
        </form>
      </AdminBlock>

      <AdminBlock
        id="destacado"
        icon={
          <Sparkles className="h-5 w-5 text-primary" />
        }
        eyebrow="Destacado"
        title="Emprendedor destacado"
      >
        <div className="grid gap-5">
          <Field label="Emprendedor">
            <Select
              value={weeklyEntrepreneurId}
              onValueChange={setWeeklyEntrepreneurId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un emprendedor" />
              </SelectTrigger>

              <SelectContent>
                {publishedEntrepreneurs.map(
                  (entrepreneur) => (
                    <SelectItem
                      key={entrepreneur.id}
                      value={entrepreneur.id}
                    >
                      {entrepreneur.business_name}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Historia o presentación">
            <Textarea
              rows={4}
              value={weeklyStory}
              onChange={(event) =>
                setWeeklyStory(
                  event.target.value,
                )
              }
            />
          </Field>

          <Button
            type="button"
            className="justify-self-start"
            onClick={saveWeekly}
          >
            Guardar destacado
          </Button>
        </div>
      </AdminBlock>

      <section
        id="emprendedores"
        className="scroll-mt-32 pt-10"
      >
        <p className="eyebrow">
          Comunidad
        </p>

        <h2 className="mt-1 font-display text-2xl font-semibold">
          Emprendedores
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-4">
          <Stat
            label="Pendientes"
            value={pending.length}
          />

          <Stat
            label="Publicados"
            value={approved.length}
          />

          <Stat
            label="Ocultos"
            value={hidden.length}
          />

          <Stat
            label="Rechazados"
            value={rejected.length}
          />
        </div>

        <AdminSection
          title="Pendientes"
          items={pending}
          onStatus={updateStatus}
          onDelete={removeEntrepreneur}
          onVisibility={toggleVisibility}
        />

        <AdminSection
          title="Publicados"
          items={approved}
          onStatus={updateStatus}
          onDelete={removeEntrepreneur}
          onVisibility={toggleVisibility}
        />

        <AdminSection
          title="Rechazados"
          items={rejected}
          onStatus={updateStatus}
          onDelete={removeEntrepreneur}
          onVisibility={toggleVisibility}
        />
      </section>

      <div
        id="noticias"
        className="scroll-mt-32"
      >
        <NewsAdmin />
      </div>

      <div
        id="educa"
        className="scroll-mt-32"
      >
        <EducationAdmin />
      </div>

      <div
        id="eventos"
        className="scroll-mt-32"
      >
        <EventAdmin />
      </div>

      {/* COMPRAVENTA */}

      <div
        id="compraventa"
        className="scroll-mt-32"
      >
        <MarketplaceAdmin />
      </div>

      <AdminBlock
        id="radio"
        icon={
          <Radio className="h-5 w-5 text-primary" />
        }
        eyebrow="Radio"
        title="Contenido radial"
      >
        <div className="grid gap-4">
          <Field label="Título">
            <Input
              value={radioForm.title}
              onChange={(event) =>
                setRadioForm(
                  (previous) => ({
                    ...previous,
                    title:
                      event.target.value,
                  }),
                )
              }
            />
          </Field>

          <Field label="Tipo">
            <Select
              value={radioForm.kind}
              onValueChange={(value) =>
                setRadioForm(
                  (previous) => ({
                    ...previous,
                    kind: value,
                  }),
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="programa">
                  Programa
                </SelectItem>

                <SelectItem value="entrevista">
                  Entrevista
                </SelectItem>

                <SelectItem value="capsula">
                  Cápsula
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Descripción">
            <Textarea
              rows={3}
              value={radioForm.description}
              onChange={(event) =>
                setRadioForm(
                  (previous) => ({
                    ...previous,
                    description:
                      event.target.value,
                  }),
                )
              }
            />
          </Field>

          <Field label="URL de audio">
            <Input
              value={radioForm.media_url}
              onChange={(event) =>
                setRadioForm(
                  (previous) => ({
                    ...previous,
                    media_url:
                      event.target.value,
                  }),
                )
              }
            />
          </Field>

          <Field label="URL de imagen">
            <Input
              value={radioForm.image_url}
              onChange={(event) =>
                setRadioForm(
                  (previous) => ({
                    ...previous,
                    image_url:
                      event.target.value,
                  }),
                )
              }
            />
          </Field>

          <Button
            type="button"
            className="justify-self-start"
            onClick={saveRadio}
          >
            {radioForm.id
              ? "Actualizar contenido"
              : "Crear contenido"}
          </Button>
        </div>

        <div className="mt-8 space-y-3">
          {(radioItems.data ?? []).map(
            (item: RadioItem) => (
              <SimpleRow
                key={item.id}
                title={item.title}
                subtitle={item.kind}
                onEdit={() =>
                  setRadioForm({
                    id: item.id,
                    title: item.title,
                    kind: item.kind,
                    description:
                      item.description ?? "",
                    media_url:
                      item.media_url ?? "",
                    image_url:
                      item.image_url ?? "",
                  })
                }
                onDelete={() =>
                  deleteRadio(
                    item.id,
                  )
                }
              />
            ),
          )}
        </div>
      </AdminBlock>

      <AdminBlock
        id="auspiciadores"
        icon={
          <Sparkles className="h-5 w-5 text-primary" />
        }
        eyebrow="Apoyo"
        title="Auspiciadores"
      >
        <div className="grid gap-4">
          <Field label="Nombre">
            <Input
              value={sponsorForm.name}
              onChange={(event) =>
                setSponsorForm(
                  (previous) => ({
                    ...previous,
                    name:
                      event.target.value,
                  }),
                )
              }
            />
          </Field>

          <Field label="Descripción">
            <Textarea
              rows={3}
              value={sponsorForm.description}
              onChange={(event) =>
                setSponsorForm(
                  (previous) => ({
                    ...previous,
                    description:
                      event.target.value,
                  }),
                )
              }
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nivel">
              <Select
                value={sponsorForm.level}
                onValueChange={(value) =>
                  setSponsorForm(
                    (previous) => ({
                      ...previous,
                      level: value,
                    }),
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="principal">
                    Auspiciador principal
                  </SelectItem>

                  <SelectItem value="empresa-amiga">
                    Empresa amiga
                  </SelectItem>

                  <SelectItem value="aliado">
                    Aliado
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Orden">
              <Input
                type="number"
                value={sponsorForm.sort_order}
                onChange={(event) =>
                  setSponsorForm(
                    (previous) => ({
                      ...previous,
                      sort_order:
                        event.target.value,
                    }),
                  )
                }
              />
            </Field>
          </div>

          <Field label="Sitio web">
            <Input
              value={sponsorForm.website_url}
              onChange={(event) =>
                setSponsorForm(
                  (previous) => ({
                    ...previous,
                    website_url:
                      event.target.value,
                  }),
                )
              }
            />
          </Field>

          <Field label="Logo">
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) =>
                setSponsorLogoFile(
                  event.target.files?.[0] ??
                    null,
                )
              }
            />
          </Field>

          <Button
            type="button"
            className="justify-self-start"
            onClick={saveSponsor}
          >
            {sponsorForm.id
              ? "Actualizar auspiciador"
              : "Crear auspiciador"}
          </Button>
        </div>

        <div className="mt-8 space-y-3">
          {(sponsors.data ?? []).map(
            (sponsor) => (
              <div
                key={sponsor.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border p-4"
              >
                <div className="flex items-center gap-4">
                  {sponsor.logo_url ? (
                    <img
                      src={sponsor.logo_url}
                      alt={sponsor.name}
                      className="h-12 w-12 rounded-lg object-contain"
                    />
                  ) : null}

                  <div>
                    <p className="font-medium">
                      {sponsor.name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {sponsor.level}
                      {" · "}
                      {sponsor.visible
                        ? "Visible"
                        : "Oculto"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setSponsorForm({
                        id: sponsor.id,
                        name: sponsor.name,
                        website_url:
                          sponsor.website_url ??
                          "",
                        description:
                          sponsor.description ??
                          "",
                        level:
                          sponsor.level,
                        sort_order:
                          String(
                            sponsor.sort_order,
                          ),
                        logo_url:
                          sponsor.logo_url ??
                          "",
                      })
                    }
                  >
                    Editar
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      toggleSponsorVisibility(
                        sponsor,
                      )
                    }
                  >
                    {sponsor.visible
                      ? "Ocultar"
                      : "Mostrar"}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      deleteSponsor(
                        sponsor.id,
                      )
                    }
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ),
          )}
        </div>
      </AdminBlock>

      <div
        id="contacto"
        className="scroll-mt-32"
      >
        <ContactAdmin />
      </div>
    </section>
  );
}

function AdminBlock({
  id,
  icon,
  eyebrow,
  title,
  children,
}: {
  id?: string;
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="mt-10 scroll-mt-32 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8"
    >
      <div className="mb-8 flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary">
          {icon}
        </div>

        <div>
          <p className="eyebrow">
            {eyebrow}
          </p>

          <h2 className="mt-1 font-display text-2xl font-semibold">
            {title}
          </h2>
        </div>
      </div>

      {children}
    </section>
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

function SimpleRow({
  title,
  subtitle,
  onEdit,
  onDelete,
}: {
  title: string;
  subtitle: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-4">
      <div>
        <p className="font-medium">
          {title}
        </p>

        <p className="text-xs text-muted-foreground">
          {subtitle}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onEdit}
        >
          Editar
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
        >
          Eliminar
        </Button>
      </div>
    </div>
  );
}

function AdminSection({
  title,
  items,
  onStatus,
  onDelete,
  onVisibility,
}: {
  title: string;
  items: Entrepreneur[];

  onStatus: (
    id: string,
    status:
      | "aprobado"
      | "rechazado"
      | "pendiente",
  ) => Promise<void>;

  onDelete: (
    id: string,
    businessName: string,
  ) => Promise<void>;

  onVisibility: (
    entrepreneur: Entrepreneur,
  ) => Promise<void>;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold">
        {title}
      </h2>

      {items.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border p-7 text-center text-sm text-muted-foreground">
          No hay emprendimientos en esta sección.
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {items.map(
            (entrepreneur) => (
              <article
                key={entrepreneur.id}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex flex-col gap-5 md:flex-row">
                  {entrepreneur.photo_url ? (
                    <img
                      src={entrepreneur.photo_url}
                      alt={entrepreneur.business_name}
                      className="h-40 w-full rounded-xl object-cover md:w-56"
                    />
                  ) : null}

                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {entrepreneur.categories?.name ??
                          "Sin categoría"}
                      </Badge>

                      <Badge
                        variant={
                          entrepreneur.visible
                            ? "default"
                            : "outline"
                        }
                      >
                        {entrepreneur.visible
                          ? "Visible"
                          : "Oculto"}
                      </Badge>
                    </div>

                    <h3 className="mt-3 font-display text-xl font-semibold">
                      {entrepreneur.business_name}
                    </h3>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {entrepreneur.short_description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                      >
                        <Link
                          to="/editar/$id"
                          params={{
                            id:
                              entrepreneur.id,
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Link>
                      </Button>

                      {entrepreneur.status ===
                      "aprobado" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            onVisibility(
                              entrepreneur,
                            )
                          }
                        >
                          {entrepreneur.visible ? (
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

                      {entrepreneur.status !==
                      "aprobado" ? (
                        <Button
                          size="sm"
                          onClick={() =>
                            onStatus(
                              entrepreneur.id,
                              "aprobado",
                            )
                          }
                        >
                          <Check className="h-4 w-4" />
                          Aprobar
                        </Button>
                      ) : null}

                      {entrepreneur.status !==
                      "rechazado" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            onStatus(
                              entrepreneur.id,
                              "rechazado",
                            )
                          }
                        >
                          <X className="h-4 w-4" />
                          Rechazar
                        </Button>
                      ) : null}

                      {entrepreneur.status ===
                      "rechazado" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            onStatus(
                              entrepreneur.id,
                              "pendiente",
                            )
                          }
                        >
                          Volver a revisión
                        </Button>
                      ) : null}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          onDelete(
                            entrepreneur.id,
                            entrepreneur.business_name,
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </Button>
                    </div>
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

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 font-display text-3xl font-semibold">
        {value}
      </p>
    </div>
  );
}