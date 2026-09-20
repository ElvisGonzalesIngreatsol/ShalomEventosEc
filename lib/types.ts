export type EventPhoto = {
  id: string
  url: string
  storagePath?: string
}

export type GalleryEvent = {
  id: string
  title: string
  category: string
  date: string
  coverUrl: string
  photos: EventPhoto[]
  createdAt?: number
}

export type Testimonial = {
  id: string
  name: string
  eventType: string
  rating: number
  message: string
  approved: boolean
  createdAt?: number
}

export type SiteImage = {
  id: string
  title: string
  url: string
  storagePath?: string
  active: boolean
  order: number
  createdAt?: number
}

export type HeroSlide = SiteImage & {
  subtitle?: string
}

export type AdTarget = "desktop" | "mobile"

export type AdvertisingImage = SiteImage & {
  link?: string
  target?: AdTarget
  placement?: "left" | "right" | "mobile"
}

export type AdSettings = {
  desktopIntervalSeconds: number
  mobileIntervalSeconds: number
  updatedAt?: number
}


export type ContactIconType =
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "phone"
  | "mail"
  | "mapPin"
  | "telegram"
  | "globe"

export type ContactChannel = {
  id: string
  icon: ContactIconType
  title: string
  value?: string
  url: string
  active: boolean
  order: number
  createdAt?: number
}

export type AboutSettings = {
  imageUrl?: string
  imageStoragePath?: string
  foundingYear: number // Año de inicio para calcular experiencia (ej. 2010 -> +15 años)
  eventsCount: number // Número de eventos realizados (ej. 1000 -> +1000)
  capacity: number // Capacidad de invitados (ej. 200)
  updatedAt?: number
}
