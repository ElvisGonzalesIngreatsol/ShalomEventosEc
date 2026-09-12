"use client"

import { useEffect, useMemo, useState } from "react"
import useSWR, { mutate } from "swr"
import { CalendarDays, Check, ImagePlus, Loader2, Trash2, Upload, Pencil } from "lucide-react"
import { fetchEvents, updateEventDetails, updateEventPhotos, uploadEventPhotos } from "@/lib/data"
import type { EventPhoto, GalleryEvent } from "@/lib/types"

type PendingPhoto = { file: File; preview: string }

const categories = ["Boda", "XV Años", "Cumpleaños", "Corporativo", "Otro"]

export function AdminEventUploader() {
  const { data: events = [], isLoading } = useSWR<GalleryEvent[]>("events", fetchEvents)
  const [selectedId, setSelectedId] = useState("")
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("Boda")
  const [date, setDate] = useState("")
  const [existingPhotos, setExistingPhotos] = useState<EventPhoto[]>([])
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const selectedEvent = events.find((event) => event.id === selectedId)
  const allPhotos = useMemo(() => existingPhotos.length + pendingPhotos.length, [existingPhotos.length, pendingPhotos.length])
  const canSave = Boolean(selectedId && title.trim() && category && date && allPhotos > 0)

  useEffect(() => () => pendingPhotos.forEach(({ preview }) => URL.revokeObjectURL(preview)), [pendingPhotos])

  function selectEvent(id: string) {
    const event = events.find((item) => item.id === id)
    setSelectedId(id)
    setTitle(event?.title || "")
    setCategory(event?.category || "Boda")
    setDate(event?.date || "")
    setExistingPhotos(event?.photos || [])
    setPendingPhotos([])
    setMessage("")
  }

  function addFiles(list: FileList | null) {
    if (!list) return
    const next = Array.from(list).filter((file) => file.type.startsWith("image/")).map((file) => ({ file, preview: URL.createObjectURL(file) }))
    setPendingPhotos((current) => [...current, ...next])
  }

  function removePhoto(index: number) {
    if (index < existingPhotos.length) setExistingPhotos((current) => current.filter((_, position) => position !== index))
    else {
      const pendingIndex = index - existingPhotos.length
      URL.revokeObjectURL(pendingPhotos[pendingIndex].preview)
      setPendingPhotos((current) => current.filter((_, position) => position !== pendingIndex))
    }
  }

  function movePhoto(from: number, to: number) {
    if (from === to) return
    const combined = [...existingPhotos.map((photo) => ({ kind: "existing" as const, photo })), ...pendingPhotos.map((photo) => ({ kind: "pending" as const, photo }))]
    const [moved] = combined.splice(from, 1)
    combined.splice(to, 0, moved)
    setExistingPhotos(combined.filter((item) => item.kind === "existing").map((item) => item.photo as EventPhoto))
    setPendingPhotos(combined.filter((item) => item.kind === "pending").map((item) => item.photo as PendingPhoto))
  }

  async function saveChanges() {
    if (!canSave || !selectedEvent || saving) return
    setSaving(true); setMessage("")
    try {
      await updateEventDetails(selectedEvent.id, { title: title.trim(), category, date })
      let updatedPhotos = existingPhotos
      if (pendingPhotos.length) {
        const result = await uploadEventPhotos({ ...selectedEvent, title, category, date, photos: existingPhotos, coverUrl: existingPhotos[0]?.url || "" }, pendingPhotos.map(({ file }) => file))
        updatedPhotos = result.photos
      }
      await updateEventPhotos({ ...selectedEvent, photos: updatedPhotos, coverUrl: updatedPhotos[0]?.url || "" }, updatedPhotos)
      setPendingPhotos([])
      await mutate("events")
      setMessage("Evento actualizado correctamente.")
    } catch {
      setMessage("No se pudo guardar el evento. Revisa Firebase e inténtalo de nuevo.")
    } finally { setSaving(false) }
  }

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="size-7 animate-spin text-accent" /></div>

  return <section className="rounded-2xl border border-accent/40 bg-card p-6 shadow-sm">
    <div className="flex items-center gap-3"><div className="rounded-xl bg-accent/20 p-2"><Pencil className="size-5 text-accent-foreground" /></div><div><h2 className="font-serif text-2xl font-semibold">Editar evento y fotos</h2><p className="text-sm text-muted-foreground">Selecciona un evento existente para modificar sus datos, fotos y orden.</p></div></div>
    <label className="mt-6 block text-sm font-medium">Evento a editar<select value={selectedId} onChange={(event) => selectEvent(event.target.value)} className="mt-1.5 w-full rounded-lg border border-input bg-background px-3.5 py-2.5"><option value="">Seleccionar evento</option>{events.map((event) => <option key={event.id} value={event.id}>{event.title} · {event.date}</option>)}</select></label>
    {selectedId && <>
      <div className="mt-5 grid gap-4 md:grid-cols-3"><label className="text-sm font-medium">Nombre<input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1.5 w-full rounded-lg border border-input bg-background px-3.5 py-2.5" /></label><label className="text-sm font-medium">Tipo<select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1.5 w-full rounded-lg border border-input bg-background px-3.5 py-2.5">{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-sm font-medium">Fecha<div className="relative mt-1.5"><CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 pl-10" /></div></label></div>
      <label onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addFiles(event.dataTransfer.files) }} className="mt-6 flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-accent/50 bg-secondary/30 px-5 py-5 text-center"><ImagePlus className="size-7 text-accent-foreground" /><span className="font-semibold">Añadir más fotos</span><span className="text-sm text-muted-foreground">Puedes seleccionar varias o arrastrarlas aquí</span><input type="file" accept="image/*" multiple className="hidden" onChange={(event) => addFiles(event.target.files)} /></label>
      <div className="mt-5 flex items-center justify-between"><p className="text-sm font-semibold">{allPhotos} fotos del evento</p><p className="text-xs text-muted-foreground">Arrastra las miniaturas para cambiar el orden</p></div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">{[...existingPhotos.map((photo) => ({ preview: photo.url })), ...pendingPhotos].map((photo, index) => <div key={`${photo.preview}-${index}`} draggable onDragStart={() => setDragIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragIndex !== null) movePhoto(dragIndex, index); setDragIndex(null) }} className="group relative aspect-square cursor-grab overflow-hidden rounded-lg border border-border bg-muted active:cursor-grabbing"><img src={photo.preview} alt={`Foto ${index + 1}`} className="size-full object-cover" /><span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">{index + 1}</span><button type="button" aria-label={`Quitar foto ${index + 1}`} onClick={() => removePhoto(index)} className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"><Trash2 className="size-3.5 text-destructive" /></button></div>)}</div>
      <div className="mt-6 flex flex-wrap items-center gap-4"><button type="button" disabled={!canSave || saving} onClick={() => void saveChanges()} className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50">{saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}Guardar cambios</button>{message && <p className={`text-sm ${message.includes("correctamente") ? "text-accent-foreground" : "text-destructive"}`}>{message}</p>}</div>
    </>}
  </section>
}
