"use client"

import useSWR from "swr"
import { fetchAdvertisements } from "@/lib/data"
import type { AdvertisingImage } from "@/lib/types"

function Rail({ items, side }: { items: AdvertisingImage[]; side: "left" | "right" }) {
  const filtered = items.filter((item) => item.placement === side)
  if (!filtered.length) return null
  return (
    <aside aria-label={`Publicidad ${side}`} className={`pointer-events-none fixed top-1/2 z-20 hidden w-32 -translate-y-1/2 xl:block ${side === "left" ? "left-4" : "right-4"}`}>
      <div className="pointer-events-auto space-y-4">{filtered.map((item) => <a key={item.id} href={item.link || "#"} target={item.link ? "_blank" : undefined} rel="noreferrer" className="block overflow-hidden rounded-xl border border-border bg-card shadow-lg transition-transform hover:scale-105"><img src={item.url} alt={item.title} className="w-full object-cover" /></a>)}</div>
    </aside>
  )
}

export function AdvertisingRails() {
  const { data = [] } = useSWR<AdvertisingImage[]>("advertisements", fetchAdvertisements)
  return <><Rail items={data} side="left" /><Rail items={data} side="right" /></>
}
