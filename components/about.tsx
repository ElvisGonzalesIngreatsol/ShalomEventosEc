const stats = [
  { value: "+12", label: "Años de experiencia" },
  { value: "+800", label: "Eventos realizados" },
  { value: "200", label: "Invitados de capacidad" },
]

export function About() {
  return (
    <section id="nosotros" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative">
          <img
            src="/images/about-venue.png"
            alt="Interior del salón de eventos Shalom"
            className="aspect-[4/5] w-full rounded-2xl object-cover"
          />
          <div className="absolute -bottom-6 -right-4 hidden rounded-2xl border border-border bg-card p-6 shadow-lg sm:block lg:-right-8">
            <p className="font-serif text-3xl font-semibold text-primary">Shalom</p>
            <p className="text-sm text-muted-foreground">Un espacio para celebrar</p>
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">
            Quiénes somos
          </span>
          <h2 className="mt-3 text-balance font-serif text-3xl font-semibold leading-tight text-foreground lg:text-4xl">
            Un salón pensado para tus momentos más importantes
          </h2>
          <div className="mt-6 space-y-4 text-pretty leading-relaxed text-muted-foreground">
            <p>
              Somos Shalom Recepciones & Eventos, un salón dedicado a hacer realidad
              celebraciones inolvidables. Desde bodas de ensueño hasta XV años, bautizos y
              eventos corporativos, ponemos a tu disposición un espacio elegante y versátil.
            </p>
            <p>
              Nuestro compromiso es cuidar cada detalle para que tú solo te ocupes de disfrutar.
              Contamos con un equipo experimentado, gastronomía de primer nivel y una atención
              cercana en cada paso de la organización.
            </p>
          </div>

          <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-8">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="font-serif text-3xl font-semibold text-primary lg:text-4xl">
                  {s.value}
                </dt>
                <dd className="mt-1 text-sm leading-snug text-muted-foreground">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
