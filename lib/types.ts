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

export type AdvertisingImage = SiteImage & {
  link?: string
  placement: "left" | "right"
}
