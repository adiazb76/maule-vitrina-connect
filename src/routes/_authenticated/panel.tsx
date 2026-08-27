import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";

import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  BarChart3,
  CalendarDays,
  Eye,
  Heart,
  LayoutDashboard,
  MessageCircle,
  Pencil,
  Plus,
  ShoppingBag,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  Button,
} from "@/components/ui/button";

import {
  Badge,
} from "@/components/ui/badge";

import {
  MyEventAdmin,
} from "@/components/my-event-admin";

import {
  MyMarketplaceAdmin,
} from "@/components/my-marketplace-admin";

import {
  LikeSummary,
} from "@/components/like-summary";

import {
  LatestDiagnostic,
} from "@/components/latest-diagnostic";

import {
  supabase,
} from "@/integrations/supabase/client";

import {
  useAuth,
  useIsAdmin,
} from "@/hooks/use-auth";

import type {
  Entrepreneur,
} from "@/lib/vitrina";

export const Route =
  createFileRoute(
    "/_authenticated/panel",
  )({
    head: () => ({
      meta: [
        {
          title:
            "Mi panel — La Vitrina",
        },

        {
          name:
            "description",

          content:
            "Administra tu emprendimiento, eventos, compraventa y métricas en La Vitrina.",
        },

        {
          name:
            "robots",

          content:
            "noindex",
        },
      ],
    }),

    component:
      PanelPage,
  });

const STATUS_LABEL:
  Record<
    string,
    string
  > = {
    pendiente:
      "En revisión",

    aprobado:
      "Publicado",

    rechazado:
      "Necesita cambios",
  };

type PanelTab =
  | "resumen"
  | "evento"
  | "compraventa"
  | "metricas";

type EventSummary = {
  id: string;
  title: string;
  status: string;
  visible: boolean;
  ends_at: string | null;
};

type MarketplaceSummary = {
  id: string;
  title: string;
  status: string;
  visible: boolean;
  expires_at: string;
};

function PanelPage() {
  const {
    user,
  } = useAuth();

  const isAdmin =
    useIsAdmin(
      user?.id,
    );

  const navigate =
    useNavigate();

  const queryClient =
    useQueryClient();

  const mine =
    useQuery({
      queryKey: [
        "my-entrepreneurs",
        user?.id,
      ],

      enabled:
        Boolean(
          user?.id,
        ),

      queryFn:
        async () => {
          const {
            data,
            error,
          } =
            await supabase
              .from(
                "entrepreneurs",
              )
              .select(
                "*, categories:category_id(name,slug), comunas:comuna_id(name,slug)",
              )
              .eq(
                "user_id",
                user!.id,
              )
              .order(
                "created_at",
                {
                  ascending:
                    false,
                },
              );

          if (error) {
            throw error;
          }

          return (
            data ?? []
          ) as unknown as Entrepreneur[];
        },
    });

  async function signOut() {
    await queryClient.cancelQueries();

    queryClient.clear();

    await supabase.auth.signOut();

    navigate({
      to: "/auth",

      replace:
        true,
    });
  }

  const totals =
    (
      mine.data ??
      []
    ).reduce(
      (
        acc,
        entrepreneur,
      ) => ({
        views:
          acc.views +
          entrepreneur.views,

        contacts:
          acc.contacts +
          entrepreneur.contacts,
      }),

      {
        views:
          0,

        contacts:
          0,
      },
    );

  return (
    <section className="container-page py-8 sm:py-10">
      {/* CABECERA */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">
            MI PANEL
          </p>

          <h1 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
            Hola
            {user?.email
              ? `, ${user.email.split("@")[0]}`
              : ""}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona tu presencia en La Vitrina desde un solo lugar.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {isAdmin ? (
            <Button
              asChild
              variant="outline"
              size="sm"
            >
              <Link to="/admin">
                Administración
              </Link>
            </Button>
          ) : null}

          {(mine.data?.length ?? 0) === 0 ? (
            <Button
              asChild
              size="sm"
            >
              <Link to="/sumate">
                <Plus className="h-4 w-4" />

                Nuevo emprendimiento
              </Link>
            </Button>
          ) : null}

          <Button
            variant="ghost"
            size="sm"
            onClick={
              signOut
            }
          >
            Cerrar sesión
          </Button>
        </div>
      </div>

      {/* KPI */}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Stat
          label="Emprendimientos"
          value={
            mine.data?.length ??
            0
          }
        />

        <Stat
          label="Visitas"
          value={
            totals.views
          }
        />

        <Stat
          label="Contactos"
          value={
            totals.contacts
          }
        />
      </div>

      {/* EMPRENDIMIENTOS */}

      <div className="mt-7 space-y-5">
        {mine.isLoading ? (
          <div className="h-36 animate-pulse rounded-2xl bg-muted" />
        ) : (
          <>
            {(mine.data?.length ??
              0) ===
            0 ? (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center">
                <p className="font-display text-lg">
                  Todavía no publicas tu emprendimiento
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Crea tu ficha para comenzar.
                </p>

                <Button
                  asChild
                  size="sm"
                  className="mt-4"
                >
                  <Link to="/sumate">
                    Publicar ahora
                  </Link>
                </Button>
              </div>
            ) : (
              mine.data?.map(
                (
                  entrepreneur,
                ) => (
                  <EntrepreneurPanel
                    key={
                      entrepreneur.id
                    }

                    entrepreneur={
                      entrepreneur
                    }
                  />
                ),
              )
            )}
          </>
        )}
      </div>
    </section>
  );
}

function EntrepreneurPanel({
  entrepreneur,
}: {
  entrepreneur:
    Entrepreneur;
}) {
  const [
    tab,
    setTab,
  ] =
    useState<PanelTab>(
      "resumen",
    );

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      {/* CABECERA */}

      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            {entrepreneur.photo_url ? (
              <img
                src={
                  entrepreneur.photo_url
                }
                alt={
                  entrepreneur.business_name
                }
                className="h-16 w-16 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div className="h-16 w-16 shrink-0 rounded-xl bg-muted" />
            )}

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate font-display text-lg font-semibold">
                  {
                    entrepreneur.business_name
                  }
                </h2>

                <Badge
                  variant={
                    entrepreneur.status ===
                    "aprobado"
                      ? "default"
                      : "secondary"
                  }
                >
                  {
                    STATUS_LABEL[
                      entrepreneur.status
                    ]
                  }
                </Badge>
              </div>

              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                {
                  entrepreneur.short_description
                }
              </p>

              <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />

                  {
                    entrepreneur.views
                  }
                </span>

                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" />

                  {
                    entrepreneur.contacts
                  }
                </span>

                <LikeSummary
                  contentType="entrepreneur"
                  contentId={
                    entrepreneur.id
                  }
                  compact
                />
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
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
                asChild
                variant="outline"
                size="sm"
              >
                <Link
                  to="/emprendedores/$slug"
                  params={{
                    slug:
                      entrepreneur.slug,
                  }}
                >
                  Ver perfil
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* PESTAÑAS */}

      <div className="border-y border-border bg-secondary/10 px-3 py-2">
        <div className="flex gap-1 overflow-x-auto">
          <TabButton
            active={
              tab ===
              "resumen"
            }

            icon={
              <LayoutDashboard className="h-4 w-4" />
            }

            label="Resumen"

            onClick={() =>
              setTab(
                "resumen",
              )
            }
          />

          <TabButton
            active={
              tab ===
              "evento"
            }

            icon={
              <CalendarDays className="h-4 w-4" />
            }

            label="Evento"

            onClick={() =>
              setTab(
                "evento",
              )
            }
          />

          <TabButton
            active={
              tab ===
              "compraventa"
            }

            icon={
              <ShoppingBag className="h-4 w-4" />
            }

            label="Compraventa"

            onClick={() =>
              setTab(
                "compraventa",
              )
            }
          />

          <TabButton
            active={
              tab ===
              "metricas"
            }

            icon={
              <BarChart3 className="h-4 w-4" />
            }

            label="Métricas"

            onClick={() =>
              setTab(
                "metricas",
              )
            }
          />
        </div>
      </div>

      {/* CONTENIDO */}

      <div className="p-4 sm:p-5">
        {tab ===
        "resumen" ? (
          <SummaryTab
            entrepreneur={
              entrepreneur
            }
          />
        ) : null}

        {tab ===
        "evento" ? (
          <MyEventAdmin
            entrepreneur={
              entrepreneur
            }
          />
        ) : null}

        {tab ===
        "compraventa" ? (
          <MyMarketplaceAdmin
            entrepreneur={
              entrepreneur
            }
          />
        ) : null}

        {tab ===
        "metricas" ? (
          <MetricsTab
            entrepreneur={
              entrepreneur
            }
          />
        ) : null}
      </div>
    </article>
  );
}

function useEntrepreneurContent(
  entrepreneurId: string,
) {
  const event =
    useQuery({
      queryKey: [
        "summary-event",
        entrepreneurId,
      ],

      queryFn:
        async () => {
          const {
            data,
            error,
          } =
            await (supabase as any)
              .from(
                "events",
              )
              .select(
                "id,title,status,visible,ends_at",
              )
              .eq(
                "entrepreneur_id",
                entrepreneurId,
              )
              .order(
                "created_at",
                {
                  ascending:
                    false,
                },
              )
              .limit(
                1,
              )
              .maybeSingle();

          if (error) {
            throw error;
          }

          return (
            data ?? null
          ) as EventSummary | null;
        },
    });

  const ad =
    useQuery({
      queryKey: [
        "summary-marketplace",
        entrepreneurId,
      ],

      queryFn:
        async () => {
          const {
            data,
            error,
          } =
            await (supabase as any)
              .from(
                "marketplace_ads",
              )
              .select(
                "id,title,status,visible,expires_at",
              )
              .eq(
                "entrepreneur_id",
                entrepreneurId,
              )
              .order(
                "created_at",
                {
                  ascending:
                    false,
                },
              )
              .limit(
                1,
              )
              .maybeSingle();

          if (error) {
            throw error;
          }

          return (
            data ?? null
          ) as MarketplaceSummary | null;
        },
    });

  return {
    event,
    ad,
  };
}

function SummaryTab({
  entrepreneur,
}: {
  entrepreneur:
    Entrepreneur;
}) {
  const {
    event,
    ad,
  } =
    useEntrepreneurContent(
      entrepreneur.id,
    );

  return (
    <div className="space-y-3">
      <LatestDiagnostic
        entrepreneurId={
          entrepreneur.id
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <SummaryCard
          title="Evento"

          value={
            event.data
              ? event.data.title
              : "Sin evento"
          }

          status={
            event.data
              ? event.data.status
              : undefined
          }

          expired={
            event.data?.ends_at
              ? new Date(
                  event.data.ends_at,
                ).getTime() <
                Date.now()
              : false
          }
        />

        <SummaryCard
          title="Compra-venta"

          value={
            ad.data
              ? ad.data.title
              : "Sin aviso"
          }

          status={
            ad.data
              ? ad.data.status
              : undefined
          }

          expired={
            ad.data
              ? new Date(
                  ad.data.expires_at,
                ).getTime() <
                Date.now()
              : false
          }
        />
      </div>
    </div>
  );
}

function MetricsTab({
  entrepreneur,
}: {
  entrepreneur:
    Entrepreneur;
}) {
  const {
    event,
    ad,
  } =
    useEntrepreneurContent(
      entrepreneur.id,
    );

  return (
    <div>
      <div className="grid gap-3 lg:grid-cols-3">
        {/* EMPRENDIMIENTO */}

        <MetricSection
          title="Emprendimiento"
          subtitle={
            entrepreneur.business_name
          }
        >
          <MetricLine
            icon={
              <Eye className="h-4 w-4" />
            }
            label="Visitas"
            value={
              entrepreneur.views
            }
          />

          <MetricLine
            icon={
              <MessageCircle className="h-4 w-4" />
            }
            label="Contactos"
            value={
              entrepreneur.contacts
            }
          />

          <MetricLike
            contentType="entrepreneur"
            contentId={
              entrepreneur.id
            }
          />
        </MetricSection>

        {/* EVENTO */}

        <MetricSection
          title="Evento"
          subtitle={
            event.data?.title ??
            "Sin evento vigente"
          }
        >
          {event.data ? (
            <>
              <MetricStatus
                status={
                  event.data.status
                }
                visible={
                  event.data.visible
                }
                expired={
                  event.data.ends_at
                    ? new Date(
                        event.data.ends_at,
                      ).getTime() <
                      Date.now()
                    : false
                }
              />

              <MetricLike
                contentType="event"
                contentId={
                  event.data.id
                }
              />
            </>
          ) : (
            <EmptyMetric />
          )}
        </MetricSection>

        {/* COMPRAVENTA */}

        <MetricSection
          title="Compra-venta"
          subtitle={
            ad.data?.title ??
            "Sin aviso vigente"
          }
        >
          {ad.data ? (
            <>
              <MetricStatus
                status={
                  ad.data.status
                }
                visible={
                  ad.data.visible
                }
                expired={
                  new Date(
                    ad.data.expires_at,
                  ).getTime() <
                  Date.now()
                }
              />

              <MetricLike
                contentType="marketplace"
                contentId={
                  ad.data.id
                }
              />
            </>
          ) : (
            <EmptyMetric />
          )}
        </MetricSection>
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-border px-4 py-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Las visitas y contactos actualmente corresponden a la ficha del emprendimiento.
          Los corazones se registran por separado para el emprendimiento, evento y aviso de Compra-venta.
        </p>
      </div>
    </div>
  );
}

function MetricSection({
  title,
  subtitle,
  children,
}: {
  title:
    string;

  subtitle:
    string;

  children:
    React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-secondary/10 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>

      <p className="mt-1 line-clamp-1 text-sm font-semibold">
        {subtitle}
      </p>

      <div className="mt-4 space-y-2">
        {children}
      </div>
    </div>
  );
}

function MetricLine({
  icon,
  label,
  value,
}: {
  icon:
    React.ReactNode;

  label:
    string;

  value:
    number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="inline-flex items-center gap-2 text-muted-foreground">
        {icon}

        {label}
      </span>

      <span className="font-semibold">
        {value}
      </span>
    </div>
  );
}

function MetricLike({
  contentType,
  contentId,
}: {
  contentType:
    | "entrepreneur"
    | "event"
    | "marketplace";

  contentId:
    string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="inline-flex items-center gap-2 text-muted-foreground">
        <Heart className="h-4 w-4" />

        Me gusta
      </span>

      <span className="font-semibold">
        <LikeSummary
          contentType={
            contentType
          }
          contentId={
            contentId
          }
          compact
        />
      </span>
    </div>
  );
}

function MetricStatus({
  status,
  visible,
  expired,
}: {
  status:
    string;

  visible:
    boolean;

  expired:
    boolean;
}) {
  let label =
    "Pendiente";

  if (expired) {
    label =
      "Finalizado";
  } else if (
    status ===
      "aprobado" &&
    visible
  ) {
    label =
      "Publicado";
  } else if (
    status ===
    "rechazado"
  ) {
    label =
      "Rechazado";
  } else if (
    !visible
  ) {
    label =
      "Oculto";
  }

  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">
        Estado
      </span>

      <span className="font-medium">
        {label}
      </span>
    </div>
  );
}

function EmptyMetric() {
  return (
    <p className="text-xs text-muted-foreground">
      Aún no hay información para mostrar.
    </p>
  );
}

function TabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active:
    boolean;

  icon:
    React.ReactNode;

  label:
    string;

  onClick:
    () => void;
}) {
  return (
    <button
      type="button"

      onClick={
        onClick
      }

      className={
        active
          ? "inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-background px-3 py-2 text-xs font-semibold text-foreground shadow-sm"
          : "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
      }
    >
      {icon}

      {label}
    </button>
  );
}

function SummaryCard({
  title,
  value,
  status,
  expired = false,
}: {
  title:
    string;

  value:
    string;

  status?:
    string;

  expired?:
    boolean;
}) {
  let statusLabel =
    "";

  if (expired) {
    statusLabel =
      "Finalizado";
  } else if (
    status ===
    "aprobado"
  ) {
    statusLabel =
      "Publicado";
  } else if (
    status ===
    "rechazado"
  ) {
    statusLabel =
      "Necesita cambios";
  } else if (
    status ===
    "pendiente"
  ) {
    statusLabel =
      "Pendiente";
  }

  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>

      <p className="mt-1 line-clamp-1 text-sm font-medium">
        {value}
      </p>

      {statusLabel ? (
        <p className="mt-1 text-xs text-muted-foreground">
          Estado:{" "}
          {statusLabel}
        </p>
      ) : null}
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label:
    string;

  value:
    number;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 font-display text-2xl font-semibold">
        {value}
      </p>
    </div>
  );
}
