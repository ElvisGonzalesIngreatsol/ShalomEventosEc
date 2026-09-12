"use client"

import { useEffect, useState } from "react"
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from "firebase/auth"
import useSWR, { mutate } from "swr"
import { Loader2, LogOut, Plus, Upload, Trash2, Check, X, ImageIcon, MessageSquare, AlertTriangle, Eye, EyeOff, GripVertical, LayoutTemplate, Megaphone, Share2 } from "lucide-react"
import { auth, isFirebaseConfigured } from "@/lib/firebase"
import { fetchEvents, createEvent, deleteEvent, uploadEventPhotos, deleteEventPhoto, updateEventPhotos, fetchAllTestimonials, setTestimonialApproval, deleteTestimonial, uploadSiteImage, fetchHeroSlides, fetchAdvertisements, deleteSiteImage } from "@/lib/data"
import type { GalleryEvent, Testimonial, HeroSlide, AdvertisingImage } from "@/lib/types"
import { site } from "@/lib/site"
import { AdminEventsManager } from "@/components/admin-events-manager"
import { AdminMediaManager } from "@/components/admin-media-manager"
import { AdminTestimonialsManager } from "@/components/admin-testimonials-manager"
import { AdminContactManager } from "@/components/admin-contact-manager"
import { showConfirmAlert, showErrorAlert } from "@/lib/alerts"

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return setChecking(false)
    return onAuthStateChanged(auth, (next) => { setUser(next); setChecking(false) })
  }, [])
  if (!isFirebaseConfigured) return <NotConfigured />
  if (checking) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="size-8 animate-spin text-accent" /></div>
  return user ? <Dashboard user={user} /> : <LoginForm />
}

function NotConfigured() { return <div className="flex min-h-screen items-center justify-center px-5"><div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center"><AlertTriangle className="mx-auto size-10 text-accent" /><h1 className="mt-4 font-serif text-2xl font-semibold">Firebase no está conectado</h1><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Agrega las claves de Firebase y habilita Authentication, Firestore y Storage.</p><a href="/" className="mt-6 inline-block rounded-full border border-border px-5 py-2.5 text-sm font-semibold">Volver al sitio</a></div></div> }

function LoginForm() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [showPassword, setShowPassword] = useState(false); const [error, setError] = useState(""); const [loading, setLoading] = useState(false)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch {
      const msg = "Correo o contraseña incorrectos."
      setError(msg)
      showErrorAlert("Acceso denegado", msg)
    } finally {
      setLoading(false)
    }
  }
  return <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-5"><form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm"><p className="text-center font-serif text-2xl font-semibold text-primary">{site.shortName}</p><h1 className="mt-1 text-center text-sm uppercase tracking-[0.2em] text-muted-foreground">Panel de administrador</h1><div className="mt-7 space-y-4"><label className="block text-sm font-medium">Correo<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1.5 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-accent/30" /></label><label className="block text-sm font-medium">Contraseña<div className="relative mt-1.5"><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 pr-11 outline-none focus:ring-2 focus:ring-accent/30" /><button type="button" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></label>{error && <p className="text-sm text-destructive">{error}</p>}<button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">{loading && <Loader2 className="size-4 animate-spin" />}Ingresar</button></div></form></div>
}

function Dashboard({ user }: { user: User }) {
  const [tab, setTab] = useState<"events" | "testimonials" | "media" | "contact">("events")

  const handleSignOut = async () => {
    const isConfirmed = await showConfirmAlert({
      title: "¿Cerrar sesión?",
      text: "¿Estás seguro de que deseas salir del panel de administración?",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Permanecer",
      isDestructive: false,
    })
    if (isConfirmed && auth) {
      await signOut(auth)
    }
  }

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div>
            <p className="font-serif text-lg font-semibold text-primary">Shalom · Admin</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"
          >
            <LogOut className="size-4" />
            Salir
          </button>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {([
            ["events", ImageIcon, "Eventos y fotos"],
            ["media", LayoutTemplate, "Portadas y publicidad"],
            ["testimonials", MessageSquare, "Opiniones"],
            ["contact", Share2, "Redes y Contacto"],
          ] as const).map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                tab === key
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "border border-border bg-card hover:bg-muted"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
        {tab === "events" ? (
          <AdminEventsManager />
        ) : tab === "media" ? (
          <AdminMediaManager />
        ) : tab === "testimonials" ? (
          <AdminTestimonialsManager />
        ) : (
          <AdminContactManager />
        )}
      </div>
    </div>
  )
}
