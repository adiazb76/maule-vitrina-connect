import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
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
import { fetchCategories, fetchComunas } from "@/lib/vitrina";

export const Route = createFileRoute("/_authenticated/editar/$id")({
  component: EditarEmprendimiento,
});

function EditarEmprendimiento() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const comunas = useQuery({
    queryKey: ["comunas"],
    queryFn: fetchComunas,
  });

  const entrepreneur = useQuery({
    queryKey: ["entrepreneur-edit", id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entrepreneurs")
        .select("*")
        .eq("id", id)
        .eq("user_id", user!.id)
        .single();

      if (error) throw error;

      return data;
    },
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
    photo_url: "",
  });

  useEffect(() => {
    if (!entrepreneur.data) return;

    const e = entrepreneur.data;

    setForm({
      business_name: e.business_name ?? "",
      owner_name: e.owner_name ?? "",
      category_id: e.category_id ?? "",
      comuna_id: e.comuna_id ?? "",
      short_description: e.short_description ?? "",
      about: e.about ?? "",
      value_prop: e.value_prop ?? "",
      tags: (e.tags ?? []).join(", "),
      whatsapp: e.whatsapp ?? "",
      phone: e.phone ?? "",
      email: e.email ?? "",
      instagram: e.instagram ?? "",
      facebook: e.facebook ?? "",
      website: e.website ?? "",
      collaboration_seeking: e.collaboration_seeking ?? "",
      collaboration_offering: e.collaboration_offering ?? "",
      photo_url: e.photo_url ?? "",
    });

    setPhotoPreview(e.photo_url ?? "");
  }, [entrepreneur.data]);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  function selectPhoto(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecciona una imagen válida.");
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
    if (!photoFile || !user) return form.photo_url || null;

    const extension =
      photoFile.name.split(".").pop()?.toLowerCase() || "jpg";

    const fileName =
      `${user.id}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${extension}`;

    const { error } = await supabase.storage
      .from("Entrepreneur-images")
      .upload(fileName, photoFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: photoFile.type,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from("Entrepreneur-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();

    if (!user) return;

    setBusy(true);

    try {
      const photoUrl = await uploadPhoto();

      const { error } = await supabase
        .from("entrepreneurs")
        .update({
          business_name: form.business_name,
          owner_name: form.owner_name,
          category_id: form.category_id || null,
          comuna_id: form.comuna_id || null,
          short_description: form.short_description,
          about: form.about || null,
          value_prop: form.value_prop || null,
          photo_url: photoUrl,
          tags: form.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          whatsapp: form.whatsapp || null,
          phone: form.phone || null,
          email: form.email || null,
          instagram: form.instagram || null,
          facebook: form.facebook || null,
          website: form.website || null,
          collaboration_seeking:
            form.collaboration_seeking || null,
          collaboration_offering:
            form.collaboration_offering || null,
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      await queryClient.invalidateQueries({
        queryKey: ["my-entrepreneurs"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["entrepreneurs"],
      });

      toast.success("Cambios guardados correctamente.");

      navigate({ to: "/panel" });
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No pudimos guardar los cambios.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (entrepreneur.isLoading) {
    return (
      <section className="container-page py-12">
        <div className="h-60 animate-pulse rounded-2xl bg-muted" />
      </section>
    );
  }

  if (entrepreneur.isError || !entrepreneur.data) {
    return (
      <section className="container-page py-20 text-center">
        <h1 className="font-display text-2xl font-semibold">
          No encontramos este emprendimiento
        </h1>

        <Button asChild className="mt-6">
          <Link to="/panel">Volver al panel</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="container-page py-12">
      <Link
        to="/panel"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al panel
      </Link>

      <div className="mt-6">
        <p className="eyebrow">Mi emprendimiento</p>

        <h1 className="mt-2 font-display text-3xl font-semibold">
          Editar {form.business_name}
        </h1>

        <p className="mt-2 text-muted-foreground">
          Mantén tu información actualizada para que las personas puedan
          conocerte y contactarte.
        </p>
      </div>

      <form
        className="mt-10 grid max-w-3xl gap-6"
        onSubmit={save}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre del emprendimiento">
            <Input
              required
              value={form.business_name}
              onChange={(e) =>
                set("business_name")(e.target.value)
              }
            />
          </Field>

          <Field label="Tu nombre">
            <Input
              required
              value={form.owner_name}
              onChange={(e) =>
                set("owner_name")(e.target.value)
              }
            />
          </Field>

          <Field label="Categoría">
            <Select
              value={form.category_id}
              onValueChange={set("category_id")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona categoría" />
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

          <Field label="Comuna">
            <Select
              value={form.comuna_id}
              onValueChange={set("comuna_id")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona comuna" />
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

        <Field label="Descripción corta">
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

          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Foto del emprendimiento"
              className="mt-3 aspect-[4/3] w-full max-w-md rounded-2xl object-cover"
            />
          ) : null}
        </Field>

        <Field label="Nuestra historia">
          <Textarea
            rows={5}
            value={form.about}
            onChange={(e) => set("about")(e.target.value)}
          />
        </Field>

        <Field label="¿Qué nos hace diferentes?">
          <Textarea
            rows={3}
            value={form.value_prop}
            onChange={(e) =>
              set("value_prop")(e.target.value)
            }
          />
        </Field>

        <Field label="Etiquetas">
          <Input
            value={form.tags}
            onChange={(e) => set("tags")(e.target.value)}
            placeholder="repuestos, automotriz, accesorios"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="WhatsApp">
            <Input
              value={form.whatsapp}
              onChange={(e) =>
                set("whatsapp")(e.target.value)
              }
            />
          </Field>

          <Field label="Teléfono">
            <Input
              value={form.phone}
              onChange={(e) =>
                set("phone")(e.target.value)
              }
            />
          </Field>

          <Field label="Correo">
            <Input
              type="email"
              value={form.email}
              onChange={(e) =>
                set("email")(e.target.value)
              }
            />
          </Field>

          <Field label="Instagram">
            <Input
              value={form.instagram}
              onChange={(e) =>
                set("instagram")(e.target.value)
              }
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
          {busy ? "Guardando…" : "Guardar cambios"}
        </Button>
      </form>
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
      <Label>{label}</Label>
      {children}
    </div>
  );
}