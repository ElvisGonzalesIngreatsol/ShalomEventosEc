"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { Star, Quote, Loader2, CheckCircle2, ChevronDown, ChevronUp, MessageSquare, Copy, ExternalLink } from "lucide-react"
import { fetchApprovedTestimonials, submitTestimonial } from "@/lib/data"
import { isFirebaseConfigured } from "@/lib/firebase"
import type { Testimonial } from "@/lib/types"
import { cn } from "@/lib/utils"
import { site } from "@/lib/site"

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
    </svg>
  )
}

const eventTypes = ["Boda", "XV Años", "Cumpleaños", "Corporativo", "Otro"]

export function Testimonials() {
  const { data, isLoading } = useSWR<Testimonial[]>("testimonials-approved", fetchApprovedTestimonials)
  const [showAll, setShowAll] = useState(false)

  // Asegurar que se ordenen siempre los más recientes primero
  const sortedTestimonials = useMemo(() => {
    if (!data) return []
    return [...data].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  }, [data])

  // Mostrar los 4 últimos o todos al presionar el botón
  const displayedTestimonials = showAll ? sortedTestimonials : sortedTestimonials.slice(0, 4)

  return (
    <section id="opiniones" className="bg-primary/[0.03]">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">
            Opiniones
          </span>
          <h2 className="mt-3 text-balance font-serif text-3xl font-semibold leading-tight text-foreground lg:text-4xl">
            Lo que dicen quienes celebraron con nosotros
          </h2>

          <div className="mt-4 flex items-center justify-center">
            <a
              href={site.googleMapsReview}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-foreground shadow-xs transition-all hover:border-primary/40 hover:bg-muted hover:scale-[1.02]"
            >
              <GoogleIcon className="size-3.5" />
              <span>Ver y calificar en Google Maps</span>
              <div className="flex text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3 fill-current" />
                ))}
              </div>
              <ExternalLink className="size-3 text-muted-foreground" />
            </a>
          </div>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          {/* List */}
          <div>
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              </div>
            ) : !data || data.length === 0 ? (
              <p className="py-16 text-center text-muted-foreground">
                Aún no hay opiniones. ¡Sé el primero en compartir tu experiencia!
              </p>
            ) : (
              <div>
                <div className="grid gap-5 sm:grid-cols-2">
                  {displayedTestimonials.map((t) => (
                    <figure
                      key={t.id}
                      className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-xs transition-shadow hover:shadow-md"
                    >
                      <Quote className="size-7 text-accent" />
                      <div className="mt-3 flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "size-4",
                              i < t.rating
                                ? "fill-accent text-accent"
                                : "fill-muted text-muted",
                            )}
                          />
                        ))}
                      </div>
                      <blockquote className="mt-3 flex-1 text-pretty leading-relaxed text-foreground/85">
                        &ldquo;{t.message}&rdquo;
                      </blockquote>
                      <figcaption className="mt-5 border-t border-border pt-4">
                        <p className="font-semibold text-foreground">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.eventType}</p>
                      </figcaption>
                    </figure>
                  ))}
                </div>

                {sortedTestimonials.length > 4 && (
                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setShowAll(!showAll)}
                      className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-xs transition-all hover:border-primary/40 hover:bg-muted/80 hover:shadow-md"
                    >
                      {showAll ? (
                        <>
                          <span>Mostrar menos</span>
                          <ChevronUp className="size-4 text-accent transition-transform group-hover:-translate-y-0.5" />
                        </>
                      ) : (
                        <>
                          <MessageSquare className="size-4 text-accent" />
                          <span>Ver todos los comentarios ({sortedTestimonials.length})</span>
                          <ChevronDown className="size-4 text-accent transition-transform group-hover:translate-y-0.5" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form */}
          <TestimonialForm />
        </div>
      </div>
    </section>
  )
}

function TestimonialForm() {
  const [name, setName] = useState("")
  const [eventType, setEventType] = useState(eventTypes[0])
  const [rating, setRating] = useState(5)
  const [hover, setHover] = useState(0)
  const [message, setMessage] = useState("")
  const [submittedMessage, setSubmittedMessage] = useState("")
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return
    const textToSend = message.trim()
    setStatus("sending")
    setError("")
    try {
      await submitTestimonial({ name: name.trim(), eventType, rating, message: textToSend })
      setSubmittedMessage(textToSend)
      setStatus("done")
      setName("")
      setMessage("")
      setRating(5)
      setCopied(false)
    } catch (err) {
      setStatus("error")
      setError(err instanceof Error ? err.message : "No se pudo enviar tu opinión.")
    }
  }

  const handleCopyAndOpenGoogle = async () => {
    try {
      await navigator.clipboard.writeText(submittedMessage)
      setCopied(true)
    } catch {
      // Fallback
    }
    window.open(site.googleMapsReview, "_blank", "noopener,noreferrer")
  }

  if (status === "done") {
    return (
      <div className="flex h-fit flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="size-7" />
        </div>
        <h3 className="mt-3 font-serif text-xl font-semibold text-foreground">¡Gracias por tu opinión!</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Tu mensaje fue recibido y aparecerá publicado en nuestra web tras la moderación.
        </p>

        {/* Tarjeta para Google Maps */}
        <div className="mt-5 w-full rounded-2xl border border-accent/30 bg-accent/5 p-4 text-left">
          <div className="flex items-center gap-2">
            <GoogleIcon className="size-5 shrink-0" />
            <p className="text-xs font-bold text-foreground">¿Nos apoyas en Google Maps?</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Copia tu mensaje con un solo clic y déjanos tu calificación de 5 estrellas en nuestra ficha oficial de Google Maps.
          </p>

          <button
            type="button"
            onClick={handleCopyAndOpenGoogle}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs transition-transform hover:scale-[1.02]"
          >
            <Copy className="size-4" />
            {copied ? "¡Copiado! Ahora pégalo en Google Maps" : "Copiar opinión y abrir Google Maps ⭐"}
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setStatus("idle")
            setCopied(false)
          }}
          className="mt-5 rounded-full border border-border px-5 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          Escribir otra opinión
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="h-fit rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24"
    >
      <h3 className="font-serif text-xl font-semibold text-foreground">Deja tu opinión</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Cuéntanos cómo fue tu experiencia en Shalom.
      </p>

      {!isFirebaseConfigured && (
        <p className="mt-4 rounded-lg bg-accent/15 px-3 py-2 text-xs text-accent-foreground">
          Conecta Firebase para recibir y guardar las opiniones reales.
        </p>
      )}

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="t-name" className="mb-1.5 block text-sm font-medium text-foreground">
            Tu nombre
          </label>
          <input
            id="t-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            placeholder="Ej. María Fernández"
          />
        </div>

        <div>
          <label htmlFor="t-type" className="mb-1.5 block text-sm font-medium text-foreground">
            Tipo de evento
          </label>
          <select
            id="t-type"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          >
            {eventTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-foreground">Calificación</span>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const value = i + 1
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHover(value)}
                  onMouseLeave={() => setHover(0)}
                  aria-label={`${value} estrellas`}
                  className="p-0.5"
                >
                  <Star
                    className={cn(
                      "size-6 transition-colors",
                      value <= (hover || rating)
                        ? "fill-accent text-accent"
                        : "fill-muted text-muted",
                    )}
                  />
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label htmlFor="t-msg" className="mb-1.5 block text-sm font-medium text-foreground">
            Tu mensaje
          </label>
          <textarea
            id="t-msg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={4}
            className="w-full resize-none rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            placeholder="Escribe aquí tu experiencia..."
          />
        </div>

        {status === "error" && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={status === "sending"}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {status === "sending" && <Loader2 className="size-4 animate-spin" />}
          Enviar opinión
        </button>
      </div>
    </form>
  )
}
