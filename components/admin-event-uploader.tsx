"use client"

import { useEffect, useMemo, useState } from "react"
import useSWR, { mutate } from "swr"
import { CalendarDays, Check, ImagePlus, Loader2, Trash2, Upload } from "lucide-react"
import { createEvent, fetchEvents, uploadEventPhotos } from "@/lib/data"
import type { GalleryEvent } from "@/lib/types"

type PendingPhoto = { file: File; preview: string }

export function AdminEventUploader() {
  const { data: events = [], isLoading } = useSWR<GalleryEvent[]>("events", fetchEvents)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("Boda")
  const [date, setDate] = useState("")
  const [photos, setPhotos] = useState<PendingPhoto[]>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => () => photos.forEach(({ preview }) => URL.revokeObjectURL(preview)), [photos])

  const canPublish = Boolean(title.trim() && category && date && photos.length)
  const totalLabel = useMemo(() => `${photos.length} ${photos.length === 1 ? "foto seleccionada" : "fotos seleccionadas"}`, [photos.length])

  function addFiles(fileList: FileList | null) {
    if (!fileList) return
    const next = Array.from(fileList).filter((file) => file.type.startsWith("image/")).map((file) => ({ file, preview: URL.createObjectURL(file) }))
    setPhotos((current) => [...current, ...next])
  }

  function movePhoto(from: number, to: number) {
    if (from === to || to < 0 || to >= photos.length) return
    setPhotos((current) => {
      const next = [...current]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  function removePhoto(index: number) {
    URL.revokeObjectURL(photos[index].preview)
    setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))
  }

  async function publish() {
    if (!canPublish || publishing) return
    setPublishing(true)
    setMessage("")
    try {
      const eventId = await createEvent({ title: title.trim(), category, date })
      const event: GalleryEvent = { id: eventId, title: title.trim(), category, date, coverUrl: "", photos: [] }
      await uploadEventPhotos(event, photos.map(({ file }) => file))
      setTitle(""); setCategory("Boda"); setDate(""); photos.forEach(({ preview }) => URL.revokeObjectURL(preview)); setPhotos([])
      await mutate("events")
      setMessage("Evento publicado correctamente.")
    } catch {
      setMessage("No se pudo publicar el evento. Revisa Firebase e inténtalo de nuevo.")
    } finally { setPublishing(false) }
  }

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="size-7 animate-spin text-accent" /></div>

  return <section className="rounded-2xl border border-accent/40 bg-card p-6 shadow-sm">
    <div className="flex items-center gap-3"><div className="rounded-xl bg-accent/20 p-2"><Upload className="size-5 text-accent-foreground" /></div><div><h2 className="font-serif text-2xl font-semibold">Publicar un evento</h2><p className="text-sm text-muted-foreground">Completa los datos, ordena las fotos y publica todo junto.</p></div></div>
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      <label className="text-sm font-medium">Nombre del evento<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Boda de Ana y Luis" className="mt-1.5 w-full rounded-lg border border-input bg-background px-3.5 py-2.5" /></label>
      <label className="text-sm font-medium">Tipo de evento<select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1.5 w-full rounded-lg border border-input bg-background px-3.5 py-2.5">{["Boda", "XV Años", "Bautizo", "Corporativo", "Otro"].map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="text-sm font-medium">Fecha del evento<div className="relative mt-1.5"><CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 pl-10" /></div></label>
    </div>
    <label onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addFiles(event.dataTransfer.files) }} className="mt-6 flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-accent/50 bg-secondary/30 px-5 py-6 text-center hover:bg-accent/10"><ImagePlus className="size-7 text-accent-foreground" /><span className="font-semibold">Seleccionar fotos</span><span className="text-sm text-muted-foreground">Puedes seleccionar varias o arrastrarlas aquí</span><input type="file" accept="image/*" multiple className="hidden" onChange={(event) => addFiles(event.target.files)} /></label>
    {photos.length > 0 && <div className="mt-5"><div className="flex items-center justify-between"><p className="text-sm font-semibold">{totalLabel}</p><p className="text-xs text-muted-foreground">Arrastra una miniatura para cambiar el orden</p></div><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">{photos.map((photo, index) => <div key={`${photo.file.name}-${index}`} draggable onDragStart={() => setDragIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragIndex !== null) movePhoto(dragIndex, index); setDragIndex(null) }} className="group relative aspect-square cursor-grab overflow-hidden rounded-lg border border-border bg-muted active:cursor-grabbing"><img src={photo.preview} alt={`Foto ${index + 1}`} className="size-full object-cover" /><span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">{index + 1}</span><button type="button" aria-label={`Quitar foto ${index + 1}`} onClick={() => removePhoto(index)} className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"><Trash2 className="size-3.5 text-destructive" /></button></div>)}</div></div>}
    <div className="mt-6 flex flex-wrap items-center gap-4"><button type="button" disabled={!canPublish || publishing} onClick={() => void publish()} className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50">{publishing ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}Publicar evento</button>{message && <p className={`text-sm ${message.includes("correctamente") ? "text-accent-foreground" : "text-destructive"}`}>{message}</p>}</div>
  </section>
}
