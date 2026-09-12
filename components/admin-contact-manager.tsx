"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import {
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Check,
  X,
  Loader2,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
} from "lucide-react"
import {
  fetchAllContactChannelsAdmin,
  createContactChannel,
  updateContactChannel,
  toggleContactChannelActive,
  deleteContactChannel,
} from "@/lib/data"
import type { ContactChannel, ContactIconType } from "@/lib/types"
import { ContactIcon, AVAILABLE_ICONS } from "@/components/contact-icon"
import { showConfirmAlert, showErrorAlert, showSuccessAlert } from "@/lib/alerts"
import { defaultContactChannels } from "@/lib/sample-data"

export function AdminContactManager() {
  const { data: channels = [], isLoading } = useSWR(
    "all-contact-channels-admin",
    fetchAllContactChannelsAdmin,
    {
      fallbackData: defaultContactChannels,
    }
  )

  const [isCreating, setIsCreating] = useState(false)
  const [editingChannel, setEditingChannel] = useState<ContactChannel | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [selectedIcon, setSelectedIcon] = useState<ContactIconType>("whatsapp")
  const [title, setTitle] = useState("WhatsApp")
  const [value, setValue] = useState("")
  const [url, setUrl] = useState("")
  const [isActive, setIsActive] = useState(true)

  const handleSelectIcon = (iconId: ContactIconType) => {
    setSelectedIcon(iconId)
    const meta = AVAILABLE_ICONS.find((i) => i.id === iconId)
    if (meta) {
      if (!title || AVAILABLE_ICONS.some((i) => i.defaultTitle === title)) {
        setTitle(meta.defaultTitle)
      }
      if (!url) {
        setUrl(meta.placeholder)
      }
    }
  }

  const resetForm = () => {
    setSelectedIcon("whatsapp")
    setTitle("WhatsApp")
    setValue("")
    setUrl("")
    setIsActive(true)
    setIsCreating(false)
    setEditingChannel(null)
  }

  const startEdit = (ch: ContactChannel) => {
    setEditingChannel(ch)
    setSelectedIcon(ch.icon)
    setTitle(ch.title)
    setValue(ch.value || "")
    setUrl(ch.url)
    setIsActive(ch.active)
    setIsCreating(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !url.trim()) {
      showErrorAlert("Campos requeridos", "Por favor ingresa un título y un enlace.")
      return
    }

    setSaving(true)
    try {
      if (editingChannel) {
        await updateContactChannel(editingChannel.id, {
          icon: selectedIcon,
          title: title.trim(),
          value: value.trim(),
          url: url.trim(),
          active: isActive,
        })
        showSuccessAlert(
          "¡Canal actualizado!",
          `Se actualizaron los datos de ${title.trim()} correctamente.`
        )
      } else {
        await createContactChannel({
          icon: selectedIcon,
          title: title.trim(),
          value: value.trim(),
          url: url.trim(),
          active: isActive,
        })
        showSuccessAlert(
          "¡Canal creado!",
          `El canal de contacto "${title.trim()}" ha sido agregado.`
        )
      }

      await mutate("all-contact-channels-admin")
      await mutate("contact-channels")
      resetForm()
    } catch (err: any) {
      showErrorAlert(
        "Error al guardar",
        err?.message || "Ocurrió un error al procesar el canal de contacto."
      )
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (ch: ContactChannel) => {
    const currentStatus = ch.active ?? (ch as any).isActive ?? true
    const nextStatus = !currentStatus
    try {
      await toggleContactChannelActive(ch.id, nextStatus)
      await mutate("all-contact-channels-admin")
      await mutate("contact-channels")
      showSuccessAlert(
        nextStatus ? "Canal visible" : "Canal oculto",
        `"${ch.title}" ahora está ${nextStatus ? "visible en la web" : "oculto para los usuarios"}.`
      )
    } catch (err: any) {
      showErrorAlert("Error", err?.message || "No se pudo cambiar el estado.")
    }
  }

  const handleDelete = async (ch: ContactChannel) => {
    const confirmed = await showConfirmAlert({
      title: "¿Eliminar canal?",
      text: `¿Estás seguro de que deseas eliminar "${ch.title}"? Los usuarios ya no verán este enlace.`,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      isDestructive: true,
    })

    if (!confirmed) return

    try {
      await deleteContactChannel(ch.id)
      await mutate("all-contact-channels-admin")
      await mutate("contact-channels")
      showSuccessAlert("Eliminado", `El canal "${ch.title}" fue eliminado exitosamente.`)
    } catch (err: any) {
      showErrorAlert("Error", err?.message || "No se pudo eliminar el canal.")
    }
  }

  return (
    <div className="space-y-8">
      {/* Header card */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-xl font-semibold text-foreground">
            Redes Sociales y Canales de Contacto
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Personaliza qué iconos, redes y formas de contacto aparecen en la sección de contacto y pie de página.
          </p>
        </div>
        {!isCreating && !editingChannel && (
          <button
            onClick={() => {
              resetForm()
              setIsCreating(true)
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.02] shadow-xs"
          >
            <Plus className="size-4" />
            Nuevo canal o red
          </button>
        )}
      </div>

      {/* Create / Edit Form Drawer */}
      {(isCreating || editingChannel) && (
        <form
          onSubmit={handleSave}
          className="rounded-2xl border-2 border-primary/20 bg-card p-6 shadow-sm transition-all"
        >
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="font-serif text-lg font-semibold text-foreground">
                {editingChannel ? `Editar: ${editingChannel.title}` : "Agregar nuevo canal o red"}
              </h3>
              <p className="text-xs text-muted-foreground">
                Selecciona un icono predefinido y escribe el enlace correspondiente.
              </p>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="mt-6 space-y-6">
            {/* Icon Picker */}
            <div>
              <label className="mb-2.5 block text-sm font-medium text-foreground">
                Selecciona el Icono:
              </label>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                {AVAILABLE_ICONS.map((meta) => {
                  const isSelected = selectedIcon === meta.id
                  return (
                    <button
                      key={meta.id}
                      type="button"
                      onClick={() => handleSelectIcon(meta.id)}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-xs ring-2 ring-primary/20"
                          : "border-border bg-background/50 hover:bg-muted/60"
                      }`}
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-card shadow-xs">
                        <ContactIcon icon={meta.id} className="size-5" />
                      </div>
                      <span className="text-xs font-semibold text-foreground truncate">
                        {meta.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Title, Subtitle, URL */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Título / Nombre visible
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: WhatsApp, Instagram, Teléfono"
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Texto secundario / Detalle (Opcional)
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Ej: +593 99 174 8342 ó @shalom_quevedo"
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Enlace / URL de destino
                </label>
                <input
                  type="text"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={
                    AVAILABLE_ICONS.find((i) => i.id === selectedIcon)?.placeholder ||
                    "https://..."
                  }
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Para WhatsApp usa <code className="rounded bg-muted px-1">https://wa.me/numero</code>, para teléfono <code className="rounded bg-muted px-1">tel:+593...</code>, para email <code className="rounded bg-muted px-1">mailto:...</code>
                </p>
              </div>
            </div>

            {/* Is Active toggle */}
            <div className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-4">
              <input
                type="checkbox"
                id="form-is-active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="size-4 rounded border-input text-primary focus:ring-primary"
              />
              <label htmlFor="form-is-active" className="text-sm font-medium text-foreground cursor-pointer">
                Habilitar y mostrar de inmediato en la sección de contacto
              </label>
            </div>

            {/* Form actions */}
            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs transition-transform hover:scale-[1.02] disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Check className="size-4" />
                    {editingChannel ? "Guardar cambios" : "Agregar canal"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Channels List */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-6 py-4">
          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
            Canales y Redes configurados
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
              {channels.length}
            </span>
          </h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : channels.length === 0 ? (
          <div className="p-12 text-center">
            <Sparkles className="mx-auto size-10 text-muted-foreground/60" />
            <p className="mt-3 font-medium text-foreground">Aún no hay canales registrados</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Haz clic en "Nuevo canal o red" para agregar WhatsApp, Instagram, Facebook o tu teléfono.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {channels.map((ch) => (
              <div
                key={ch.id}
                className="flex flex-col gap-4 p-5 transition-colors hover:bg-muted/20 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-card border border-border shadow-xs">
                    <ContactIcon icon={ch.icon} className="size-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground truncate">{ch.title}</span>
                      {(() => {
                        const isChannelActive = ch.active ?? (ch as any).isActive ?? true
                        return (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              isChannelActive
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                : "bg-muted text-muted-foreground border border-border"
                            }`}
                          >
                            {isChannelActive ? (
                              <>
                                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Activo
                              </>
                            ) : (
                              <>
                                <span className="size-1.5 rounded-full bg-muted-foreground" />
                                Oculto
                              </>
                            )}
                          </span>
                        )
                      })()}
                    </div>
                    {ch.value && (
                      <p className="text-xs font-medium text-primary mt-0.5">{ch.value}</p>
                    )}
                    <a
                      href={ch.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground truncate max-w-sm"
                    >
                      <span className="truncate">{ch.url}</span>
                      <ExternalLink className="size-3 shrink-0" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {(() => {
                    const isChannelActive = ch.active ?? (ch as any).isActive ?? true
                    return (
                      <button
                        onClick={() => handleToggle(ch)}
                        title={isChannelActive ? "Ocultar canal" : "Habilitar canal"}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          isChannelActive
                            ? "border border-amber-500/30 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20"
                            : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20"
                        }`}
                      >
                        {isChannelActive ? (
                          <>
                            <EyeOff className="size-3.5" />
                            Ocultar
                          </>
                        ) : (
                          <>
                            <Eye className="size-3.5" />
                            Mostrar
                          </>
                        )}
                      </button>
                    )
                  })()}

                  <button
                    onClick={() => startEdit(ch)}
                    title="Editar información"
                    className="flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                  >
                    <Edit2 className="size-3.5" />
                    Editar
                  </button>

                  <button
                    onClick={() => handleDelete(ch)}
                    title="Eliminar canal"
                    className="flex size-8 items-center justify-center rounded-full border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
