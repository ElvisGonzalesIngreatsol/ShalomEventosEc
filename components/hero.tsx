"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import useSWR from "swr"
import { site, whatsappUrl } from "@/lib/site"
import { fetchHeroSlides } from "@/lib/data"
import type { HeroSlide } from "@/lib/types"

const fallbackSlides: HeroSlide[] = [
  {
    id: "fallback-1",
    title: "Shalom Recepciones & Eventos",
    subtitle: "Bodas · XV Años · Cumpleaños · Corporativos",
    url: "/images/hero-salon.png",
    active: true,
    order: 0,
  },
  {
    id: "fallback-2",
    title: "Bodas Mágicas",
    subtitle: "Bodas · XV Años · Cumpleaños · Corporativos",
    url: "/images/event-wedding.png",
    active: true,
    order: 1,
  },
  {
    id: "fallback-3",
    title: "Quinceañeras Inolvidables",
    subtitle: "Bodas · XV Años · Cumpleaños · Corporativos",
    url: "/images/event-xv.png",
    active: true,
    order: 2,
  },
  {
    id: "fallback-4",
    title: "Eventos Exclusivos",
    subtitle: "Bodas · XV Años · Cumpleaños · Corporativos",
    url: "/images/about-venue.png",
    active: true,
    order: 3,
  },
]

export function Hero() {
  const { data } = useSWR<HeroSlide[]>("hero-slides", fetchHeroSlides)
  const slides = data && data.length > 0 ? data : fallbackSlides
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (slides.length < 2) return
    const timer = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5500)
    return () => window.clearInterval(timer)
  }, [slides.length])

  const slide = slides[current] ?? slides[0]

  return (
    <section id="inicio" className="relative min-h-[92vh] w-full overflow-hidden bg-black text-white">
      {/* Carrusel de imágenes de fondo con transición suave */}
      {slides.map((item, index) => {
        const isActive = index === current
        return (
          <div
            key={item.id}
            className={`absolute inset-0 size-full transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <img
              src={item.url}
              alt={item.title}
              className={`size-full object-cover transition-transform duration-7000 ease-out ${
                isActive ? "scale-105" : "scale-100"
              }`}
            />
          </div>
        )
      })}

      {/* Capas de opacidad para que el texto resalte nítido y legible */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[0.5px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/70" />

      {/* Contenido en primer plano (siempre arriba de las fotos) */}
      <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-end px-5 pb-16 pt-32 lg:px-8 lg:pb-24">
        <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-white backdrop-blur-md shadow-sm">
          <Sparkles className="size-3.5 text-accent" />
          {slide.subtitle || "Bodas · XV Años · Cumpleaños · Corporativos"}
        </span>

        <h1 className="max-w-3xl text-balance font-serif text-4xl font-semibold leading-[1.05] text-white sm:text-5xl lg:text-7xl drop-shadow-md">
          {site.tagline}
        </h1>

        <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-white/90 drop-shadow sm:text-lg">
          En {site.name} transformamos tus celebraciones en experiencias memorables, con un espacio elegante, tecnología de iluminación y un equipo que cuida cada detalle.
        </p>

        {/* Botones de acción */}
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <a
            href={whatsappUrl("Hola, me gustaría cotizar un evento en Shalom.")}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-accent px-7 py-3.5 text-center text-sm font-semibold text-accent-foreground shadow-lg transition-transform hover:scale-[1.03]"
          >
            Reserva tu fecha
          </a>
          <a
            href="#galeria"
            className="rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-center text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
          >
            Ver eventos realizados
          </a>
        </div>

        {/* Controles del carrusel */}
        {slides.length > 1 && (
          <div className="mt-10 flex items-center gap-3">
            <button
              type="button"
              aria-label="Imagen anterior"
              onClick={() => setCurrent((current - 1 + slides.length) % slides.length)}
              className="rounded-full border border-white/30 bg-black/40 p-2 text-white transition-colors hover:bg-white/20"
            >
              <ChevronLeft className="size-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {slides.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Ver imagen ${index + 1}`}
                  onClick={() => setCurrent(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === current ? "w-8 bg-accent" : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              aria-label="Siguiente imagen"
              onClick={() => setCurrent((current + 1) % slides.length)}
              className="rounded-full border border-white/30 bg-black/40 p-2 text-white transition-colors hover:bg-white/20"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export const heroFetcher = fetchHeroSlides
