"use client"

import { useEffect, useState } from "react"
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import useSWR from "swr"
import {
  Loader2,
  LogOut,
  Plus,
  Upload,
  Trash2,
  Check,
  X,
  ImageIcon,
  MessageSquare,
  AlertTriangle,
} from "lucide-react"
import { auth, isFirebaseConfigured } from "@/lib/firebase"
import {
  fetchEvents,
  createEvent,
  deleteEvent,
  uploadEventPhotos,
  deleteEventPhoto,
  fetchAllTestimonials,
  setTestimonialApproval,
  deleteTestimonial,
} from "@/lib/data"
import type { GalleryEvent, Testimonial } from "@/lib/types"
import { site } from "@/lib/site"
import { mutate } from "swr"

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setChecking(false)
      return
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setChecking(false)
    })
    return () => unsub()
  }, [])

  if (!isFirebaseConfigured) {
    return <NotConfigured />
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return <Dashboard user={user} />
}

function NotConfigured() {
  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <AlertTriangle className="mx-auto size-10 text-accent" />
        <h1 className="mt-4 font-serif text-2xl font-semibold text-foreground">
          Firebase no está conectado
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Para usar el panel de administrador agrega tus claves de Firebase en las variables de
          entorno del proyecto y habilita Authentication (email/contraseña), Firestore y Storage.
        </p>
        <a
          href="/"
          className="mt-6 inline-block rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
        >
          Volver al sitio
        </a>
      </div>
    </div>
  )
}

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!auth) return
    setLoading(true)
    setError("")
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch {
      setError("Correo o contraseña incorrectos.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-border bg-card p-8">
        <p className="text-center font-serif text-2xl font-semibold text-primary">{site.shortName}</p>
        <h1 className="mt-1 text-center text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Panel de administrador
        </h1>

        <div className="mt-7 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
              Correo
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Ingresar
          </button>
        </div>
      </form>
    </div>
  )
}

function Dashboard({ user }: { user: User }) {
  const [tab, setTab] = useState<"events" | "testimonials">("events")

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div>
            <p className="font-serif text-lg font-semibold text-primary">Shalom · Admin</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => auth && signOut(auth)}
            className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            <LogOut className="size-4" />
            Salir
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-8">
        <div className="mb-6 flex gap-2">
          <button
            type="button"
            onClick={() => setTab("events")}
            className={
              tab === "events"
                ? "flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                : "flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground"
            }
          >
            <ImageIcon className="size-4" />
            Eventos y fotos
          </button>
          <button
            type="button"
            onClick={() => setTab("testimonials")}
            className={
              tab === "testimonials"
                ? "flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                : "flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground"
            }
          >
            <MessageSquare className="size-4" />
            Opiniones
          </button>
        </div>

        {tab === "events" ? <EventsManager /> : <TestimonialsManager />}
      </div>
    </div>
  )
}

function EventsManager() {
  const { data: events, isLoading } = useSWR<GalleryEvent[]>("events", fetchEvents)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("Boda")
  const [date, setDate] = useState("")
  const [creating, setCreating] = useState(false)
  const [uploadingId, setUploadingId] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setCreating(true)
    try {
      await createEvent({ title: title.trim(), category, date: date.trim() })
      setTitle("")
      setDate("")
      await mutate("events")
    } finally {
      setCreating(false)
    }
  }

  async function handleUpload(event: GalleryEvent, files: FileList | null) {
    if (!files || files.length === 0) return
    setUploadingId(event.id)
    try {
      await uploadEventPhotos(event, Array.from(files))
      await mutate("events")
    } finally {
      setUploadingId(null)
    }
  }

  async function handleDeleteEvent(id: string) {
    if (!confirm("¿Eliminar este evento y todas sus fotos?")) return
    await deleteEvent(id)
    await mutate("events")
  }

  async function handleDeletePhoto(event: GalleryEvent, photoId: string) {
    const photo = event.photos.find((p) => p.id === photoId)
    if (!photo) return
    await deleteEventPhoto(event, photo)
    await mutate("events")
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-lg font-semibold text-foreground">Nuevo evento</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título (ej. Boda de Ana & Luis)"
            required
            className="rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 sm:col-span-1"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          >
            {["Boda", "XV Años", "Bautizo", "Corporativo", "Otro"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="Fecha (ej. Junio 2025)"
            className="rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="mt-4 flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Crear evento
        </button>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-7 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-5">
          {events?.map((event) => (
            <div key={event.id} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-foreground">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {event.category} · {event.date} · {event.photos.length} fotos
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteEvent(event.id)}
                  className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-4" />
                  Eliminar
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
                {event.photos.map((photo) => (
                  <div key={photo.id} className="group relative overflow-hidden rounded-lg">
                    <img src={photo.url || "/placeholder.svg"} alt="" className="aspect-square w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(event, photo.id)}
                      aria-label="Eliminar foto"
                      className="absolute right-1 top-1 rounded-full bg-foreground/70 p-1 text-background opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}

                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary">
                  {uploadingId === event.id ? (
                    <Loader2 className="size-6 animate-spin" />
                  ) : (
                    <>
                      <Upload className="size-6" />
                      <span className="text-xs">Subir</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={uploadingId === event.id}
                    onChange={(e) => handleUpload(event, e.target.files)}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TestimonialsManager() {
  const { data, isLoading } = useSWR<Testimonial[]>("testimonials-all", fetchAllTestimonials)

  async function toggle(id: string, approved: boolean) {
    await setTestimonialApproval(id, approved)
    await mutate("testimonials-all")
    await mutate("testimonials-approved")
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar esta opinión?")) return
    await deleteTestimonial(id)
    await mutate("testimonials-all")
    await mutate("testimonials-approved")
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="size-7 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {data?.length === 0 && (
        <p className="py-10 text-center text-muted-foreground">No hay opiniones todavía.</p>
      )}
      {data?.map((t) => (
        <div key={t.id} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-foreground">
                {t.name}{" "}
                <span className="text-sm font-normal text-muted-foreground">· {t.eventType}</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {"★".repeat(t.rating)}
                {"☆".repeat(5 - t.rating)}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/85">{t.message}</p>
            </div>
            <span
              className={
                t.approved
                  ? "shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                  : "shrink-0 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent-foreground"
              }
            >
              {t.approved ? "Publicada" : "Pendiente"}
            </span>
          </div>

          <div className="mt-4 flex gap-2">
            {!t.approved ? (
              <button
                type="button"
                onClick={() => toggle(t.id, true)}
                className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground"
              >
                <Check className="size-4" />
                Aprobar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => toggle(t.id, false)}
                className="flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                <X className="size-4" />
                Ocultar
              </button>
            )}
            <button
              type="button"
              onClick={() => remove(t.id)}
              className="flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-4" />
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
