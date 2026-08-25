import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Eye,
  EyeOff,
  Save,
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
import type { EducationItem } from "@/lib/vitrina";

export function EducationAdmin() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    id: "",
    kind: "capsula",
    category: "",
    title: "",
    summary: "",
    author_name: "",
    author_role: "",
    image_url: "",
    media_url: "",
    external_url: "",
    tool_type: "",
    featured: false,
    sort_order: "0",
  });

  const items = useQuery({
    queryKey: ["education-admin"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("education_items")
        .select("*")
        .order("featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .order("published_at", { ascending: false });

      if (error) throw error;

      return (data ?? []) as EducationItem[];
    },
  });

  async function save() {
    if (!form.title.trim()) {
      toast.error("El título es obligatorio.");
      return;
    }

    const payload = {
      kind: form.kind,
      category: form.category || null,
      title: form.title.trim(),
      summary: form.summary || null,
      author_name: form.author_name || null,
      author_role: form.author_role || null,
      image_url: form.image_url || null,
      media_url: form.media_url || null,
      external_url: form.external_url || null,
      tool_type:
        form.kind === "herramienta"
          ? form.tool_type || null
          : null,
      featured: form.featured,
      visible: true,
      sort_order: Number(form.sort_order) || 0,
      updated_at: new Date().toISOString(),
    };

    let error;

    if (form.id) {
      ({ error } = await (supabase as any)
        .from("education_items")
        .update(payload)
        .eq("id", form.id));
    } else {
      ({ error } = await (supabase as any)
        .from("education_items")
        .insert(payload));
    }

    if (error) {
      toast.error(error.message);
      return;
    }

    resetForm();

    await queryClient.invalidateQueries({
      queryKey: ["education-admin"],
    });

    await queryClient.invalidateQueries({
      queryKey: ["education-items"],
    });

    toast.success("Contenido Educa guardado.");
  }

  async function toggleVisible(item: EducationItem) {
    const { error } = await (supabase as any)
      .from("education_items")
      .update({
        visible: !item.visible,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: ["education-admin"],
    });

    await queryClient.invalidateQueries({
      queryKey: ["education-items"],
    });
  }

  async function remove(id: string) {
    if (!window.confirm("¿Eliminar este contenido de Educa?")) return;

    const { error } = await (supabase as any)
      .from("education_items")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: ["education-admin"],
    });

    await queryClient.invalidateQueries({
      queryKey: ["education-items"],
    });

    toast.success("Contenido eliminado.");
  }

  function resetForm() {
    setForm({
      id: "",
      kind: "capsula",
      category: "",
      title: "",
      summary: "",
      author_name: "",
      author_role: "",
      image_url: "",
      media_url: "",
      external_url: "",
      tool_type: "",
      featured: false,
      sort_order: "0",
    });
  }

  return (
    <section className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
      <div className="mb-8 flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>

        <div>
          <p className="eyebrow">La Vitrina Educa</p>
          <h2 className="mt-1 font-display text-2xl font-semibold">
            Cápsulas y herramientas
          </h2>
        </div>
      </div>

      <div className="grid gap-5">
        <Field label="Tipo">
          <Select
            value={form.kind}
            onValueChange={(value) =>
              setForm((p) => ({
                ...p,
                kind: value,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="capsula">Cápsula</SelectItem>
              <SelectItem value="herramienta">Herramienta</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Categoría">
            <Input
              value={form.category}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  category: e.target.value,
                }))
              }
              placeholder="Finanzas, Personas, Ventas..."
            />
          </Field>

          <Field label="Orden">
            <Input
              type="number"
              value={form.sort_order}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  sort_order: e.target.value,
                }))
              }
            />
          </Field>
        </div>

        <Field label="Título">
          <Input
            value={form.title}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                title: e.target.value,
              }))
            }
          />
        </Field>

        <Field label="Resumen">
          <Textarea
            rows={3}
            value={form.summary}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                summary: e.target.value,
              }))
            }
          />
        </Field>

        {form.kind === "capsula" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre del experto">
              <Input
                value={form.author_name}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    author_name: e.target.value,
                  }))
                }
              />
            </Field>

            <Field label="Profesión / especialidad">
              <Input
                value={form.author_role}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    author_role: e.target.value,
                  }))
                }
              />
            </Field>
          </div>
        ) : (
          <Field label="Tipo de herramienta">
            <Select
              value={form.tool_type || "guia"}
              onValueChange={(value) =>
                setForm((p) => ({
                  ...p,
                  tool_type: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="calculadora">
                  Calculadora
                </SelectItem>
                <SelectItem value="plantilla">
                  Plantilla
                </SelectItem>
                <SelectItem value="guia">
                  Guía
                </SelectItem>
                <SelectItem value="indicador">
                  Indicador
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="URL imagen">
            <Input
              value={form.image_url}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  image_url: e.target.value,
                }))
              }
            />
          </Field>

          <Field label="URL video / audio">
            <Input
              value={form.media_url}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  media_url: e.target.value,
                }))
              }
            />
          </Field>
        </div>

        <Field label="Enlace externo / descarga">
          <Input
            value={form.external_url}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                external_url: e.target.value,
              }))
            }
          />
        </Field>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                featured: e.target.checked,
              }))
            }
          />
          Destacar
        </label>

        <Button
          type="button"
          className="justify-self-start"
          onClick={save}
        >
          <Save className="h-4 w-4" />
          {form.id ? "Actualizar contenido" : "Crear contenido"}
        </Button>
      </div>

      <div className="mt-8 space-y-3">
        {(items.data ?? []).map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border p-4"
          >
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">
                {item.kind === "capsula"
                  ? "Cápsula"
                  : "Herramienta"}
                {" · "}
                {item.visible ? "Visible" : "Oculto"}
                {item.featured ? " · Destacado" : ""}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setForm({
                    id: item.id,
                    kind: item.kind,
                    category: item.category ?? "",
                    title: item.title,
                    summary: item.summary ?? "",
                    author_name: item.author_name ?? "",
                    author_role: item.author_role ?? "",
                    image_url: item.image_url ?? "",
                    media_url: item.media_url ?? "",
                    external_url: item.external_url ?? "",
                    tool_type: item.tool_type ?? "",
                    featured: item.featured,
                    sort_order: String(item.sort_order),
                  })
                }
              >
                Editar
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleVisible(item)}
              >
                {item.visible ? (
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

              <Button
                size="sm"
                variant="ghost"
                onClick={() => remove(item.id)}
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>
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