"use client"

import { useState, useRef, useEffect } from "react"
import useSWR, { mutate } from "swr"
import {
  Upload,
  Check,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  Calendar,
  Award,
  Users,
  Plus,
  Minus,
  Info,
  RotateCcw,
} from "lucide-react"
import { fetchAboutSettings, updateAboutSettings, defaultAboutSettings } from "@/lib/data"
import { showSuccessAlert, showErrorAlert, showInfoAlert } from "@/lib/alerts"
import type { AboutSettings } from "@/lib/types"

export function AdminAboutManager() {
  const { data = defaultAboutSettings, isLoading } = useSWR<AboutSettings>(
    "about-settings",
    fetchAboutSettings
  )

  const [foundingYear, setFoundingYear] = useState<number>(defaultAboutSettings.foundingYear)
  const [eventsCount, setEventsCount] = useState<number>(defaultAboutSettings.eventsCount)
  const [capacity, setCapacity] = useState<number>(defaultAboutSettings.capacity)
  const [newFile, setNewFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sincronizar estado cuando se cargan los datos de Firestore
  useEffect(() => {
    if (data) {
      setFoundingYear(data.foundingYear || 2010)
      setEventsCount(data.eventsCount ?? 1000)
      setCapacity(data.capacity ?? 200)
    }
  }, [data])

  // Crear y limpiar preview del archivo seleccionado
  useEffect(() => {
    if (!newFile) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(newFile)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [newFile])

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    if (!file.type.startsWith("image/")) {
      showErrorAlert("Formato incorrecto", "Por favor selecciona un archivo de imagen (JPG, PNG o WebP).")
      return
    }
    setNewFile(file)
    setMessage(null)
  }

  // Cálculo automático del año actual
  const currentYear = new Date().getFullYear()
  const calculatedYears = Math.max(1, currentYear - foundingYear)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      await updateAboutSettings(
        {
          foundingYear: Number(foundingYear),
          eventsCount: Number(eventsCount),
          capacity: Number(capacity),
          imageUrl: previewUrl ? undefined : data.imageUrl,
        },
        newFile,
        data.imageStoragePath
      )

      await mutate("about-settings")
      setNewFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""

      setMessage({ type: "success", text: "¡Sección Nosotros actualizada correctamente!" })
      showSuccessAlert(
        "¡Cambios guardados!",
        "La foto y las estadísticas de Nosotros han sido actualizadas y ya están visibles en la web."
      )
    } catch (err: any) {
      const errorMsg = err?.message || "Ocurrió un error al guardar los cambios en Firebase."
      setMessage({ type: "error", text: errorMsg })
      showErrorAlert("Error al guardar", errorMsg)
    } finally {
      setIsSaving(false)
    }
  }

  const currentDisplayImage = previewUrl || data.imageUrl || "/images/about-venue.png"

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Encabezado descriptivo */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-accent/20 text-accent-foreground shadow-inner">
              <Users className="size-6" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">
                Gestión de la Sección "Nosotros"
              </h2>
              <p className="text-sm text-muted-foreground">
                Actualiza la fotografía principal del salón y configura las estadísticas visibles en el sitio.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-6 space-y-8">
          {/* =========================================================================
              BLOQUE 1: FOTO DE LA SECCIÓN NOSOTROS
          ========================================================================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-foreground">
                Fotografía del Salón / Espacio
              </h3>
              {newFile && (
                <button
                  type="button"
                  onClick={() => {
                    setNewFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ""
                  }}
                  className="flex items-center gap-1.5 text-xs text-destructive hover:underline"
                >
                  <RotateCcw className="size-3.5" />
                  Deshacer nueva foto
                </button>
              )}
            </div>

            {/* Aviso con Dimensiones Recomendadas */}
            <div className="flex items-start gap-2.5 rounded-2xl border border-accent/30 bg-accent/10 p-4 text-xs text-accent-foreground">
              <Sparkles className="size-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-foreground">
                  Dimensiones de referencia recomendadas para la foto:
                </p>
                <p className="text-muted-foreground">
                  Formato vertical <strong>4:5</strong> o similar, resolución ideal de <strong>800 × 1000 px</strong> (mínimo 600 × 750 px). Este tamaño garantiza que la foto encaje perfectamente en el marco con borde redondeado sin deformarse.
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12 md:items-center">
              {/* Vista previa de la imagen */}
              <div className="md:col-span-4 flex flex-col items-center">
                <div className="relative aspect-[4/5] w-full max-w-[260px] overflow-hidden rounded-2xl border-2 border-border shadow-md bg-muted">
                  <img
                    src={currentDisplayImage}
                    alt="Vista previa de Nosotros"
                    className="size-full object-cover"
                  />
                  {newFile && (
                    <span className="absolute left-2.5 top-2.5 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      Nueva foto seleccionada
                    </span>
                  )}
                  <div className="absolute -bottom-3 -right-2 hidden rounded-xl border border-border bg-card px-3 py-1.5 shadow-md sm:block">
                    <p className="font-serif text-xs font-bold text-primary">Shalom</p>
                  </div>
                </div>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  {newFile ? `Archivo: ${newFile.name}` : "Foto visible actualmente"}
                </p>
              </div>

              {/* Zona de subida */}
              <div className="md:col-span-8">
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    handleFileChange(e.dataTransfer.files)
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 p-6 text-center transition-all hover:border-accent hover:bg-accent/10"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files)}
                  />
                  <div className="flex size-11 items-center justify-center rounded-full bg-accent/20 text-accent-foreground transition-transform group-hover:scale-110">
                    <Upload className="size-5" />
                  </div>
                  <p className="mt-2.5 text-sm font-semibold text-foreground">
                    {newFile ? "Cambiar foto seleccionada" : "Haz clic para seleccionar nueva foto o arrástrala aquí"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Formatos admitidos: JPG, PNG o WebP. Se guardará al presionar "Guardar cambios".
                  </p>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-border/60" />

          {/* =========================================================================
              BLOQUE 2: ESTADÍSTICAS Y NÚMEROS DE NOSOTROS
          ========================================================================= */}
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-lg font-bold text-foreground">
                Estadísticas y Contadores
              </h3>
              <p className="text-sm text-muted-foreground">
                Controla los años de experiencia, eventos realizados y capacidad que se muestran al público.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {/* 1. Años de experiencia con incremento automático */}
              <div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-background p-5 shadow-xs">
                <div>
                  <div className="flex items-center gap-2 text-accent-foreground">
                    <Calendar className="size-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Años de experiencia
                    </span>
                  </div>

                  <p className="mt-3 font-serif text-3xl font-bold text-primary">
                    +{calculatedYears}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Se muestra como: <strong>+{calculatedYears} Años de experiencia</strong>
                  </p>

                  <div className="mt-4 space-y-1.5">
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase">
                      Año de fundación / inicio
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFoundingYear((prev) => prev - 1)}
                        className="flex size-8 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted"
                        title="Restar 1 año de fundación"
                      >
                        <Minus className="size-3" />
                      </button>
                      <input
                        type="number"
                        min="1980"
                        max={currentYear}
                        value={foundingYear}
                        onChange={(e) => setFoundingYear(Number(e.target.value) || currentYear)}
                        className="w-full rounded-lg border border-input bg-card px-3 py-1.5 text-center text-sm font-semibold focus:border-accent focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setFoundingYear((prev) => Math.min(currentYear, prev + 1))}
                        className="flex size-8 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted"
                        title="Sumar 1 año de fundación"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-border/60 bg-muted/30 p-2.5 text-[11px] text-muted-foreground">
                  <div className="flex items-start gap-1.5">
                    <Info className="size-3.5 shrink-0 mt-0.5 text-accent" />
                    <span>
                      <strong>Incremento automático:</strong> El sistema calcula ({currentYear} - {foundingYear} = {calculatedYears}). Cada 1 de enero aumentará solo sin tocar el código.
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Eventos realizados con incremento/decremento */}
              <div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-background p-5 shadow-xs">
                <div>
                  <div className="flex items-center gap-2 text-accent-foreground">
                    <Award className="size-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Eventos realizados
                    </span>
                  </div>

                  <p className="mt-3 font-serif text-3xl font-bold text-primary">
                    +{eventsCount}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Se muestra como: <strong>+{eventsCount} Eventos realizados</strong>
                  </p>

                  <div className="mt-4 space-y-1.5">
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase">
                      Número de eventos
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEventsCount((prev) => Math.max(0, prev - 50))}
                        className="flex size-8 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted"
                        title="Restar 50 eventos"
                      >
                        <Minus className="size-3" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={eventsCount}
                        onChange={(e) => setEventsCount(Math.max(0, Number(e.target.value) || 0))}
                        className="w-full rounded-lg border border-input bg-card px-3 py-1.5 text-center text-sm font-semibold focus:border-accent focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setEventsCount((prev) => prev + 50)}
                        className="flex size-8 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted"
                        title="Sumar 50 eventos"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-between gap-1 text-[11px] text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => setEventsCount((prev) => Math.max(0, prev - 10))}
                    className="rounded px-2 py-1 bg-muted/60 hover:bg-muted"
                  >
                    -10
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventsCount((prev) => prev + 10)}
                    className="rounded px-2 py-1 bg-muted/60 hover:bg-muted"
                  >
                    +10
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventsCount((prev) => prev + 100)}
                    className="rounded px-2 py-1 bg-muted/60 hover:bg-muted font-semibold text-accent-foreground"
                  >
                    +100
                  </button>
                </div>
              </div>

              {/* 3. Capacidad de invitados con incremento/decremento */}
              <div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-background p-5 shadow-xs">
                <div>
                  <div className="flex items-center gap-2 text-accent-foreground">
                    <Users className="size-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Capacidad de invitados
                    </span>
                  </div>

                  <p className="mt-3 font-serif text-3xl font-bold text-primary">
                    {capacity}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Se muestra como: <strong>{capacity} Capacidad de invitados</strong>
                  </p>

                  <div className="mt-4 space-y-1.5">
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase">
                      Número de personas
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCapacity((prev) => Math.max(0, prev - 10))}
                        className="flex size-8 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted"
                        title="Restar 10 personas"
                      >
                        <Minus className="size-3" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        step="5"
                        value={capacity}
                        onChange={(e) => setCapacity(Math.max(0, Number(e.target.value) || 0))}
                        className="w-full rounded-lg border border-input bg-card px-3 py-1.5 text-center text-sm font-semibold focus:border-accent focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setCapacity((prev) => prev + 10)}
                        className="flex size-8 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted"
                        title="Sumar 10 personas"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-between gap-1 text-[11px] text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => setCapacity((prev) => Math.max(0, prev - 5))}
                    className="rounded px-2 py-1 bg-muted/60 hover:bg-muted"
                  >
                    -5
                  </button>
                  <button
                    type="button"
                    onClick={() => setCapacity((prev) => prev + 5)}
                    className="rounded px-2 py-1 bg-muted/60 hover:bg-muted"
                  >
                    +5
                  </button>
                  <button
                    type="button"
                    onClick={() => setCapacity((prev) => prev + 25)}
                    className="rounded px-2 py-1 bg-muted/60 hover:bg-muted font-semibold text-accent-foreground"
                  >
                    +25
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mensajes de feedback */}
          {message && (
            <div
              className={`flex items-center gap-2 rounded-xl p-3.5 text-sm ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-destructive/10 text-destructive border border-destructive/20"
              }`}
            >
              {message.type === "success" ? <Check className="size-4 shrink-0" /> : <Info className="size-4 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Botón Guardar */}
          <div className="flex items-center justify-end border-t border-border/60 pt-5">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:opacity-90 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Guardando cambios en Nosotros…</span>
                </>
              ) : (
                <>
                  <Check className="size-4" />
                  <span>Guardar cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
