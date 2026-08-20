import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Radio, Target, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre La Vitrina — Quiénes somos | Maule Sur" },
      {
        name: "description",
        content:
          "La Vitrina es una comunidad que visibiliza emprendedores del Maule Sur, conecta personas y promueve la colaboración local.",
      },
      { property: "og:title", content: "Sobre La Vitrina" },
      { property: "og:description", content: "Nos mostramos. Nos conectamos. Crecemos juntos." },
    ],
  }),
  component: SobrePage,
});

const VALUES = [
  { icon: Users, title: "Comunidad", text: "Creemos que juntos llegamos más lejos que compitiendo solos." },
  { icon: Heart, title: "Cercanía", text: "Detrás de cada emprendimiento hay una persona y una historia real." },
  { icon: Target, title: "Visibilidad", text: "Damos vitrina digital a quienes trabajan cada día en su territorio." },
  { icon: Radio, title: "Difusión", text: "Sumamos radio y redes para amplificar las voces del Maule Sur." },
];

function SobrePage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Sobre La Vitrina</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Nos mostramos. Nos conectamos. Crecemos juntos.
        </p>
      </header>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-semibold">Nuestra misión</h2>
          <p className="mt-3 text-foreground/85">
            Visibilizar y conectar a los emprendedores del Maule Sur mediante una plataforma digital y un espacio
            radial, facilitando que las personas encuentren productos y servicios locales, y que los emprendimientos
            encuentren clientes, aliados y oportunidades.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-secondary/40 p-6">
          <h2 className="font-display text-xl font-semibold">Nuestra visión</h2>
          <p className="mt-3 text-foreground/85">
            Ser la red de referencia del emprendimiento en el Maule Sur: un lugar donde cada negocio tiene un perfil
            digno, cada historia se escucha y cada colaboración fortalece la economía local.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold">Nuestros valores</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <article key={v.title} className="rounded-2xl border border-border bg-card p-5">
              <v.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-medium">{v.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{v.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold">Cómo funciona</h2>
        <ol className="mt-4 space-y-3">
          {[
            "Postulas tu emprendimiento con tus datos, fotos y descripción.",
            "El equipo revisa y aprueba el perfil para asegurar calidad y pertinencia territorial.",
            "Tu perfil se publica en el directorio con contacto directo por WhatsApp y redes.",
            "Participas de la comunidad: eventos, colaboración y espacio radial.",
          ].map((step, i) => (
            <li key={step} className="flex gap-3 rounded-xl border border-border bg-card p-4">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <span className="text-sm text-foreground/85">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/sumate">Postular mi emprendimiento</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/emprendedores">Explorar el directorio</Link>
        </Button>
      </div>
    </div>
  );
}
