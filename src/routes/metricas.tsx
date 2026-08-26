import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  CalendarDays,
  Download,
  Eye,
  FileText,
  Heart,
  MapPin,
  MessageCircle,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Button,
} from "@/components/ui/button";

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
  useIsAdmin,
} from "@/hooks/use-auth";


export const Route =
  createFileRoute(
    "/metricas",
  )({
    head: () => ({
      meta: [
        {
          title:
            "Métricas y Gestión | La Vitrina",
        },

        {
          name:
            "robots",

          content:
            "noindex,nofollow",
        },
      ],
    }),

    component:
      MetricsPage,
  });


type EntrepreneurMetric = {
  id: string;
  business_name: string;
  owner_name: string;
  status: string;
  visible: boolean;
  featured: boolean;
  created_at: string;
  views: number;
  contacts: number;

  category_id:
    string | null;

  category_name:
    string | null;

  activity_id:
    string | null;

  activity_name:
    string | null;

  comuna_id:
    string | null;

  comuna_name:
    string | null;

  likes: number;
};


type EventMetric = {
  id: string;

  entrepreneur_id:
    string | null;

  business_name:
    string | null;

  title: string;
  status: string;
  visible: boolean;

  created_at:
    string;

  starts_at:
    string;

  ends_at:
    string | null;

  category_id:
    string | null;

  category_name:
    string | null;

  activity_id:
    string | null;

  activity_name:
    string | null;

  comuna_id:
    string | null;

  comuna_name:
    string | null;

  likes:
    number;
};


type MarketplaceMetric = {
  id: string;

  entrepreneur_id:
    string | null;

  business_name:
    string | null;

  type: string;
  title: string;
  status: string;
  visible: boolean;

  created_at:
    string;

  expires_at:
    string;

  price:
    number | null;

  category_id:
    string | null;

  category_name:
    string | null;

  activity_id:
    string | null;

  activity_name:
    string | null;

  comuna_id:
    string | null;

  comuna_name:
    string | null;

  likes:
    number;
};


type DailyMetric = {
  metric_date:
    string;

  content_type:
    string;

  event_type:
    string;

  entrepreneur_id:
    string | null;

  total:
    number;
};


type Period =
  | "30"
  | "90"
  | "365"
  | "all";


type ComparisonMode =
  | "week"
  | "month"
  | "year";


type ExecutiveMetric = {
  label: string;
  current: number;
  previous: number;
  delta: number;
  percent: number | null;
  unit?: "number" | "percent";
  note: string;
  historyAvailable?: boolean;
};


type RankedRow = {
  id:
    string;

  name:
    string;

  entrepreneurs:
    number;

  share:
    number;

  views:
    number;

  contacts:
    number;

  likes:
    number;

  events:
    number;

  ads:
    number;
};


function MetricsPage() {
  const {
    user,
    loading,
  } =
    useAuth();

  const isAdmin =
    useIsAdmin(
      user?.id,
    );

  const [
    period,
    setPeriod,
  ] =
    useState<Period>(
      "30",
    );

  const [
    comparisonMode,
    setComparisonMode,
  ] =
    useState<ComparisonMode>(
      "month",
    );

  const [
    category,
    setCategory,
  ] =
    useState(
      "all",
    );

  const [
    activity,
    setActivity,
  ] =
    useState(
      "all",
    );

  const [
    comuna,
    setComuna,
  ] =
    useState(
      "all",
    );


  const entrepreneurs =
    useQuery({
      queryKey: [
        "admin-metrics-entrepreneurs",
      ],

      enabled:
        Boolean(
          isAdmin,
        ),

      queryFn:
        async () => {
          const {
            data,
            error,
          } =
            await (
              supabase as any
            )
              .from(
                "admin_entrepreneur_metrics",
              )
              .select("*");

          if (error) {
            throw error;
          }

          return (
            data ??
            []
          ) as EntrepreneurMetric[];
        },
    });


  const events =
    useQuery({
      queryKey: [
        "admin-metrics-events",
      ],

      enabled:
        Boolean(
          isAdmin,
        ),

      queryFn:
        async () => {
          const {
            data,
            error,
          } =
            await (
              supabase as any
            )
              .from(
                "admin_event_metrics",
              )
              .select("*");

          if (error) {
            throw error;
          }

          return (
            data ??
            []
          ) as EventMetric[];
        },
    });


  const marketplace =
    useQuery({
      queryKey: [
        "admin-metrics-marketplace",
      ],

      enabled:
        Boolean(
          isAdmin,
        ),

      queryFn:
        async () => {
          const {
            data,
            error,
          } =
            await (
              supabase as any
            )
              .from(
                "admin_marketplace_metrics",
              )
              .select("*");

          if (error) {
            throw error;
          }

          return (
            data ??
            []
          ) as MarketplaceMetric[];
        },
    });


  const history =
    useQuery({
      queryKey: [
        "admin-daily-analytics",
      ],

      enabled:
        Boolean(
          isAdmin,
        ),

      queryFn:
        async () => {
          const {
            data,
            error,
          } =
            await (
              supabase as any
            )
              .from(
                "admin_daily_analytics",
              )
              .select("*")
              .order(
                "metric_date",
                {
                  ascending:
                    true,
                },
              );

          if (error) {
            throw error;
          }

          return (
            data ??
            []
          ) as DailyMetric[];
        },
    });


  const cutoff =
    useMemo(
      () => {
        if (
          period ===
          "all"
        ) {
          return null;
        }

        const date =
          new Date();

        date.setDate(
          date.getDate() -
            Number(
              period,
            ),
        );

        return date;
      },

      [
        period,
      ],
    );


  const dimensionMatch =
    (
      row: {
        category_id?:
          string | null;

        activity_id?:
          string | null;

        comuna_id?:
          string | null;
      },
    ) =>
      (
        category ===
          "all" ||
        row.category_id ===
          category
      ) &&
      (
        activity ===
          "all" ||
        row.activity_id ===
          activity
      ) &&
      (
        comuna ===
          "all" ||
        row.comuna_id ===
          comuna
      );


  const filteredEntrepreneurs =
    useMemo(
      () =>
        (
          entrepreneurs.data ??
          []
        ).filter(
          dimensionMatch,
        ),

      [
        entrepreneurs.data,
        category,
        activity,
        comuna,
      ],
    );


  const filteredEvents =
    useMemo(
      () =>
        (
          events.data ??
          []
        ).filter(
          dimensionMatch,
        ),

      [
        events.data,
        category,
        activity,
        comuna,
      ],
    );


  const filteredMarketplace =
    useMemo(
      () =>
        (
          marketplace.data ??
          []
        ).filter(
          dimensionMatch,
        ),

      [
        marketplace.data,
        category,
        activity,
        comuna,
      ],
    );


  const categories =
    useMemo(
      () =>
        uniqueOptions(
          entrepreneurs.data ??
            [],
          "category_id",
          "category_name",
        ),

      [
        entrepreneurs.data,
      ],
    );


  const activities =
    useMemo(
      () =>
        uniqueOptions(
          (
            entrepreneurs.data ??
            []
          ).filter(
            (
              row,
            ) =>
              category ===
                "all" ||
              row.category_id ===
                category,
          ),

          "activity_id",
          "activity_name",
        ),

      [
        entrepreneurs.data,
        category,
      ],
    );


  const comunas =
    useMemo(
      () =>
        uniqueOptions(
          entrepreneurs.data ??
            [],
          "comuna_id",
          "comuna_name",
        ),

      [
        entrepreneurs.data,
      ],
    );


  const activeEntrepreneurs =
    filteredEntrepreneurs.filter(
      (
        row,
      ) =>
        row.status ===
          "aprobado" &&
        row.visible,
    );


  const newEntrepreneurs =
    activeEntrepreneurs.filter(
      (
        row,
      ) =>
        !cutoff ||
        new Date(
          row.created_at,
        ) >=
          cutoff,
    );


  const totalViews =
    sum(
      activeEntrepreneurs,
      "views",
    );

  const totalContacts =
    sum(
      activeEntrepreneurs,
      "contacts",
    );

  const entrepreneurLikes =
    sum(
      activeEntrepreneurs,
      "likes",
    );


  const now =
    new Date();


  const activeEvents =
    filteredEvents.filter(
      (
        row,
      ) => {
        const end =
          row.ends_at ??
          row.starts_at;

        return (
          row.status ===
            "aprobado" &&
          row.visible &&
          new Date(
            end,
          ) >=
            now
        );
      },
    );


  const activeAds =
    filteredMarketplace.filter(
      (
        row,
      ) =>
        row.status ===
          "aprobado" &&
        row.visible &&
        new Date(
          row.expires_at,
        ) >=
          now,
    );


  const totalLikes =
    entrepreneurLikes +
    sum(
      filteredEvents,
      "likes",
    ) +
    sum(
      filteredMarketplace,
      "likes",
    );


  const contactRate =
    totalViews >
    0
      ? (
          totalContacts /
          totalViews
        ) *
        100
      : 0;


  const avgViews =
    activeEntrepreneurs.length >
    0
      ? totalViews /
        activeEntrepreneurs.length
      : 0;


  const avgContacts =
    activeEntrepreneurs.length >
    0
      ? totalContacts /
        activeEntrepreneurs.length
      : 0;


  const avgLikes =
    activeEntrepreneurs.length >
    0
      ? entrepreneurLikes /
        activeEntrepreneurs.length
      : 0;


  const withActivity =
    activeEntrepreneurs.filter(
      (
        row,
      ) =>
        Boolean(
          row.activity_id,
        ),
    ).length;


  const withContacts =
    activeEntrepreneurs.filter(
      (
        row,
      ) =>
        Number(
          row.contacts,
        ) >
        0,
    ).length;


  const categoryRanking =
    buildDimensionRanking({
      entrepreneurs:
        activeEntrepreneurs,

      events:
        filteredEvents,

      ads:
        filteredMarketplace,

      idKey:
        "category_id",

      nameKey:
        "category_name",
    });


  const activityRanking =
    buildDimensionRanking({
      entrepreneurs:
        activeEntrepreneurs,

      events:
        filteredEvents,

      ads:
        filteredMarketplace,

      idKey:
        "activity_id",

      nameKey:
        "activity_name",
    });


  const comunaRanking =
    buildDimensionRanking({
      entrepreneurs:
        activeEntrepreneurs,

      events:
        filteredEvents,

      ads:
        filteredMarketplace,

      idKey:
        "comuna_id",

      nameKey:
        "comuna_name",
    });


  const top3CategoryShare =
    categoryRanking
      .slice(
        0,
        3,
      )
      .reduce(
        (
          total,
          row,
        ) =>
          total +
          row.share,

        0,
      );


  const top3ComunaShare =
    comunaRanking
      .slice(
        0,
        3,
      )
      .reduce(
        (
          total,
          row,
        ) =>
          total +
          row.share,

        0,
      );


  const ranking =
    [...activeEntrepreneurs]
      .sort(
        (
          a,
          b,
        ) =>
          score(
            b,
          ) -
          score(
            a,
          ),
      )
      .slice(
        0,
        10,
      );


  const evolution =
    useMemo(
      () => {
        const map =
          new Map<
            string,
            {
              date:
                string;

              visits:
                number;

              contacts:
                number;

              likes:
                number;
            }
          >();

        (
          history.data ??
          []
        )
          .filter(
            (
              row,
            ) =>
              !cutoff ||
              new Date(
                row.metric_date,
              ) >=
                cutoff,
          )
          .forEach(
            (
              row,
            ) => {
              const current =
                map.get(
                  row.metric_date,
                ) ?? {
                  date:
                    row.metric_date,

                  visits:
                    0,

                  contacts:
                    0,

                  likes:
                    0,
                };

              if (
                row.event_type ===
                "view"
              ) {
                current.visits +=
                  Number(
                    row.total,
                  );
              }

              if (
                [
                  "whatsapp",
                  "phone",
                  "instagram",
                  "website",
                  "email",
                  "contact",
                ].includes(
                  row.event_type,
                )
              ) {
                current.contacts +=
                  Number(
                    row.total,
                  );
              }

              if (
                row.event_type ===
                "like_added"
              ) {
                current.likes +=
                  Number(
                    row.total,
                  );
              }

              if (
                row.event_type ===
                "like_removed"
              ) {
                current.likes -=
                  Number(
                    row.total,
                  );
              }

              map.set(
                row.metric_date,
                current,
              );
            },
          );

        return Array.from(
          map.values(),
        ).sort(
          (
            a,
            b,
          ) =>
            a.date.localeCompare(
              b.date,
            ),
        );
      },

      [
        history.data,
        cutoff,
      ],
    );


  const comparisonRanges =
    useMemo(
      () =>
        getComparisonRanges(
          comparisonMode,
          new Date(),
        ),

      [
        comparisonMode,
      ],
    );


  const filteredHistory =
    useMemo(
      () => {
        const allowedIds =
          new Set(
            activeEntrepreneurs.map(
              (
                row,
              ) =>
                row.id,
            ),
          );

        return (
          history.data ??
          []
        ).filter(
          (
            row,
          ) =>
            !row.entrepreneur_id ||
            allowedIds.has(
              row.entrepreneur_id,
            ),
        );
      },

      [
        history.data,
        activeEntrepreneurs,
      ],
    );


  const currentNewEntrepreneurs =
    activeEntrepreneurs.filter(
      (
        row,
      ) =>
        isWithinRange(
          row.created_at,
          comparisonRanges.currentStart,
          comparisonRanges.currentEnd,
        ),
    ).length;


  const previousNewEntrepreneurs =
    activeEntrepreneurs.filter(
      (
        row,
      ) =>
        isWithinRange(
          row.created_at,
          comparisonRanges.previousStart,
          comparisonRanges.previousEnd,
        ),
    ).length;


  const previousEntrepreneurBase =
    Math.max(
      activeEntrepreneurs.length -
        currentNewEntrepreneurs,
      0,
    );


  const currentVisits =
    analyticsPeriodTotal(
      filteredHistory,
      comparisonRanges.currentStart,
      comparisonRanges.currentEnd,
      [
        "view",
      ],
    );


  const previousVisits =
    analyticsPeriodTotal(
      filteredHistory,
      comparisonRanges.previousStart,
      comparisonRanges.previousEnd,
      [
        "view",
      ],
    );


  const currentContacts =
    analyticsPeriodTotal(
      filteredHistory,
      comparisonRanges.currentStart,
      comparisonRanges.currentEnd,
      [
        "whatsapp",
        "phone",
        "instagram",
        "website",
        "email",
        "contact",
      ],
    );


  const previousContacts =
    analyticsPeriodTotal(
      filteredHistory,
      comparisonRanges.previousStart,
      comparisonRanges.previousEnd,
      [
        "whatsapp",
        "phone",
        "instagram",
        "website",
        "email",
        "contact",
      ],
    );


  const currentLikes =
    analyticsNetLikes(
      filteredHistory,
      comparisonRanges.currentStart,
      comparisonRanges.currentEnd,
    );


  const previousLikes =
    analyticsNetLikes(
      filteredHistory,
      comparisonRanges.previousStart,
      comparisonRanges.previousEnd,
    );


  const currentEventsCreated =
    filteredEvents.filter(
      (
        row,
      ) =>
        isWithinRange(
          row.created_at,
          comparisonRanges.currentStart,
          comparisonRanges.currentEnd,
        ),
    ).length;


  const previousEventsCreated =
    filteredEvents.filter(
      (
        row,
      ) =>
        isWithinRange(
          row.created_at,
          comparisonRanges.previousStart,
          comparisonRanges.previousEnd,
        ),
    ).length;


  const currentAdsCreated =
    filteredMarketplace.filter(
      (
        row,
      ) =>
        isWithinRange(
          row.created_at,
          comparisonRanges.currentStart,
          comparisonRanges.currentEnd,
        ),
    ).length;


  const previousAdsCreated =
    filteredMarketplace.filter(
      (
        row,
      ) =>
        isWithinRange(
          row.created_at,
          comparisonRanges.previousStart,
          comparisonRanges.previousEnd,
        ),
    ).length;


  const hasInteractionHistory =
    (
      history.data ??
      []
    ).length >
    0;


  const executiveComparisons:
    ExecutiveMetric[] =
    [
      makeExecutiveMetric(
        "Emprendedores",
        activeEntrepreneurs.length,
        previousEntrepreneurBase,
        `${currentNewEntrepreneurs} nuevos en ${comparisonLabel(
          comparisonMode,
        )}`,
        true,
      ),

      makeExecutiveMetric(
        "Visitas",
        currentVisits,
        previousVisits,
        "Interacciones del período",
        hasInteractionHistory,
      ),

      makeExecutiveMetric(
        "Contactos",
        currentContacts,
        previousContacts,
        "WhatsApp, teléfono, redes, web y correo",
        hasInteractionHistory,
      ),

      makeExecutiveMetric(
        "Me gusta",
        currentLikes,
        previousLikes,
        "Variación neta de corazones",
        hasInteractionHistory,
      ),

      makeExecutiveMetric(
        "Eventos publicados",
        currentEventsCreated,
        previousEventsCreated,
        "Creados durante el período",
        true,
      ),

      makeExecutiveMetric(
        "Compra-venta",
        currentAdsCreated,
        previousAdsCreated,
        "Avisos creados durante el período",
        true,
      ),

      makeExecutiveMetric(
        "Comunas activas",
        comunaRanking.length,
        comunaRanking.length,
        "Territorios con presencia",
        true,
      ),

      makeExecutiveMetric(
        "Conversión visita→contacto",
        currentVisits > 0
          ? (currentContacts / currentVisits) * 100
          : 0,
        previousVisits > 0
          ? (previousContacts / previousVisits) * 100
          : 0,
        "Efectividad del tráfico",
        hasInteractionHistory,
        "percent",
      ),
    ];


  function resetFilters() {
    setPeriod(
      "30",
    );

    setCategory(
      "all",
    );

    setActivity(
      "all",
    );

    setComuna(
      "all",
    );
  }


  function downloadData() {
    const rows =
      activeEntrepreneurs.map(
        (
          row,
        ) => ({
          tipo:
            "Emprendedor",

          nombre:
            row.business_name,

          propietario:
            row.owner_name,

          rubro:
            row.category_name ??
            "",

          actividad:
            row.activity_name ??
            "",

          comuna:
            row.comuna_name ??
            "",

          visitas:
            row.views,

          contactos:
            row.contacts,

          me_gusta:
            row.likes,

          fecha_registro:
            row.created_at,
        }),
      );

    downloadCsv(
      rows,
      `la-vitrina-metricas-${today()}.csv`,
    );
  }


  function generateReport() {
    window.print();
  }


  if (
    loading
  ) {
    return (
      <section className="container-page py-10">
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
      </section>
    );
  }


  if (
    !user ||
    !isAdmin
  ) {
    return (
      <section className="container-page py-14 text-center">
        <h1 className="page-title">
          Acceso restringido
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Esta información está disponible sólo para administradores.
        </p>

        <Button
          asChild
          size="sm"
          className="mt-5"
        >
          <Link to="/">
            Volver al inicio
          </Link>
        </Button>
      </section>
    );
  }


  const loadingData =
    entrepreneurs.isLoading ||
    events.isLoading ||
    marketplace.isLoading ||
    history.isLoading;


  if (
    loadingData
  ) {
    return (
      <section className="container-page py-10">
        <p className="eyebrow">
          ADMINISTRACIÓN
        </p>

        <h1 className="mt-1 page-title">
          Métricas y Gestión
        </h1>

        <div className="mt-5 h-56 animate-pulse rounded-xl bg-muted" />
      </section>
    );
  }


  return (
    <section className="container-page py-7 sm:py-8">
      <style>{`
        @page {
          size: A3 landscape;
          margin: 8mm;
        }

        @media print {
          html,
          body {
            background: white !important;
            width: 100% !important;
            min-width: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          header,
          footer,
          .no-print {
            display: none !important;
          }

          .container-page {
            width: 100% !important;
            max-width: none !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }

          .metric-report {
            width: 100% !important;
            max-width: none !important;
            padding: 0 !important;
          }

          .metric-report * {
            box-sizing: border-box !important;
          }

          .metric-report article,
          .metric-report section,
          .metric-report table,
          .metric-report tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .metric-report .sm\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .metric-report .lg\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .metric-report .lg\\:grid-cols-4 {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          }

          .metric-report .xl\\:grid-cols-4 {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          }

          .metric-report .xl\\:grid-cols-7 {
            grid-template-columns: repeat(7, minmax(0, 1fr)) !important;
          }

          .metric-report .sm\\:flex-row {
            flex-direction: row !important;
          }

          .metric-report .sm\\:items-end {
            align-items: flex-end !important;
          }

          .metric-report .sm\\:justify-between {
            justify-content: space-between !important;
          }

          .metric-report .lg\\:grid-cols-\\[0\\.85fr_1\\.15fr\\] {
            grid-template-columns: 0.85fr 1.15fr !important;
          }

          .metric-report .overflow-x-auto {
            overflow: visible !important;
          }

          .metric-report table {
            width: 100% !important;
            min-width: 0 !important;
            font-size: 9px !important;
          }

          .metric-report thead {
            display: table-header-group !important;
          }

          .metric-report svg {
            max-width: 100% !important;
          }
        }
      `}</style>

      <div className="metric-report">
        {/* CABECERA */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              to="/admin"
              className="no-print inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver a Administración
            </Link>

            <p className="eyebrow mt-3">
              ADMINISTRACIÓN · INTELIGENCIA DE GESTIÓN
            </p>

            <h1 className="mt-1 page-title">
              Métricas y Gestión
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Vista ejecutiva del desempeño de La Vitrina, desde lo general hasta el detalle.
            </p>
          </div>

          <div className="no-print flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={
                downloadData
              }
            >
              <Download className="h-3.5 w-3.5" />
              Descargar datos
            </Button>

            <Button
              size="sm"
              onClick={
                generateReport
              }
            >
              <FileText className="h-3.5 w-3.5" />
              Generar informe PDF
            </Button>
          </div>
        </div>


        {/* FILTROS */}

        <section className="no-print mt-5 rounded-xl border border-border bg-card p-3">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <Filter
              label="Período"
            >
              <Select
                value={
                  period
                }
                onValueChange={(
                  value,
                ) =>
                  setPeriod(
                    value as Period,
                  )
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="30">
                    Últimos 30 días
                  </SelectItem>

                  <SelectItem value="90">
                    Últimos 90 días
                  </SelectItem>

                  <SelectItem value="365">
                    Últimos 12 meses
                  </SelectItem>

                  <SelectItem value="all">
                    Todo el histórico
                  </SelectItem>
                </SelectContent>
              </Select>
            </Filter>

            <Filter
              label="Rubro"
            >
              <Select
                value={
                  category
                }
                onValueChange={(
                  value,
                ) => {
                  setCategory(
                    value,
                  );

                  setActivity(
                    "all",
                  );
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">
                    Todos
                  </SelectItem>

                  {categories.map(
                    (
                      item,
                    ) => (
                      <SelectItem
                        key={
                          item.id
                        }
                        value={
                          item.id
                        }
                      >
                        {
                          item.name
                        }
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </Filter>

            <Filter
              label="Actividad"
            >
              <Select
                value={
                  activity
                }
                onValueChange={
                  setActivity
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">
                    Todas
                  </SelectItem>

                  {activities.map(
                    (
                      item,
                    ) => (
                      <SelectItem
                        key={
                          item.id
                        }
                        value={
                          item.id
                        }
                      >
                        {
                          item.name
                        }
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </Filter>

            <Filter
              label="Comuna"
            >
              <Select
                value={
                  comuna
                }
                onValueChange={
                  setComuna
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">
                    Todas
                  </SelectItem>

                  {comunas.map(
                    (
                      item,
                    ) => (
                      <SelectItem
                        key={
                          item.id
                        }
                        value={
                          item.id
                        }
                      >
                        {
                          item.name
                        }
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </Filter>

            <div className="flex items-end">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={
                  resetFilters
                }
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        </section>


        {/* FOTO ACTUAL */}

        <section className="mt-4">
          <div className="mb-2">
            <p className="eyebrow">FOTO ACTUAL</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Totales acumulados y vigentes de La Vitrina.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <Kpi
            icon={
              <Users className="h-4 w-4" />
            }
            label="Emprendedores"
            value={
              activeEntrepreneurs.length
            }
            note="Total activo"
          />

          <Kpi
            icon={
              <Eye className="h-4 w-4" />
            }
            label="Visitas acumuladas"
            value={
              totalViews
            }
            note={`${avgViews.toFixed(1)} promedio`}
          />

          <Kpi
            icon={
              <MessageCircle className="h-4 w-4" />
            }
            label="Contactos acumulados"
            value={
              totalContacts
            }
            note={`${contactRate.toFixed(1)}% conversión`}
          />

          <Kpi
            icon={
              <Heart className="h-4 w-4" />
            }
            label="Me gusta"
            value={
              totalLikes
            }
            note={`${avgLikes.toFixed(1)} prom. emprendedor`}
          />

          <Kpi
            icon={
              <CalendarDays className="h-4 w-4" />
            }
            label="Eventos"
            value={
              activeEvents.length
            }
            note="Vigentes"
          />

          <Kpi
            icon={
              <ShoppingBag className="h-4 w-4" />
            }
            label="Compra-venta"
            value={
              activeAds.length
            }
            note="Avisos vigentes"
          />

          <Kpi
            icon={
              <MapPin className="h-4 w-4" />
            }
            label="Comunas"
            value={
              comunaRanking.length
            }
            note="Con presencia"
          />
          </div>
        </section>



        {/* RESUMEN EJECUTIVO COMPARATIVO */}

        <section className="mt-4 rounded-xl border border-border bg-card p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>

              <div>
                <p className="eyebrow">
                  RESUMEN EJECUTIVO
                </p>

                <h2 className="mt-1 section-title">
                  Cómo estamos evolucionando
                </h2>

                <p className="mt-1 text-[11px] text-muted-foreground">
                  Actual vs período anterior. Verde indica crecimiento; rojo, disminución.
                </p>
              </div>
            </div>

            <div className="no-print flex rounded-lg border border-border bg-background p-1">
              <ComparisonButton
                active={
                  comparisonMode ===
                  "week"
                }
                onClick={() =>
                  setComparisonMode(
                    "week",
                  )
                }
              >
                Semana
              </ComparisonButton>

              <ComparisonButton
                active={
                  comparisonMode ===
                  "month"
                }
                onClick={() =>
                  setComparisonMode(
                    "month",
                  )
                }
              >
                Mes
              </ComparisonButton>

              <ComparisonButton
                active={
                  comparisonMode ===
                  "year"
                }
                onClick={() =>
                  setComparisonMode(
                    "year",
                  )
                }
              >
                Año
              </ComparisonButton>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {executiveComparisons.map(
              (
                item,
              ) => (
                <ExecutiveComparison
                  key={
                    item.label
                  }
                  item={
                    item
                  }
                />
              ),
            )}
          </div>

          {!hasInteractionHistory ? (
            <p className="mt-3 rounded-lg bg-secondary/15 px-3 py-2 text-[10px] leading-relaxed text-muted-foreground">
              Las comparaciones de visitas, contactos y corazones comenzarán a ser representativas a medida que se acumule el nuevo histórico. Emprendedores, eventos y avisos ya utilizan sus fechas de creación.
            </p>
          ) : null}
        </section>



        {/* EVOLUCIÓN */}

        <section className="mt-4 rounded-xl border border-border bg-card p-4">
          <HeaderBlock
            eyebrow="EVOLUCIÓN"
            title="Actividad histórica"
            description="Único gráfico del dashboard: permite ver tendencia diaria, semanal y mensual."
          />

          {evolution.length >
          0 ? (
            <div className="mt-4 h-64">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={
                    evolution
                  }
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={
                      false
                    }
                  />

                  <XAxis
                    dataKey="date"
                    tick={{
                      fontSize:
                        10,
                    }}
                  />

                  <YAxis
                    tick={{
                      fontSize:
                        10,
                    }}
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="visits"
                    name="Visitas"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    dot={
                      false
                    }
                  />

                  <Line
                    type="monotone"
                    dataKey="contacts"
                    name="Contactos"
                    stroke="var(--color-accent)"
                    strokeWidth={2}
                    dot={
                      false
                    }
                  />

                  <Line
                    type="monotone"
                    dataKey="likes"
                    name="Me gusta"
                    stroke="var(--color-chart-3)"
                    strokeWidth={2}
                    dot={
                      false
                    }
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyHistory />
          )}
        </section>


        {/* COMUNIDAD */}

        <section className="mt-4 rounded-xl border border-border bg-card p-4">
          <HeaderBlock
            eyebrow="COMUNIDAD"
            title="Ranking por rubro"
            description="Participación, tráfico, contactos e interacción por rubro."
          />

          <RankTable
            rows={
              categoryRanking
            }
          />
        </section>


        {/* ACTIVIDADES */}

        <section className="mt-4 rounded-xl border border-border bg-card p-4">
          <HeaderBlock
            eyebrow="ACTIVIDADES"
            title="Ranking por actividad"
            description="Permite bajar desde el rubro general a la actividad específica."
          />

          <RankTable
            rows={
              activityRanking
            }
          />
        </section>


        {/* TERRITORIO */}

        <section className="mt-4 rounded-xl border border-border bg-card p-4">
          <HeaderBlock
            eyebrow="TERRITORIO"
            title="Cobertura del Maule Sur"
            description="Distribución territorial y porcentaje de emprendedores por comuna."
          />

          <TerritoryExecutive
            rows={
              comunaRanking
            }
            total={
              activeEntrepreneurs.length
            }
          />

          <div className="mt-4 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
            <TerritoryMap
              rows={
                comunaRanking
              }
            />

            <RankTable
              rows={
                comunaRanking
              }
              compact
            />
          </div>
        </section>


        {/* RANKING EMPRENDEDORES */}

        <section className="mt-4 rounded-xl border border-border bg-card p-4">
          <HeaderBlock
            eyebrow="ENGAGEMENT"
            title="Top emprendedores"
            description="Ranking ponderado por visitas, contactos y me gusta."
          />

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-xs">
              <thead className="border-b border-border text-[10px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3">
                    #
                  </th>

                  <th className="py-2 pr-3">
                    Emprendimiento
                  </th>

                  <th className="py-2 pr-3">
                    Rubro
                  </th>

                  <th className="py-2 pr-3">
                    Comuna
                  </th>

                  <th className="py-2 pr-3 text-right">
                    Visitas
                  </th>

                  <th className="py-2 pr-3 text-right">
                    Contactos
                  </th>

                  <th className="py-2 text-right">
                    ❤️
                  </th>
                </tr>
              </thead>

              <tbody>
                {ranking.map(
                  (
                    row,
                    index,
                  ) => (
                    <tr
                      key={
                        row.id
                      }
                      className="border-b border-border/60 last:border-0"
                    >
                      <td className="py-2 pr-3 font-semibold text-muted-foreground">
                        {index + 1}
                      </td>

                      <td className="py-2 pr-3 font-medium">
                        {
                          row.business_name
                        }
                      </td>

                      <td className="py-2 pr-3 text-muted-foreground">
                        {
                          row.category_name ??
                          "—"
                        }
                      </td>

                      <td className="py-2 pr-3 text-muted-foreground">
                        {
                          row.comuna_name ??
                          "—"
                        }
                      </td>

                      <td className="py-2 pr-3 text-right">
                        {
                          row.views
                        }
                      </td>

                      <td className="py-2 pr-3 text-right">
                        {
                          row.contacts
                        }
                      </td>

                      <td className="py-2 text-right">
                        {
                          row.likes
                        }
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </section>


        {/* EVENTOS + COMPRAVENTA */}

        <section className="mt-4 grid gap-4 lg:grid-cols-2">
          <MiniSummary
            icon={
              <CalendarDays className="h-4 w-4" />
            }
            eyebrow="EVENTOS"
            title="Actividad de eventos"
            total={
              filteredEvents.length
            }
            active={
              activeEvents.length
            }
            likes={
              sum(
                filteredEvents,
                "likes",
              )
            }
            labels={{
              total:
                "Registrados",

              active:
                "Vigentes",
            }}
          />

          <MiniSummary
            icon={
              <ShoppingBag className="h-4 w-4" />
            }
            eyebrow="COMPRA-VENTA"
            title="Actividad comercial"
            total={
              filteredMarketplace.length
            }
            active={
              activeAds.length
            }
            likes={
              sum(
                filteredMarketplace,
                "likes",
              )
            }
            labels={{
              total:
                "Avisos",

              active:
                "Vigentes",
            }}
          />
        </section>


        {/* DATOS */}

        <section className="mt-4 rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <HeaderBlock
              eyebrow="DATOS"
              title="Detalle de emprendedores"
              description="Base filtrada utilizada en esta vista."
            />

            <Button
              variant="outline"
              size="sm"
              className="no-print h-8 text-xs"
              onClick={
                downloadData
              }
            >
              <Download className="h-3.5 w-3.5" />
              CSV
            </Button>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-xs">
              <thead className="border-b border-border text-[10px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3">
                    Emprendimiento
                  </th>

                  <th className="py-2 pr-3">
                    Rubro
                  </th>

                  <th className="py-2 pr-3">
                    Actividad
                  </th>

                  <th className="py-2 pr-3">
                    Comuna
                  </th>

                  <th className="py-2 pr-3 text-right">
                    Visitas
                  </th>

                  <th className="py-2 pr-3 text-right">
                    Contactos
                  </th>

                  <th className="py-2 text-right">
                    ❤️
                  </th>
                </tr>
              </thead>

              <tbody>
                {activeEntrepreneurs
                  .slice(
                    0,
                    100,
                  )
                  .map(
                    (
                      row,
                    ) => (
                      <tr
                        key={
                          row.id
                        }
                        className="border-b border-border/60 last:border-0"
                      >
                        <td className="py-2 pr-3 font-medium">
                          {
                            row.business_name
                          }
                        </td>

                        <td className="py-2 pr-3 text-muted-foreground">
                          {
                            row.category_name ??
                            "—"
                          }
                        </td>

                        <td className="py-2 pr-3 text-muted-foreground">
                          {
                            row.activity_name ??
                            "—"
                          }
                        </td>

                        <td className="py-2 pr-3 text-muted-foreground">
                          {
                            row.comuna_name ??
                            "—"
                          }
                        </td>

                        <td className="py-2 pr-3 text-right">
                          {
                            row.views
                          }
                        </td>

                        <td className="py-2 pr-3 text-right">
                          {
                            row.contacts
                          }
                        </td>

                        <td className="py-2 text-right">
                          {
                            row.likes
                          }
                        </td>
                      </tr>
                    ),
                  )}
              </tbody>
            </table>
          </div>

          {activeEntrepreneurs.length >
          100 ? (
            <p className="mt-2 text-[10px] text-muted-foreground">
              La vista muestra las primeras 100 filas. La descarga CSV contiene todas.
            </p>
          ) : null}
        </section>


        {/* PIE DEL INFORME */}

        <div className="mt-5 border-t border-border pt-3 text-[10px] text-muted-foreground">
          Informe de Gestión · La Vitrina · Generado {new Intl.DateTimeFormat(
            "es-CL",
            {
              dateStyle:
                "long",

              timeStyle:
                "short",
            },
          ).format(
            new Date(),
          )}
        </div>
      </div>
    </section>
  );
}


/* ============================================================
 * COMPONENTES
 * ============================================================
 */

function ComparisonButton({
  active,
  onClick,
  children,
}: {
  active:
    boolean;

  onClick:
    () => void;

  children:
    React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={
        active
          ? "rounded-md bg-primary px-3 py-1.5 text-[10px] font-semibold text-primary-foreground"
          : "rounded-md px-3 py-1.5 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      }
    >
      {
        children
      }
    </button>
  );
}


function ExecutiveComparison({
  item,
}: {
  item:
    ExecutiveMetric;
}) {
  const positive =
    item.delta >
    0;

  const negative =
    item.delta <
    0;

  const tone =
    positive
      ? "text-emerald-700"
      : negative
        ? "text-red-600"
        : "text-muted-foreground";

  const barTone =
    positive
      ? "bg-emerald-600"
      : negative
        ? "bg-red-500"
        : "bg-muted-foreground/40";

  const currentWidth =
    comparisonBarWidth(
      item.current,
      item.previous,
    );

  const unavailable =
    item.historyAvailable ===
    false;

  return (
    <article className="min-w-0 rounded-xl border border-border bg-background p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
            {
              item.label
            }
          </p>

          <p className="mt-1 font-display text-xl font-semibold sm:text-2xl">
            {unavailable
              ? "—"
              : formatExecutiveValue(
                  item.current,
                  item.unit,
                )}
          </p>
        </div>

        <div className="text-right">
          <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
            Período anterior
          </p>

          <p className="mt-1 text-sm font-semibold">
            {unavailable
              ? "—"
              : formatExecutiveValue(
                  item.previous,
                  item.unit,
                )}
          </p>
        </div>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${barTone}`}
          style={{
            width:
              unavailable
                ? "0%"
                : `${currentWidth}%`,
          }}
        />
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className={`text-[11px] font-semibold ${tone}`}>
          {unavailable
            ? "Histórico en construcción"
            : `${positive ? "▲" : negative ? "▼" : "—"} ${signedExecutiveDelta(
                item.delta,
                item.unit,
              )} · ${formatVariation(
                item.percent,
              )}`}
        </p>

        <p className="text-[10px] text-muted-foreground">
          {
            item.note
          }
        </p>
      </div>
    </article>
  );
}


function Kpi({
  icon,
  label,
  value,
  note,
}: {
  icon:
    React.ReactNode;

  label:
    string;

  value:
    number;

  note:
    string;
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground">
          {icon}
        </span>

        <span className="text-[9px] uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>

      <p className="mt-2 font-display text-xl font-semibold">
        {formatNumber(
          value,
        )}
      </p>

      <p className="mt-0.5 text-[10px] text-muted-foreground">
        {note}
      </p>
    </article>
  );
}


function ManagementKpi({
  label,
  value,
  note,
}: {
  label:
    string;

  value:
    string;

  note:
    string;
}) {
  return (
    <article className="rounded-xl border border-border bg-secondary/15 p-3">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 font-display text-lg font-semibold">
        {value}
      </p>

      <p className="mt-0.5 text-[10px] text-muted-foreground">
        {note}
      </p>
    </article>
  );
}


function HeaderBlock({
  eyebrow,
  title,
  description,
}: {
  eyebrow:
    string;

  title:
    string;

  description?:
    string;
}) {
  return (
    <div>
      <p className="eyebrow">
        {eyebrow}
      </p>

      <h2 className="mt-1 section-title">
        {title}
      </h2>

      {description ? (
        <p className="mt-1 text-[11px] text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}


function Filter({
  label,
  children,
}: {
  label:
    string;

  children:
    React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      {children}
    </div>
  );
}


function RankTable({
  rows,
  compact = false,
}: {
  rows:
    RankedRow[];

  compact?:
    boolean;
}) {
  if (
    rows.length ===
    0
  ) {
    return (
      <p className="mt-4 text-xs text-muted-foreground">
        Sin información para los filtros seleccionados.
      </p>
    );
  }

  return (
    <div className={compact ? "overflow-x-auto" : "mt-3 overflow-x-auto"}>
      <table className="w-full min-w-[760px] text-left text-xs">
        <thead className="border-b border-border text-[10px] uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="py-2 pr-3">
              #
            </th>

            <th className="py-2 pr-3">
              Ranking
            </th>

            <th className="py-2 pr-3 text-right">
              N°
            </th>

            <th className="py-2 pr-3 text-right">
              %
            </th>

            <th className="py-2 pr-3 text-right">
              Visitas
            </th>

            <th className="py-2 pr-3 text-right">
              Contactos
            </th>

            <th className="py-2 pr-3 text-right">
              ❤️
            </th>

            <th className="py-2 pr-3 text-right">
              Eventos
            </th>

            <th className="py-2 text-right">
              Avisos
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map(
            (
              row,
              index,
            ) => (
              <tr
                key={
                  row.id
                }
                className="border-b border-border/60 last:border-0"
              >
                <td className="py-2 pr-3 font-semibold text-muted-foreground">
                  {index + 1}
                </td>

                <td className="py-2 pr-3 font-medium">
                  {
                    row.name
                  }
                </td>

                <td className="py-2 pr-3 text-right">
                  {
                    row.entrepreneurs
                  }
                </td>

                <td className="py-2 pr-3 text-right font-medium text-primary">
                  {
                    row.share.toFixed(
                      1,
                    )
                  }%
                </td>

                <td className="py-2 pr-3 text-right">
                  {
                    formatNumber(
                      row.views,
                    )
                  }
                </td>

                <td className="py-2 pr-3 text-right">
                  {
                    formatNumber(
                      row.contacts,
                    )
                  }
                </td>

                <td className="py-2 pr-3 text-right">
                  {
                    formatNumber(
                      row.likes,
                    )
                  }
                </td>

                <td className="py-2 pr-3 text-right">
                  {
                    formatNumber(
                      row.events,
                    )
                  }
                </td>

                <td className="py-2 text-right">
                  {
                    formatNumber(
                      row.ads,
                    )
                  }
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}


function TerritoryExecutive({
  rows,
  total,
}: {
  rows:
    RankedRow[];

  total:
    number;
}) {
  const leader =
    rows[0];

  const bottom =
    rows[
      rows.length - 1
    ];

  const top3 =
    rows
      .slice(
        0,
        3,
      )
      .reduce(
        (
          value,
          row,
        ) =>
          value +
          row.share,

        0,
      );

  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <ManagementKpi
        label="Cobertura"
        value={`${rows.length} comunas`}
        note="Con emprendedores activos"
      />

      <ManagementKpi
        label="Mayor presencia"
        value={
          leader
            ? `${leader.name} · ${leader.share.toFixed(1)}%`
            : "—"
        }
        note={
          leader
            ? `${leader.entrepreneurs} emprendedores`
            : "Sin datos"
        }
      />

      <ManagementKpi
        label="Top 3 comunas"
        value={`${top3.toFixed(1)}%`}
        note="Concentración territorial"
      />

      <ManagementKpi
        label="Menor presencia"
        value={
          bottom
            ? `${bottom.name} · ${bottom.share.toFixed(1)}%`
            : "—"
        }
        note={
          total >
          0
            ? "Oportunidad de crecimiento"
            : "Sin datos"
        }
      />
    </div>
  );
}


function TerritoryMap({
  rows,
}: {
  rows:
    RankedRow[];
}) {
  const max =
    Math.max(
      ...rows.map(
        (
          row,
        ) =>
          row.entrepreneurs,
      ),
      1,
    );

  return (
    <article className="rounded-xl border border-border bg-secondary/10 p-4">
      <p className="eyebrow">
        MAPA EJECUTIVO
      </p>

      <h3 className="mt-1 text-sm font-semibold">
        Presencia por comuna
      </h3>

      <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
        Vista territorial esquemática. El tamaño de cada comuna representa su participación en la comunidad.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {rows.map(
          (
            row,
          ) => {
            const intensity =
              0.15 +
              (
                row.entrepreneurs /
                max
              ) *
                0.55;

            return (
              <div
                key={
                  row.id
                }
                className="rounded-lg border border-border bg-card p-3"
                style={{
                  boxShadow:
                    `inset 0 0 0 999px color-mix(in oklab, var(--color-primary) ${Math.round(
                      intensity *
                        100,
                    )}%, transparent)`,
                }}
              >
                <p className="text-xs font-semibold">
                  {
                    row.name
                  }
                </p>

                <p className="mt-1 font-display text-lg font-semibold">
                  {
                    row.entrepreneurs
                  }
                </p>

                <p className="text-[10px] text-muted-foreground">
                  {
                    row.share.toFixed(
                      1,
                    )
                  }% de emprendedores
                </p>

                <p className="mt-1 text-[9px] text-muted-foreground">
                  {formatNumber(
                    row.contacts,
                  )} contactos · {formatNumber(
                    row.events,
                  )} eventos
                </p>
              </div>
            );
          },
        )}
      </div>
    </article>
  );
}


function MiniSummary({
  icon,
  eyebrow,
  title,
  total,
  active,
  likes,
  labels,
}: {
  icon:
    React.ReactNode;

  eyebrow:
    string;

  title:
    string;

  total:
    number;

  active:
    number;

  likes:
    number;

  labels: {
    total:
      string;

    active:
      string;
  };
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="text-primary">
          {icon}
        </span>

        <HeaderBlock
          eyebrow={
            eyebrow
          }
          title={
            title
          }
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <SmallStat
          value={
            total
          }
          label={
            labels.total
          }
        />

        <SmallStat
          value={
            active
          }
          label={
            labels.active
          }
        />

        <SmallStat
          value={
            likes
          }
          label="Me gusta"
        />
      </div>
    </article>
  );
}


function SmallStat({
  value,
  label,
}: {
  value:
    number;

  label:
    string;
}) {
  return (
    <div className="rounded-lg bg-secondary/20 p-3 text-center">
      <p className="font-display text-lg font-semibold">
        {formatNumber(
          value,
        )}
      </p>

      <p className="mt-0.5 text-[9px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
    </div>
  );
}


function EmptyHistory() {
  return (
    <div className="mt-4 rounded-lg border border-dashed border-border p-6 text-center">
      <TrendingUp className="mx-auto h-5 w-5 text-muted-foreground/50" />

      <p className="mt-2 text-xs font-medium">
        El histórico comienza ahora
      </p>

      <p className="mt-1 text-[11px] text-muted-foreground">
        Las visitas, contactos y reacciones futuras irán formando la evolución semanal, mensual y anual.
      </p>
    </div>
  );
}


/* ============================================================
 * FUNCIONES
 * ============================================================
 */

function sum<
  T extends Record<
    string,
    any
  >,
>(
  rows:
    T[],

  key:
    keyof T,
) {
  return rows.reduce(
    (
      total,
      row,
    ) =>
      total +
      Number(
        row[key] ??
          0,
      ),

    0,
  );
}


function score(
  row:
    EntrepreneurMetric,
) {
  return (
    row.views +
    row.contacts *
      5 +
    row.likes *
      3
  );
}


function buildDimensionRanking({
  entrepreneurs,
  events,
  ads,
  idKey,
  nameKey,
}: {
  entrepreneurs:
    EntrepreneurMetric[];

  events:
    EventMetric[];

  ads:
    MarketplaceMetric[];

  idKey:
    "category_id" |
    "activity_id" |
    "comuna_id";

  nameKey:
    "category_name" |
    "activity_name" |
    "comuna_name";
}) {
  const total =
    entrepreneurs.length;

  const map =
    new Map<
      string,
      RankedRow
    >();

  entrepreneurs.forEach(
    (
      row,
    ) => {
      const id =
        row[idKey];

      const name =
        row[nameKey];

      if (
        !id ||
        !name
      ) {
        return;
      }

      const current =
        map.get(
          id,
        ) ?? {
          id,
          name,
          entrepreneurs:
            0,
          share:
            0,
          views:
            0,
          contacts:
            0,
          likes:
            0,
          events:
            0,
          ads:
            0,
        };

      current.entrepreneurs +=
        1;

      current.views +=
        Number(
          row.views ??
            0,
        );

      current.contacts +=
        Number(
          row.contacts ??
            0,
        );

      current.likes +=
        Number(
          row.likes ??
            0,
        );

      map.set(
        id,
        current,
      );
    },
  );


  events.forEach(
    (
      row,
    ) => {
      const id =
        row[idKey];

      if (
        id &&
        map.has(
          id,
        )
      ) {
        map.get(
          id,
        )!.events +=
          1;

        map.get(
          id,
        )!.likes +=
          Number(
            row.likes ??
              0,
          );
      }
    },
  );


  ads.forEach(
    (
      row,
    ) => {
      const id =
        row[idKey];

      if (
        id &&
        map.has(
          id,
        )
      ) {
        map.get(
          id,
        )!.ads +=
          1;

        map.get(
          id,
        )!.likes +=
          Number(
            row.likes ??
              0,
          );
      }
    },
  );


  return Array.from(
    map.values(),
  )
    .map(
      (
        row,
      ) => ({
        ...row,

        share:
          total >
          0
            ? (
                row.entrepreneurs /
                total
              ) *
              100
            : 0,
      }),
    )
    .sort(
      (
        a,
        b,
      ) =>
        b.entrepreneurs -
        a.entrepreneurs ||
        b.contacts -
        a.contacts,
    );
}


function uniqueOptions<
  T extends Record<
    string,
    any
  >,
>(
  rows:
    T[],

  idKey:
    keyof T,

  nameKey:
    keyof T,
) {
  const map =
    new Map<
      string,
      string
    >();

  rows.forEach(
    (
      row,
    ) => {
      const id =
        row[idKey];

      const name =
        row[nameKey];

      if (
        id &&
        name
      ) {
        map.set(
          String(
            id,
          ),
          String(
            name,
          ),
        );
      }
    },
  );

  return Array.from(
    map.entries(),
  )
    .map(
      ([
        id,
        name,
      ]) => ({
        id,
        name,
      }),
    )
    .sort(
      (
        a,
        b,
      ) =>
        a.name.localeCompare(
          b.name,
          "es",
        ),
    );
}


function makeExecutiveMetric(
  label:
    string,

  current:
    number,

  previous:
    number,

  note:
    string,

  historyAvailable:
    boolean,

  unit:
    "number" | "percent" =
      "number",
): ExecutiveMetric {
  const delta =
    current -
    previous;

  return {
    label,
    current,
    previous,
    delta,

    percent:
      previous ===
      0
        ? current ===
          0
          ? 0
          : null
        : (
            delta /
            Math.abs(
              previous,
            )
          ) *
          100,

    note,
    historyAvailable,
    unit,
  };
}


function getComparisonRanges(
  mode:
    ComparisonMode,

  now:
    Date,
) {
  if (
    mode ===
    "week"
  ) {
    const day =
      now.getDay();

    const diff =
      day ===
      0
        ? 6
        : day -
          1;

    const currentStart =
      startOfDay(
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() -
            diff,
        ),
      );

    const currentEnd =
      endOfDay(
        now,
      );

    const previousStart =
      startOfDay(
        new Date(
          currentStart.getFullYear(),
          currentStart.getMonth(),
          currentStart.getDate() -
            7,
        ),
      );

    const previousEnd =
      endOfDay(
        new Date(
          currentStart.getFullYear(),
          currentStart.getMonth(),
          currentStart.getDate() -
            1,
        ),
      );

    return {
      currentStart,
      currentEnd,
      previousStart,
      previousEnd,
    };
  }


  if (
    mode ===
    "year"
  ) {
    return {
      currentStart:
        new Date(
          now.getFullYear(),
          0,
          1,
        ),

      currentEnd:
        endOfDay(
          now,
        ),

      previousStart:
        new Date(
          now.getFullYear() -
            1,
          0,
          1,
        ),

      previousEnd:
        endOfDay(
          new Date(
            now.getFullYear() -
              1,
            11,
            31,
          ),
        ),
    };
  }


  return {
    currentStart:
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ),

    currentEnd:
      endOfDay(
        now,
      ),

    previousStart:
      new Date(
        now.getFullYear(),
        now.getMonth() -
          1,
        1,
      ),

    previousEnd:
      endOfDay(
        new Date(
          now.getFullYear(),
          now.getMonth(),
          0,
        ),
      ),
  };
}


function startOfDay(
  value:
    Date,
) {
  const date =
    new Date(
      value,
    );

  date.setHours(
    0,
    0,
    0,
    0,
  );

  return date;
}


function endOfDay(
  value:
    Date,
) {
  const date =
    new Date(
      value,
    );

  date.setHours(
    23,
    59,
    59,
    999,
  );

  return date;
}


function isWithinRange(
  value:
    string,

  start:
    Date,

  end:
    Date,
) {
  const date =
    new Date(
      value,
    );

  return (
    date >=
      start &&
    date <=
      end
  );
}


function analyticsPeriodTotal(
  rows:
    DailyMetric[],

  start:
    Date,

  end:
    Date,

  eventTypes:
    string[],
) {
  return rows.reduce(
    (
      total,
      row,
    ) => {
      const date =
        new Date(
          `${row.metric_date}T12:00:00`,
        );

      if (
        date <
          start ||
        date >
          end ||
        !eventTypes.includes(
          row.event_type,
        )
      ) {
        return total;
      }

      return (
        total +
        Number(
          row.total ??
            0,
        )
      );
    },

    0,
  );
}


function analyticsNetLikes(
  rows:
    DailyMetric[],

  start:
    Date,

  end:
    Date,
) {
  const added =
    analyticsPeriodTotal(
      rows,
      start,
      end,
      [
        "like_added",
      ],
    );

  const removed =
    analyticsPeriodTotal(
      rows,
      start,
      end,
      [
        "like_removed",
      ],
    );

  return (
    added -
    removed
  );
}


function comparisonLabel(
  mode:
    ComparisonMode,
) {
  if (
    mode ===
    "week"
  ) {
    return "esta semana";
  }

  if (
    mode ===
    "year"
  ) {
    return "este año";
  }

  return "este mes";
}


function formatExecutiveValue(
  value:
    number,

  unit:
    "number" | "percent" =
      "number",
) {
  if (
    unit ===
    "percent"
  ) {
    return `${value.toFixed(
      1,
    )}%`;
  }

  return formatNumber(
    value,
  );
}


function signedExecutiveDelta(
  value:
    number,

  unit:
    "number" | "percent" =
      "number",
) {
  if (
    unit ===
    "percent"
  ) {
    const sign =
      value >
      0
        ? "+"
        : "";

    return `${sign}${value.toFixed(
      1,
    )} pp`;
  }

  return signedNumber(
    value,
  );
}


function signedNumber(
  value:
    number,
) {
  if (
    value >
    0
  ) {
    return `+${formatNumber(
      value,
    )}`;
  }

  return formatNumber(
    value,
  );
}


function formatVariation(
  value:
    number | null,
) {
  if (
    value ===
    null
  ) {
    return "nuevo";
  }

  if (
    value >
    0
  ) {
    return `+${value.toFixed(
      1,
    )}%`;
  }

  return `${value.toFixed(
    1,
  )}%`;
}


function comparisonBarWidth(
  current:
    number,

  previous:
    number,
) {
  const max =
    Math.max(
      Math.abs(
        current,
      ),
      Math.abs(
        previous,
      ),
      1,
    );

  return Math.max(
    8,
    Math.min(
      100,
      (
        Math.abs(
          current,
        ) /
        max
      ) *
        100,
    ),
  );
}


function downloadCsv(
  rows:
    Record<
      string,
      any
    >[],

  filename:
    string,
) {
  if (
    rows.length ===
    0
  ) {
    return;
  }

  const headers =
    Object.keys(
      rows[0],
    );

  const csv =
    [
      headers.join(
        ";",
      ),

      ...rows.map(
        (
          row,
        ) =>
          headers
            .map(
              (
                key,
              ) =>
                csvCell(
                  row[key],
                ),
            )
            .join(
              ";",
            ),
      ),
    ].join(
      "\n",
    );

  const blob =
    new Blob(
      [
        "\ufeff",
        csv,
      ],
      {
        type:
          "text/csv;charset=utf-8;",
      },
    );

  const url =
    URL.createObjectURL(
      blob,
    );

  const link =
    document.createElement(
      "a",
    );

  link.href =
    url;

  link.download =
    filename;

  link.click();

  URL.revokeObjectURL(
    url,
  );
}


function csvCell(
  value:
    unknown,
) {
  const text =
    String(
      value ??
        "",
    ).replace(
      /"/g,
      '""',
    );

  return `"${text}"`;
}


function formatNumber(
  value:
    number,
) {
  return new Intl.NumberFormat(
    "es-CL",
  ).format(
    value,
  );
}


function percent(
  value:
    number,

  total:
    number,
) {
  if (
    total <=
    0
  ) {
    return "0,0%";
  }

  return `${(
    (
      value /
      total
    ) *
    100
  ).toFixed(
    1,
  )}%`;
}


function today() {
  return new Date()
    .toISOString()
    .slice(
      0,
      10,
    );
}
