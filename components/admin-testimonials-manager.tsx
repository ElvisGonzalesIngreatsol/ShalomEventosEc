"use client"

import { useState, useMemo } from "react"
import useSWR, { mutate } from "swr"
import {
  MessageSquare,
  Check,
  EyeOff,
  Trash2,
  Loader2,
  Star,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  Copy,
  ExternalLink,
} from "lucide-react"
import {
  fetchAllTestimonials,
  setTestimonialApproval,
  deleteTestimonial,
} from "@/lib/data"
import {
  showSuccessAlert,
  showInfoAlert,
  showErrorAlert,
  showConfirmAlert,
} from "@/lib/alerts"
import type { Testimonial } from "@/lib/types"
import { site } from "@/lib/site"

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
    </svg>
  )
}

export function AdminTestimonialsManager() {
  const { data: testimonials = [], isLoading } = useSWR<Testimonial[]>(
    "testimonials-all",
    fetchAllTestimonials
  )

  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  // Contadores
  const totalCount = testimonials.length
  const approvedCount = testimonials.filter((t) => t.approved).length
  const pendingCount = testimonials.filter((t) => !t.approved).length

  // Lista filtrada
  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((t) => {
      // Filtro por estado
      if (filter === "pending" && t.approved) return false
      if (filter === "approved" && !t.approved) return false

      // Búsqueda por texto (nombre, mensaje o tipo de evento)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchName = t.name.toLowerCase().includes(query)
        const matchMsg = t.message.toLowerCase().includes(query)
        const matchType = t.eventType.toLowerCase().includes(query)
        return matchName || matchMsg || matchType
      }

      return true
    })
  }, [testimonials, filter, searchQuery])

  // APROBAR O OCULTAR CON SWEETALERT
  const handleToggleApproval = async (t: Testimonial, shouldApprove: boolean) => {
    setActionLoadingId(t.id)
    try {
      await setTestimonialApproval(t.id, shouldApprove)
      await mutate("testimonials-all")
      await mutate("testimonials-approved")

      if (shouldApprove) {
        showSuccessAlert(
          "¡Opinión aprobada!",
          `El comentario de ${t.name} ahora es visible para los visitantes.`
        )
      } else {
        showInfoAlert(
          "Opinión ocultada",
          `El comentario de ${t.name} se ocultó de la página web.`
        )
      }
    } catch (err: any) {
      showErrorAlert(
        "Error al actualizar",
        err?.message || "No se pudo cambiar el estado de la opinión."
      )
    } finally {
      setActionLoadingId(null)
    }
  }

  // ELIMINAR CON CONFIRMACIÓN SWEETALERT
  const handleDeleteTestimonial = async (t: Testimonial) => {
    const isConfirmed = await showConfirmAlert({
      title: "¿Eliminar opinión?",
      text: `Se eliminará permanentemente la opinión de "${t.name}". Esta acción no se puede deshacer.`,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      isDestructive: true,
    })

    if (isConfirmed) {
      setActionLoadingId(t.id)
      try {
        await deleteTestimonial(t.id)
        await mutate("testimonials-all")
        await mutate("testimonials-approved")

        showSuccessAlert(
          "Opinión eliminada",
          "El comentario fue eliminado con éxito."
        )
      } catch (err: any) {
        showErrorAlert(
          "Error al eliminar",
          err?.message || "No se pudo eliminar el comentario."
        )
      } finally {
        setActionLoadingId(null)
      }
    }
  }

  // COPIAR COMENTARIO Y ABRIR GOOGLE MAPS
  const handleCopyForGoogle = async (t: Testimonial) => {
    try {
      await navigator.clipboard.writeText(t.message)
      window.open(site.googleMapsReview, "_blank", "noopener,noreferrer")
      showSuccessAlert(
        "¡Comentario copiado!",
        `El testimonio de "${t.name}" se copió al portapapeles y se abrió Google Maps para que puedas pegarlo.`
      )
    } catch {
      window.open(site.googleMapsReview, "_blank", "noopener,noreferrer")
      showInfoAlert(
        "Google Maps abierto",
        "Se abrió la ficha de Google Maps de Shalom Eventos."
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado y estadísticas */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-accent/20 text-accent-foreground shadow-xs">
              <MessageSquare className="size-6" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">
                Gestión de Opiniones
              </h2>
              <p className="text-sm text-muted-foreground">
                Revisa, aprueba para el sitio público o copia testimonios para Google Maps.
              </p>
            </div>
          </div>

          {/* Badges de resumen */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-muted px-3.5 py-1.5 text-xs font-semibold text-foreground">
              Total: {totalCount}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
              <CheckCircle2 className="size-3.5" />
              Publicadas: {approvedCount}
            </span>
            <span
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold border ${
                pendingCount > 0
                  ? "bg-amber-50 text-amber-700 border-amber-300 animate-pulse"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              <Clock className="size-3.5" />
              Pendientes: {pendingCount}
            </span>
            <a
              href={site.googleMapsReview}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
            >
              <GoogleIcon className="size-3.5" />
              <span>Ficha Google Maps</span>
              <ExternalLink className="size-3 text-muted-foreground" />
            </a>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                filter === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "border border-border bg-background hover:bg-muted text-foreground"
              }`}
            >
              Todas ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("pending")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                filter === "pending"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "border border-border bg-background hover:bg-muted text-foreground"
              }`}
            >
              <span>Pendientes ({pendingCount})</span>
              {pendingCount > 0 && <span className="size-2 rounded-full bg-amber-200" />}
            </button>
            <button
              type="button"
              onClick={() => setFilter("approved")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                filter === "approved"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "border border-border bg-background hover:bg-muted text-foreground"
              }`}
            >
              Publicadas ({approvedCount})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, evento..."
              className="w-full rounded-full border border-input bg-background py-1.5 pl-9 pr-4 text-xs focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>
      </div>

      {/* Lista de testimonios */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-accent" />
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center">
          <MessageSquare className="mx-auto size-10 text-muted-foreground/50" />
          <h3 className="mt-3 font-serif text-lg font-semibold text-foreground">
            No se encontraron opiniones
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery.trim()
              ? "Ningún comentario coincide con los términos de búsqueda."
              : filter === "pending"
                ? "No hay opiniones pendientes por revisar en este momento."
                : filter === "approved"
                  ? "No hay opiniones aprobadas actualmente."
                  : "Aún no se han recibido opiniones de clientes."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredTestimonials.map((t) => {
            const isProcessing = actionLoadingId === t.id
            return (
              <div
                key={t.id}
                className={`relative flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-xs transition-all hover:shadow-md ${
                  t.approved
                    ? "border-border"
                    : "border-amber-300/80 bg-amber-50/20 ring-1 ring-amber-200/50"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{t.name}</p>
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {t.eventType}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`size-3.5 ${
                              i < t.rating
                                ? "fill-amber-400 text-amber-400"
                                : "fill-muted text-muted"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        t.approved
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {t.approved ? "Publicada" : "Pendiente"}
                    </span>
                  </div>

                  <blockquote className="mt-3 text-sm leading-relaxed text-foreground/85">
                    &ldquo;{t.message}&rdquo;
                  </blockquote>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {!t.approved ? (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleToggleApproval(t, true)}
                        className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Check className="size-3.5" />
                        )}
                        Aprobar
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleToggleApproval(t, false)}
                        className="flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <EyeOff className="size-3.5" />
                        )}
                        Ocultar
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCopyForGoogle(t)}
                      title="Copiar texto y abrir Google Maps para publicar la reseña"
                      className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:border-accent hover:bg-muted/80 transition-colors"
                    >
                      <GoogleIcon className="size-3.5" />
                      <Copy className="size-3 text-muted-foreground" />
                      <span>Copiar para Google</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleDeleteTestimonial(t)}
                    className="flex items-center gap-1 rounded-full p-2 text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                    title="Eliminar opinión permanentemente"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
