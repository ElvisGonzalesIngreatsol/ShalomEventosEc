"use client"

import useSWR from "swr"
import Image from "next/image"
import { site, navLinks } from "@/lib/site"
import { fetchContactChannels } from "@/lib/data"
import { ContactIcon } from "@/components/contact-icon"
import type { ContactChannel } from "@/lib/types"
import { defaultContactChannels } from "@/lib/sample-data"

export function SiteFooter() {
  const { data: channels = [] } = useSWR<ContactChannel[]>(
    "contact-channels",
    fetchContactChannels,
    {
      fallbackData: defaultContactChannels.filter((c) => c.active),
    }
  )

  // Canales sociales activos
  const socialChannels = channels.filter((c) =>
    ["instagram", "facebook", "tiktok", "youtube", "whatsapp", "telegram"].includes(c.icon)
  )

  // Teléfono y Correo si están en los canales
  const phoneChannel = channels.find((c) => c.icon === "phone")
  const mailChannel = channels.find((c) => c.icon === "mail")

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Image
              src="/images/logo-shalom-white.png"
              alt="Shalom Recepciones & Eventos"
              width={320}
              height={120}
              className="h-20 md:h-24 w-auto object-contain"
            />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-primary-foreground/80">
              {site.tagline}.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-foreground/70">
              Navegación
            </h3>
            <ul className="mt-4 space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-primary-foreground/85 transition-colors hover:text-accent"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-foreground/70">
              Contacto
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/85">
              <li>
                {phoneChannel?.url ? (
                  <a href={phoneChannel.url} className="hover:text-accent transition-colors">
                    {phoneChannel.value || site.phone}
                  </a>
                ) : (
                  site.phone
                )}
              </li>
              <li>
                {mailChannel?.url ? (
                  <a href={mailChannel.url} className="hover:text-accent transition-colors">
                    {mailChannel.value || site.email}
                  </a>
                ) : (
                  site.email
                )}
              </li>
              <li>{site.address}</li>
            </ul>

            {/* Social channels */}
            <div className="mt-5 flex flex-wrap gap-2.5">
              {socialChannels.length > 0 ? (
                socialChannels.map((c) => (
                  <a
                    key={c.id}
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={c.title}
                    title={c.title}
                    className="flex size-10 items-center justify-center rounded-full bg-primary-foreground/10 transition-transform hover:scale-110 hover:bg-accent hover:text-accent-foreground"
                  >
                    <ContactIcon icon={c.icon} className="size-5" />
                  </a>
                ))
              ) : (
                <>
                  <a
                    href={site.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="flex size-10 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <ContactIcon icon="instagram" className="size-5" />
                  </a>
                  <a
                    href={site.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="flex size-10 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <ContactIcon icon="facebook" className="size-5" />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-primary-foreground/15 pt-6 text-sm text-primary-foreground/70 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name}. Todos los derechos reservados.
          </p>
          <a href="/admin" className="transition-colors hover:text-accent">
            Acceso administrador
          </a>
        </div>
      </div>
    </footer>
  )
}
