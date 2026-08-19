import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg font-semibold">LA VITRINA</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Comunidad de Emprendedores del Maule Sur
          </p>
          <p className="mt-4 max-w-xs font-display text-base text-foreground">
            “Nos mostramos. Nos conectamos. Crecemos juntos.”
          </p>
        </div>
        <div>
          <p className="eyebrow">Explorar</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/emprendedores" className="hover:text-foreground">
                Emprendedores
              </Link>
            </li>
            <li>
              <Link to="/categorias" className="hover:text-foreground">
                Categorías
              </Link>
            </li>
            <li>
              <Link to="/eventos" className="hover:text-foreground">
                Eventos
              </Link>
            </li>
            <li>
              <Link to="/radio" className="hover:text-foreground">
                La Vitrina en Radio
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">Comunidad</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/comunidad" className="hover:text-foreground">
                Qué es la comunidad
              </Link>
            </li>
            <li>
              <Link to="/sumate" className="hover:text-foreground">
                Quiero ser parte
              </Link>
            </li>
            <li>
              <Link to="/sobre" className="hover:text-foreground">
                Sobre La Vitrina
              </Link>
            </li>
            <li>
              <Link to="/auth" className="hover:text-foreground">
                Ingresar
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">El Maule Sur</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Linares, Longaví, Parral, Retiro, Villa Alegre, Yerbas Buenas, Colbún, San Javier,
            Cauquenes, Chanco y Pelluhue.
          </p>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-1 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} La Vitrina · Maule Sur, Chile</span>
          <span>El Maule Sur tiene talento. Hagámoslo visible.</span>
        </div>
      </div>
    </footer>
  );
}
