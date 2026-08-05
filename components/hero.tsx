import { site, whatsappUrl } from "@/lib/site"

export function Hero() {
  return (
    <section id="inicio" className="relative min-h-[92vh] w-full overflow-hidden">
      <img
        src="/images/hero-salon.png"
        alt="Salón de eventos Shalom decorado para una recepción"
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/45 to-foreground/80" />

      <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-end px-5 pb-16 pt-32 lg:px-8 lg:pb-24">
        <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-background/30 bg-background/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-background backdrop-blur-sm">
          Bodas · XV Años · Corporativos
        </span>
        <h1 className="max-w-3xl text-balance font-serif text-4xl font-semibold leading-[1.05] text-background sm:text-5xl lg:text-7xl">
          {site.tagline}
        </h1>
        <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-background/85 lg:text-lg">
          En {site.name} transformamos tus celebraciones en experiencias memorables, con un
          espacio elegante y un equipo que cuida cada detalle.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <a
            href={whatsappUrl("Hola, me gustaría cotizar un evento en Shalom.")}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-accent px-7 py-3.5 text-center text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.03]"
          >
            Reserva tu fecha
          </a>
          <a
            href="#galeria"
            className="rounded-full border border-background/40 bg-background/10 px-7 py-3.5 text-center text-sm font-semibold text-background backdrop-blur-sm transition-colors hover:bg-background/20"
          >
            Ver eventos realizados
          </a>
        </div>
      </div>
    </section>
  )
}
