"use client"

import { useState, useEffect, useRef } from "react"
import useSWR, { mutate } from "swr"
import {
  CalendarDays,
  Check,
  FolderPlus,
  GripVertical,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  X,
  AlertCircle,
  Clock,
} from "lucide-react"
import {
  fetchEvents,
  createEventWithPhotos,
  saveEventFull,
  deleteEvent,
} from "@/lib/data"
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from "@/lib/alerts"
import type { GalleryEvent, EventPhoto } from "@/lib/types"

const EVENT_CATEGORIES = [
  "Boda",
  "XV Años",
  "Cumpleaños",
  "Corporativo",
  "Baby Shower",
  "Graduación",
  "Otro",
]

type PendingLocalFile = {
  id: string
  file: File
  preview: string
}

type EditPhotoItem =
  | { kind: "existing"; id: string; url: string; raw: EventPhoto }
  | { kind: "new"; id: string; preview: string; file: File }

export function AdminEventsManager() {
  const { data: events = [], isLoading } = useSWR<GalleryEvent[]>("events", fetchEvents)

  /* =========================================================
     DIV 1: ESTADO PARA CREAR NUEVO EVENTO
  ========================================================= */
  const [newTitle, setNewTitle] = useState("")
  const [newCategory, setNewCategory] = useState("Boda")
  const [newDate, setNewDate] = useState("")
  const [newPhotos, setNewPhotos] = useState<PendingLocalFile[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [createMessage, setCreateMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [createDragIndex, setCreateDragIndex] = useState<number | null>(null)
  const [createDragOverIndex, setCreateDragOverIndex] = useState<number | null>(null)
  const newFileInputRef = useRef<HTMLInputElement>(null)

  // Limpieza de URLs temporales de creación
  useEffect(() => {
    return () => {
      newPhotos.forEach((p) => URL.revokeObjectURL(p.preview))
    }
  }, [newPhotos])

  const handleAddNewFiles = (fileList: FileList | null) => {
    if (!fileList) return
    const valid = Array.from(fileList)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
      }))

    setNewPhotos((prev) => [...prev, ...valid])
    setCreateMessage(null)
  }

  const removeNewPhoto = (index: number) => {
    setNewPhotos((prev) => {
      const target = prev[index]
      if (target) URL.revokeObjectURL(target.preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleCreateReorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    setNewPhotos((prev) => {
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) {
      showErrorAlert("Falta información", "Por favor ingresa un nombre para el evento.")
      setCreateMessage({ type: "error", text: "Por favor ingresa un nombre para el evento." })
      return
    }
    if (!newDate) {
      showErrorAlert("Falta información", "Por favor selecciona la fecha del evento.")
      setCreateMessage({ type: "error", text: "Por favor selecciona la fecha del evento." })
      return
    }
    if (newPhotos.length === 0) {
      showErrorAlert("Fotos requeridas", "Agrega al menos una foto para el álbum del evento.")
      setCreateMessage({ type: "error", text: "Agrega al menos una foto para el evento." })
      return
    }

    setIsCreating(true)
    setCreateMessage(null)

    try {
      await createEventWithPhotos(
        {
          title: newTitle.trim(),
          category: newCategory,
          date: newDate,
        },
        newPhotos.map((p) => p.file)
      )

      const createdTitle = newTitle.trim()
      const photosCount = newPhotos.length

      // Limpiar formulario
      setNewTitle("")
      setNewDate("")
      setNewCategory("Boda")
      newPhotos.forEach((p) => URL.revokeObjectURL(p.preview))
      setNewPhotos([])
      if (newFileInputRef.current) newFileInputRef.current.value = ""

      await mutate("events")
      setCreateMessage({ type: "success", text: "¡Evento y fotos creados y publicados con éxito!" })
      showSuccessAlert(
        "¡Evento publicado!",
        `"${createdTitle}" se creó correctamente con ${photosCount} ${photosCount === 1 ? "foto" : "fotos"}.`
      )
    } catch (err: any) {
      const errorMsg = err?.message || "Error al subir fotos y crear el evento. Verifica la conexión a Firebase."
      setCreateMessage({ type: "error", text: errorMsg })
      showErrorAlert("Error al crear evento", errorMsg)
    } finally {
      setIsCreating(false)
    }
  }

  /* =========================================================
     DIV 2: ESTADO PARA EDITAR EVENTOS REALIZADOS
  ========================================================= */
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editCategory, setEditCategory] = useState("Boda")
  const [editDate, setEditDate] = useState("")
  const [editPhotos, setEditPhotos] = useState<EditPhotoItem[]>([])
  const [deletedExistingPhotos, setDeletedExistingPhotos] = useState<EventPhoto[]>([])
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [editMessage, setEditMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [editDragIndex, setEditDragIndex] = useState<number | null>(null)
  const [editDragOverIndex, setEditDragOverIndex] = useState<number | null>(null)
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  // Abrir panel de edición para un evento existente
  const startEditingEvent = (event: GalleryEvent) => {
    editPhotos.forEach((p) => {
      if (p.kind === "new") URL.revokeObjectURL(p.preview)
    })

    setEditingEventId(event.id)
    setEditTitle(event.title)
    setEditCategory(event.category)
    setEditDate(event.date)
    setEditPhotos(
      (event.photos || []).map((photo) => ({
        kind: "existing",
        id: photo.id,
        url: photo.url,
        raw: photo,
      }))
    )
    setDeletedExistingPhotos([])
    setEditMessage(null)
  }

  const cancelEditing = () => {
    editPhotos.forEach((p) => {
      if (p.kind === "new") URL.revokeObjectURL(p.preview)
    })
    setEditingEventId(null)
    setEditPhotos([])
    setDeletedExistingPhotos([])
    setEditMessage(null)
  }

  const handleAddEditFiles = (fileList: FileList | null) => {
    if (!fileList) return
    const valid = Array.from(fileList)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        kind: "new" as const,
        id: `new-${file.name}-${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
      }))

    setEditPhotos((prev) => [...prev, ...valid])
    setEditMessage(null)
  }

  const removeEditPhoto = (index: number) => {
    setEditPhotos((prev) => {
      const target = prev[index]
      if (target.kind === "new") {
        URL.revokeObjectURL(target.preview)
      } else {
        setDeletedExistingPhotos((del) => [...del, target.raw])
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleEditReorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    setEditPhotos((prev) => {
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
  }

  const handleSaveEdit = async () => {
    if (!editingEventId) return
    if (!editTitle.trim()) {
      showErrorAlert("Falta información", "El nombre del evento no puede estar vacío.")
      setEditMessage({ type: "error", text: "El nombre del evento no puede estar vacío." })
      return
    }
    if (!editDate) {
      showErrorAlert("Falta información", "La fecha del evento es obligatoria.")
      setEditMessage({ type: "error", text: "La fecha del evento es obligatoria." })
      return
    }
    if (editPhotos.length === 0) {
      showErrorAlert("Fotos requeridas", "El evento debe tener al menos una foto.")
      setEditMessage({ type: "error", text: "El evento debe tener al menos una foto." })
      return
    }

    setIsSavingEdit(true)
    setEditMessage(null)

    try {
      const itemsToSave = editPhotos.map((item) => {
        if (item.kind === "existing") {
          return { kind: "existing" as const, photo: item.raw }
        } else {
          return { kind: "new" as const, file: item.file }
        }
      })

      await saveEventFull(
        editingEventId,
        {
          title: editTitle.trim(),
          category: editCategory,
          date: editDate,
        },
        itemsToSave,
        deletedExistingPhotos
      )

      const updatedTitle = editTitle.trim()

      await mutate("events")
      setEditMessage({ type: "success", text: "Cambios guardados correctamente." })
      showSuccessAlert(
        "¡Cambios guardados!",
        `El evento "${updatedTitle}" ha sido actualizado correctamente.`
      )
      setTimeout(() => {
        cancelEditing()
      }, 1000)
    } catch (err: any) {
      const errorMsg = err?.message || "Error al actualizar el evento."
      setEditMessage({
        type: "error",
        text: errorMsg,
      })
      showErrorAlert("Error al actualizar", errorMsg)
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleDeleteEvent = async (event: GalleryEvent) => {
    const isConfirmed = await showConfirmAlert({
      title: "¿Eliminar evento?",
      text: `¿Estás seguro de eliminar "${event.title}" y sus ${event.photos?.length || 0} fotos? Esta acción no se puede deshacer.`,
      confirmButtonText: "Sí, eliminar evento",
      cancelButtonText: "Cancelar",
      isDestructive: true,
    })

    if (!isConfirmed) return

    setDeletingEventId(event.id)
    try {
      await deleteEvent(event.id, event.photos)
      if (editingEventId === event.id) {
        cancelEditing()
      }
      await mutate("events")
      showSuccessAlert(
        "Evento eliminado",
        `El evento "${event.title}" fue eliminado permanentemente.`
      )
    } catch (err: any) {
      showErrorAlert(
        "Error al eliminar",
        "No se pudo eliminar el evento: " + (err?.message || "Error desconocido")
      )
    } finally {
      setDeletingEventId(null)
    }
  }

  return (
    <div className="space-y-12">
      {/* =========================================================================
          DIV 1: CREAR EVENTO CON FOTOS Y DRAG & DROP
      ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-sm transition-all hover:shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-accent/20 text-accent-foreground shadow-inner">
              <FolderPlus className="size-6" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">
                Crear Nuevo Evento
              </h2>
              <p className="text-sm text-muted-foreground">
                Ingresa los datos, agrega las fotos y ordénalas arrastrándolas antes de publicar.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-foreground">
            <Sparkles className="size-3.5" /> Div 1 · Nuevo Evento
          </span>
        </div>

        <form onSubmit={handleCreateSubmit} className="mt-6 space-y-6">
          {/* Campos básicos */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nombre del evento *
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ej. Boda Katherine & Carlos"
                required
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tipo de evento
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                {EVENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Fecha del evento *
              </label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-4 text-sm transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>
          </div>

          {/* Zona de carga y ordenamiento de fotos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Fotos del evento ({newPhotos.length} seleccionadas)
              </label>
              {newPhotos.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  Arrastra las miniaturas para cambiar el orden · La foto <strong>#1</strong> es la portada
                </span>
              )}
            </div>

            {/* Dropzone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                handleAddNewFiles(e.dataTransfer.files)
              }}
              onClick={() => newFileInputRef.current?.click()}
              className="group flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 p-6 text-center transition-all hover:border-accent hover:bg-accent/10"
            >
              <input
                ref={newFileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleAddNewFiles(e.target.files)}
              />
              <div className="flex size-10 items-center justify-center rounded-full bg-accent/20 text-accent-foreground group-hover:scale-110 transition-transform">
                <Upload className="size-5" />
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground">
                Haz clic para elegir fotos o arrástralas aquí
              </p>
              <p className="text-xs text-muted-foreground">
                Puedes subir varias imágenes al mismo tiempo (JPG, PNG, WebP)
              </p>
            </div>

            {/* Grilla con Drag and Drop */}
            {newPhotos.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {newPhotos.map((photo, index) => {
                  const isCover = index === 0
                  const isDragging = createDragIndex === index
                  const isOver = createDragOverIndex === index

                  return (
                    <div
                      key={photo.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", String(index))
                        setCreateDragIndex(index)
                      }}
                      onDragOver={(e) => {
                        e.preventDefault()
                        setCreateDragOverIndex(index)
                      }}
                      onDragLeave={() => {
                        if (createDragOverIndex === index) setCreateDragOverIndex(null)
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        if (createDragIndex !== null) {
                          handleCreateReorder(createDragIndex, index)
                        }
                        setCreateDragIndex(null)
                        setCreateDragOverIndex(null)
                      }}
                      onDragEnd={() => {
                        setCreateDragIndex(null)
                        setCreateDragOverIndex(null)
                      }}
                      className={`group relative aspect-square cursor-grab overflow-hidden rounded-xl border-2 bg-muted transition-all active:cursor-grabbing ${
                        isCover ? "border-primary ring-2 ring-primary/20" : "border-border"
                      } ${isDragging ? "opacity-30 scale-95" : "opacity-100"} ${
                        isOver ? "border-accent scale-105 shadow-lg" : ""
                      }`}
                      title="Arrastra para reordenar"
                    >
                      <img
                        src={photo.preview}
                        alt={`Foto ${index + 1}`}
                        className="size-full object-cover pointer-events-none"
                      />

                      {/* Badge de orden o portada */}
                      <span
                        className={`absolute left-1.5 top-1.5 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm ${
                          isCover ? "bg-primary" : "bg-black/70 backdrop-blur-xs"
                        }`}
                      >
                        <GripVertical className="size-2.5 opacity-80" />
                        {isCover ? "★ Portada" : `#${index + 1}`}
                      </span>

                      {/* Botón quitar foto */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeNewPhoto(index)
                        }}
                        aria-label="Quitar foto"
                        className="absolute right-1.5 top-1.5 rounded-full bg-destructive/90 p-1 text-white shadow-sm transition-transform hover:scale-110"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Mensajes de retroalimentación */}
          {createMessage && (
            <div
              className={`flex items-center gap-2 rounded-xl p-3.5 text-sm ${
                createMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-destructive/10 text-destructive border border-destructive/20"
              }`}
            >
              {createMessage.type === "success" ? (
                <Check className="size-4 shrink-0" />
              ) : (
                <AlertCircle className="size-4 shrink-0" />
              )}
              <span>{createMessage.text}</span>
            </div>
          )}

          {/* Botón de publicar */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={isCreating || !newTitle.trim() || !newDate || newPhotos.length === 0}
              className="flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Subiendo fotos y creando evento…</span>
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  <span>Crear y publicar evento</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* =========================================================================
          DIV 2: EVENTOS REALIZADOS Y EDICIÓN (FOTOS, ORDEN, FECHA, NOMBRE, ETC.)
      ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-sm transition-all hover:shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
              <CalendarDays className="size-6" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">
                Eventos Realizados
              </h2>
              <p className="text-sm text-muted-foreground">
                Administra, elimina y edita cualquier evento (nombre, categoría, fecha, fotos y su orden).
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Div 2 · {events.length} {events.length === 1 ? "evento registrado" : "eventos registrados"}
          </span>
        </div>

        {/* Panel de edición activo si hay un evento seleccionado */}
        {editingEventId && (
          <div className="mt-8 rounded-2xl border-2 border-accent/60 bg-accent/5 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-accent/20 pb-4">
              <div className="flex items-center gap-2">
                <Pencil className="size-5 text-accent-foreground" />
                <h3 className="font-serif text-lg font-bold text-foreground">
                  Modificando evento: <span className="text-accent-foreground">{editTitle}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={cancelEditing}
                className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" /> Cancelar
              </button>
            </div>

            {/* Inputs de edición */}
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Nombre
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tipo de evento
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                >
                  {EVENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Fecha
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            {/* Carga de fotos adicionales */}
            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Fotos del álbum ({editPhotos.length} fotos en total)
                </label>
                <span className="text-xs text-muted-foreground">
                  Arrastra cualquier foto para cambiar su posición · La primera es la portada
                </span>
              </div>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  handleAddEditFiles(e.dataTransfer.files)
                }}
                onClick={() => editFileInputRef.current?.click()}
                className="flex min-h-[90px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-accent/40 bg-background/60 p-4 text-center hover:bg-background transition-colors"
              >
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleAddEditFiles(e.target.files)}
                />
                <ImagePlus className="size-5 text-accent-foreground" />
                <p className="mt-1 text-xs font-semibold text-foreground">
                  Haz clic o arrastra más fotos para agregarlas a este evento
                </p>
              </div>

              {/* Grilla de reordenamiento drag & drop */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {editPhotos.map((item, index) => {
                  const isCover = index === 0
                  const isDragging = editDragIndex === index
                  const isOver = editDragOverIndex === index
                  const imgSrc = item.kind === "existing" ? item.url : item.preview

                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", String(index))
                        setEditDragIndex(index)
                      }}
                      onDragOver={(e) => {
                        e.preventDefault()
                        setEditDragOverIndex(index)
                      }}
                      onDragLeave={() => {
                        if (editDragOverIndex === index) setEditDragOverIndex(null)
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        if (editDragIndex !== null) {
                          handleEditReorder(editDragIndex, index)
                        }
                        setEditDragIndex(null)
                        setEditDragOverIndex(null)
                      }}
                      onDragEnd={() => {
                        setEditDragIndex(null)
                        setEditDragOverIndex(null)
                      }}
                      className={`group relative aspect-square cursor-grab overflow-hidden rounded-xl border-2 bg-muted transition-all active:cursor-grabbing ${
                        isCover ? "border-primary ring-2 ring-primary/20" : "border-border"
                      } ${isDragging ? "opacity-30 scale-95" : "opacity-100"} ${
                        isOver ? "border-accent scale-105 shadow-lg" : ""
                      }`}
                      title="Arrastra para reordenar"
                    >
                      <img
                        src={imgSrc}
                        alt={`Foto ${index + 1}`}
                        className="size-full object-cover pointer-events-none"
                      />

                      <span
                        className={`absolute left-1.5 top-1.5 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm ${
                          isCover ? "bg-primary" : "bg-black/70 backdrop-blur-xs"
                        }`}
                      >
                        <GripVertical className="size-2.5 opacity-80" />
                        {isCover ? "★ Portada" : `#${index + 1}`}
                      </span>

                      {item.kind === "new" && (
                        <span className="absolute bottom-1.5 left-1.5 rounded bg-emerald-600 px-1 py-0.2 text-[9px] font-bold text-white">
                          Nueva
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => removeEditPhoto(index)}
                        aria-label="Quitar foto"
                        className="absolute right-1.5 top-1.5 rounded-full bg-destructive/90 p-1 text-white shadow-sm transition-transform hover:scale-110"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Mensaje de estado al editar */}
            {editMessage && (
              <div
                className={`mt-5 flex items-center gap-2 rounded-xl p-3 text-sm ${
                  editMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                }`}
              >
                {editMessage.type === "success" ? (
                  <Check className="size-4 shrink-0" />
                ) : (
                  <AlertCircle className="size-4 shrink-0" />
                )}
                <span>{editMessage.text}</span>
              </div>
            )}

            {/* Botones de guardar o cancelar edición */}
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-accent/20 pt-4">
              <button
                type="button"
                onClick={cancelEditing}
                disabled={isSavingEdit}
                className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSavingEdit || editPhotos.length === 0}
                className="flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm hover:opacity-90 disabled:opacity-50"
              >
                {isSavingEdit ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Guardando cambios…</span>
                  </>
                ) : (
                  <>
                    <Check className="size-4" />
                    <span>Guardar cambios</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Listado de eventos existentes */}
        <div className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-8 animate-spin text-accent" />
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-12 text-center text-muted-foreground">
              <CalendarDays className="mx-auto size-10 opacity-40" />
              <p className="mt-3 font-medium">Aún no hay eventos registrados.</p>
              <p className="text-xs">Usa el formulario de arriba (Div 1) para publicar tu primer evento.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => {
                const isSelectedForEdit = editingEventId === event.id
                const isBeingDeleted = deletingEventId === event.id
                const cover = event.coverUrl || event.photos?.[0]?.url

                return (
                  <div
                    key={event.id}
                    className={`overflow-hidden rounded-2xl border transition-all ${
                      isSelectedForEdit
                        ? "border-accent ring-2 ring-accent/30 bg-accent/5 shadow-md"
                        : "border-border bg-card hover:border-border/80 hover:shadow-sm"
                    }`}
                  >
                    {/* Imagen de portada */}
                    <div className="relative aspect-video w-full bg-muted overflow-hidden">
                      {cover ? (
                        <img
                          src={cover}
                          alt={event.title}
                          className="size-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                          Sin fotos
                        </div>
                      )}
                      <span className="absolute left-2.5 top-2.5 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-xs">
                        {event.category}
                      </span>
                      <span className="absolute right-2.5 top-2.5 rounded-full bg-primary/90 px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
                        {event.photos?.length || 0} fotos
                      </span>
                    </div>

                    {/* Contenido de la tarjeta */}
                    <div className="p-4">
                      <h4 className="font-serif text-base font-bold text-foreground line-clamp-1">
                        {event.title}
                      </h4>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="size-3.5" />
                        {event.date || "Sin fecha"}
                      </p>

                      {/* Botones de acción */}
                      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
                        <button
                          type="button"
                          onClick={() => startEditingEvent(event)}
                          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                            isSelectedForEdit
                              ? "bg-accent text-accent-foreground"
                              : "border border-border hover:bg-muted"
                          }`}
                        >
                          <Pencil className="size-3.5" />
                          {isSelectedForEdit ? "Editando ahora" : "Editar evento"}
                        </button>

                        <button
                          type="button"
                          disabled={isBeingDeleted}
                          onClick={() => handleDeleteEvent(event)}
                          className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                          title="Eliminar evento"
                        >
                          {isBeingDeleted ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
