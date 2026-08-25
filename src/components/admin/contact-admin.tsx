import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Facebook,
  Globe,
  Instagram,
  Mail,
  MessageCircle,
  Phone,
  Save,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { supabase } from "@/integrations/supabase/client";
import {
  fetchSiteSettings,
  siteWhatsappLink,
} from "@/lib/vitrina";

export function ContactAdmin() {
  const queryClient = useQueryClient();

  const settings = useQuery({
    queryKey: ["site-settings"],
    queryFn: fetchSiteSettings,
  });

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    phone: "",
    whatsapp: "",
    whatsapp_message: "",
    instagram: "",
    facebook: "",
    email: "",
    website: "",
  });

  useEffect(() => {
    if (!settings.data) return;

    setForm({
      phone: settings.data.phone ?? "",
      whatsapp: settings.data.whatsapp ?? "",
      whatsapp_message:
        settings.data.whatsapp_message ?? "",
      instagram: settings.data.instagram ?? "",
      facebook: settings.data.facebook ?? "",
      email: settings.data.email ?? "",
      website: settings.data.website ?? "",
    });
  }, [settings.data]);

  async function save() {
    setSaving(true);

    try {
      const { error } = await (supabase as any)
        .from("site_settings")
        .update({
          phone: form.phone.trim() || null,
          whatsapp: form.whatsapp.trim() || null,
          whatsapp_message:
            form.whatsapp_message.trim() || null,
          instagram: form.instagram.trim() || null,
          facebook: form.facebook.trim() || null,
          email: form.email.trim() || null,
          website: form.website.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", "home");

      if (error) throw error;

      await queryClient.invalidateQueries({
        queryKey: ["site-settings"],
      });

      toast.success("Contacto y redes actualizados.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No pudimos guardar los datos de contacto.",
      );
    } finally {
      setSaving(false);
    }
  }

  const whatsappPreview = siteWhatsappLink({
    whatsapp: form.whatsapp || null,
    whatsapp_message:
      form.whatsapp_message || null,
  });

  return (
    <section className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
      <div className="mb-7">
        <p className="eyebrow">
          Contacto y redes
        </p>

        <h2 className="mt-1 font-display text-2xl font-semibold">
          Canales oficiales de La Vitrina
        </h2>

        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Estos datos podrán utilizarse en el inicio, footer,
          botones de contacto y accesos rápidos de toda la web.
        </p>
      </div>

      <div className="grid gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Teléfono"
            icon={<Phone className="h-4 w-4" />}
          >
            <Input
              value={form.phone}
              onChange={(e) =>
                setForm((previous) => ({
                  ...previous,
                  phone: e.target.value,
                }))
              }
              placeholder="+56 9 1234 5678"
            />
          </Field>

          <Field
            label="WhatsApp"
            icon={<MessageCircle className="h-4 w-4" />}
          >
            <Input
              value={form.whatsapp}
              onChange={(e) =>
                setForm((previous) => ({
                  ...previous,
                  whatsapp: e.target.value,
                }))
              }
              placeholder="+56 9 1234 5678"
            />
          </Field>

          <Field
            label="Instagram"
            icon={<Instagram className="h-4 w-4" />}
          >
            <Input
              value={form.instagram}
              onChange={(e) =>
                setForm((previous) => ({
                  ...previous,
                  instagram: e.target.value,
                }))
              }
              placeholder="@lavitrina o URL completa"
            />
          </Field>

          <Field
            label="Facebook"
            icon={<Facebook className="h-4 w-4" />}
          >
            <Input
              value={form.facebook}
              onChange={(e) =>
                setForm((previous) => ({
                  ...previous,
                  facebook: e.target.value,
                }))
              }
              placeholder="Nombre de página o URL"
            />
          </Field>

          <Field
            label="Correo"
            icon={<Mail className="h-4 w-4" />}
          >
            <Input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((previous) => ({
                  ...previous,
                  email: e.target.value,
                }))
              }
              placeholder="contacto@lavitrina.cl"
            />
          </Field>

          <Field
            label="Sitio web"
            icon={<Globe className="h-4 w-4" />}
          >
            <Input
              value={form.website}
              onChange={(e) =>
                setForm((previous) => ({
                  ...previous,
                  website: e.target.value,
                }))
              }
              placeholder="www.lavitrina.cl"
            />
          </Field>
        </div>

        <Field
          label="Mensaje predeterminado de WhatsApp"
          icon={<MessageCircle className="h-4 w-4" />}
        >
          <Textarea
            rows={3}
            value={form.whatsapp_message}
            onChange={(e) =>
              setForm((previous) => ({
                ...previous,
                whatsapp_message: e.target.value,
              }))
            }
            placeholder="Hola, llegué desde La Vitrina y quisiera hacer una consulta."
          />
        </Field>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={save}
            disabled={saving}
          >
            <Save className="h-4 w-4" />

            {saving
              ? "Guardando..."
              : "Guardar contacto y redes"}
          </Button>

          {whatsappPreview ? (
            <Button
              asChild
              type="button"
              variant="outline"
            >
              <a
                href={whatsappPreview}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="h-4 w-4" />
                Probar WhatsApp
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        {icon}
        {label}
      </Label>

      {children}
    </div>
  );
}