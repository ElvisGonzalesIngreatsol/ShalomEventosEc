"use client"

import { useState, useRef } from "react"
import useSWR, { mutate } from "swr"
import {
  LayoutTemplate,
  Megaphone,
  Upload,
  Trash2,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  Plus,
  ImagePlus,
  AlertCircle,
  ExternalLink,
  Pencil,
  X,
} from "lucide-react"
import {
  fetchAllHeroSlidesAdmin,
  fetchAllAdvertisementsAdmin,
  uploadMultipleHeroSlides,
  toggleHeroSlideActive,
  uploadMultipleAdvertisements,
  toggleAdvertisementActive,
  updateAdvertisement,
  deleteSiteImage,
} from "@/lib/data"
import {
  showSuccessAlert,
  showInfoAlert,
  showErrorAlert,
  showConfirmAlert,
} from "@/lib/alerts"
import type { HeroSlide, AdvertisingImage } from "@/lib/types"

export function AdminMediaManager() {
  const [kind, setKind] = useState<"heroSlides" | "advertisements">("heroSlides")

  // =========================================================
  // HERO SLIDES STATE
  // =========================================================
  const { data: slides = [], isLoading: loadingSlides } = useSWR<HeroSlide[]>(
    "hero-slides-admin",
    fetchAllHeroSlidesAdmin
  )
  const [heroFiles, setHeroFiles] = useState<File[]>([])
  const [heroTitle, setHeroTitle] = useState("")
  const [isUploadingHero, setIsUploadingHero] = useState(false)
  const [heroMessage, setHeroMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const heroFileInputRef = useRef<HTMLInputElement>(null)

  // =========================================================
  // ADS (PUBLICIDAD LATERAL) STATE
  // =========================================================
  const { data: ads = [], isLoading: loadingAds } = useSWR<AdvertisingImage[]>(
    "ads-admin",
    fetchAllAdvertisementsAdmin
  )
  const [adFiles, setAdFiles] = useState<File[]>([])
  const [adTitle, setAdTitle] = useState("")
  const [adPlacement, setAdPlacement] = useState<"left" | "right">("left")
  const [adLink, setAdLink] = useState("")
  const [isUploadingAd, setIsUploadingAd] = useState(false)
  const [adMessage, setAdMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const adFileInputRef = useRef<HTMLInputElement>(null)

  // ESTADO PARA EDITAR PUBLICIDAD
  const [editingAdId, setEditingAdId] = useState<string | null>(null)
  const [editAdTitle, setEditAdTitle] = useState("")
  const [editAdPlacement, setEditAdPlacement] = useState<"left" | "right">("left")
  const [editAdLink, setEditAdLink] = useState("")
  const [editAdActive, setEditAdActive] = useState(true)
  const [editAdNewFile, setEditAdNewFile] = useState<File | null>(null)
  const [isSavingAdEdit, setIsSavingAdEdit] = useState(false)
  const [editAdMessage, setEditAdMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const editAdFileInputRef = useRef<HTMLInputElement>(null)
  const editAdPanelRef = useRef<HTMLDivElement>(null)

  // MANEJO DE SUBIDA MÚLTIPLE DE HERO
  const handleHeroFilesSelected = (files: FileList | null) => {
    if (!files) return
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/"))
    setHeroFiles((prev) => [...prev, ...valid])
    setHeroMessage(null)
  }

  const handleUploadHeroSlides = async () => {
    if (heroFiles.length === 0) return
    setIsUploadingHero(true)
    setHeroMessage(null)

    const uploadedCount = heroFiles.length

    try {
      await uploadMultipleHeroSlides(heroFiles, heroTitle)
      setHeroFiles([])
      setHeroTitle("")
      if (heroFileInputRef.current) heroFileInputRef.current.value = ""
      await mutate("hero-slides-admin")
      await mutate("hero-slides")
      setHeroMessage({ type: "success", text: "¡Fotos de portada subidas con éxito!" })
      showSuccessAlert(
        "¡Portadas subidas!",
        `Se ${uploadedCount === 1 ? "añadió 1 foto" : `añadieron ${uploadedCount} fotos`} al carrusel del Hero.`
      )
    } catch (err: any) {
      const errorMsg = err?.message || "Error al subir las fotos. Verifica los permisos de Firebase."
      setHeroMessage({
        type: "error",
        text: errorMsg,
      })
      showErrorAlert("Error al subir fotos", errorMsg)
    } finally {
      setIsUploadingHero(false)
    }
  }

  const handleToggleSlideActive = async (slide: HeroSlide) => {
    const newStatus = !slide.active
    try {
      await toggleHeroSlideActive(slide.id, newStatus)
      await mutate("hero-slides-admin")
      await mutate("hero-slides")
      showInfoAlert(
        newStatus ? "Portada activada" : "Portada oculta",
        `La foto "${slide.title}" ahora está ${newStatus ? "visible en el carrusel" : "oculta temporalmente"}.`
      )
    } catch (err: any) {
      showErrorAlert(
        "Error al cambiar estado",
        err?.message || "No se pudo cambiar el estado de la imagen."
      )
    }
  }

  const handleDeleteSlide = async (slide: HeroSlide) => {
    const isConfirmed = await showConfirmAlert({
      title: "¿Eliminar foto de portada?",
      text: `Se eliminará permanentemente la foto "${slide.title}" del carrusel del hero.`,
      confirmButtonText: "Sí, eliminar foto",
      cancelButtonText: "Cancelar",
      isDestructive: true,
    })

    if (!isConfirmed) return

    try {
      await deleteSiteImage("heroSlides", slide)
      await mutate("hero-slides-admin")
      await mutate("hero-slides")
      showSuccessAlert("Foto eliminada", `La foto "${slide.title}" fue eliminada con éxito.`)
    } catch (err: any) {
      showErrorAlert(
        "Error al eliminar",
        err?.message || "No se pudo eliminar la imagen del servidor."
      )
    }
  }

  // MANEJO DE SUBIDA DE PUBLICIDAD LATERAL
  const handleAdFilesSelected = (files: FileList | null) => {
    if (!files) return
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/"))
    setAdFiles((prev) => [...prev, ...valid])
    setAdMessage(null)
  }

  const handleUploadAds = async () => {
    if (adFiles.length === 0) return
    setIsUploadingAd(true)
    setAdMessage(null)

    const uploadedCount = adFiles.length
    const currentPlacement = adPlacement

    try {
      await uploadMultipleAdvertisements(adFiles, adPlacement, adTitle, adLink)
      setAdFiles([])
      setAdTitle("")
      setAdLink("")
      if (adFileInputRef.current) adFileInputRef.current.value = ""
      await mutate("ads-admin")
      await mutate("advertisements")
      setAdMessage({ type: "success", text: "¡Publicidad lateral subida con éxito!" })
      showSuccessAlert(
        "¡Publicidad publicada!",
        `Se ${uploadedCount === 1 ? "subió 1 anuncio" : `subieron ${uploadedCount} anuncios`} al lado ${currentPlacement === "left" ? "izquierdo" : "derecho"}.`
      )
    } catch (err: any) {
      const errorMsg = err?.message || "Error al subir la publicidad. Verifica los permisos de Firebase."
      setAdMessage({
        type: "error",
        text: errorMsg,
      })
      showErrorAlert("Error al subir publicidad", errorMsg)
    } finally {
      setIsUploadingAd(false)
    }
  }

  const handleToggleAdActive = async (ad: AdvertisingImage) => {
    const newStatus = !ad.active
    try {
      await toggleAdvertisementActive(ad.id, newStatus)
      await mutate("ads-admin")
      await mutate("advertisements")
      showInfoAlert(
        newStatus ? "Publicidad activada" : "Publicidad oculta",
        `El anuncio "${ad.title}" ahora está ${newStatus ? "visible en la pantalla" : "oculto"}.`
      )
    } catch (err: any) {
      showErrorAlert(
        "Error al cambiar estado",
        err?.message || "No se pudo actualizar el estado del anuncio."
      )
    }
  }

  const handleDeleteAd = async (ad: AdvertisingImage) => {
    const isConfirmed = await showConfirmAlert({
      title: "¿Eliminar publicidad?",
      text: `Se eliminará permanentemente el anuncio "${ad.title}". Esta acción no se puede deshacer.`,
      confirmButtonText: "Sí, eliminar anuncio",
      cancelButtonText: "Cancelar",
      isDestructive: true,
    })

    if (!isConfirmed) return

    try {
      await deleteSiteImage("advertisements", ad)
      if (editingAdId === ad.id) {
        cancelEditingAd()
      }
      await mutate("ads-admin")
      await mutate("advertisements")
      showSuccessAlert(
        "Publicidad eliminada",
        `El anuncio "${ad.title}" fue removido exitosamente.`
      )
    } catch (err: any) {
      showErrorAlert(
        "Error al eliminar",
        err?.message || "No se pudo eliminar el anuncio del servidor."
      )
    }
  }

  // EDICIÓN DE PUBLICIDAD
  const startEditingAd = (ad: AdvertisingImage) => {
    setEditingAdId(ad.id)
    setEditAdTitle(ad.title)
    setEditAdPlacement(ad.placement)
    setEditAdLink(ad.link || "")
    setEditAdActive(ad.active ?? true)
    setEditAdNewFile(null)
    setEditAdMessage(null)

    // Desplazamiento suave al panel de edición
    setTimeout(() => {
      editAdPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 60)
  }

  const cancelEditingAd = () => {
    setEditingAdId(null)
    setEditAdTitle("")
    setEditAdLink("")
    setEditAdActive(true)
    setEditAdNewFile(null)
    setEditAdMessage(null)
  }

  const handleSaveAdEdit = async () => {
    if (!editingAdId) return
    if (!editAdTitle.trim()) {
      showErrorAlert("Falta información", "El título de la publicidad no puede estar vacío.")
      setEditAdMessage({ type: "error", text: "El título de la publicidad no puede estar vacío." })
      return
    }

    const currentAd = ads.find((a) => a.id === editingAdId)
    setIsSavingAdEdit(true)
    setEditAdMessage(null)

    try {
      await updateAdvertisement(
        editingAdId,
        {
          title: editAdTitle.trim(),
          placement: editAdPlacement,
          link: editAdLink.trim(),
          active: editAdActive,
        },
        editAdNewFile,
        currentAd?.storagePath
      )

      const updatedTitle = editAdTitle.trim()

      await mutate("ads-admin")
      await mutate("advertisements")
      setEditAdMessage({ type: "success", text: "¡Publicidad actualizada con éxito!" })
      showSuccessAlert(
        "¡Publicidad actualizada!",
        `Los datos de "${updatedTitle}" se guardaron correctamente.`
      )
      setTimeout(() => {
        cancelEditingAd()
      }, 1000)
    } catch (err: any) {
      const errorMsg = err?.message || "Error al actualizar la publicidad."
      setEditAdMessage({
        type: "error",
        text: errorMsg,
      })
      showErrorAlert("Error al actualizar", errorMsg)
    } finally {
      setIsSavingAdEdit(false)
    }
  }

  const leftAds = ads.filter((a) => a.placement === "left")
  const rightAds = ads.filter((a) => a.placement === "right")
  const currentEditingAd = ads.find((a) => a.id === editingAdId)

  return (
    <div className="space-y-8">
      {/* Selector de pestañas */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setKind("heroSlides")}
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
            kind === "heroSlides"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "border border-border bg-card hover:bg-muted"
          }`}
        >
          <LayoutTemplate className="size-4" />
          Portadas del Hero ({slides.length})
        </button>

        <button
          type="button"
          onClick={() => setKind("advertisements")}
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
            kind === "advertisements"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "border border-border bg-card hover:bg-muted"
          }`}
        >
          <Megaphone className="size-4" />
          Publicidad lateral ({ads.length})
        </button>
      </div>

      {/* =========================================================================
          SECCIÓN 1: PORTADAS DEL HERO
      ========================================================================= */}
      {kind === "heroSlides" ? (
        <div className="space-y-8">
          {/* Tarjeta para subir nuevas fotos */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 border-b border-border/60 pb-4">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-accent/20 text-accent-foreground">
                <ImagePlus className="size-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold">Añadir fotos al carrusel de portada</h3>
                <p className="text-sm text-muted-foreground">
                  Selecciona una o más fotos para que aparezcan en el carrusel de inicio.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Título o descripción general (opcional)
                </label>
                <input
                  type="text"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="Ej. Salón decorado para fiesta"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>

              {/* Zona Dropzone para varias fotos */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  handleHeroFilesSelected(e.dataTransfer.files)
                }}
                onClick={() => heroFileInputRef.current?.click()}
                className="group flex min-h-[130px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 p-6 text-center hover:border-accent hover:bg-accent/10 transition-colors"
              >
                <input
                  ref={heroFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleHeroFilesSelected(e.target.files)}
                />
                <div className="flex size-10 items-center justify-center rounded-full bg-accent/20 text-accent-foreground group-hover:scale-110 transition-transform">
                  <Upload className="size-5" />
                </div>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  Haz clic para elegir fotos o arrástralas aquí
                </p>
                <p className="text-xs text-muted-foreground">
                  Puedes seleccionar varias fotos a la vez para tu portada
                </p>
              </div>

              {/* Miniaturas de fotos seleccionadas pendientes de subir */}
              {heroFiles.length > 0 && (
                <div className="rounded-2xl border border-border/80 bg-muted/40 p-4">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {heroFiles.length} {heroFiles.length === 1 ? "foto seleccionada" : "fotos seleccionadas"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setHeroFiles([])}
                      className="text-xs font-medium text-destructive hover:underline"
                    >
                      Limpiar lista
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {heroFiles.map((file, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground"
                      >
                        {file.name}
                        <button
                          type="button"
                          onClick={() => setHeroFiles((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Mensaje de retroalimentación */}
              {heroMessage && (
                <div
                  className={`flex items-center gap-2 rounded-xl p-3 text-sm ${
                    heroMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "bg-destructive/10 text-destructive border border-destructive/20"
                  }`}
                >
                  {heroMessage.type === "success" ? (
                    <Check className="size-4 shrink-0" />
                  ) : (
                    <AlertCircle className="size-4 shrink-0" />
                  )}
                  <span>{heroMessage.text}</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleUploadHeroSlides}
                  disabled={heroFiles.length === 0 || isUploadingHero}
                  className="flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUploadingHero ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Subiendo fotos…</span>
                    </>
                  ) : (
                    <>
                      <Upload className="size-4" />
                      <span>Subir {heroFiles.length > 0 ? `(${heroFiles.length})` : ""} al carrusel</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Grilla de fotos de portada existentes con controles de poner/quitar */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold">Fotos de portada actuales</h3>
                <p className="text-sm text-muted-foreground">
                  Usa el botón "Poner / Quitar" para decidir qué fotos se muestran en el carrusel de inicio.
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {slides.filter((s) => s.active).length} activas en el carrusel
              </span>
            </div>

            {loadingSlides ? (
              <div className="flex justify-center py-12">
                <Loader2 className="size-8 animate-spin text-accent" />
              </div>
            ) : slides.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                <p>Aún no has subido fotos personalizadas para la portada.</p>
                <p className="text-xs">El sitio actualmente muestra las imágenes de demostración por defecto.</p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {slides.map((slide) => (
                  <div
                    key={slide.id}
                    className={`overflow-hidden rounded-2xl border transition-all ${
                      slide.active
                        ? "border-accent/80 bg-card ring-1 ring-accent/30"
                        : "border-border/60 bg-muted/30 opacity-70"
                    }`}
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-black/10">
                      <img
                        src={slide.url}
                        alt={slide.title}
                        className="size-full object-cover"
                      />
                      <span
                        className={`absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm ${
                          slide.active ? "bg-emerald-600" : "bg-black/70 backdrop-blur-xs"
                        }`}
                      >
                        {slide.active ? (
                          <>
                            <Check className="size-3" /> Visible en carrusel
                          </>
                        ) : (
                          <>
                            <EyeOff className="size-3" /> Oculta
                          </>
                        )}
                      </span>
                    </div>

                    <div className="p-4">
                      <h4 className="font-semibold text-foreground line-clamp-1">{slide.title}</h4>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {slide.active ? "Mostrándose en inicio" : "No visible en inicio"}
                      </p>

                      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
                        <button
                          type="button"
                          onClick={() => handleToggleSlideActive(slide)}
                          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                            slide.active
                              ? "border border-border hover:bg-muted text-foreground"
                              : "bg-primary text-primary-foreground"
                          }`}
                        >
                          {slide.active ? (
                            <>
                              <EyeOff className="size-3.5" /> Quitar del carrusel
                            </>
                          ) : (
                            <>
                              <Eye className="size-3.5" /> Poner en carrusel
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteSlide(slide)}
                          className="flex items-center gap-1 rounded-full p-2 text-destructive hover:bg-destructive/10 transition-colors"
                          title="Eliminar permanentemente"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* =========================================================================
            SECCIÓN 2: PUBLICIDAD LATERAL (PANTALLAS ANCHAS)
        ========================================================================= */
        <div className="space-y-8">
          {/* Panel de edición de anuncio si hay uno activo */}
          {editingAdId && currentEditingAd && (
            <div
              ref={editAdPanelRef}
              className="scroll-mt-24 rounded-3xl border-2 border-accent/80 bg-accent/5 p-6 shadow-md md:p-8"
            >
              <div className="flex items-center justify-between border-b border-accent/30 pb-4">
                <div className="flex items-center gap-2">
                  <Pencil className="size-5 text-accent-foreground" />
                  <h3 className="font-serif text-xl font-bold">
                    Editando publicidad: <span className="text-accent-foreground">{editAdTitle}</span>
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={cancelEditingAd}
                  className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" /> Cancelar
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Título o Marca *
                    </label>
                    <input
                      type="text"
                      value={editAdTitle}
                      onChange={(e) => setEditAdTitle(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Ubicación lateral
                    </label>
                    <select
                      value={editAdPlacement}
                      onChange={(e) => setEditAdPlacement(e.target.value as "left" | "right")}
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    >
                      <option value="left">Lado Izquierdo</option>
                      <option value="right">Lado Derecho</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Estado
                    </label>
                    <select
                      value={editAdActive ? "active" : "hidden"}
                      onChange={(e) => setEditAdActive(e.target.value === "active")}
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    >
                      <option value="active">Visible en la web</option>
                      <option value="hidden">Oculta (Inactiva)</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Enlace web o WhatsApp
                    </label>
                    <input
                      type="text"
                      value={editAdLink}
                      onChange={(e) => setEditAdLink(e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                </div>

                {/* Cambio de imagen opcional */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Cambiar imagen (opcional)
                  </label>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="size-20 overflow-hidden rounded-xl border border-border bg-black/10">
                      <img
                        src={editAdNewFile ? URL.createObjectURL(editAdNewFile) : currentEditingAd.url}
                        alt="Vista previa"
                        className="size-full object-cover"
                      />
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-input bg-background px-4 py-2.5 text-xs font-semibold hover:bg-muted">
                      <Upload className="size-4" />
                      {editAdNewFile ? editAdNewFile.name : "Subir nueva foto"}
                      <input
                        ref={editAdFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setEditAdNewFile(e.target.files?.[0] || null)}
                      />
                    </label>
                    {editAdNewFile && (
                      <button
                        type="button"
                        onClick={() => setEditAdNewFile(null)}
                        className="text-xs text-destructive hover:underline"
                      >
                        Conservar foto actual
                      </button>
                    )}
                  </div>
                </div>

                {editAdMessage && (
                  <div
                    className={`flex items-center gap-2 rounded-xl p-3 text-sm ${
                      editAdMessage.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-destructive/10 text-destructive border border-destructive/20"
                    }`}
                  >
                    {editAdMessage.type === "success" ? (
                      <Check className="size-4 shrink-0" />
                    ) : (
                      <AlertCircle className="size-4 shrink-0" />
                    )}
                    <span>{editAdMessage.text}</span>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={cancelEditingAd}
                    disabled={isSavingAdEdit}
                    className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold hover:bg-muted"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAdEdit}
                    disabled={isSavingAdEdit || !editAdTitle.trim()}
                    className="flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm hover:opacity-90 disabled:opacity-50"
                  >
                    {isSavingAdEdit ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>Guardando…</span>
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
            </div>
          )}

          {/* Formulario para añadir nuevas publicidades */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 border-b border-border/60 pb-4">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-accent/20 text-accent-foreground">
                <Megaphone className="size-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold">Añadir publicidad lateral</h3>
                <p className="text-sm text-muted-foreground">
                  Sube 2 o 3 fotos para cada lateral (Izquierda o Derecha) para aprovechar pantallas anchas.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Título o Marca
                  </label>
                  <input
                    value={adTitle}
                    onChange={(e) => setAdTitle(e.target.value)}
                    placeholder="Ej. DJ & Iluminación Pro"
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Ubicación lateral
                  </label>
                  <select
                    value={adPlacement}
                    onChange={(e) => setAdPlacement(e.target.value as "left" | "right")}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="left">Lado Izquierdo</option>
                    <option value="right">Lado Derecho</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Enlace web o WhatsApp (opcional)
                  </label>
                  <input
                    value={adLink}
                    onChange={(e) => setAdLink(e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>

              {/* Zona Dropzone para varias fotos de publicidad */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  handleAdFilesSelected(e.dataTransfer.files)
                }}
                onClick={() => adFileInputRef.current?.click()}
                className="group flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 p-5 text-center hover:border-accent hover:bg-accent/10 transition-colors"
              >
                <input
                  ref={adFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleAdFilesSelected(e.target.files)}
                />
                <Upload className="size-5 text-accent-foreground" />
                <p className="mt-1.5 text-sm font-semibold text-foreground">
                  Seleccionar fotos para {adPlacement === "left" ? "Lado Izquierdo" : "Lado Derecho"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Formato vertical recomendado (3:4 o similar)
                </p>
              </div>

              {/* Lista de archivos seleccionados */}
              {adFiles.length > 0 && (
                <div className="rounded-2xl border border-border/80 bg-muted/40 p-4">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {adFiles.length} {adFiles.length === 1 ? "foto seleccionada" : "fotos seleccionadas"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAdFiles([])}
                      className="text-xs font-medium text-destructive hover:underline"
                    >
                      Limpiar lista
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {adFiles.map((file, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground"
                      >
                        {file.name}
                        <button
                          type="button"
                          onClick={() => setAdFiles((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Mensaje de retroalimentación */}
              {adMessage && (
                <div
                  className={`flex items-center gap-2 rounded-xl p-3 text-sm ${
                    adMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "bg-destructive/10 text-destructive border border-destructive/20"
                  }`}
                >
                  {adMessage.type === "success" ? (
                    <Check className="size-4 shrink-0" />
                  ) : (
                    <AlertCircle className="size-4 shrink-0" />
                  )}
                  <span>{adMessage.text}</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleUploadAds}
                  disabled={adFiles.length === 0 || isUploadingAd}
                  className="flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUploadingAd ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Subiendo publicidad…</span>
                    </>
                  ) : (
                    <>
                      <Upload className="size-4" />
                      <span>Subir {adFiles.length > 0 ? `(${adFiles.length})` : ""} anuncios</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Grilla de anuncios actuales por lado */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-serif text-xl font-bold">Publicidades laterales actuales</h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded-full bg-accent/20 px-3 py-1 font-bold text-accent-foreground">
                  Izquierda: {leftAds.filter((a) => a.active).length} activas
                </span>
                <span className="rounded-full bg-primary/10 px-3 py-1 font-bold text-primary">
                  Derecha: {rightAds.filter((a) => a.active).length} activas
                </span>
              </div>
            </div>

            {loadingAds ? (
              <div className="flex justify-center py-12">
                <Loader2 className="size-8 animate-spin text-accent" />
              </div>
            ) : ads.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border py-12 text-center text-muted-foreground bg-card">
                <Megaphone className="mx-auto size-9 opacity-40" />
                <p className="mt-2 font-medium">Aún no hay anuncios registrados.</p>
                <p className="text-xs">Sube 2 o 3 fotos para la izquierda o derecha para aprovecharlas en pantallas anchas.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ads.map((item) => {
                  const isEditingThis = editingAdId === item.id
                  return (
                    <div
                      key={item.id}
                      className={`overflow-hidden rounded-2xl border transition-all ${
                        isEditingThis
                          ? "border-accent ring-2 ring-accent/30 bg-accent/5 shadow-md"
                          : item.active
                            ? "border-border bg-card shadow-xs"
                            : "border-border/60 bg-muted/30 opacity-70"
                      }`}
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/10">
                        <img src={item.url} alt={item.title} className="size-full object-cover" />
                        <span className="absolute left-2.5 top-2.5 rounded-full bg-black/70 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-xs">
                          {item.placement === "left" ? "Lado Izquierdo" : "Lado Derecho"}
                        </span>
                        <span
                          className={`absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-sm ${
                            item.active ? "bg-emerald-600" : "bg-black/70"
                          }`}
                        >
                          {item.active ? "Visible" : "Oculta"}
                        </span>
                      </div>

                      <div className="p-4">
                        <h4 className="font-semibold text-foreground line-clamp-1">{item.title}</h4>
                        {item.link ? (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 flex items-center gap-1 text-xs text-accent hover:underline line-clamp-1"
                          >
                            <ExternalLink className="size-3" />
                            {item.link}
                          </a>
                        ) : (
                          <p className="mt-1 text-xs text-muted-foreground">Enlaza a WhatsApp</p>
                        )}

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
                          <button
                            type="button"
                            onClick={() => {
                              if (isEditingThis) {
                                editAdPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
                              } else {
                                startEditingAd(item)
                              }
                            }}
                            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                              isEditingThis
                                ? "bg-accent text-accent-foreground shadow-xs ring-2 ring-accent/40 animate-pulse"
                                : "border border-border hover:bg-muted"
                            }`}
                            title={isEditingThis ? "Ir al formulario arriba" : "Editar anuncio"}
                          >
                            <Pencil className="size-3" />
                            {isEditingThis ? "Editando ↑" : "Editar"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleAdActive(item)}
                            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                              item.active
                                ? "border border-border hover:bg-muted text-foreground"
                                : "bg-primary text-primary-foreground"
                            }`}
                          >
                            {item.active ? (
                              <>
                                <EyeOff className="size-3.5" /> Quitar
                              </>
                            ) : (
                              <>
                                <Eye className="size-3.5" /> Poner
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteAd(item)}
                            className="flex items-center gap-1 rounded-full p-2 text-destructive hover:bg-destructive/10 transition-colors"
                            title="Eliminar anuncio"
                          >
                            <Trash2 className="size-4" />
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
      )}
    </div>
  )
}
