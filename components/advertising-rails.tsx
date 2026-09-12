"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { X } from "lucide-react"
import { fetchAdvertisements } from "@/lib/data"
import type { AdvertisingImage } from "@/lib/types"
import { whatsappUrl } from "@/lib/site"
import { cn } from "@/lib/utils"

function Rail({
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

  // Mostrar un máximo de 3 publicidades por lado
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
        "w-36 min-[1620px]:w-44"
      )}
    >
      {/* Botón superior para cerrar toda la columna de publicidad */}
      <div className="flex items-center justify-between rounded-xl border border-border/70 bg-card/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground shadow-xs backdrop-blur-xs">
        <span>Publicidad</span>
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
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-muted">
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

            {/* Pequeño botón en la tarjeta para cerrar solo este anuncio */}
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

export function AdvertisingRails() {
  const { data = [] } = useSWR<AdvertisingImage[]>("advertisements", fetchAdvertisements)
  const [pastHero, setPastHero] = useState(false)
  const [closedRails, setClosedRails] = useState<{ left?: boolean; right?: boolean }>({})
  const [dismissedItemIds, setDismissedItemIds] = useState<string[]>([])

  useEffect(() => {
    const handleScroll = () => {
      const hero = document.getElementById("inicio")
      if (hero) {
        // Activa la publicidad únicamente cuando se pasa de la sección Hero
        const heroBottom = hero.offsetTop + hero.offsetHeight - 180
        setPastHero(window.scrollY > heroBottom)
      } else {
        // Fallback por altura de ventana
        setPastHero(window.scrollY > window.innerHeight * 0.75)
      }
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Filtrar anuncios descartados por el usuario
  const visibleItems = data.filter((item) => !dismissedItemIds.includes(item.id))

  const handleCloseRail = (side: "left" | "right") => {
    setClosedRails((prev) => ({ ...prev, [side]: true }))
  }

  const handleDismissItem = (id: string) => {
    setDismissedItemIds((prev) => [...prev, id])
  }

  return (
    <>
      {!closedRails.left && (
        <Rail
          items={visibleItems}
          side="left"
          visible={pastHero}
          onCloseRail={handleCloseRail}
          onDismissItem={handleDismissItem}
        />
      )}
      {!closedRails.right && (
        <Rail
          items={visibleItems}
          side="right"
          visible={pastHero}
          onCloseRail={handleCloseRail}
          onDismissItem={handleDismissItem}
        />
      )}
    </>
  )
}
