"use client"

import { useCallback, useEffect, useState } from "react"
import useSWR from "swr"
import useEmblaCarousel from "embla-carousel-react"
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ImageOff,
  Loader2,
  Images,
  ArrowLeft,
  Search,
  FolderDown,
} from "lucide-react"
import { fetchEvents } from "@/lib/data"
import type { GalleryEvent } from "@/lib/types"
import { downloadImage, downloadAlbum } from "@/lib/download"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import Link from "next/link"

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

const CATEGORIES = ["Todos", "Boda", "XV Años", "Bautizo", "Corporativo", "Otro"]

export default function EventosPage() {
  const { data: events, isLoading } = useSWR<GalleryEvent[]>("events", fetchEvents)
  const [active, setActive] = useState<GalleryEvent | null>(null)
  const [filter, setFilter] = useState("Todos")
  const [search, setSearch] = useState("")

  const filtered = (events ?? []).filter((e) => {
    const matchCat = filter === "Todos" || e.category === filter
    const matchSearch =
      search.trim() === "" ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen pt-24 pb-20">
        {/* ---- Header section ---- */}
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Volver al inicio
          </Link>

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">
                Álbumes de fotos
              </span>
              <h1 className="mt-2 font-serif text-4xl font-semibold leading-tight text-foreground lg:text-5xl">
                Todos los eventos
              </h1>
              <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
                {isLoading
                  ? "Cargando álbumes…"
                  : `${events?.length ?? 0} ${events?.length === 1 ? "álbum publicado" : "álbumes publicados"}`}
              </p>
            </div>

            {/* Search */}
            <div className="relative md:w-72">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Buscar evento…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          {/* Category filter pills */}
          <div className="mt-8 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  filter === cat
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-background text-foreground/70 hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ---- Grid ---- */}
        <div className="mx-auto mt-10 max-w-7xl px-5 lg:px-8">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="size-9 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
              <ImageOff className="size-12" />
              <p className="text-base">
                {search || filter !== "Todos"
                  ? "No se encontraron eventos con ese filtro."
                  : "Aún no hay eventos publicados."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((event) => (
                <AlbumCard
                  key={event.id}
                  event={event}
                  onClick={() => setActive(event)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />

      {active && (
        <Lightbox event={active} onClose={() => setActive(null)} />
      )}
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Album Card                                                          */
/* ------------------------------------------------------------------ */

function AlbumCard({
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
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-background text-left transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {/* Cover */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={event.coverUrl || "/placeholder.svg"}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* photo count */}
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-foreground/60 px-2.5 py-1 text-xs font-semibold text-background backdrop-blur-sm">
          <Images className="size-3" />
          {event.photos.length}
        </span>
        {/* hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-foreground/30 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
          <span className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground shadow-sm">
            Abrir álbum
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="inline-block w-fit rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
          {event.category}
        </span>
        <h2 className="font-serif text-base font-semibold leading-snug text-foreground">
          {event.title}
        </h2>
        <p className="text-xs text-muted-foreground">{event.date}</p>
      </div>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Lightbox / Carousel                                                 */
/* ------------------------------------------------------------------ */

function Lightbox({
  event,
  onClose,
}: {
  event: GalleryEvent
  onClose: () => void
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selected, setSelected] = useState(0)
  const [zipping, setZipping] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleDownloadAlbum = useCallback(async () => {
    if (zipping) return
    setZipping(true)
    setProgress(0)
    try {
      await downloadAlbum(event, (done, total) => setProgress(Math.round((done / total) * 100)))
    } finally {
      setZipping(false)
    }
  }, [event, zipping])

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

  const photo = event.photos[selected]

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-foreground/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Álbum: ${event.title}`}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-background/50">
            {event.category} · {event.date}
          </p>
          <h3 className="font-serif text-lg font-semibold text-background">
            {event.title}
          </h3>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm tabular-nums text-background/60">
            {selected + 1} / {event.photos.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar álbum"
            className="rounded-full bg-background/10 p-2 text-background transition-colors hover:bg-background/20"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative flex-1 overflow-hidden">
        <div className="h-full" ref={emblaRef}>
          <div className="flex h-full">
            {event.photos.map((p) => (
              <div
                key={p.id}
                className="flex h-full min-w-0 flex-[0_0_100%] items-center justify-center p-4"
              >
                <img
                  src={p.url || "/placeholder.svg"}
                  alt={`${event.title} — foto ${event.photos.indexOf(p) + 1}`}
                  className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
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
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/10 p-3 text-background transition-colors hover:bg-background/25"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Foto siguiente"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/10 p-3 text-background transition-colors hover:bg-background/25"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {event.photos.length > 1 && (
        <div className="flex items-center justify-center gap-2 overflow-x-auto px-5 py-3">
          {event.photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={`Ir a foto ${i + 1}`}
              className={`size-10 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                i === selected
                  ? "border-accent opacity-100 scale-110"
                  : "border-transparent opacity-50 hover:opacity-80"
              }`}
            >
              <img
                src={p.url || "/placeholder.svg"}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Bottom bar */}
      <div className="flex flex-wrap items-center justify-center gap-3 px-5 pb-6 pt-2">
        <button
          type="button"
          onClick={() =>
            downloadImage(photo.url, `${event.id}-foto-${selected + 1}.jpg`)
          }
          className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.03]"
        >
          <Download className="size-4" />
          Descargar esta foto
        </button>
        <button
          type="button"
          onClick={handleDownloadAlbum}
          disabled={zipping}
          className="flex items-center gap-2 rounded-full border border-background/25 px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-background/10 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {zipping ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Preparando… {progress}%
            </>
          ) : (
            <>
              <FolderDown className="size-4" />
              Descargar este álbum
            </>
          )}
        </button>
      </div>
    </div>
  )
}
