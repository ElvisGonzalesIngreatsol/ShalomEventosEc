"use client"

import { useActionState, useEffect, useRef } from "react"
import useSWR from "swr"
import { Mail, Phone, MapPin, Clock, MessageCircle, Loader2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react"
import { site, whatsappUrl } from "@/lib/site"
import { sendContact } from "@/app/actions/send-contact"
import { fetchContactChannels } from "@/lib/data"
import { ContactIcon } from "@/components/contact-icon"
import type { ContactChannel } from "@/lib/types"

import { defaultContactChannels } from "@/lib/sample-data"

export function Contact() {
  const [state, formAction, isPending] = useActionState(sendContact, null)
  const formRef = useRef<HTMLFormElement>(null)

  const { data: channels = [] } = useSWR<ContactChannel[]>(
    "contact-channels",
    fetchContactChannels,
    {
      fallbackData: defaultContactChannels.filter((c) => c.active),
    }
  )

  // Limpia el formulario cuando el envío es exitoso
  useEffect(() => {
    if (state?.ok) formRef.current?.reset()
  }, [state])

  // Encuentra si hay canal de WhatsApp configurado
  const whatsappChannel = channels.find((c) => c.icon === "whatsapp" && c.active)
  const whatsappLink = whatsappChannel?.url || whatsappUrl("Hola, me gustaría más información sobre Shalom.")

  return (
    <section id="contacto" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">
            Contacto
          </span>
          <h2 className="mt-3 text-balance font-serif text-3xl font-semibold leading-tight text-foreground lg:text-4xl">
            Hagamos realidad tu próximo evento
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Escríbenos por WhatsApp para una respuesta inmediata o déjanos tus datos y te
            contactamos a la brevedad.
          </p>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.03] shadow-sm"
          >
            <ContactIcon icon="whatsapp" className="size-5" />
            Escribir por WhatsApp
          </a>

          {/* Canales y Redes dinámicos administrables */}
          <div className="mt-10">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Medios de atención directa y redes
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {channels.map((ch) => (
                <a
                  key={ch.id}
                  href={ch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3.5 rounded-xl border border-border bg-card/60 p-3.5 transition-all hover:border-primary/40 hover:bg-card hover:shadow-xs"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
                    <ContactIcon icon={ch.icon} className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {ch.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {ch.value || ch.url.replace(/^https?:\/\/(www\.)?/, "")}
                    </p>
                  </div>
                  <ExternalLink className="size-3.5 shrink-0 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>

            {/* Horario y Ubicación fija */}
            <div className="mt-6 flex flex-wrap gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-primary" />
                {site.address}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-primary" />
                {site.hours}
              </span>
            </div>
          </div>
        </div>

        {/* Contact form (envía correo real vía Resend) */}
        <form ref={formRef} action={formAction} className="rounded-2xl border border-border bg-card p-6 lg:p-8">
          <h3 className="font-serif text-xl font-semibold text-foreground">Envíanos un mensaje</h3>
          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="c-name" className="mb-1.5 block text-sm font-medium text-foreground">
                Nombre
              </label>
              <input
                id="c-name"
                name="name"
                required
                disabled={isPending}
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:opacity-60"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label htmlFor="c-email" className="mb-1.5 block text-sm font-medium text-foreground">
                Correo electrónico
              </label>
              <input
                id="c-email"
                name="email"
                type="email"
                required
                disabled={isPending}
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:opacity-60"
                placeholder="tucorreo@ejemplo.com"
              />
            </div>
            <div>
              <label htmlFor="c-msg" className="mb-1.5 block text-sm font-medium text-foreground">
                Mensaje
              </label>
              <textarea
                id="c-msg"
                name="message"
                required
                rows={5}
                disabled={isPending}
                className="w-full resize-none rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:opacity-60"
                placeholder="Cuéntanos sobre tu evento (fecha, tipo, número de invitados)..."
              />
            </div>

            {state?.ok && (
              <div className="flex items-start gap-2 rounded-lg bg-primary/10 px-3.5 py-3 text-sm text-primary">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                <span>¡Mensaje enviado! Te responderemos muy pronto.</span>
              </div>
            )}
            {state && !state.ok && state.error && (
              <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3.5 py-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar mensaje"
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
