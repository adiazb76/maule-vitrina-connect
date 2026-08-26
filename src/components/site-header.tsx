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
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary font-display text-lg font-semibold text-primary-foreground">
            V
          </span>

          <span className="leading-tight">
            <span className="block font-display text-base font-semibold tracking-tight">
              LA VITRINA
            </span>

            <span className="block text-[11px] text-muted-foreground">
              Emprendedores del Maule Sur
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{
                exact: item.to === "/",
              }}
              activeProps={{
                className: "text-primary",
              }}
              className="rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button
            asChild
            variant="ghost"
            size="sm"
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
          >
            <Link to="/sumate">
              Quiero ser parte
            </Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label={
            open
              ? "Cerrar menú"
              : "Abrir menú"
          }
          className="grid h-10 w-10 place-items-center rounded-md border border-border lg:hidden"
          onClick={() =>
            setOpen(
              (previous) =>
                !previous,
            )
          }
        >
          {open ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="container-page flex flex-col py-3">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() =>
                  setOpen(false)
                }
                activeOptions={{
                  exact:
                    item.to === "/",
                }}
                activeProps={{
                  className:
                    "text-primary",
                }}
                className="rounded-md px-1 py-3 text-base font-medium text-foreground"
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-3 flex flex-col gap-2 border-t border-border pb-4 pt-4">
              <Button
                asChild
                variant="outline"
              >
                <Link
                  to={
                    user
                      ? "/panel"
                      : "/auth"
                  }
                  onClick={() =>
                    setOpen(false)
                  }
                >
                  {user
                    ? "Mi panel"
                    : "Ingresar"}
                </Link>
              </Button>

              <Button asChild>
                <Link
                  to="/sumate"
                  onClick={() =>
                    setOpen(false)
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