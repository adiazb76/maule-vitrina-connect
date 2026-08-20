import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  ArrowLeft,
  Facebook,
  Globe,
  Handshake,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getEntrepreneurBySlug } from "@/lib/entrepreneurs.functions";
import {
  instagramLink,
  logInteraction,
  websiteLink,
  whatsappLink,
  type Entrepreneur,
  type Product,
} from "@/lib/vitrina";

export const Route = createFileRoute("/emprendedores/$slug")({
  loader: async ({ params }) => {
    const result = await getEntrepreneurBySlug({ data: { slug: params.slug } });
    if (!result) throw notFound();
    return result as unknown as { entrepreneur: Entrepreneur; products: Product[] };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Emprendimiento no encontrado — La Vitrina" }, { name: "robots", content: "noindex" }],
      };
    }
    const e = loaderData.entrepreneur;
    const title = `${e.business_name} — Emprendedor del Maule Sur | La Vitrina`;
    const description = e.short_description?.slice(0, 155) || `Conoce a ${e.business_name} en La Vitrina.`;
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ];
    if (e.photo_url && e.photo_url.startsWith("https://")) {
      meta.push({ property: "og:image", content: e.photo_url });
      meta.push({ name: "twitter:image", content: e.photo_url });
    }
    return { meta };
  },
  component: EntrepreneurProfile,
  notFoundComponent: ProfileNotFound,
});

function ProfileNotFound() {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-3xl font-semibold">Emprendimiento no encontrado</h1>
      <p className="mt-3 text-muted-foreground">Puede que aún no esté aprobado o que el enlace haya cambiado.</p>
      <Button asChild className="mt-6">
        <Link to="/emprendedores">Ver el directorio</Link>
      </Button>
    </div>
  );
}

function EntrepreneurProfile() {
  const { entrepreneur: e, products } = Route.useLoaderData();
  const wa = whatsappLink(e);
  const ig = instagramLink(e.instagram);
  const web = websiteLink(e.website);

  useEffect(() => {
    logInteraction(e.id, "view");
  }, [e.id]);

  return (
    <div className="pb-20">
      <div className="relative h-56 w-full overflow-hidden bg-muted sm:h-72 md:h-80">
        {e.photo_url ? (
          <img src={e.photo_url} alt={`Imagen de ${e.business_name}`} className="h-full w-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="container-page -mt-16 relative">
        <Link
          to="/emprendedores"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al directorio
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {e.categories?.name ? <Badge variant="secondary" className="rounded-full">{e.categories.name}</Badge> : null}
            {e.comunas?.name ? (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {e.comunas.name}
              </span>
            ) : null}
            {e.featured ? <Badge className="rounded-full">Destacado</Badge> : null}
          </div>

          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{e.business_name}</h1>
          <p className="mt-1 text-muted-foreground">Por {e.owner_name}</p>
          <p className="mt-4 max-w-2xl text-foreground/85">{e.short_description}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {wa ? (
              <Button asChild variant="whatsapp">
                <a href={wa} target="_blank" rel="noreferrer" onClick={() => logInteraction(e.id, "whatsapp")}>
                  <MessageCircle className="h-4 w-4" /> Escribir por WhatsApp
                </a>
              </Button>
            ) : null}
            {ig ? (
              <Button asChild variant="outline">
                <a href={ig} target="_blank" rel="noreferrer" onClick={() => logInteraction(e.id, "instagram")}>
                  <Instagram className="h-4 w-4" /> Instagram
                </a>
              </Button>
            ) : null}
            {e.facebook ? (
              <Button asChild variant="outline">
                <a href={e.facebook} target="_blank" rel="noreferrer" onClick={() => logInteraction(e.id, "facebook")}>
                  <Facebook className="h-4 w-4" /> Facebook
                </a>
              </Button>
            ) : null}
            {web ? (
              <Button asChild variant="outline">
                <a href={web} target="_blank" rel="noreferrer" onClick={() => logInteraction(e.id, "website")}>
                  <Globe className="h-4 w-4" /> Sitio web
                </a>
              </Button>
            ) : null}
            {e.email ? (
              <Button asChild variant="outline">
                <a href={`mailto:${e.email}`} onClick={() => logInteraction(e.id, "email")}>
                  <Mail className="h-4 w-4" /> Email
                </a>
              </Button>
            ) : null}
            {e.phone ? (
              <Button asChild variant="outline">
                <a href={`tel:${e.phone}`} onClick={() => logInteraction(e.id, "phone")}>
                  <Phone className="h-4 w-4" /> Llamar
                </a>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-8">
            {e.about ? (
              <section className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-display text-xl font-semibold">Nuestra historia</h2>
                <p className="mt-3 whitespace-pre-line text-foreground/85">{e.about}</p>
              </section>
            ) : null}

            {products.length > 0 ? (
              <section>
                <h2 className="font-display text-xl font-semibold">Productos y servicios</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {products.map((p) => (
                    <article key={p.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          loading="lazy"
                          className="aspect-[4/3] w-full object-cover"
                        />
                      ) : null}
                      <div className="p-4">
                        <h3 className="font-medium">{p.name}</h3>
                        {p.description ? (
                          <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                        ) : null}
                        {p.info ? <p className="mt-2 text-sm font-medium text-primary">{p.info}</p> : null}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-6">
            {e.value_prop ? (
              <section className="rounded-2xl border border-border bg-secondary/40 p-6">
                <h2 className="font-display text-lg font-semibold">Lo que nos hace únicos</h2>
                <p className="mt-2 text-sm text-foreground/85">{e.value_prop}</p>
              </section>
            ) : null}

            {e.collaboration_seeking || e.collaboration_offering ? (
              <section className="rounded-2xl border border-border bg-card p-6">
                <h2 className="inline-flex items-center gap-2 font-display text-lg font-semibold">
                  <Handshake className="h-5 w-5 text-primary" /> Colaboración
                </h2>
                {e.collaboration_offering ? (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ofrece</p>
                    <p className="text-sm text-foreground/85">{e.collaboration_offering}</p>
                  </div>
                ) : null}
                {e.collaboration_seeking ? (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Busca</p>
                    <p className="text-sm text-foreground/85">{e.collaboration_seeking}</p>
                  </div>
                ) : null}
              </section>
            ) : null}

            {e.tags.length > 0 ? (
              <section className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-display text-lg font-semibold">Etiquetas</h2>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {e.tags.map((t) => (
                    <span key={t} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                      {t}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
