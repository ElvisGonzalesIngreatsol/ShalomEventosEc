import type { GalleryEvent, Testimonial } from "./types"

export const sampleEvents: GalleryEvent[] = [
  {
    id: "boda-ana-luis",
    title: "Boda de Ana & Luis",
    category: "Boda",
    date: "Junio 2025",
    coverUrl: "/images/event-wedding.png",
    photos: [
      { id: "w1", url: "/images/event-wedding.png" },
      { id: "w2", url: "/images/hero-salon.png" },
      { id: "w3", url: "/images/about-venue.png" },
      { id: "w4", url: "/images/service-catering.png" },
    ],
  },
  {
    id: "xv-camila",
    title: "XV Años de Camila",
    category: "XV Años",
    date: "Marzo 2025",
    coverUrl: "/images/event-xv.png",
    photos: [
      { id: "x1", url: "/images/event-xv.png" },
      { id: "x2", url: "/images/hero-salon.png" },
      { id: "x3", url: "/images/about-venue.png" },
    ],
  },
  {
    id: "corp-innova",
    title: "Cena Anual Innova S.A.",
    category: "Corporativo",
    date: "Diciembre 2024",
    coverUrl: "/images/event-corporate.png",
    photos: [
      { id: "c1", url: "/images/event-corporate.png" },
      { id: "c2", url: "/images/about-venue.png" },
      { id: "c3", url: "/images/service-catering.png" },
    ],
  },
]

export const sampleTestimonials: Testimonial[] = [
  {
    id: "t1",
    name: "María Fernández",
    eventType: "Boda",
    rating: 5,
    message:
      "Nuestro día fue perfecto. El salón lució espectacular y el equipo cuidó cada detalle. ¡Gracias Shalom!",
    approved: true,
    createdAt: Date.now() - 1000000,
  },
  {
    id: "t2",
    name: "Jorge Ramírez",
    eventType: "XV Años",
    rating: 5,
    message:
      "Los XV de mi hija fueron un sueño. Excelente atención, comida deliciosa y un ambiente increíble.",
    approved: true,
    createdAt: Date.now() - 2000000,
  },
  {
    id: "t3",
    name: "Innova S.A.",
    eventType: "Corporativo",
    rating: 5,
    message:
      "Organizamos nuestra cena de fin de año y todo salió impecable. Profesionalismo de principio a fin.",
    approved: true,
    createdAt: Date.now() - 3000000,
  },
]
