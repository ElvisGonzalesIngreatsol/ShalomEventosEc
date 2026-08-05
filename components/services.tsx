import { UtensilsCrossed, Music, Sparkles, Camera, Users, Wine } from "lucide-react"
import { whatsappUrl } from "@/lib/site"

const services = [
  {
    icon: UtensilsCrossed,
    title: "Banquete gourmet",
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
    name: "Esencial",
    price: "Consultar",
    highlight: false,
    features: ["Salón por 6 horas", "Montaje básico", "Menú de 2 tiempos", "Mobiliario incluido"],
  },
  {
    name: "Celebración",
    price: "Consultar",
    highlight: true,
    features: [
      "Salón por 8 horas",
      "Decoración temática",
      "Menú de 3 tiempos",
      "Audio e iluminación",
      "Coordinador dedicado",
    ],
  },
  {
    name: "Premium",
    price: "Consultar",
    highlight: false,
    features: [
      "Salón sin límite de horario",
      "Decoración de lujo",
      "Menú de gala + barra libre",
      "Cobertura fotográfica",
      "Coordinación total",
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
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className={
                  pkg.highlight
                    ? "relative rounded-3xl border-2 border-primary bg-card p-8 shadow-lg"
                    : "relative rounded-3xl border border-border bg-card p-8"
                }
              >
                {pkg.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
                    Más elegido
                  </span>
                )}
                <h4 className="font-serif text-2xl font-semibold text-foreground">{pkg.name}</h4>
                <p className="mt-2 text-sm text-muted-foreground">Desde</p>
                <p className="font-serif text-3xl font-semibold text-primary">{pkg.price}</p>
                <ul className="mt-6 space-y-3">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground/80">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={whatsappUrl(`Hola, me interesa el paquete ${pkg.name} de Shalom.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    pkg.highlight
                      ? "mt-8 block rounded-full bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
                      : "mt-8 block rounded-full border border-border px-6 py-3 text-center text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                  }
                >
                  Solicitar información
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
