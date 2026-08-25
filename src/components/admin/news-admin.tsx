import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Newspaper, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { NewsItem } from "@/lib/vitrina";

export function NewsAdmin() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    id: "",
    title: "",
    summary: "",
    body: "",
    image_url: "",
    external_url: "",
    instagram_url: "",
    whatsapp_text: "",
    radio_note: "",
    featured: false,
    sort_order: "0",
  });

  const items = useQuery({
    queryKey: ["news-admin"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("news_items")
        .select("*")
        .order("featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .order("published_at", { ascending: false });

      if (error) throw error;

      return (data ?? []) as NewsItem[];
    },
  });

  async function save() {
    if (!form.title.trim()) {
      toast.error("El título es obligatorio.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      summary: form.summary || null,
      body: form.body || null,
      image_url: form.image_url || null,
      external_url: form.external_url || null,
      instagram_url: form.instagram_url || null,
      whatsapp_text: form.whatsapp_text || null,
      radio_note: form.radio_note || null,
      featured: form.featured,
      sort_order: Number(form.sort_order) || 0,
      visible: true,
      updated_at: new Date().toISOString(),
    };

    let error;

    if (form.id) {
      ({ error } = await (supabase as any)
        .from("news_items")
        .update(payload)
        .eq("id", form.id));
    } else {
      ({ error } = await (supabase as any)
        .from("news_items")
        .insert(payload));
    }

    if (error) {
      toast.error(error.message);
      return;
    }

    setForm({
      id: "",
      title: "",
      summary: "",
      body: "",
      image_url: "",
      external_url: "",
      instagram_url: "",
      whatsapp_text: "",
      radio_note: "",
      featured: false,
      sort_order: "0",
    });

    await queryClient.invalidateQueries({
      queryKey: ["news-admin"],
    });

    await queryClient.invalidateQueries({
      queryKey: ["news-items"],
    });

    toast.success("Noticia guardada.");
  }

  async function toggleVisible(item: NewsItem) {
    const { error } = await (supabase as any)
      .from("news_items")
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
      queryKey: ["news-admin"],
    });

    await queryClient.invalidateQueries({
      queryKey: ["news-items"],
    });
  }

  async function remove(id: string) {
    if (!window.confirm("¿Eliminar esta noticia?")) return;

    const { error } = await (supabase as any)
      .from("news_items")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: ["news-admin"],
    });

    await queryClient.invalidateQueries({
      queryKey: ["news-items"],
    });

    toast.success("Noticia eliminada.");
  }

  return (
    <section className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
      <div className="mb-8 flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary">
          <Newspaper className="h-5 w-5 text-primary" />
        </div>

        <div>
          <p className="eyebrow">Actualidad</p>
          <h2 className="mt-1 font-display text-2xl font-semibold">
            Noticias / Hoy en La Vitrina
          </h2>
        </div>
      </div>

      <div className="grid gap-5">
        <Field label="Título">
          <Input
            value={form.title}
            onChange={(e) =>
              setForm((p) => ({ ...p, title: e.target.value }))
            }
          />
        </Field>

        <Field label="Resumen">
          <Textarea
            rows={2}
            value={form.summary}
            onChange={(e) =>
              setForm((p) => ({ ...p, summary: e.target.value }))
            }
          />
        </Field>

        <Field label="Texto completo">
          <Textarea
            rows={5}
            value={form.body}
            onChange={(e) =>
              setForm((p) => ({ ...p, body: e.target.value }))
            }
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="URL imagen">
            <Input
              value={form.image_url}
              onChange={(e) =>
                setForm((p) => ({ ...p, image_url: e.target.value }))
              }
            />
          </Field>

          <Field label="Enlace externo">
            <Input
              value={form.external_url}
              onChange={(e) =>
                setForm((p) => ({ ...p, external_url: e.target.value }))
              }
            />
          </Field>

          <Field label="Instagram">
            <Input
              value={form.instagram_url}
              onChange={(e) =>
                setForm((p) => ({ ...p, instagram_url: e.target.value }))
              }
            />
          </Field>

          <Field label="Orden">
            <Input
              type="number"
              value={form.sort_order}
              onChange={(e) =>
                setForm((p) => ({ ...p, sort_order: e.target.value }))
              }
            />
          </Field>
        </div>

        <Field label="Texto sugerido para WhatsApp">
          <Textarea
            rows={3}
            value={form.whatsapp_text}
            onChange={(e) =>
              setForm((p) => ({ ...p, whatsapp_text: e.target.value }))
            }
          />
        </Field>

        <Field label="Nota para radio">
          <Textarea
            rows={3}
            value={form.radio_note}
            onChange={(e) =>
              setForm((p) => ({ ...p, radio_note: e.target.value }))
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
          {form.id ? "Actualizar noticia" : "Crear noticia"}
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
                {item.visible ? "Visible" : "Oculta"}
                {item.featured ? " · Destacada" : ""}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setForm({
                    id: item.id,
                    title: item.title,
                    summary: item.summary ?? "",
                    body: item.body ?? "",
                    image_url: item.image_url ?? "",
                    external_url: item.external_url ?? "",
                    instagram_url: item.instagram_url ?? "",
                    whatsapp_text: item.whatsapp_text ?? "",
                    radio_note: item.radio_note ?? "",
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