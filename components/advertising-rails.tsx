"use client"

import { useState, useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import useSWR from "swr"
import { X, ExternalLink, ChevronLeft, ChevronRight, Megaphone, Sparkles } from "lucide-react"
import { fetchAdvertisements, fetchAdSettings, defaultAdSettings } from "@/lib/data"
import type { AdvertisingImage, AdSettings } from "@/lib/types"
import { whatsappUrl } from "@/lib/site"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  Riel de escritorio (Pantallas anchas >= 1460px)                   */
/*  Una sola tira larga por lado, más ancha, con rotación automática   */
/* ------------------------------------------------------------------ */
function DesktopRail({
  items,
  side,
  visible,
  intervalSeconds = 2,
  onCloseRail,
}: {
  items: AdvertisingImage[]
  side: "left" | "right"
  visible: boolean
  intervalSeconds?: number
  onCloseRail: (side: "left" | "right") => void
}) {
  const filtered = items.filter((item) => item.placement === side)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Asegurar que el índice no desborde si cambia la lista
  const safeIndex = filtered.length > 0 ? currentIndex % filtered.length : 0

  // Rotación automática cada `intervalSeconds` (por defecto 2 segundos)
  useEffect(() => {
    if (filtered.length <= 1 || isPaused) return
    const ms = Math.max(1000, (intervalSeconds || 2) * 1000)
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filtered.length)
    }, ms)
    return () => clearInterval(timer)
  }, [filtered.length, intervalSeconds, isPaused])

  if (!filtered.length) return null

  const activeItem = filtered[safeIndex]
  const targetUrl =
    activeItem.link ||
    whatsappUrl(
      activeItem.title
        ? `Hola, vi la publicidad de ${activeItem.title} en la web de Shalom Eventos.`
        : "Hola, vi la publicidad en la web de Shalom Eventos."
    )

  return (
    <aside
      aria-label={`Publicidad lateral ${side === "left" ? "izquierda" : "derecha"}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={cn(
        "fixed top-20 z-30 hidden flex-col gap-2 min-[1460px]:flex transition-all duration-500 ease-in-out",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 -translate-y-6 pointer-events-none",
        side === "left"
          ? "left-2 min-[1600px]:left-5"
          : "right-2 min-[1600px]:right-5",
        // Tira ancha (w-56 a w-64)
        "w-56 min-[1600px]:w-64"
      )}
    >
      {/* Barra superior de la tira con botón de cierre */}
      <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card/95 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground shadow-sm backdrop-blur-md">
        <span className="flex items-center gap-1.5 text-accent-foreground font-bold">
          <Megaphone className="size-3.5 text-accent" />
          <span>Publicidad</span>
          {filtered.length > 1 && (
            <span className="text-[10px] font-normal text-muted-foreground">
              ({safeIndex + 1}/{filtered.length})
            </span>
          )}
        </span>
        <div className="flex items-center gap-1">
          {filtered.length > 1 && (
            <div className="flex items-center gap-0.5 mr-1">
              <button
                type="button"
                onClick={() =>
                  setCurrentIndex((prev) => (prev - 1 + filtered.length) % filtered.length)
                }
                className="flex size-4.5 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Anterior"
                aria-label="Anterior publicidad"
              >
                <ChevronLeft className="size-3" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => (prev + 1) % filtered.length)}
                className="flex size-4.5 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Siguiente"
                aria-label="Siguiente publicidad"
              >
                <ChevronRight className="size-3" />
              </button>
            </div>
          )}
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
      </div>

      {/* Tira única larga para este lado */}
      <div className="group relative block overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xl transition-all duration-300 hover:border-accent hover:shadow-2xl">
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative block w-full overflow-hidden"
          title={activeItem.title || "Ver publicidad"}
        >
          {/* Contenedor vertical alargado y alto (tira larga) */}
          <div className="relative h-[620px] min-[1600px]:h-[720px] max-h-[82vh] w-full overflow-hidden bg-muted/60">
            <img
              key={activeItem.id}
              src={activeItem.url}
              alt={activeItem.title || "Anuncio Shalom"}
              className="size-full object-cover transition-transform duration-700 group-hover:scale-105 animate-in fade-in duration-300"
            />
            {/* Etiqueta anuncio */}
            <span className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-xs">
              Anuncio
            </span>

            {/* Sombra gradiente inferior para legibilidad si hay título o para acentuar */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8 text-white">
              {activeItem.title && (
                <p className="font-semibold text-xs leading-snug text-white line-clamp-2 drop-shadow-sm">
                  {activeItem.title}
                </p>
              )}
              <div className="mt-1 flex items-center gap-1 text-[10px] font-medium text-accent-foreground drop-shadow-sm">
                <span>Más información</span>
                <ExternalLink className="size-2.5" />
              </div>
            </div>
          </div>
        </a>

        {/* Indicadores de bolitas si hay múltiples anuncios en la tira */}
        {filtered.length > 1 && (
          <div className="absolute bottom-1.5 left-0 right-0 flex justify-center gap-1 py-1 pointer-events-none">
            {filtered.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  i === safeIndex ? "w-4 bg-accent" : "w-1 bg-white/50"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}

/* ------------------------------------------------------------------ */
/*  Publicidad Emergente (Popup Modal) para Teléfonos y Móviles       */
/*  Con botón de cerrar y rotación automática cada X segundos         */
/* ------------------------------------------------------------------ */
function MobileAdEmergente({
  items,
  visible,
  intervalSeconds = 2,
  onClose,
}: {
  items: AdvertisingImage[]
  visible: boolean
  intervalSeconds?: number
  onClose: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const safeIndex = items.length > 0 ? currentIndex % items.length : 0

  // Rotación automática cada `intervalSeconds` (por defecto 2 segundos)
  useEffect(() => {
    if (items.length <= 1 || isPaused) return
    const ms = Math.max(1000, (intervalSeconds || 2) * 1000)
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, ms)
    return () => clearInterval(timer)
  }, [items.length, intervalSeconds, isPaused])

  // Cerrar al presionar la tecla Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    },
    [onClose]
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  if (!items.length || !visible) return null

  const activeItem = items[safeIndex]
  const targetUrl =
    activeItem.link ||
    whatsappUrl(
      activeItem.title
        ? `Hola, vi la publicidad de ${activeItem.title} en la web de Shalom Eventos.`
        : "Hola, vi la publicidad en la web de Shalom Eventos."
    )

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Anuncio publicitario emergente"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs min-[1460px]:hidden animate-in fade-in duration-300"
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Contenedor del Popup */}
      <div className="relative w-full max-w-[340px] sm:max-w-[380px] max-h-[85vh] flex flex-col rounded-3xl border border-white/20 bg-card/95 shadow-2xl backdrop-blur-xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Cabecera del popup con etiqueta y botón de cerrar */}
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-accent-foreground">
            <Sparkles className="size-3.5 text-accent" />
            <span>Publicidad</span>
            {items.length > 1 && (
              <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                {safeIndex + 1} de {items.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {items.length > 1 && (
              <div className="flex items-center gap-0.5 mr-1">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
                  }
                  className="flex size-6 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-accent transition-colors shadow-xs"
                  aria-label="Anuncio anterior"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % items.length)}
                  className="flex size-6 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-accent transition-colors shadow-xs"
                  aria-label="Siguiente anuncio"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex size-7 items-center justify-center rounded-full bg-muted/80 text-muted-foreground hover:bg-destructive hover:text-white transition-all shadow-xs"
              title="Cerrar anuncio"
              aria-label="Cerrar anuncio"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Imagen del anuncio emergente */}
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block overflow-hidden"
          title={activeItem.title || "Ver anuncio"}
        >
          <div className="relative aspect-[4/5] sm:aspect-[9/16] max-h-[55vh] w-full overflow-hidden bg-black/5 flex items-center justify-center">
            <img
              key={activeItem.id}
              src={activeItem.url}
              alt={activeItem.title || "Anuncio Shalom"}
              className="size-full object-contain sm:object-cover transition-transform duration-500 group-hover:scale-102 animate-in fade-in duration-300"
            />
            <span className="absolute left-3 top-3 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-xs">
              Destacado
            </span>
          </div>

          {/* Pie de foto / Botón de acción */}
          <div className="p-3.5 bg-card">
            {activeItem.title && (
              <h4 className="font-semibold text-sm text-foreground line-clamp-1">
                {activeItem.title}
              </h4>
            )}
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Toca para ver detalles en WhatsApp o web
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground shadow-xs">
                <span>Ver más</span>
                <ExternalLink className="size-3" />
              </span>
            </div>
          </div>
        </a>

        {/* Indicadores de progreso si hay más de 1 */}
        {items.length > 1 && (
          <div className="flex justify-center gap-1.5 pb-2.5 bg-card">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === safeIndex ? "w-6 bg-accent" : "w-1.5 bg-muted-foreground/30"
                )}
                aria-label={`Ir al anuncio ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Componente Principal de Publicidad                                */
/* ------------------------------------------------------------------ */
export function AdvertisingRails({ immediate = false }: { immediate?: boolean } = {}) {
  const pathname = usePathname()
  const isDirectPage = immediate || Boolean(pathname?.startsWith("/eventos"))

  const { data: ads = [] } = useSWR<AdvertisingImage[]>("advertisements", fetchAdvertisements)
  const { data: settings = defaultAdSettings } = useSWR<AdSettings>("ad-settings", fetchAdSettings)

  const [isVisible, setIsVisible] = useState(isDirectPage)
  const [closedRails, setClosedRails] = useState<{ left?: boolean; right?: boolean }>({})
  const [mobileClosed, setMobileClosed] = useState(false)

  useEffect(() => {
    // Si es la página de eventos o inmediata, mostrar de inmediato
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

  const handleCloseRail = (side: "left" | "right") => {
    setClosedRails((prev) => ({ ...prev, [side]: true }))
  }

  // Separar anuncios por tipo / dispositivo:
  // Móvil: target === "mobile" o placement === "mobile"
  // Web / Escritorio: target !== "mobile" y placement !== "mobile"
  const desktopAds = ads.filter((item) => item.target !== "mobile" && item.placement !== "mobile")
  const mobileAds = ads.filter((item) => item.target === "mobile" || item.placement === "mobile")

  if (ads.length === 0) return null

  return (
    <>
      {/* Rieles de tira única ancha para pantallas de escritorio amplias */}
      {!closedRails.left && (
        <DesktopRail
          items={desktopAds}
          side="left"
          visible={isVisible}
          intervalSeconds={settings.desktopIntervalSeconds ?? 2}
          onCloseRail={handleCloseRail}
        />
      )}
      {!closedRails.right && (
        <DesktopRail
          items={desktopAds}
          side="right"
          visible={isVisible}
          intervalSeconds={settings.desktopIntervalSeconds ?? 2}
          onCloseRail={handleCloseRail}
        />
      )}

      {/* Anuncio emergente (popup) para celulares y tablets */}
      {!mobileClosed && mobileAds.length > 0 && (
        <MobileAdEmergente
          items={mobileAds}
          visible={isVisible}
          intervalSeconds={settings.mobileIntervalSeconds ?? 2}
          onClose={() => setMobileClosed(true)}
        />
      )}
    </>
  )
}

