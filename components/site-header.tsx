"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { site, navLinks, whatsappUrl } from "@/lib/site"
import Image from "next/image"

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState<string>("")
  const pathname = usePathname()
  const solidHeader = pathname !== "/"

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24)

      // Detección de sección activa en la página principal
      if (pathname === "/") {
        const sections = ["contacto", "opiniones", "galeria", "servicios", "nosotros", "inicio"]
        const scrollPosition = window.scrollY + 140

        for (const id of sections) {
          const el = document.getElementById(id)
          if (el) {
            const top = el.offsetTop
            if (scrollPosition >= top) {
              setActiveSection(id)
              break
            }
          }
        }
      }
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [pathname])

  const isSolid = scrolled || solidHeader

  const getHref = (href: string) => {
    if (href.startsWith("#") && pathname !== "/") {
      return `/${href}`
    }
    return href
  }

  const isLinkActive = (href: string) => {
    // Si estamos en la página de galería (/eventos)
    if (pathname === "/eventos" || pathname.startsWith("/eventos")) {
      return href === "/eventos"
    }

    // Si estamos en la página principal, según el scroll
    if (pathname === "/") {
      if (href === "/eventos" && activeSection === "galeria") {
        return true
      }
      if (href === `#${activeSection}`) {
        return true
      }
    }

    return false
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        isSolid
          ? "border-b border-border bg-background/95 backdrop-blur-md shadow-xs"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={isSolid ? "/images/logo-shalom.png" : "/images/logo-shalom-white.png"}
            alt="Shalom Recepciones & Eventos"
            width={280}
            height={100}
            className="h-14 md:h-16 w-auto object-contain"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href)

            return (
              <Link
                key={link.href}
                href={getHref(link.href)}
                className={cn(
                  "group relative py-1 text-sm font-medium transition-colors",
                  active
                    ? "font-semibold text-accent"
                    : isSolid
                      ? "text-foreground/80 hover:text-accent"
                      : "text-white/90 hover:text-white",
                )}
              >
                <span>{link.label}</span>
                {/* Indicador visual activo */}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 h-0.5 w-full rounded-full transition-all duration-300",
                    active
                      ? "scale-x-100 bg-accent opacity-100"
                      : "scale-x-0 bg-accent/60 opacity-0 group-hover:scale-x-75 group-hover:opacity-100",
                  )}
                />
              </Link>
            )
          })}
        </nav>

        <div className="hidden md:block">
          <a
            href={whatsappUrl("Hola, me gustaría cotizar un evento en Shalom.")}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.03]"
          >
            Cotizar evento
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          className={cn(
            "rounded-md p-2 md:hidden",
            isSolid ? "text-foreground" : "text-white",
          )}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href)

              return (
                <Link
                  key={link.href}
                  href={getHref(link.href)}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-base font-medium transition-colors",
                    active
                      ? "bg-accent/15 font-semibold text-accent"
                      : "text-foreground/80 hover:bg-muted",
                  )}
                >
                  <span>{link.label}</span>
                  {active && <span className="size-2 rounded-full bg-accent" />}
                </Link>
              )
            })}
            <a
              href={whatsappUrl("Hola, me gustaría cotizar un evento en Shalom.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 rounded-full bg-accent px-5 py-3 text-center text-sm font-semibold text-accent-foreground"
            >
              Cotizar evento
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
