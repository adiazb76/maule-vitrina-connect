import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Eye,
  EyeOff,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { supabase } from "@/integrations/supabase/client";

type MarketplaceAd = {
  id: string;
  entrepreneur_id: string;
  type: "vendo" | "compro";
  title: string;
  description: string;
  price: number | null;
  image_url: string | null;
  contact_url: string | null;
  status: "pendiente" | "aprobado" | "rechazado";
  visible: boolean;
  created_at: string;
  expires_at: string;
};

export function MarketplaceAdmin() {
  const queryClient = useQueryClient();

  const ads = useQuery({
    queryKey: ["marketplace-admin"],

    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("marketplace_ads")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      return (data ?? []) as MarketplaceAd[];
    },
  });

  async function refresh() {
    await queryClient.invalidateQueries({
      queryKey: ["marketplace-admin"],
    });

    await queryClient.invalidateQueries({
      queryKey: ["marketplace-ads"],
    });

    await queryClient.invalidateQueries({
      queryKey: ["my-marketplace-ad"],
    });

    await queryClient.invalidateQueries({
      queryKey: ["summary-marketplace"],
    });
  }

  async function approve(
    ad: MarketplaceAd,
  ) {
    const { error } =
      await (supabase as any)
        .from("marketplace_ads")
        .update({
          status: "aprobado",
          visible: true,
        })
        .eq("id", ad.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    await refresh();

    toast.success(
      "Aviso aprobado y publicado.",
    );
  }

  async function reject(
    ad: MarketplaceAd,
  ) {
    const { error } =
      await (supabase as any)
        .from("marketplace_ads")
        .update({
          status: "rechazado",
          visible: false,
        })
        .eq("id", ad.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    await refresh();

    toast.success(
      "Aviso rechazado.",
    );
  }

  async function toggleVisibility(
    ad: MarketplaceAd,
  ) {
    const { error } =
      await (supabase as any)
        .from("marketplace_ads")
        .update({
          visible: !ad.visible,
        })
        .eq("id", ad.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    await refresh();

    toast.success(
      ad.visible
        ? "Aviso ocultado."
        : "Aviso visible nuevamente.",
    );
  }

  async function remove(
    ad: MarketplaceAd,
  ) {
    if (
      !window.confirm(
        `¿Eliminar el aviso "${ad.title}"?`,
      )
    ) {
      return;
    }

    const { error } =
      await (supabase as any)
        .from("marketplace_ads")
        .delete()
        .eq("id", ad.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    await refresh();

    toast.success(
      "Aviso eliminado.",
    );
  }

  const rows =
    ads.data ?? [];

  const pending =
    rows.filter(
      (ad) =>
        ad.status === "pendiente" &&
        !isExpired(ad),
    );

  const published =
    rows.filter(
      (ad) =>
        ad.status === "aprobado" &&
        ad.visible &&
        !isExpired(ad),
    );

  const hidden =
    rows.filter(
      (ad) =>
        ad.status === "aprobado" &&
        !ad.visible &&
        !isExpired(ad),
    );

  const rejected =
    rows.filter(
      (ad) =>
        ad.status === "rechazado",
    );

  const expired =
    rows.filter(isExpired);

  return (
    <section className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
      <div>
        <p className="eyebrow inline-flex items-center gap-2">
          <ShoppingBag className="h-4 w-4" />
          COMPRAVENTA
        </p>

        <h2 className="mt-1 font-display text-2xl font-semibold">
          Administración de avisos
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Revisa y administra los avisos publicados por la comunidad.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-5">
        <Stat
          label="Pendientes"
          value={pending.length}
        />

        <Stat
          label="Publicados"
          value={published.length}
        />

        <Stat
          label="Ocultos"
          value={hidden.length}
        />

        <Stat
          label="Rechazados"
          value={rejected.length}
        />

        <Stat
          label="Finalizados"
          value={expired.length}
        />
      </div>

      <AdGroup
        title="Pendientes de aprobación"
        ads={pending}
        empty="No hay avisos pendientes."
        onApprove={approve}
        onReject={reject}
        onVisibility={toggleVisibility}
        onDelete={remove}
      />

      <AdGroup
        title="Publicados"
        ads={published}
        empty="No hay avisos publicados."
        onApprove={approve}
        onReject={reject}
        onVisibility={toggleVisibility}
        onDelete={remove}
      />

      <AdGroup
        title="Ocultos"
        ads={hidden}
        empty="No hay avisos ocultos."
        onApprove={approve}
        onReject={reject}
        onVisibility={toggleVisibility}
        onDelete={remove}
      />

      <AdGroup
        title="Rechazados"
        ads={rejected}
        empty="No hay avisos rechazados."
        onApprove={approve}
        onReject={reject}
        onVisibility={toggleVisibility}
        onDelete={remove}
      />

      <AdGroup
        title="Finalizados"
        ads={expired}
        empty="Todavía no hay avisos finalizados."
        onApprove={approve}
        onReject={reject}
        onVisibility={toggleVisibility}
        onDelete={remove}
      />
    </section>
  );
}

function AdGroup({
  title,
  ads,
  empty,
  onApprove,
  onReject,
  onVisibility,
  onDelete,
}: {
  title: string;
  ads: MarketplaceAd[];
  empty: string;

  onApprove: (
    ad: MarketplaceAd,
  ) => void;

  onReject: (
    ad: MarketplaceAd,
  ) => void;

  onVisibility: (
    ad: MarketplaceAd,
  ) => void;

  onDelete: (
    ad: MarketplaceAd,
  ) => void;
}) {
  return (
    <section className="mt-8">
      <h3 className="font-display text-lg font-semibold">
        {title}
      </h3>

      {ads.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
          {empty}
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {ads.map(
            (ad) => (
              <article
                key={ad.id}
                className="flex flex-col gap-4 rounded-xl border border-border p-4 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 gap-3">
                  {ad.image_url ? (
                    <img
                      src={ad.image_url}
                      alt={ad.title}
                      className="h-20 w-20 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="grid h-20 w-20 shrink-0 place-items-center rounded-lg bg-muted">
                      <ShoppingBag className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          ad.type === "vendo"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {ad.type === "vendo"
                          ? "Vendo"
                          : "Compro"}
                      </Badge>

                      <StatusBadge
                        ad={ad}
                      />
                    </div>

                    <h4 className="mt-2 line-clamp-1 font-display text-base font-semibold">
                      {ad.title}
                    </h4>

                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {ad.description}
                    </p>

                    <div className="mt-1 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
                      {ad.price != null ? (
                        <span>
                          {formatPrice(ad.price)}
                        </span>
                      ) : null}

                      <span>
                        vence {formatDate(ad.expires_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {ad.status !==
                  "aprobado" ? (
                    <Button
                      size="sm"
                      onClick={() =>
                        onApprove(ad)
                      }
                    >
                      <Check className="h-4 w-4" />
                      Aprobar
                    </Button>
                  ) : null}

                  {ad.status !==
                  "rechazado" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        onReject(ad)
                      }
                    >
                      <X className="h-4 w-4" />
                      Rechazar
                    </Button>
                  ) : null}

                  {ad.status ===
                  "aprobado" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        onVisibility(ad)
                      }
                    >
                      {ad.visible ? (
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

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      onDelete(ad)
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </article>
            ),
          )}
        </div>
      )}
    </section>
  );
}

function StatusBadge({
  ad,
}: {
  ad: MarketplaceAd;
}) {
  if (isExpired(ad)) {
    return (
      <Badge variant="outline">
        Finalizado
      </Badge>
    );
  }

  if (
    ad.status === "pendiente"
  ) {
    return (
      <Badge variant="secondary">
        Pendiente
      </Badge>
    );
  }

  if (
    ad.status === "rechazado"
  ) {
    return (
      <Badge variant="destructive">
        Rechazado
      </Badge>
    );
  }

  if (!ad.visible) {
    return (
      <Badge variant="outline">
        Oculto
      </Badge>
    );
  }

  return (
    <Badge>
      Publicado
    </Badge>
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
    <div className="rounded-xl border border-border bg-secondary/10 p-4">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 font-display text-2xl font-semibold">
        {value}
      </p>
    </div>
  );
}

function isExpired(
  ad: MarketplaceAd,
) {
  return (
    new Date(
      ad.expires_at,
    ).getTime() <
    Date.now()
  );
}

function formatPrice(
  value: number,
) {
  return new Intl.NumberFormat(
    "es-CL",
    {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    },
  ).format(value);
}

function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "es-CL",
    {
      day: "2-digit",
      month: "short",
    },
  ).format(
    new Date(value),
  );
}