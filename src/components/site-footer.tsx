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

  const contact = settings.data;

  const phone = phoneLink(
    contact?.phone ?? null,
  );

  const whatsapp = siteWhatsappLink(
    contact ?? null,
  );

  const instagram = instagramLink(
    contact?.instagram ?? null,
  );

  const facebook = facebookLink(
    contact?.facebook ?? null,
  );

  const email = emailLink(
    contact?.email ?? null,
  );

  const website = websiteLink(
    contact?.website ?? null,
  );

  const hasContact =
    phone ||
    whatsapp ||
    instagram ||
    facebook ||
    email ||
    website;

  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="container-page grid gap-9 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* LA VITRINA */}

        <div>
          <p className="font-display text-lg font-semibold">
            LA VITRINA
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Comunidad de Emprendedores del Maule Sur
          </p>

          <p className="mt-4 max-w-xs font-display text-base text-foreground">
            “Nos mostramos. Nos conectamos. Crecemos juntos.”
          </p>
        </div>

        {/* EXPLORAR */}

        <div>
          <p className="eyebrow">
            Explorar
          </p>

          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link
                to="/comunidad"
                className="hover:text-foreground"
              >
                Comunidad
              </Link>
            </li>

            <li>
              <Link
                to="/educa"
                className="hover:text-foreground"
              >
                La Vitrina Educa
              </Link>
            </li>

            <li>
              <Link
                to="/diagnostico"
                className="hover:text-foreground"
              >
                Diagnóstico
              </Link>
            </li>

            <li>
              <Link
                to="/eventos"
                className="hover:text-foreground"
              >
                Eventos
              </Link>
            </li>

            <li>
              <Link
                to="/radio"
                className="hover:text-foreground"
              >
                La Vitrina en Radio
              </Link>
            </li>
          </ul>
        </div>

        {/* PARTICIPA */}

        <div>
          <p className="eyebrow">
            Participa
          </p>

          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link
                to="/sumate"
                className="hover:text-foreground"
              >
                Quiero ser parte
              </Link>
            </li>

            <li>
              <Link
                to="/sobre"
                className="hover:text-foreground"
              >
                Sobre La Vitrina
              </Link>
            </li>

            <li>
              <Link
                to="/auth"
                className="hover:text-foreground"
              >
                Ingresar
              </Link>
            </li>
          </ul>
        </div>

        {/* CONTACTO Y REDES */}

        <div>
          <p className="eyebrow">
            Contacto y redes
          </p>

          {hasContact ? (
            <div className="mt-3 space-y-2.5 text-sm text-muted-foreground">
              {whatsapp ? (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-foreground"
                >
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  WhatsApp
                </a>
              ) : null}

              {instagram ? (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-foreground"
                >
                  <Instagram className="h-4 w-4 shrink-0" />
                  Instagram
                </a>
              ) : null}

              {facebook ? (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-foreground"
                >
                  <Facebook className="h-4 w-4 shrink-0" />
                  Facebook
                </a>
              ) : null}

              {phone ? (
                <a
                  href={phone}
                  className="flex items-center gap-2 hover:text-foreground"
                >
                  <Phone className="h-4 w-4 shrink-0" />

                  <span>
                    {contact?.phone}
                  </span>
                </a>
              ) : null}

              {email ? (
                <a
                  href={email}
                  className="flex items-center gap-2 hover:text-foreground"
                >
                  <Mail className="h-4 w-4 shrink-0" />

                  <span className="break-all">
                    {contact?.email}
                  </span>
                </a>
              ) : null}

              {website ? (
                <a
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-foreground"
                >
                  <Globe className="h-4 w-4 shrink-0" />

                  <span className="break-all">
                    {contact?.website}
                  </span>
                </a>
              ) : null}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Próximamente.
            </p>
          )}
        </div>
      </div>

      {/* MAULE SUR */}

      <div className="border-t border-border">
        <div className="container-page py-5">
          <p className="text-xs leading-relaxed text-muted-foreground">
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
        <div className="container-page flex flex-col gap-1 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
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