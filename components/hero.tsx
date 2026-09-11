"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import useSWR from "swr"
import { site, whatsappUrl } from "@/lib/site"
import { fetchHeroSlides } from "@/lib/data"
import type { HeroSlide } from "@/lib/types"

const fallbackSlides: HeroSlide[] = [
  { id: "fallback", title: "Shalom Recepciones & Eventos", subtitle: "Bodas · XV Años · Corporativos", url: "/images/hero-salon.png", active: true, order: 0 },
]

export function Hero() {
  const { data } = useSWR<HeroSlide[]>("hero-slides", fetchHeroSlides)
  const slides = data && data.length > 0 ? data : fallbackSlides
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (slides.length < 2) return
    const timer = window.setInterval(() => setCurrent((value) => (value + 1) % slides.length), 6000)
    return () => window.clearInterval(timer)
  }, [slides.length])

  const slide = slides[current] ?? slides[0]

  return (
    <section id="inicio" className="relative min-h-[92vh] w-full overflow-hidden bg-foreground">
      {slides.map((item, index) => (
        <img key={item.id} src={item.url} alt={item.title} className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 ${index === current ? "opacity-100" : "opacity-0"}`} />
      ))}
      <div className="absolute inset-0 bg-foreground/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/65 via-transparent to-foreground/90" />
      <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-end px-5 pb-16 pt-32 lg:px-8 lg:pb-24">
        <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-background/30 bg-background/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-background backdrop-blur-sm">
          {slide.subtitle || "Bodas · XV Años · Corporativos"}
        </span>
        <h1 className="max-w-3xl text-balance font-serif text-4xl font-semibold leading-[1.05] text-background sm:text-5xl lg:text-7xl">{site.tagline}</h1>
        <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-background/85 lg:text-lg">En {site.name} transformamos tus celebraciones en experiencias memorables, con un espacio elegante y un equipo que cuida cada detalle.</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <a href={whatsappUrl("Hola, me gustaría cotizar un evento en Shalom.")} target="_blank" rel="noopener noreferrer" className="rounded-full bg-accent px-7 py-3.5 text-center text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.03]">Reserva tu fecha</a>
          <a href="#galeria" className="rounded-full border border-background/40 bg-background/10 px-7 py-3.5 text-center text-sm font-semibold text-background backdrop-blur-sm transition-colors hover:bg-background/20">Ver eventos realizados</a>
        </div>
        {slides.length > 1 && (
          <div className="mt-8 flex items-center gap-3">
            <button type="button" aria-label="Imagen anterior" onClick={() => setCurrent((current - 1 + slides.length) % slides.length)} className="rounded-full border border-background/35 p-2 text-background hover:bg-background/15"><ChevronLeft className="size-4" /></button>
            <div className="flex gap-1.5">{slides.map((item, index) => <button key={item.id} type="button" aria-label={`Ver imagen ${index + 1}`} onClick={() => setCurrent(index)} className={`h-1.5 rounded-full transition-all ${index === current ? "w-8 bg-accent" : "w-2 bg-background/50"}`} />)}</div>
            <button type="button" aria-label="Siguiente imagen" onClick={() => setCurrent((current + 1) % slides.length)} className="rounded-full border border-background/35 p-2 text-background hover:bg-background/15"><ChevronRight className="size-4" /></button>
          </div>
        )}
      </div>
    </section>
  )
}

export const heroFetcher = fetchHeroSlides
    
