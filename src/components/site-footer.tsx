import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Facebook,
  Globe,
  Instagram,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";

import {
  emailLink,
  facebookLink,
  fetchSiteSettings,
  instagramLink,
  phoneLink,
  siteWhatsappLink,
  websiteLink,
} from "@/lib/vitrina";

export function SiteFooter() {
  const settings = useQuery({
    queryKey: ["site-settings"],
    queryFn: fetchSiteSettings,
  });

  const contact =
    settings.data;

  const phone =
    phoneLink(
      contact?.phone ??
        null,
    );

  const whatsapp =
    siteWhatsappLink(
      contact ??
        null,
    );

  const instagram =
    instagramLink(
      contact?.instagram ??
        null,
    );

  const facebook =
    facebookLink(
      contact?.facebook ??
        null,
    );

  const email =
    emailLink(
      contact?.email ??
        null,
    );

  const website =
    websiteLink(
      contact?.website ??
        null,
    );

  const hasContact =
    phone ||
    whatsapp ||
    instagram ||
    facebook ||
    email ||
    website;

  return (
    <footer className="mt-12 border-t border-border bg-surface">
      {/* CONTENIDO PRINCIPAL */}

      <div className="container-page grid gap-7 py-7 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {/* LA VITRINA */}

        <div>
          <p className="font-display text-base font-semibold">
            LA VITRINA
          </p>

          <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-muted-foreground">
            Comunidad de Emprendedores del Maule Sur
          </p>

          <p className="mt-3 max-w-[230px] font-display text-sm leading-relaxed text-foreground">
            “Nos mostramos. Nos conectamos. Crecemos juntos.”
          </p>
        </div>

        {/* EXPLORAR */}

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Explorar
          </p>

          <ul className="mt-2.5 space-y-1.5 text-xs text-muted-foreground">
            <li>
              <Link
                to="/comunidad"
                className="transition-colors hover:text-foreground"
              >
                Comunidad
              </Link>
            </li>

            <li>
              <Link
                to="/eventos"
                className="transition-colors hover:text-foreground"
              >
                Eventos
              </Link>
            </li>

            <li>
              <Link
                to="/educa"
                className="transition-colors hover:text-foreground"
              >
                La Vitrina Educa
              </Link>
            </li>

            <li>
              <Link
                to="/diagnostico"
                className="transition-colors hover:text-foreground"
              >
                Diagnóstico
              </Link>
            </li>

            <li>
              <Link
                to="/radio"
                className="transition-colors hover:text-foreground"
              >
                La Vitrina en Radio
              </Link>
            </li>

            <li>
              <Link
                to="/compraventa"
                className="transition-colors hover:text-foreground"
              >
                Compra-venta
              </Link>
            </li>
          </ul>
        </div>

        {/* PARTICIPA */}

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Participa
          </p>

          <ul className="mt-2.5 space-y-1.5 text-xs text-muted-foreground">
            <li>
              <Link
                to="/sumate"
                className="transition-colors hover:text-foreground"
              >
                Quiero ser parte
              </Link>
            </li>

            <li>
              <Link
                to="/sobre"
                className="transition-colors hover:text-foreground"
              >
                Sobre La Vitrina
              </Link>
            </li>

            <li>
              <Link
                to="/auth"
                className="transition-colors hover:text-foreground"
              >
                Ingresar
              </Link>
            </li>
          </ul>
        </div>

        {/* CONTACTO */}

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Contacto y redes
          </p>

          {hasContact ? (
            <div className="mt-2.5 space-y-2 text-xs text-muted-foreground">
              {whatsapp ? (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  <MessageCircle className="h-3.5 w-3.5 shrink-0" />

                  <span>
                    WhatsApp
                  </span>
                </a>
              ) : null}

              {instagram ? (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  <Instagram className="h-3.5 w-3.5 shrink-0" />

                  <span>
                    Instagram
                  </span>
                </a>
              ) : null}

              {facebook ? (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  <Facebook className="h-3.5 w-3.5 shrink-0" />

                  <span>
                    Facebook
                  </span>
                </a>
              ) : null}

              {phone ? (
                <a
                  href={phone}
                  className="flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0" />

                  <span>
                    {contact?.phone}
                  </span>
                </a>
              ) : null}

              {email ? (
                <a
                  href={email}
                  className="flex items-start gap-2 transition-colors hover:text-foreground"
                >
                  <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" />

                  <span className="break-all leading-relaxed">
                    {contact?.email}
                  </span>
                </a>
              ) : null}

              {website ? (
                <a
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-2 transition-colors hover:text-foreground"
                >
                  <Globe className="mt-0.5 h-3.5 w-3.5 shrink-0" />

                  <span className="break-all leading-relaxed">
                    {contact?.website}
                  </span>
                </a>
              ) : null}
            </div>
          ) : (
            <p className="mt-2.5 text-xs text-muted-foreground">
              Próximamente.
            </p>
          )}
        </div>
      </div>

      {/* MAULE SUR */}

      <div className="border-t border-border">
        <div className="container-page py-3.5">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">
              Maule Sur:
            </span>{" "}
            Linares, Longaví, Parral, Retiro, Villa Alegre,
            Yerbas Buenas, Colbún, San Javier, Cauquenes,
            Chanco y Pelluhue.
          </p>
        </div>
      </div>

      {/* COPYRIGHT */}

      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-1 py-3.5 text-[10px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} La Vitrina · Maule Sur, Chile
          </span>

          <span>
            El Maule Sur tiene talento. Hagámoslo visible.
          </span>
        </div>
      </div>
    </footer>
  );
}