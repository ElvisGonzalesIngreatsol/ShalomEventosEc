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
