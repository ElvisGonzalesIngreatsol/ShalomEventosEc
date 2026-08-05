"use client"

import { useState } from "react"
import useSWR from "swr"
import { Star, Quote, Loader2, CheckCircle2 } from "lucide-react"
import { fetchApprovedTestimonials, submitTestimonial } from "@/lib/data"
import { isFirebaseConfigured } from "@/lib/firebase"
import type { Testimonial } from "@/lib/types"
import { cn } from "@/lib/utils"

const eventTypes = ["Boda", "XV Años", "Bautizo", "Corporativo", "Otro"]

export function Testimonials() {
  const { data, isLoading } = useSWR<Testimonial[]>("testimonials-approved", fetchApprovedTestimonials)

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
              <div className="grid gap-5 sm:grid-cols-2">
                {data.map((t) => (
                  <figure
                    key={t.id}
                    className="flex flex-col rounded-2xl border border-border bg-card p-6"
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
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return
    setStatus("sending")
    setError("")
    try {
      await submitTestimonial({ name: name.trim(), eventType, rating, message: message.trim() })
      setStatus("done")
      setName("")
      setMessage("")
      setRating(5)
    } catch (err) {
      setStatus("error")
      setError(err instanceof Error ? err.message : "No se pudo enviar tu opinión.")
    }
  }

  if (status === "done") {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center">
        <CheckCircle2 className="size-12 text-primary" />
        <h3 className="mt-4 font-serif text-xl font-semibold text-foreground">¡Gracias!</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Tu opinión fue enviada y aparecerá publicada una vez que la revisemos.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
        >
          Escribir otra
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
