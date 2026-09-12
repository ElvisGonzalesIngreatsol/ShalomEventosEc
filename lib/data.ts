import {
  collection,
  getDocs,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage, isFirebaseConfigured } from "./firebase"
import type {
  GalleryEvent,
  Testimonial,
  EventPhoto,
  HeroSlide,
  AdvertisingImage,
  ContactChannel,
  ContactIconType,
} from "./types"
import { sampleEvents, sampleTestimonials, defaultContactChannels } from "./sample-data"

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

export async function updateEventDetails(
  id: string,
  data: Pick<GalleryEvent, "title" | "category" | "date">,
): Promise<void> {
  if (!isFirebaseConfigured || !db) throw new Error("Firebase no está configurado")
  await updateDoc(doc(db, "events", id), data)
}

export async function deleteEvent(id: string, photos?: EventPhoto[]): Promise<void> {
  if (!isFirebaseConfigured || !db) throw new Error("Firebase no está configurado")
  if (photos && storage) {
    for (const p of photos) {
      if (p.storagePath) {
        await deleteObject(ref(storage, p.storagePath)).catch(() => undefined)
      }
    }
  }
  await deleteDoc(doc(db, "events", id))
}

export async function createEventWithPhotos(
  data: Omit<GalleryEvent, "id" | "photos" | "coverUrl" | "createdAt">,
  orderedFiles: File[],
): Promise<GalleryEvent> {
  if (!isFirebaseConfigured || !db || !storage) throw new Error("Firebase no está configurado")

  const createdAt = Date.now()
  const docRef = await addDoc(collection(db, "events"), {
    ...data,
    coverUrl: "",
    photos: [],
    createdAt,
  })
  const eventId = docRef.id

  const uploaded: EventPhoto[] = []
  for (let i = 0; i < orderedFiles.length; i++) {
    const file = orderedFiles[i]
    const path = `events/${eventId}/${Date.now()}-${i}-${file.name}`
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    uploaded.push({ id: path, url, storagePath: path })
  }

  const coverUrl = uploaded[0]?.url || ""
  await updateDoc(doc(db, "events", eventId), { photos: uploaded, coverUrl })

  return {
    id: eventId,
    ...data,
    coverUrl,
    photos: uploaded,
    createdAt,
  }
}

export async function saveEventFull(
  eventId: string,
  details: { title: string; category: string; date: string },
  items: Array<{ kind: "existing"; photo: EventPhoto } | { kind: "new"; file: File }>,
  deletedPhotos?: EventPhoto[],
): Promise<void> {
  if (!isFirebaseConfigured || !db || !storage) throw new Error("Firebase no está configurado")

  if (deletedPhotos && deletedPhotos.length > 0) {
    for (const p of deletedPhotos) {
      if (p.storagePath) {
        await deleteObject(ref(storage, p.storagePath)).catch(() => undefined)
      }
    }
  }

  const finalPhotos: EventPhoto[] = []
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.kind === "existing") {
      finalPhotos.push(item.photo)
    } else {
      const path = `events/${eventId}/${Date.now()}-${i}-${item.file.name}`
      const storageRef = ref(storage, path)
      await uploadBytes(storageRef, item.file)
      const url = await getDownloadURL(storageRef)
      finalPhotos.push({ id: path, url, storagePath: path })
    }
  }

  const coverUrl = finalPhotos[0]?.url || ""
  await updateDoc(doc(db, "events", eventId), {
    title: details.title.trim(),
    category: details.category,
    date: details.date,
    photos: finalPhotos,
    coverUrl,
  })
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

/* -------------------------- Site media -------------------------- */

export async function fetchHeroSlides(): Promise<HeroSlide[]> {
  if (!isFirebaseConfigured || !db) return []
  const snap = await getDocs(query(collection(db, "heroSlides"), orderBy("order", "asc")))
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<HeroSlide, "id">) })).filter((s) => s.active)
}

export async function fetchAllHeroSlidesAdmin(): Promise<HeroSlide[]> {
  if (!isFirebaseConfigured || !db) return []
  const snap = await getDocs(query(collection(db, "heroSlides"), orderBy("order", "asc")))
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<HeroSlide, "id">) }))
}

export async function toggleHeroSlideActive(id: string, active: boolean): Promise<void> {
  if (!isFirebaseConfigured || !db) throw new Error("Firebase no está configurado")
  await updateDoc(doc(db, "heroSlides", id), { active })
}

export async function uploadMultipleHeroSlides(files: File[], title?: string): Promise<void> {
  if (!isFirebaseConfigured || !db || !storage) throw new Error("Firebase no está configurado")

  const current = await fetchAllHeroSlidesAdmin()
  const startingOrder = current.length

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const path = `site/heroSlides/${Date.now()}-${i}-${file.name}`
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    const itemTitle = title?.trim() ? `${title.trim()} ${i + 1}` : file.name.replace(/\.[^/.]+$/, "")

    await addDoc(collection(db, "heroSlides"), {
      title: itemTitle,
      subtitle: "Bodas · XV Años · Cumpleaños · Corporativos",
      active: true,
      order: startingOrder + i,
      url,
      storagePath: path,
      createdAt: Date.now(),
    })
  }
}

export async function fetchAdvertisements(): Promise<AdvertisingImage[]> {
  if (!isFirebaseConfigured || !db) return []
  const snap = await getDocs(query(collection(db, "advertisements"), orderBy("order", "asc")))
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AdvertisingImage, "id">) })).filter((a) => a.active)
}

export async function fetchAllAdvertisementsAdmin(): Promise<AdvertisingImage[]> {
  if (!isFirebaseConfigured || !db) return []
  const snap = await getDocs(query(collection(db, "advertisements"), orderBy("order", "asc")))
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AdvertisingImage, "id">) }))
}

export async function toggleAdvertisementActive(id: string, active: boolean): Promise<void> {
  if (!isFirebaseConfigured || !db) throw new Error("Firebase no está configurado")
  await updateDoc(doc(db, "advertisements", id), { active })
}

export async function updateAdvertisement(
  id: string,
  data: {
    title: string
    placement: "left" | "right"
    link: string
    active?: boolean
  },
  newFile?: File | null,
  currentStoragePath?: string
): Promise<void> {
  if (!isFirebaseConfigured || !db) throw new Error("Firebase no está configurado")

  let updatePayload: Record<string, any> = {
    title: data.title.trim(),
    placement: data.placement,
    link: data.link.trim(),
  }
  if (typeof data.active === "boolean") {
    updatePayload.active = data.active
  }

  if (newFile && storage) {
    if (currentStoragePath) {
      await deleteObject(ref(storage, currentStoragePath)).catch(() => undefined)
    }

    const path = `site/advertisements/${Date.now()}-${newFile.name}`
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, newFile)
    const url = await getDownloadURL(storageRef)
    updatePayload.url = url
    updatePayload.storagePath = path
  }

  await updateDoc(doc(db, "advertisements", id), updatePayload)
}

export async function uploadMultipleAdvertisements(
  files: File[],
  placement: "left" | "right",
  title?: string,
  link?: string,
): Promise<void> {
  if (!isFirebaseConfigured || !db || !storage) throw new Error("Firebase no está configurado")

  const current = await fetchAllAdvertisementsAdmin()
  const startingOrder = current.length

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const path = `site/advertisements/${Date.now()}-${i}-${file.name}`
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    const itemTitle = title?.trim() ? `${title.trim()} ${i + 1}` : file.name.replace(/\.[^/.]+$/, "")

    await addDoc(collection(db, "advertisements"), {
      title: itemTitle,
      url,
      storagePath: path,
      placement,
      link: link?.trim() || "",
      active: true,
      order: startingOrder + i,
      createdAt: Date.now(),
    })
  }
}

export async function uploadSiteImage(
  collectionName: "heroSlides" | "advertisements",
  file: File,
  data: Omit<HeroSlide, "id" | "url" | "storagePath"> | Omit<AdvertisingImage, "id" | "url" | "storagePath">,
): Promise<void> {
  if (!isFirebaseConfigured || !db || !storage) throw new Error("Firebase no está configurado")
  const path = `site/${collectionName}/${Date.now()}-${file.name}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)
  await addDoc(collection(db, collectionName), { ...data, url, storagePath: path, createdAt: Date.now() })
}

export async function deleteSiteImage(collectionName: "heroSlides" | "advertisements", item: HeroSlide | AdvertisingImage): Promise<void> {
  if (!isFirebaseConfigured || !db || !storage) throw new Error("Firebase no está configurado")
  if (item.storagePath) await deleteObject(ref(storage, item.storagePath)).catch(() => undefined)
  await deleteDoc(doc(db, collectionName, item.id))
}

export async function updateEventPhotos(event: GalleryEvent, photos: EventPhoto[]): Promise<void> {
  if (!isFirebaseConfigured || !db) throw new Error("Firebase no está configurado")
  await updateDoc(doc(db, "events", event.id), { photos, coverUrl: photos[0]?.url || "" })
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

/* -------------------------- Contact Channels (Redes y Contacto) -------------------------- */

export async function fetchContactChannels(): Promise<ContactChannel[]> {
  if (!isFirebaseConfigured || !db) {
    return defaultContactChannels.filter((c) => c.active)
  }

  try {
    const snap = await getDocs(query(collection(db, "contactChannels"), orderBy("order", "asc")))
    if (snap.empty) {
      return defaultContactChannels.filter((c) => c.active)
    }
    return snap.docs
      .map((d) => {
        const data = d.data()
        return {
          id: d.id,
          ...data,
          active: data.active ?? data.isActive ?? true,
        } as ContactChannel
      })
      .filter((c) => c.active)
  } catch {
    return defaultContactChannels.filter((c) => c.active)
  }
}

export async function fetchAllContactChannelsAdmin(): Promise<ContactChannel[]> {
  if (!isFirebaseConfigured || !db) {
    return defaultContactChannels
  }

  try {
    const snap = await getDocs(query(collection(db, "contactChannels"), orderBy("order", "asc")))
    if (snap.empty) {
      // Auto-sembrar los canales por defecto en Firestore para que existan como documentos reales
      try {
        await Promise.all(
          defaultContactChannels.map((ch) =>
            setDoc(doc(db!, "contactChannels", ch.id), {
              icon: ch.icon,
              title: ch.title,
              value: ch.value,
              url: ch.url,
              active: ch.active,
              order: ch.order,
              createdAt: ch.createdAt,
            })
          )
        )
      } catch (e) {
        console.error("Error al sembrar canales en Firestore:", e)
      }
      return defaultContactChannels
    }
    return snap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        ...data,
        active: data.active ?? data.isActive ?? true,
      } as ContactChannel
    })
  } catch {
    return defaultContactChannels
  }
}

export async function createContactChannel(
  data: Omit<ContactChannel, "id" | "order" | "createdAt">,
): Promise<string> {
  if (!isFirebaseConfigured || !db) throw new Error("Firebase no está configurado")

  const current = await fetchAllContactChannelsAdmin()
  const order = current.length

  const docRef = await addDoc(collection(db, "contactChannels"), {
    ...data,
    order,
    createdAt: Date.now(),
  })

  return docRef.id
}

export async function updateContactChannel(
  id: string,
  data: Partial<Omit<ContactChannel, "id" | "createdAt">>
): Promise<void> {
  if (!isFirebaseConfigured || !db) throw new Error("Firebase no está configurado")

  const defaultFallback = defaultContactChannels.find((d) => d.id === id)
  const baseData = defaultFallback
    ? {
        icon: defaultFallback.icon,
        title: defaultFallback.title,
        value: defaultFallback.value,
        url: defaultFallback.url,
        active: defaultFallback.active,
        order: defaultFallback.order,
        createdAt: defaultFallback.createdAt,
      }
    : {}

  await setDoc(
    doc(db, "contactChannels", id),
    {
      ...baseData,
      ...data,
    },
    { merge: true }
  )
}

export async function toggleContactChannelActive(id: string, active: boolean): Promise<void> {
  if (!isFirebaseConfigured || !db) throw new Error("Firebase no está configurado")

  const defaultFallback = defaultContactChannels.find((d) => d.id === id)
  const baseData = defaultFallback
    ? {
        icon: defaultFallback.icon,
        title: defaultFallback.title,
        value: defaultFallback.value,
        url: defaultFallback.url,
        order: defaultFallback.order,
        createdAt: defaultFallback.createdAt,
      }
    : {}

  await setDoc(
    doc(db, "contactChannels", id),
    {
      ...baseData,
      active,
    },
    { merge: true }
  )
}

export async function deleteContactChannel(id: string): Promise<void> {
  if (!isFirebaseConfigured || !db) throw new Error("Firebase no está configurado")
  await deleteDoc(doc(db, "contactChannels", id))
}
