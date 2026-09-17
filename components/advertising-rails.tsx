"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import useSWR from "swr"
import { X, ExternalLink, ChevronLeft, ChevronRight, Megaphone } from "lucide-react"
import { fetchAdvertisements } from "@/lib/data"
import type { AdvertisingImage } from "@/lib/types"
import { whatsappUrl } from "@/lib/site"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  Riel de escritorio (Pantallas anchas >= 1460px)                   */
/* ------------------------------------------------------------------ */
function DesktopRail({
  items,
  side,
  visible,
  onCloseRail,
  onDismissItem,
}: {
  items: AdvertisingImage[]
  side: "left" | "right"
  visible: boolean
  onCloseRail: (side: "left" | "right") => void
  onDismissItem: (id: string) => void
}) {
  const filtered = items.filter((item) => item.placement === side)
  if (!filtered.length) return null

  // Mostrar hasta 3 publicidades por lado
  const displayItems = filtered.slice(0, 3)

  return (
    <aside
      aria-label={`Publicidad ${side === "left" ? "izquierda" : "derecha"}`}
      className={cn(
        "fixed top-28 z-30 hidden flex-col gap-2.5 min-[1460px]:flex transition-all duration-500 ease-in-out",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 -translate-y-6 pointer-events-none",
        side === "left"
          ? "left-2 min-[1600px]:left-5"
          : "right-2 min-[1600px]:right-5",
        "w-48 min-[1600px]:w-52"
      )}
    >
      {/* Botón superior para cerrar toda la columna */}
      <div className="flex items-center justify-between rounded-xl border border-border/70 bg-card/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground shadow-xs backdrop-blur-xs">
        <span className="flex items-center gap-1.5">
          <Megaphone className="size-3 text-accent" />
          Publicidad
        </span>
        <button
          type="button"
          onClick={() => onCloseRail(side)}
          className="flex size-4.5 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive hover:text-white transition-colors"
          title={`Cerrar publicidad ${side === "left" ? "izquierda" : "derecha"}`}
          aria-label="Cerrar publicidad"
        >
          <X className="size-3" />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {displayItems.map((item) => (
          <div key={item.id} className="group relative block">
            <a
              href={item.link || whatsappUrl(`Hola, vi la publicidad de ${item.title} en la web de Shalom.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-2xl border border-border/80 bg-card p-1.5 shadow-md transition-all duration-300 hover:scale-[1.03] hover:border-accent hover:shadow-xl"
              title={item.title}
            >
              {/* Formato 1:1 Cuadrado solicitado */}
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
                <img
                  src={item.url}
                  alt={item.title}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold text-white backdrop-blur-xs shadow-xs">
                  Anuncio
                </span>
              </div>
              {item.title && (
                <p className="px-1 pt-1.5 pb-0.5 text-center text-xs font-semibold text-foreground line-clamp-1">
                  {item.title}
                </p>
              )}
            </a>

            {/* Pequeño botón para descartar solo este anuncio */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onDismissItem(item.id)
              }}
              className="absolute right-2.5 top-2.5 z-10 flex size-5 items-center justify-center rounded-full bg-black/65 text-white/90 shadow-sm backdrop-blur-xs hover:scale-110 hover:bg-destructive hover:text-white transition-all"
              title="Cerrar este anuncio"
              aria-label="Cerrar este anuncio"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
      </div>
    </aside>
  )
}

/* ------------------------------------------------------------------ */
/*  Publicidad flotante para Móviles y Tablets (< 1460px)              */
/* ------------------------------------------------------------------ */
function MobileAdFloating({
  items,
  visible,
  onClose,
}: {
  items: AdvertisingImage[]
  visible: boolean
  onClose: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Rotación automática suave cada 7 segundos si hay varios anuncios
  useEffect(() => {
    if (items.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, 7000)
    return () => clearInterval(interval)
  }, [items.length])

  if (!items.length) return null

  const activeItem = items[currentIndex % items.length]
  const targetUrl =
    activeItem.link ||
    whatsappUrl(`Hola, vi la publicidad de ${activeItem.title} en la web de Shalom.`)

  return (
    <aside
      aria-label="Publicidad en teléfono"
      className={cn(
        "fixed bottom-4 right-3 left-3 sm:left-auto sm:right-4 z-40 min-[1460px]:hidden transition-all duration-500 ease-out",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-8 pointer-events-none"
      )}
    >
      <div className="relative mx-auto max-w-[340px] sm:w-[320px] rounded-2xl border border-border/90 bg-card/95 p-2 shadow-2xl backdrop-blur-md">
        {/* Cabecera del widget móvil */}
        <div className="mb-1.5 flex items-center justify-between px-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          <span className="flex items-center gap-1 text-accent-foreground font-bold">
            <Megaphone className="size-3" />
            Publicidad {items.length > 1 && `(${currentIndex + 1}/${items.length})`}
          </span>
          <div className="flex items-center gap-1">
            {items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
                  }
                  className="flex size-5 items-center justify-center rounded-full bg-muted text-foreground hover:bg-accent transition-colors"
                  aria-label="Anuncio anterior"
                >
                  <ChevronLeft className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % items.length)}
                  className="flex size-5 items-center justify-center rounded-full bg-muted text-foreground hover:bg-accent transition-colors"
                  aria-label="Siguiente anuncio"
                >
                  <ChevronRight className="size-3" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="ml-1 flex size-5 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-destructive hover:text-white transition-colors"
              title="Cerrar publicidad"
              aria-label="Cerrar publicidad"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>

        {/* Contenido con imagen cuadrada 1:1 */}
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-background/80 p-1.5 transition-all hover:border-accent hover:shadow-md"
        >
          {/* Imagen Cuadrada */}
          <div className="relative size-16 sm:size-20 shrink-0 overflow-hidden rounded-lg bg-muted aspect-square">
            <img
              src={activeItem.url}
              alt={activeItem.title}
              className="size-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1 pr-1">
            <p className="text-xs sm:text-sm font-semibold text-foreground line-clamp-1">
              {activeItem.title}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">
              Toca para ver detalles o escribir por WhatsApp
            </p>
            <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
              <span>Ver más</span>
              <ExternalLink className="size-2.5" />
            </div>
          </div>
        </a>
      </div>
    </aside>
  )
}

/* ------------------------------------------------------------------ */
/*  Componente Principal de Publicidad                                */
/* ------------------------------------------------------------------ */
export function AdvertisingRails({ immediate = false }: { immediate?: boolean } = {}) {
  const pathname = usePathname()
  const isDirectPage = immediate || Boolean(pathname?.startsWith("/eventos"))

  const { data = [] } = useSWR<AdvertisingImage[]>("advertisements", fetchAdvertisements)
  const [isVisible, setIsVisible] = useState(isDirectPage)
  const [closedRails, setClosedRails] = useState<{ left?: boolean; right?: boolean }>({})
  const [mobileClosed, setMobileClosed] = useState(false)
  const [dismissedItemIds, setDismissedItemIds] = useState<string[]>([])

  useEffect(() => {
    // Si es la página de eventos/álbumes o tiene immediate, mostrar de inmediato
    if (isDirectPage) {
      setIsVisible(true)
      return
    }

    const handleScroll = () => {
      const hero = document.getElementById("inicio")
      if (hero) {
        // En página principal con hero, esperar a rebasar el banner inicial
        const heroBottom = hero.offsetTop + hero.offsetHeight - 180
        setIsVisible(window.scrollY > heroBottom)
      } else {
        // En cualquier otra página sin hero, mostrar inmediatamente
        setIsVisible(true)
      }
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isDirectPage])

  // Filtrar anuncios descartados por el usuario
  const visibleItems = data.filter((item) => !dismissedItemIds.includes(item.id))

  const handleCloseRail = (side: "left" | "right") => {
    setClosedRails((prev) => ({ ...prev, [side]: true }))
  }

  const handleDismissItem = (id: string) => {
    setDismissedItemIds((prev) => [...prev, id])
  }

  if (visibleItems.length === 0) return null

  return (
    <>
      {/* Rieles para pantallas de escritorio amplias */}
      {!closedRails.left && (
        <DesktopRail
          items={visibleItems}
          side="left"
          visible={isVisible}
          onCloseRail={handleCloseRail}
          onDismissItem={handleDismissItem}
        />
      )}
      {!closedRails.right && (
        <DesktopRail
          items={visibleItems}
          side="right"
          visible={isVisible}
          onCloseRail={handleCloseRail}
          onDismissItem={handleDismissItem}
        />
      )}

      {/* Widget flotante para celulares y pantallas pequeñas */}
      {!mobileClosed && (
        <MobileAdFloating
          items={visibleItems}
          visible={isVisible}
          onClose={() => setMobileClosed(true)}
        />
      )}
    </>
  )
}
