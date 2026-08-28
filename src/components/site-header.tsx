import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const NAV = [
  { to: "/", label: "Inicio" },
  { to: "/comunidad", label: "Comunidad" },
  { to: "/eventos", label: "Eventos" },
  { to: "/educa", label: "Educa" },
  { to: "/diagnostico", label: "Diagnóstico" },
  { to: "/radio", label: "Radio" },
  { to: "/compraventa", label: "Compra-venta" },
  { to: "/sobre", label: "Sobre La Vitrina" },
] as const;

export function SiteHeader() {
  const [open, setOpen] =
    useState(false);

  const { user } =
    useAuth();

  const todayLabel =
    new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
      .format(new Date())
      .replace(".", "")
      .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
      {/* DESKTOP / TABLET */}

      <div className="container-page flex h-14 items-center justify-between gap-3">
        {/* MARCA */}

        <Link
          to="/"
          onClick={() =>
            setOpen(false)
          }
          className="flex shrink-0 items-center gap-2"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary font-display text-base font-semibold text-primary-foreground">
            V
          </span>

          <span className="hidden leading-tight sm:block">
            <span className="block font-display text-sm font-semibold tracking-tight">
              LA VITRINA
            </span>

            <span className="block text-[10px] text-muted-foreground">
              Emprendedores del Maule Sur
            </span>
          </span>
        </Link>

        {/* MENÃš ESCRITORIO */}

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex">
          {NAV.map(
            (item) => (
              <Link
                key={
                  item.to
                }
                to={
                  item.to
                }
                activeOptions={{
                  exact:
                    item.to ===
                    "/",
                }}
                activeProps={{
                  className:
                    "bg-secondary/60 text-foreground",
                }}
                className="whitespace-nowrap rounded-md px-2 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary/30 hover:text-foreground"
              >
                {
                  item.label
                }
              </Link>
            ),
          )}
        </nav>

        {/* ACCIONES */}

        <div className="hidden shrink-0 items-center gap-1.5 lg:flex">
          <span className="mr-2 whitespace-nowrap text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
            {"Actualizado · "}{todayLabel}
          </span>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 px-2.5 text-xs"
          >
            <Link
              to={
                user
                  ? "/panel"
                  : "/auth"
              }
            >
              {user
                ? "Mi panel"
                : "Ingresar"}
            </Link>
          </Button>

          <Button
            asChild
            size="sm"
            className="h-8 px-3 text-xs"
          >
            <Link to={user ? "/panel" : "/auth"}>
              Quiero ser parte
            </Link>
          </Button>
        </div>

        {/* MENÃš MÓVIL */}

        <span className="ml-auto whitespace-nowrap text-[9px] font-medium uppercase tracking-wide text-muted-foreground lg:hidden">
          {todayLabel}
        </span>

        <button
          type="button"
          aria-label={
            open
              ? "Cerrar menú"
              : "Abrir menú"
          }
          aria-expanded={
            open
          }
          className="grid h-9 w-9 place-items-center rounded-md border border-border bg-card lg:hidden"
          onClick={() =>
            setOpen(
              (
                previous,
              ) =>
                !previous,
            )
          }
        >
          {open ? (
            <X className="h-4.5 w-4.5" />
          ) : (
            <Menu className="h-4.5 w-4.5" />
          )}
        </button>
      </div>

      {/* MENÃš MÓVIL ABIERTO */}

      {open ? (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="container-page py-2">
            <div className="grid gap-0.5">
              {NAV.map(
                (item) => (
                  <Link
                    key={
                      item.to
                    }
                    to={
                      item.to
                    }
                    onClick={() =>
                      setOpen(
                        false,
                      )
                    }
                    activeOptions={{
                      exact:
                        item.to ===
                        "/",
                    }}
                    activeProps={{
                      className:
                        "bg-secondary/60 text-foreground",
                    }}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary/30 hover:text-foreground"
                  >
                    {
                      item.label
                    }
                  </Link>
                ),
              )}
            </div>

            <div className="mt-2 grid gap-2 border-t border-border pt-3 pb-3 sm:grid-cols-2">
              <Button
                asChild
                variant="outline"
                size="sm"
              >
                <Link
                  to={
                    user
                      ? "/panel"
                      : "/auth"
                  }
                  onClick={() =>
                    setOpen(
                      false,
                    )
                  }
                >
                  {user
                    ? "Mi panel"
                    : "Ingresar"}
                </Link>
              </Button>

              <Button
                asChild
                size="sm"
              >
                <Link
                  to={user ? "/panel" : "/auth"}
                  onClick={() =>
                    setOpen(
                      false,
                    )
                  }
                >
                  Quiero ser parte
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
