import { UtensilsCrossed, Music, Sparkles, Camera, Users, Wine, Check } from "lucide-react"
import { whatsappUrl } from "@/lib/site"

const services = [
  {
    icon: UtensilsCrossed,
    title: "Catering y Banquetes",
    description: "Menús personalizados de tres tiempos, buffet o cena de gala a tu elección.",
  },
  {
    icon: Sparkles,
    title: "Decoración temática",
    description: "Ambientación floral, iluminación y montaje adaptado al estilo de tu evento.",
  },
  {
    icon: Music,
    title: "Audio e iluminación",
    description: "Equipo profesional de sonido, pista de baile y show de luces incluido.",
  },
  {
    icon: Wine,
    title: "Barra de bebidas",
    description: "Paquetes de barra libre, coctelería y servicio de meseros capacitados.",
  },
  {
    icon: Camera,
    title: "Cobertura de fotos",
    description: "Fotografía del evento que luego podrás revivir y descargar desde esta web.",
  },
  {
    icon: Users,
    title: "Coordinación total",
    description: "Un coordinador dedicado que organiza cada detalle el día de tu evento.",
  },
]

const packages = [
  {
    name: "Básico",
    price: "Consultar",
    highlight: false,
    badge: null,
    features: [
      "Salón por 6 horas",
      "Decoración básica",
      "Menú con 1 proteína",
      "Mobiliario",
      "Meseros",
      "Catering",
    ],
  },
  {
    name: "Estándar",
    price: "Consultar",
    highlight: true,
    badge: "Más elegido",
    features: [
      "Salón por 7 horas",
      "Decoración 2 estaciones",
      "Menú con 2 proteína",
      "Mobiliario",
      "Meseros",
      "Catering",
      "Dj - Audio - Iluminación",
    ],
  },
  {
    name: "Premium",
    price: "Consultar",
    highlight: false,
    badge: "Recomendado",
    features: [
      "Salón por 8 horas",
      "Decoración de 3 estaciones",
      "Menú con 2 proteína y postre",
      "Mobiliario",
      "Meseros",
      "Catering",
      "Audio Iluminación",
      "Fotográfica y filmación",
    ],
  },
]

export function Services() {
  return (
    <section id="servicios" className="bg-secondary/50">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">
            Lo que ofrecemos
          </span>
          <h2 className="mt-3 text-balance font-serif text-3xl font-semibold leading-tight text-foreground lg:text-4xl">
            Todo lo que tu evento necesita, en un solo lugar
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Diseñamos cada servicio para que tu celebración sea perfecta de principio a fin.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div
              key={s.title}
              className="rounded-2xl border border-border bg-card p-7 transition-shadow hover:shadow-md"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="size-6" />
              </div>
              <h3 className="mt-5 font-serif text-xl font-semibold text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
            </div>
          ))}
        </div>

        {/* Packages */}
        <div className="mt-20">
          <h3 className="text-center font-serif text-2xl font-semibold text-foreground lg:text-3xl">
            Nuestros paquetes
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted-foreground">
            Opciones pensadas para ajustarse al tipo y magnitud de tu celebración.
          </p>

          <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:items-stretch">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className={
                  pkg.highlight
                    ? "group relative flex flex-col justify-between rounded-3xl border-2 border-primary bg-card p-8 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-2xl hover:ring-4 hover:ring-accent/25"
                    : "group relative flex flex-col justify-between rounded-3xl border-2 border-border/80 bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:ring-4 hover:ring-primary/20"
                }
              >
                {pkg.badge && (
                  <span
                    className={
                      pkg.highlight
                        ? "absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground shadow-sm transition-transform duration-300 group-hover:scale-105"
                        : "absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground shadow-sm transition-transform duration-300 group-hover:scale-105"
                    }
                  >
                    {pkg.badge}
                  </span>
                )}

                <div>
                  <h4 className="font-serif text-2xl font-semibold text-foreground transition-colors group-hover:text-primary">
                    {pkg.name}
                  </h4>
                  <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">Desde</p>
                  <p className="font-serif text-3xl font-semibold text-primary">{pkg.price}</p>

                  <div className="my-6 h-px w-full bg-border" />

                  <ul className="space-y-3">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/85">
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                          <Check className="size-3" strokeWidth={3} />
                        </span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <a
                    href={whatsappUrl(`Hola, me interesa el paquete ${pkg.name} de Shalom.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full rounded-full border-2 border-border/90 bg-card px-6 py-3.5 text-center text-sm font-semibold text-foreground shadow-sm transition-all duration-300 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:ring-4 hover:ring-primary/20 active:scale-[0.98]"
                  >
                    Solicitar información
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
