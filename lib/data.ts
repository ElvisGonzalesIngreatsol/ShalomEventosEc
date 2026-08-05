import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage, isFirebaseConfigured } from "./firebase"
import type { GalleryEvent, Testimonial, EventPhoto } from "./types"
import { sampleEvents, sampleTestimonials } from "./sample-data"

/* -------------------------- Gallery events -------------------------- */

export async function fetchEvents(): Promise<GalleryEvent[]> {
  if (!isFirebaseConfigured || !db) return sampleEvents

  const snap = await getDocs(query(collection(db, "events"), orderBy("createdAt", "desc")))
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<GalleryEvent, "id">) }))
}

export async function createEvent(
  data: Omit<GalleryEvent, "id" | "photos" | "coverUrl" | "createdAt">,
): Promise<string> {
  if (!isFirebaseConfigured || !db) throw new Error("Firebase no está configurado")

  const docRef = await addDoc(collection(db, "events"), {
    ...data,
    coverUrl: "",
    photos: [],
    createdAt: Date.now(),
  })
  return docRef.id
}

export async function deleteEvent(id: string): Promise<void> {
  if (!isFirebaseConfigured || !db) throw new Error("Firebase no está configurado")
  await deleteDoc(doc(db, "events", id))
}

export async function uploadEventPhotos(
  event: GalleryEvent,
  files: File[],
): Promise<GalleryEvent> {
  if (!isFirebaseConfigured || !db || !storage)
    throw new Error("Firebase no está configurado")

  const uploaded: EventPhoto[] = []
  for (const file of files) {
    const path = `events/${event.id}/${Date.now()}-${file.name}`
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    uploaded.push({ id: path, url, storagePath: path })
  }

  const photos = [...event.photos, ...uploaded]
  const coverUrl = event.coverUrl || uploaded[0]?.url || ""

  await updateDoc(doc(db, "events", event.id), { photos, coverUrl })
  return { ...event, photos, coverUrl }
}

export async function deleteEventPhoto(
  event: GalleryEvent,
  photo: EventPhoto,
): Promise<GalleryEvent> {
  if (!isFirebaseConfigured || !db || !storage)
    throw new Error("Firebase no está configurado")

  if (photo.storagePath) {
    try {
      await deleteObject(ref(storage, photo.storagePath))
    } catch {
      // ignore missing object
    }
  }
  const photos = event.photos.filter((p) => p.id !== photo.id)
  const coverUrl = event.coverUrl === photo.url ? photos[0]?.url || "" : event.coverUrl
  await updateDoc(doc(db, "events", event.id), { photos, coverUrl })
  return { ...event, photos, coverUrl }
}

/* -------------------------- Testimonials -------------------------- */

export async function fetchApprovedTestimonials(): Promise<Testimonial[]> {
  if (!isFirebaseConfigured || !db) return sampleTestimonials

  const snap = await getDocs(query(collection(db, "testimonials"), orderBy("createdAt", "desc")))
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Testimonial, "id">) }))
    .filter((t) => t.approved)
}

export async function fetchAllTestimonials(): Promise<Testimonial[]> {
  if (!isFirebaseConfigured || !db) return sampleTestimonials

  const snap = await getDocs(query(collection(db, "testimonials"), orderBy("createdAt", "desc")))
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Testimonial, "id">) }))
}

export async function submitTestimonial(
  data: Omit<Testimonial, "id" | "approved" | "createdAt">,
): Promise<void> {
  if (!isFirebaseConfigured || !db)
    throw new Error("Firebase no está configurado. Conecta tus claves para recibir opiniones.")

  await addDoc(collection(db, "testimonials"), {
    ...data,
    approved: false,
    createdAt: Date.now(),
  })
}

export async function setTestimonialApproval(id: string, approved: boolean): Promise<void> {
  if (!isFirebaseConfigured || !db) throw new Error("Firebase no está configurado")
  await updateDoc(doc(db, "testimonials", id), { approved })
}

export async function deleteTestimonial(id: string): Promise<void> {
  if (!isFirebaseConfigured || !db) throw new Error("Firebase no está configurado")
  await deleteDoc(doc(db, "testimonials", id))
}
