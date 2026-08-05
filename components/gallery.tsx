"use client"

import { useCallback, useEffect, useState } from "react"
import useSWR from "swr"
import useEmblaCarousel from "embla-carousel-react"
import { X, ChevronLeft, ChevronRight, Download, ImageOff, Loader2, ArrowRight, Images } from "lucide-react"
import { fetchEvents } from "@/lib/data"
import type { GalleryEvent } from "@/lib/types"
import Link from "next/link"

async function downloadImage(url: string, filename: string) {
  try {
    const res = await fetch(url, { mode: "cors" })
    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = objectUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(objectUrl)
  } catch {
    window.open(url, "_blank")
  }
}

export function Gallery() {
  const { data: events, isLoading } = useSWR<GalleryEvent[]>("events", fetchEvents)
  const [active, setActive] = useState<GalleryEvent | null>(null)

  // Only show the 3 most recent events on the homepage
  const recent = events?.slice(0, 3) ?? []

  return (
    <section id="galeria" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
      <div className="flex flex-col items-center text-center md:flex-row md:items-end md:justify-between md:text-left">
        <div className="max-w-xl">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">
            Galería de eventos
          </span>
          <h2 className="mt-3 text-balance font-serif text-3xl font-semibold leading-tight text-foreground lg:text-4xl">
            Revive cada celebración
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Momentos capturados en Shalom. Explora los álbumes y descarga las fotos que más te gusten.
          </p>
        </div>
        <Link
          href="/eventos"
          className="mt-6 flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted md:mt-0 md:shrink-0"
        >
          Ver todos los eventos
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-16 flex justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : recent.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-muted-foreground">
          <ImageOff className="size-10" />
          <p>Aún no hay eventos publicados.</p>
        </div>
      ) : (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((event) => (
            <AlbumCard key={event.id} event={event} onClick={() => setActive(event)} />
          ))}
        </div>
      )}

      {/* CTA to full events page */}
      {(events?.length ?? 0) > 0 && (
        <div className="mt-12 flex justify-center">
          <Link
            href="/eventos"
            className="flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.03]"
          >
            <Images className="size-4" />
            Explorar todos los álbumes
          </Link>
        </div>
      )}

      {active && (
        <Lightbox event={active} onClose={() => setActive(null)} />
      )}
    </section>
  )
}

export function AlbumCard({
  event,
  onClick,
}: {
  event: GalleryEvent
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={event.coverUrl || "/placeholder.svg"}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* photo count badge top-right */}
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-foreground/60 px-2.5 py-1 text-xs font-semibold text-background backdrop-blur-sm">
          <Images className="size-3" />
          {event.photos.length} fotos
        </span>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <span className="inline-block rounded-full bg-accent/90 px-3 py-1 text-xs font-semibold text-accent-foreground">
          {event.category}
        </span>
        <h3 className="mt-2 font-serif text-xl font-semibold leading-snug text-background">
          {event.title}
        </h3>
        <p className="mt-0.5 text-sm text-background/75">{event.date}</p>
      </div>
      {/* hover overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground">
          Abrir álbum
        </span>
      </div>
    </button>
  )
}

function Lightbox({ event, onClose }: { event: GalleryEvent; onClose: () => void }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selected, setSelected] = useState(0)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap())
    emblaApi.on("select", onSelect)
    onSelect()
    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") scrollPrev()
      if (e.key === "ArrowRight") scrollNext()
    }
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [onClose, scrollPrev, scrollNext])

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-foreground/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos de ${event.title}`}
    >
      <div className="flex items-center justify-between px-5 py-4 lg:px-8">
        <div>
          <h3 className="font-serif text-lg font-semibold text-background">{event.title}</h3>
          <p className="text-sm text-background/70">
            {selected + 1} / {event.photos.length}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar galería"
          className="rounded-full bg-background/10 p-2 text-background transition-colors hover:bg-background/20"
        >
          <X className="size-6" />
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div className="h-full" ref={emblaRef}>
          <div className="flex h-full">
            {event.photos.map((photo) => (
              <div key={photo.id} className="flex h-full min-w-0 flex-[0_0_100%] items-center justify-center p-4">
                <img
                  src={photo.url || "/placeholder.svg"}
                  alt={event.title}
                  className="max-h-full max-w-full rounded-lg object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {event.photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Foto anterior"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/10 p-2.5 text-background transition-colors hover:bg-background/25"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Foto siguiente"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/10 p-2.5 text-background transition-colors hover:bg-background/25"
            >
              <ChevronRight className="size-6" />
            </button>
          </>
        )}
      </div>

      <div className="flex items-center justify-center px-5 py-5">
        <button
          type="button"
          onClick={() =>
            downloadImage(
              event.photos[selected].url,
              `${event.id}-${selected + 1}.jpg`,
            )
          }
          className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.03]"
        >
          <Download className="size-4" />
          Descargar esta foto
        </button>
      </div>
    </div>
  )
}
