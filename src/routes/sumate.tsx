import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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
import { useAuth } from "@/hooks/use-auth";
import { fetchCategories, fetchComunas, slugify } from "@/lib/vitrina";

export const Route = createFileRoute("/sumate")({
  head: () => ({
    meta: [
      { title: "Súmate a La Vitrina — Publica tu emprendimiento" },
      {
        name: "description",
        content:
          "Registra tu emprendimiento del Maule Sur: cuéntanos qué haces, dónde estás y cómo te pueden contactar.",
      },
    ],
  }),
  component: SumatePage,
});

function SumatePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const comunas = useQuery({
    queryKey: ["comunas"],
    queryFn: fetchComunas,
  });

  const [busy, setBusy] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [form, setForm] = useState({
    business_name: "",
    owner_name: "",
    category_id: "",
    comuna_id: "",
    short_description: "",
    about: "",
    value_prop: "",
    tags: "",
    whatsapp: "",
    phone: "",
    email: "",
    instagram: "",
    facebook: "",
    website: "",
    collaboration_seeking: "",
    collaboration_offering: "",
  });

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  function selectPhoto(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecciona un archivo de imagen.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no puede superar los 5 MB.");
      return;
    }

    setPhotoFile(file);

    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function uploadPhoto() {
    if (!photoFile || !user) return null;

    const extension =
      photoFile.name.split(".").pop()?.toLowerCase() || "jpg";

    const fileName =
      `${user.id}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("Entrepreneur-images")
      .upload(fileName, photoFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: photoFile.type,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("Entrepreneur-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) return;

    if (!form.category_id || !form.comuna_id) {
      toast.error("Selecciona categoría y comuna.");
      return;
    }

    setBusy(true);

    try {
      const photoUrl = await uploadPhoto();

      const slug =
        `${slugify(form.business_name)}-${Math.random()
          .toString(36)
          .slice(2, 6)}`;

      const { error } = await supabase.from("entrepreneurs").insert({
        user_id: user.id,
        slug,
        business_name: form.business_name,
        owner_name: form.owner_name,
        category_id: form.category_id,
        comuna_id: form.comuna_id,
        short_description: form.short_description,
        about: form.about || null,
        value_prop: form.value_prop || null,
        photo_url: photoUrl,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        whatsapp: form.whatsapp || null,
        phone: form.phone || null,
        email: form.email || user.email || null,
        instagram: form.instagram || null,
        facebook: form.facebook || null,
        website: form.website || null,
        collaboration_seeking:
          form.collaboration_seeking || null,
        collaboration_offering:
          form.collaboration_offering || null,
      });

      if (error) throw error;

      toast.success(
        "¡Listo! Tu emprendimiento quedó en revisión.",
      );

      navigate({ to: "/panel" });
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No pudimos guardar el emprendimiento.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="border-b border-border bg-surface">
        <div className="container-page py-12">
          <p className="eyebrow">Súmate</p>

          <h1 className="mt-2 font-display text-4xl font-semibold">
            Publica tu emprendimiento en La Vitrina
          </h1>

          <p className="mt-3 max-w-2xl text-muted-foreground">
            Completa el formulario y nuestro equipo revisará tu perfil
            dentro de 48 horas.
          </p>
        </div>
      </section>

      <section className="container-page py-12">
        {loading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-muted" />
        ) : !user ? (
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="font-display text-xl">
              Primero crea tu cuenta
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Necesitamos una cuenta para que puedas editar tu perfil
              y ver tus métricas.
            </p>

            <Button asChild className="mt-5">
              <Link to="/auth">Ingresar o registrarme</Link>
            </Button>
          </div>
        ) : (
          <form
            className="mx-auto grid max-w-3xl gap-6"
            onSubmit={submit}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre del emprendimiento" required>
                <Input
                  required
                  value={form.business_name}
                  onChange={(e) =>
                    set("business_name")(e.target.value)
                  }
                />
              </Field>

              <Field label="Tu nombre" required>
                <Input
                  required
                  value={form.owner_name}
                  onChange={(e) =>
                    set("owner_name")(e.target.value)
                  }
                />
              </Field>

              <Field label="Categoría" required>
                <Select
                  value={form.category_id}
                  onValueChange={set("category_id")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rubro" />
                  </SelectTrigger>

                  <SelectContent>
                    {categories.data?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Comuna" required>
                <Select
                  value={form.comuna_id}
                  onValueChange={set("comuna_id")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu comuna" />
                  </SelectTrigger>

                  <SelectContent>
                    {comunas.data?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Descripción corta (una línea)" required>
              <Input
                required
                maxLength={160}
                value={form.short_description}
                onChange={(e) =>
                  set("short_description")(e.target.value)
                }
              />
            </Field>

            <Field label="Foto de portada">
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) =>
                  selectPhoto(e.target.files?.[0])
                }
              />

              <p className="text-xs text-muted-foreground">
                JPG, PNG o WebP. Máximo 5 MB.
              </p>

              {photoPreview ? (
                <div className="mt-3">
                  <img
                    src={photoPreview}
                    alt="Vista previa de la portada"
                    className="aspect-[4/3] w-full max-w-md rounded-2xl border border-border object-cover"
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview("");
                    }}
                  >
                    Quitar foto
                  </Button>
                </div>
              ) : null}
            </Field>

            <Field label="Tu historia">
              <Textarea
                rows={5}
                value={form.about}
                onChange={(e) => set("about")(e.target.value)}
                placeholder="¿Cómo partió tu emprendimiento? ¿Qué te mueve?"
              />
            </Field>

            <Field label="¿Qué te hace diferente?">
              <Textarea
                rows={3}
                value={form.value_prop}
                onChange={(e) =>
                  set("value_prop")(e.target.value)
                }
              />
            </Field>

            <Field label="Etiquetas (separadas por coma)">
              <Input
                value={form.tags}
                onChange={(e) => set("tags")(e.target.value)}
                placeholder="artesanía, alimentos, servicios"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="WhatsApp">
                <Input
                  value={form.whatsapp}
                  onChange={(e) =>
                    set("whatsapp")(e.target.value)
                  }
                  placeholder="+56 9..."
                />
              </Field>

              <Field label="Teléfono">
                <Input
                  value={form.phone}
                  onChange={(e) => set("phone")(e.target.value)}
                />
              </Field>

              <Field label="Correo de contacto">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email")(e.target.value)}
                />
              </Field>

              <Field label="Instagram">
                <Input
                  value={form.instagram}
                  onChange={(e) =>
                    set("instagram")(e.target.value)
                  }
                  placeholder="@tuemprendimiento"
                />
              </Field>

              <Field label="Facebook">
                <Input
                  value={form.facebook}
                  onChange={(e) =>
                    set("facebook")(e.target.value)
                  }
                />
              </Field>

              <Field label="Sitio web">
                <Input
                  value={form.website}
                  onChange={(e) =>
                    set("website")(e.target.value)
                  }
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Busco colaborar en…">
                <Textarea
                  rows={3}
                  value={form.collaboration_seeking}
                  onChange={(e) =>
                    set("collaboration_seeking")(e.target.value)
                  }
                />
              </Field>

              <Field label="Puedo aportar…">
                <Textarea
                  rows={3}
                  value={form.collaboration_offering}
                  onChange={(e) =>
                    set("collaboration_offering")(e.target.value)
                  }
                />
              </Field>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={busy}
              className="justify-self-start"
            >
              {busy
                ? "Subiendo y enviando…"
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
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required ? (
          <span className="text-primary"> *</span>
        ) : null}
      </Label>

      {children}
    </div>
  );
}
