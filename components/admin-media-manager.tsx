"use client"

import { useState, useEffect, useRef } from "react"
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
  Clock,
  Smartphone,
  Monitor,
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
  fetchAdSettings,
  updateAdSettings,
  defaultAdSettings,
} from "@/lib/data"
import {
  showSuccessAlert,
  showInfoAlert,
  showErrorAlert,
  showConfirmAlert,
} from "@/lib/alerts"
import type { HeroSlide, AdvertisingImage, AdTarget, AdSettings } from "@/lib/types"

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
  // ADS (PUBLICIDAD WEB Y MÓVIL) STATE
  // =========================================================
  const { data: ads = [], isLoading: loadingAds } = useSWR<AdvertisingImage[]>(
    "ads-admin",
    fetchAllAdvertisementsAdmin
  )
  const { data: adSettings = defaultAdSettings, mutate: mutateAdSettings } = useSWR<AdSettings>(
    "ad-settings",
    fetchAdSettings
  )

  // Intervalos de rotación por tipo (por defecto 2 segundos)
  const [desktopIntervalInput, setDesktopIntervalInput] = useState<number>(2)
  const [mobileIntervalInput, setMobileIntervalInput] = useState<number>(2)
  const [isSavingIntervals, setIsSavingIntervals] = useState(false)
  const [intervalSavedMessage, setIntervalSavedMessage] = useState(false)

  // Sincronizar intervalos cuando cargan las configuraciones
  useEffect(() => {
    if (adSettings) {
      setDesktopIntervalInput(adSettings.desktopIntervalSeconds ?? 2)
      setMobileIntervalInput(adSettings.mobileIntervalSeconds ?? 2)
    }
  }, [adSettings])

  const [adFiles, setAdFiles] = useState<File[]>([])
  const [adTitle, setAdTitle] = useState("")
  const [adTarget, setAdTarget] = useState<AdTarget>("desktop")
  const [adPlacement, setAdPlacement] = useState<"left" | "right">("left")
  const [adLink, setAdLink] = useState("")
  const [isUploadingAd, setIsUploadingAd] = useState(false)
  const [adMessage, setAdMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const adFileInputRef = useRef<HTMLInputElement>(null)

  // ESTADO PARA EDITAR PUBLICIDAD
  const [editingAdId, setEditingAdId] = useState<string | null>(null)
  const [editAdTitle, setEditAdTitle] = useState("")
  const [editAdTarget, setEditAdTarget] = useState<AdTarget>("desktop")
  const [editAdPlacement, setEditAdPlacement] = useState<"left" | "right">("left")
  const [editAdLink, setEditAdLink] = useState("")
  const [editAdActive, setEditAdActive] = useState(true)
  const [editAdNewFile, setEditAdNewFile] = useState<File | null>(null)
  const [isSavingAdEdit, setIsSavingAdEdit] = useState(false)
  const [editAdMessage, setEditAdMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const editAdFileInputRef = useRef<HTMLInputElement>(null)
  const editAdPanelRef = useRef<HTMLDivElement>(null)

  // Filtro de lista de publicidades
  const [adListFilter, setAdListFilter] = useState<"all" | "desktop" | "mobile">("all")

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

  const handleSaveIntervals = async () => {
    setIsSavingIntervals(true)
    try {
      const desktopSec = Number(desktopIntervalInput) > 0 ? Number(desktopIntervalInput) : 2
      const mobileSec = Number(mobileIntervalInput) > 0 ? Number(mobileIntervalInput) : 2
      await updateAdSettings({
        desktopIntervalSeconds: desktopSec,
        mobileIntervalSeconds: mobileSec,
      })
      await mutateAdSettings()
      await mutate("ad-settings")
      setIntervalSavedMessage(true)
      setTimeout(() => setIntervalSavedMessage(false), 3000)
      showSuccessAlert(
        "¡Intervalos guardados!",
        `Computadoras: ${desktopSec} segundos | Celulares: ${mobileSec} segundos`
      )
    } catch (err: any) {
      showErrorAlert("Error al guardar intervalos", err?.message || "No se pudo actualizar.")
    } finally {
      setIsSavingIntervals(false)
    }
  }

  const handleUploadAds = async () => {
    if (adFiles.length === 0) return
    setIsUploadingAd(true)
    setAdMessage(null)

    const uploadedCount = adFiles.length
    const currentTarget = adTarget
    const currentPlacement = adPlacement

    try {
      await uploadMultipleAdvertisements(adFiles, adTarget, adPlacement, adTitle, adLink)
      setAdFiles([])
      setAdTitle("")
      setAdLink("")
      if (adFileInputRef.current) adFileInputRef.current.value = ""
      await mutate("ads-admin")
      await mutate("advertisements")
      setAdMessage({ type: "success", text: "¡Publicidad subida con éxito!" })
      showSuccessAlert(
        "¡Publicidad publicada!",
        `Se ${uploadedCount === 1 ? "subió 1 anuncio" : `subieron ${uploadedCount} anuncios`} para ${
          currentTarget === "mobile"
            ? "teléfonos móviles (anuncio emergente)"
            : `computadoras (${currentPlacement === "left" ? "lado izquierdo" : "lado derecho"})`
        }.`
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
        `El anuncio "${ad.title || "sin título"}" ahora está ${newStatus ? "visible" : "oculto"}.`
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
      text: `Se eliminará permanentemente el anuncio "${ad.title || "seleccionado"}". Esta acción no se puede deshacer.`,
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
        `El anuncio "${ad.title || "seleccionado"}" fue removido exitosamente.`
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
    setEditAdTitle(ad.title || "")
    const isMobile = ad.target === "mobile" || ad.placement === "mobile"
    setEditAdTarget(isMobile ? "mobile" : "desktop")
    setEditAdPlacement(ad.placement === "right" ? "right" : "left")
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

    const currentAd = ads.find((a) => a.id === editingAdId)
    setIsSavingAdEdit(true)
    setEditAdMessage(null)

    try {
      await updateAdvertisement(
        editingAdId,
        {
          title: editAdTitle.trim(),
          target: editAdTarget,
          placement: editAdTarget === "mobile" ? "mobile" : editAdPlacement,
          link: editAdLink.trim(),
          active: editAdActive,
        },
        editAdNewFile,
        currentAd?.storagePath
      )

      const updatedTitle = editAdTitle.trim() || "Publicidad"

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

  // Listas segmentadas por dispositivo
  const desktopAds = ads.filter((a) => a.target !== "mobile" && a.placement !== "mobile")
  const mobileAds = ads.filter((a) => a.target === "mobile" || a.placement === "mobile")
  const leftAds = desktopAds.filter((a) => a.placement === "left")
  const rightAds = desktopAds.filter((a) => a.placement === "right")

  const currentEditingAd = ads.find((a) => a.id === editingAdId)

  // Lista filtrada según selector de vista
  const filteredAdsList =
    adListFilter === "desktop"
      ? desktopAds
      : adListFilter === "mobile"
      ? mobileAds
      : ads

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

            <div className="mt-4 flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-3.5 py-2.5 text-xs text-accent-foreground">
              <Sparkles className="size-4 shrink-0" />
              <span>
                <strong>Tamaño de referencia recomendado:</strong> 1920 × 1080 px (Panorámica 16:9 de alta resolución) para que se aprecie nítida en pantallas de computadora y teléfonos celulares.
              </span>
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
                  Formato recomendado: 1920 × 1080 px (16:9). Puedes seleccionar varias fotos a la vez.
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
            SECCIÓN 2: PUBLICIDAD (WEB / COMPUTADORAS Y MÓVILES)
        ========================================================================= */
        <div className="space-y-8">
          {/* ------------------------------------------------------------- */}
          {/* BLOQUE 1: CONFIGURACIÓN DE INTERVALOS DE ROTACIÓN            */}
          {/* ------------------------------------------------------------- */}
          <div className="rounded-3xl border border-accent/40 bg-card p-6 shadow-sm md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-accent/20 text-accent-foreground">
                  <Clock className="size-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold">Intervalos de rotación de anuncios</h3>
                  <p className="text-sm text-muted-foreground">
                    Tiempo que permanece visible cada anuncio antes de cambiar automáticamente (por defecto: 2 segundos).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSaveIntervals}
                disabled={isSavingIntervals}
                className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-xs font-semibold text-accent-foreground shadow-sm hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {isSavingIntervals ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Guardando…</span>
                  </>
                ) : intervalSavedMessage ? (
                  <>
                    <Check className="size-4 text-emerald-600" />
                    <span>¡Guardado con éxito!</span>
                  </>
                ) : (
                  <>
                    <Check className="size-4" />
                    <span>Guardar intervalos</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/80 bg-background/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="size-4 text-accent" />
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Computadoras / Web (Segundos)
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    step="1"
                    value={desktopIntervalInput}
                    onChange={(e) => setDesktopIntervalInput(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-28 rounded-xl border border-input bg-card px-4 py-2 text-center text-base font-bold focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                  <span className="text-xs text-muted-foreground">
                    Duración en la tira lateral (Izquierda / Derecha)
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-border/80 bg-background/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="size-4 text-accent" />
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Teléfonos / Móvil (Segundos)
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    step="1"
                    value={mobileIntervalInput}
                    onChange={(e) => setMobileIntervalInput(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-28 rounded-xl border border-input bg-card px-4 py-2 text-center text-base font-bold focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                  <span className="text-xs text-muted-foreground">
                    Duración en el anuncio emergente (Popup)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* BLOQUE 2: PANEL DE EDICIÓN DE ANUNCIO                        */}
          {/* ------------------------------------------------------------- */}
          {editingAdId && currentEditingAd && (
            <div
              ref={editAdPanelRef}
              className="scroll-mt-24 rounded-3xl border-2 border-accent/80 bg-accent/5 p-6 shadow-md md:p-8"
            >
              <div className="flex items-center justify-between border-b border-accent/30 pb-4">
                <div className="flex items-center gap-2">
                  <Pencil className="size-5 text-accent-foreground" />
                  <h3 className="font-serif text-xl font-bold">
                    Editando publicidad:{" "}
                    <span className="text-accent-foreground">
                      {editAdTitle || "Sin título"}
                    </span>
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
                {/* Selector de dispositivo en edición */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tipo de publicidad
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setEditAdTarget("desktop")}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                        editAdTarget === "desktop"
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "border border-border bg-background hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <Monitor className="size-3.5" /> Computadoras / Web
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditAdTarget("mobile")}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                        editAdTarget === "mobile"
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "border border-border bg-background hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <Smartphone className="size-3.5" /> Celulares / Móvil (Emergente)
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Título o Marca <span className="text-muted-foreground font-normal">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={editAdTitle}
                      onChange={(e) => setEditAdTitle(e.target.value)}
                      placeholder="Ej. DJ & Iluminación Pro (opcional)"
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </div>

                  {editAdTarget === "desktop" ? (
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
                  ) : (
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Modalidad móvil
                      </label>
                      <div className="rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-xs font-semibold text-muted-foreground">
                        📱 Ventana emergente (Popup)
                      </div>
                    </div>
                  )}

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
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Enlace web o WhatsApp <span className="text-muted-foreground font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={editAdLink}
                    onChange={(e) => setEditAdLink(e.target.value)}
                    placeholder="https://... o enlace a WhatsApp"
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>

                {/* Cambio de imagen opcional */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Cambiar imagen (opcional)
                    </label>
                    <span className="text-[11px] text-muted-foreground">
                      {editAdTarget === "desktop"
                        ? "📐 Recomendado tira web: 600 × 1600 px o 600 × 1400 px (Proporción vertical alargada ~1:2.5)"
                        : "📐 Recomendado móvil emergente: 1080 × 1350 px (4:5) o 800 × 800 px (1:1)"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="size-20 aspect-square overflow-hidden rounded-xl border border-border bg-black/10">
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

                <div className="flex justify-end gap-2 border-t border-accent/20 pt-3">
                  <button
                    type="button"
                    onClick={cancelEditingAd}
                    className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAdEdit}
                    disabled={isSavingAdEdit}
                    className="flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-xs font-semibold text-accent-foreground shadow-sm hover:opacity-90 disabled:opacity-50"
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

          {/* ------------------------------------------------------------- */}
          {/* BLOQUE 3: FORMULARIO PARA AÑADIR NUEVAS PUBLICIDADES        */}
          {/* ------------------------------------------------------------- */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 border-b border-border/60 pb-4">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-accent/20 text-accent-foreground">
                <Megaphone className="size-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold">Añadir nueva publicidad</h3>
                <p className="text-sm text-muted-foreground">
                  Elige si deseas subir publicidad para computadoras (tira lateral) o para celulares (anuncio emergente).
                </p>
              </div>
            </div>

            {/* Selector de Tipo de Publicidad: Web vs Móvil */}
            <div className="mt-5">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                ¿Dónde se mostrará esta publicidad?
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setAdTarget("desktop")}
                  className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                    adTarget === "desktop"
                      ? "border-accent bg-accent/10 ring-2 ring-accent/30 shadow-xs"
                      : "border-border bg-background hover:bg-muted/50"
                  }`}
                >
                  <div className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${
                    adTarget === "desktop" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    <Monitor className="size-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Publicidad para Computadoras (Web)</h4>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Se muestra en una tira larga y ancha en los laterales (izquierdo o derecho) que va rotando los anuncios.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAdTarget("mobile")}
                  className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                    adTarget === "mobile"
                      ? "border-accent bg-accent/10 ring-2 ring-accent/30 shadow-xs"
                      : "border-border bg-background hover:bg-muted/50"
                  }`}
                >
                  <div className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${
                    adTarget === "mobile" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    <Smartphone className="size-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Publicidad para Móvil (Teléfonos)</h4>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Se muestra en un anuncio emergente (popup) centrado con botón de cerrar que rota automáticamente.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Referencia de tamaño de imagen según el tipo seleccionado */}
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-accent/30 bg-accent/10 p-3.5 text-xs text-accent-foreground">
              <Sparkles className="size-4 shrink-0 mt-0.5 text-accent" />
              {adTarget === "desktop" ? (
                <div>
                  <strong>📐 Tamaño de referencia recomendado para Web / Computadora (Tira lateral larga):</strong>
                  <p className="mt-0.5 text-accent-foreground/90">
                    Formato <strong>vertical alargado (tira larga)</strong>: <strong>600 × 1600 px</strong> o <strong>600 × 1400 px</strong> (Proporción aprox. 1:2.5) para que llene la tira lateral de arriba a abajo de manera limpia y nítida.
                  </p>
                </div>
              ) : (
                <div>
                  <strong>📐 Tamaño de referencia recomendado para Móvil (Anuncio emergente):</strong>
                  <p className="mt-0.5 text-accent-foreground/90">
                    Formato <strong>vertical o cuadrado</strong>: <strong>1080 × 1350 px</strong> (Proporción 4:5), <strong>1080 × 1920 px</strong> (9:16) o <strong>800 × 800 px</strong> (1:1) para que se aprecie completo y centrado en la pantalla del celular.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Título o Marca <span className="text-muted-foreground font-normal">(opcional)</span>
                  </label>
                  <input
                    value={adTitle}
                    onChange={(e) => setAdTitle(e.target.value)}
                    placeholder="Ej. DJ & Sonido Pro (opcional)"
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>

                {adTarget === "desktop" ? (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Ubicación lateral
                    </label>
                    <select
                      value={adPlacement}
                      onChange={(e) => setAdPlacement(e.target.value as "left" | "right")}
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    >
                      <option value="left">Lado Izquierdo (Tira)</option>
                      <option value="right">Lado Derecho (Tira)</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Ubicación
                    </label>
                    <div className="rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-xs font-semibold text-muted-foreground">
                      📱 Anuncio emergente en celular
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Enlace web o WhatsApp <span className="text-muted-foreground font-normal">(opcional)</span>
                  </label>
                  <input
                    value={adLink}
                    onChange={(e) => setAdLink(e.target.value)}
                    placeholder="https://instagram.com/... o WhatsApp"
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>

              {/* Zona Dropzone para fotos de publicidad */}
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
                  {adTarget === "mobile"
                    ? "Seleccionar fotos para Anuncio Emergente Móvil"
                    : `Seleccionar fotos para ${adPlacement === "left" ? "Tira Izquierda" : "Tira Derecha"}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {adTarget === "mobile"
                    ? "Recomendado: 1080 × 1350 px (4:5) o 800 × 800 px (1:1)"
                    : "Recomendado: 600 × 1600 px o 600 × 1400 px (Tira vertical larga)"}
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

          {/* ------------------------------------------------------------- */}
          {/* BLOQUE 4: LISTA Y GRILLA DE ANUNCIOS ACTUALES                 */}
          {/* ------------------------------------------------------------- */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-xl font-bold">Publicidades registradas</h3>
                <p className="text-xs text-muted-foreground">
                  Gestiona y activa/desactiva los anuncios que rotan en la web y en el móvil.
                </p>
              </div>

              {/* Filtro por dispositivo */}
              <div className="flex flex-wrap items-center gap-1.5 rounded-full border border-border bg-card p-1">
                <button
                  type="button"
                  onClick={() => setAdListFilter("all")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                    adListFilter === "all"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Todas ({ads.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAdListFilter("desktop")}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                    adListFilter === "desktop"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Monitor className="size-3" /> Web ({desktopAds.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAdListFilter("mobile")}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                    adListFilter === "mobile"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Smartphone className="size-3" /> Móvil ({mobileAds.length})
                </button>
              </div>
            </div>

            {/* Badges de estadísticas activas */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-accent/20 px-3 py-1 font-bold text-accent-foreground">
                Web Izquierda: {leftAds.filter((a) => a.active).length} activas
              </span>
              <span className="rounded-full bg-primary/10 px-3 py-1 font-bold text-primary">
                Web Derecha: {rightAds.filter((a) => a.active).length} activas
              </span>
              <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 px-3 py-1 font-bold">
                Móvil Emergente: {mobileAds.filter((a) => a.active).length} activas
              </span>
            </div>

            {loadingAds ? (
              <div className="flex justify-center py-12">
                <Loader2 className="size-8 animate-spin text-accent" />
              </div>
            ) : filteredAdsList.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border py-12 text-center text-muted-foreground bg-card">
                <Megaphone className="mx-auto size-9 opacity-40" />
                <p className="mt-2 font-medium">No hay anuncios en esta categoría.</p>
                <p className="text-xs">Usa el formulario arriba para subir nuevos anuncios.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAdsList.map((item) => {
                  const isEditingThis = editingAdId === item.id
                  const isMobile = item.target === "mobile" || item.placement === "mobile"

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
                      <div className="relative aspect-[4/5] sm:aspect-[3/4] w-full overflow-hidden bg-black/10">
                        <img
                          src={item.url}
                          alt={item.title || "Anuncio"}
                          className="size-full object-cover"
                        />
                        <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-black/75 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-xs shadow-xs">
                          {isMobile ? (
                            <>
                              <Smartphone className="size-3 text-accent" /> Móvil (Emergente)
                            </>
                          ) : (
                            <>
                              <Monitor className="size-3 text-accent" />{" "}
                              {item.placement === "right" ? "Web (Derecha)" : "Web (Izquierda)"}
                            </>
                          )}
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
                        <h4 className="font-semibold text-foreground line-clamp-1">
                          {item.title || <span className="italic text-muted-foreground text-xs">(Sin título)</span>}
                        </h4>
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
