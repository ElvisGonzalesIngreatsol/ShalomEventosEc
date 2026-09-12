const stats = [
  { value: "+15", label: "Años de experiencia" },
  { value: "+1000", label: "Eventos realizados" },
  { value: "200", label: "Capacidad de invitados" },
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
              Shalom Recepciones & Eventos es un salón de eventos dedicado a hacer realidad
              los sueños de nuestros clientes. Somos una empresa que se esfuerza por crear
              momentos inolvidables para aquellos que nos eligen para celebrar sus ocasiones especiales.
            </p>
            <p>
              Nuestro equipo de expertos en planificación y organización de eventos trabaja
              incansablemente para ofrecer una experiencia única y personalizada para cada uno de nuestros
              clientes. Ya sea que esté planeando una boda, un cumpleaños, una graduación o cualquier otra
              celebración, en Shalom Recepciones & Eventos, nos aseguramos de que cada detalle se maneje
              con profesionalismo, dedicación y creatividad. ¡Permítanos ser parte de su próxima
              celebración y hacerla memorable para usted y sus invitados!.
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
