import {
  createFileRoute,
  Link,
  notFound,
} from "@tanstack/react-router";

import {
  useEffect,
} from "react";

import {
  ArrowLeft,
  Facebook,
  Globe,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Button,
} from "@/components/ui/button";

import {
  LikeButton,
} from "@/components/like-button";

import {
  getEntrepreneurBySlug,
} from "@/lib/entrepreneurs.functions";

import {
  facebookLink,
  instagramLink,
  logInteraction,
  websiteLink,
  whatsappLink,
  type Entrepreneur,
  type Product,
} from "@/lib/vitrina";

export const Route =
  createFileRoute(
    "/emprendedores/$slug",
  )({
    loader:
      async ({
        params,
      }) => {
        const result =
          await getEntrepreneurBySlug({
            data: {
              slug:
                params.slug,
            },
          });

        if (!result) {
          throw notFound();
        }

        return result as unknown as {
          entrepreneur:
            Entrepreneur;

          products:
            Product[];
        };
      },

    head:
      ({
        loaderData,
      }) => {
        if (!loaderData) {
          return {
            meta: [
              {
                title:
                  "Emprendimiento no encontrado | La Vitrina",
              },

              {
                name:
                  "robots",

                content:
                  "noindex",
              },
            ],
          };
        }

        const e =
          loaderData.entrepreneur;

        const title =
          `${e.business_name} | La Vitrina Maule Sur`;

        const description =
          e.short_description
            ?.slice(
              0,
              155,
            ) ||
          `Conoce a ${e.business_name} en La Vitrina.`;

        const meta:
          Array<
            Record<
              string,
              string
            >
          > = [
          {
            title,
          },

          {
            name:
              "description",

            content:
              description,
          },

          {
            property:
              "og:title",

            content:
              title,
          },

          {
            property:
              "og:description",

            content:
              description,
          },
        ];

        if (
          e.photo_url &&
          e.photo_url.startsWith(
            "https://",
          )
        ) {
          meta.push({
            property:
              "og:image",

            content:
              e.photo_url,
          });

          meta.push({
            name:
              "twitter:image",

            content:
              e.photo_url,
          });
        }

        return {
          meta,
        };
      },

    component:
      EntrepreneurProfile,

    notFoundComponent:
      ProfileNotFound,
  });


function ProfileNotFound() {
  return (
    <div className="container-page py-14 text-center">
      <h1 className="page-title">
        Emprendimiento no encontrado
      </h1>

      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Puede que todavía no esté publicado o que el enlace haya cambiado.
      </p>

      <Button
        asChild
        size="sm"
        className="mt-5"
      >
        <Link to="/comunidad">
          Volver a Comunidad
        </Link>
      </Button>
    </div>
  );
}


function EntrepreneurProfile() {
  const {
    entrepreneur:
      e,

    products,
  } =
    Route.useLoaderData();

  const wa =
    whatsappLink(
      e,
    );

  const ig =
    instagramLink(
      e.instagram,
    );

  const fb =
    facebookLink(
      e.facebook,
    );

  const web =
    websiteLink(
      e.website,
    );

  useEffect(
    () => {
      logInteraction(
        e.id,
        "view",
      );
    },
    [
      e.id,
    ],
  );

  return (
    <div className="pb-10">
      {/* RETORNO */}

      <div className="container-page pt-4">
        <Link
          to="/comunidad"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />

          Volver a Comunidad
        </Link>
      </div>

      {/* CABECERA PRINCIPAL */}

      <section className="container-page pt-3">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="grid md:grid-cols-[280px_1fr] lg:grid-cols-[340px_1fr]">
            {/* FOTO */}

            <div className="bg-muted">
              {e.photo_url ? (
                <img
                  src={
                    e.photo_url
                  }
                  alt={
                    e.business_name
                  }
                  className="aspect-[16/9] h-full max-h-64 w-full object-cover md:aspect-auto md:max-h-none"
                />
              ) : (
                <div className="grid min-h-48 place-items-center text-xs text-muted-foreground">
                  Sin imagen
                </div>
              )}
            </div>

            {/* INFORMACIÓN */}

            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {/* CLASIFICACIÓN */}

                  <div className="flex flex-wrap items-center gap-1.5">
                    {e.categories
                      ?.name ? (
                      <Badge
                        variant="secondary"
                        className="h-5 rounded-full px-2 text-[10px]"
                      >
                        {
                          e.categories
                            .name
                        }
                      </Badge>
                    ) : null}

                    {e.activities
                      ?.name ? (
                      <Badge
                        variant="outline"
                        className="h-5 rounded-full px-2 text-[10px]"
                      >
                        {
                          e.activities
                            .name
                        }
                      </Badge>
                    ) : null}

                    {e.comunas
                      ?.name ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                        <MapPin className="h-3 w-3" />

                        {
                          e.comunas
                            .name
                        }
                      </span>
                    ) : null}
                  </div>

                  {/* NOMBRE */}

                  <h1 className="mt-2 page-title">
                    {
                      e.business_name
                    }
                  </h1>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {
                      e.owner_name
                    }
                  </p>
                </div>

                {/* CORAZÓN */}

                <LikeButton
                  contentType="entrepreneur"
                  contentId={
                    e.id
                  }
                  compact
                />
              </div>

              {/* DESCRIPCIÓN */}

              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/80">
                {
                  e.short_description
                }
              </p>

              {/* CONTACTO PRINCIPAL */}

              <div className="mt-4 flex flex-wrap gap-2">
                {wa ? (
                  <Button
                    asChild
                    size="sm"
                    variant="whatsapp"
                    className="h-8 text-xs"
                  >
                    <a
                      href={
                        wa
                      }
                      target="_blank"
                      rel="noreferrer"
                      onClick={() =>
                        logInteraction(
                          e.id,
                          "whatsapp",
                        )
                      }
                    >
                      <MessageCircle className="h-3.5 w-3.5" />

                      WhatsApp
                    </a>
                  </Button>
                ) : null}

                {e.phone ? (
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                  >
                    <a
                      href={`tel:${e.phone}`}
                      onClick={() =>
                        logInteraction(
                          e.id,
                          "phone",
                        )
                      }
                    >
                      <Phone className="h-3.5 w-3.5" />

                      Llamar
                    </a>
                  </Button>
                ) : null}

                {ig ? (
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-8 px-2.5 text-xs"
                  >
                    <a
                      href={
                        ig
                      }
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Instagram"
                      onClick={() =>
                        logInteraction(
                          e.id,
                          "instagram",
                        )
                      }
                    >
                      <Instagram className="h-3.5 w-3.5" />

                      Instagram
                    </a>
                  </Button>
                ) : null}

                {fb ? (
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-8 px-2.5 text-xs"
                  >
                    <a
                      href={
                        fb
                      }
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Facebook"
                      onClick={() =>
                        logInteraction(
                          e.id,
                          "facebook",
                        )
                      }
                    >
                      <Facebook className="h-3.5 w-3.5" />

                      Facebook
                    </a>
                  </Button>
                ) : null}

                {web ? (
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-8 px-2.5 text-xs"
                  >
                    <a
                      href={
                        web
                      }
                      target="_blank"
                      rel="noreferrer"
                      onClick={() =>
                        logInteraction(
                          e.id,
                          "website",
                        )
                      }
                    >
                      <Globe className="h-3.5 w-3.5" />

                      Sitio web
                    </a>
                  </Button>
                ) : null}

                {e.email ? (
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-8 px-2.5 text-xs"
                  >
                    <a
                      href={`mailto:${e.email}`}
                      onClick={() =>
                        logInteraction(
                          e.id,
                          "email",
                        )
                      }
                    >
                      <Mail className="h-3.5 w-3.5" />

                      Correo
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENIDO */}

      <section className="container-page mt-4">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_0.75fr]">
          {/* IZQUIERDA */}

          <div className="space-y-4">
            {e.about ? (
              <section className="rounded-xl border border-border bg-card p-5">
                <p className="eyebrow">
                  CONÓCENOS
                </p>

                <h2 className="mt-1 section-title">
                  Nuestra historia
                </h2>

                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/80">
                  {
                    e.about
                  }
                </p>
              </section>
            ) : null}

            {products.length >
            0 ? (
              <section className="rounded-xl border border-border bg-card p-5">
                <p className="eyebrow">
                  OFERTA
                </p>

                <div className="flex items-end justify-between gap-3">
                  <h2 className="mt-1 section-title">
                    Productos y servicios
                  </h2>

                  <span className="text-[10px] text-muted-foreground">
                    {
                      products.length
                    }{" "}
                    disponibles
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {products.map(
                    (
                      product,
                    ) => (
                      <article
                        key={
                          product.id
                        }
                        className="flex overflow-hidden rounded-lg border border-border bg-background"
                      >
                        {product.image_url ? (
                          <img
                            src={
                              product.image_url
                            }
                            alt={
                              product.name
                            }
                            loading="lazy"
                            className="h-24 w-24 shrink-0 object-cover"
                          />
                        ) : null}

                        <div className="min-w-0 p-3">
                          <h3 className="line-clamp-1 text-sm font-semibold">
                            {
                              product.name
                            }
                          </h3>

                          {product.description ? (
                            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                              {
                                product.description
                              }
                            </p>
                          ) : null}

                          {product.info ? (
                            <p className="mt-1 text-[11px] font-medium text-primary">
                              {
                                product.info
                              }
                            </p>
                          ) : null}
                        </div>
                      </article>
                    ),
                  )}
                </div>
              </section>
            ) : null}
          </div>

          {/* DERECHA */}

          <aside className="space-y-4">
            {e.value_prop ? (
              <section className="rounded-xl border border-border bg-secondary/20 p-4">
                <p className="eyebrow">
                  DIFERENCIAL
                </p>

                <h2 className="mt-1 text-sm font-semibold">
                  Lo que nos hace únicos
                </h2>

                <p className="mt-1.5 text-xs leading-relaxed text-foreground/80">
                  {
                    e.value_prop
                  }
                </p>
              </section>
            ) : null}

            {e.tags?.length >
            0 ? (
              <section className="rounded-xl border border-border bg-card p-4">
                <p className="eyebrow">
                  PALABRAS CLAVE
                </p>

                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {e.tags.map(
                    (
                      tag,
                    ) => (
                      <span
                        key={
                          tag
                        }
                        className="rounded-full border border-border bg-background px-2 py-1 text-[10px] text-muted-foreground"
                      >
                        {
                          tag
                        }
                      </span>
                    ),
                  )}
                </div>
              </section>
            ) : null}
          </aside>
        </div>
      </section>
    </div>
  );
}