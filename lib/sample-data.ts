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
  {
    id: "t4",
    name: "Gabriela & Carlos",
    eventType: "Boda",
    rating: 5,
    message:
      "La ambientación, la iluminación y la coordinación fueron mágicas. Todos nuestros invitados quedaron maravillados.",
    approved: true,
    createdAt: Date.now() - 4000000,
  },
  {
    id: "t5",
    name: "Patricio Morales",
    eventType: "Cumpleaños",
    rating: 5,
    message:
      "Celebramos los 50 de mi padre en Shalom y fue inolvidable. El servicio de banquetes y la música estuvieron de 10.",
    approved: true,
    createdAt: Date.now() - 5000000,
  },
]

export const defaultContactChannels = [
  {
    id: "c-whatsapp",
    icon: "whatsapp" as const,
    title: "WhatsApp",
    value: "+593 99 174 8342",
    url: "https://wa.me/593991748342",
    active: true,
    order: 0,
    createdAt: Date.now() - 600000,
  },
  {
    id: "c-instagram",
    icon: "instagram" as const,
    title: "Instagram",
    value: "@shalom_quevedo",
    url: "https://instagram.com/shalom_quevedo?igshid=NTc4MTIwNjQ2YQ==",
    active: true,
    order: 1,
    createdAt: Date.now() - 500000,
  },
  {
    id: "c-facebook",
    icon: "facebook" as const,
    title: "Facebook",
    value: "Shalom Recepciones",
    url: "https://www.facebook.com/share/1DzysVjXeX/",
    active: true,
    order: 2,
    createdAt: Date.now() - 400000,
  },
  {
    id: "c-tiktok",
    icon: "tiktok" as const,
    title: "TikTok",
    value: "@shalomeventosec",
    url: "https://www.tiktok.com/@shalomeventosec",
    active: true,
    order: 3,
    createdAt: Date.now() - 300000,
  },
  {
    id: "c-phone",
    icon: "phone" as const,
    title: "Teléfono",
    value: "+593 99 174 8342 / +593 99 105 1826",
    url: "tel:+593991748342",
    active: true,
    order: 4,
    createdAt: Date.now() - 200000,
  },
  {
    id: "c-mail",
    icon: "mail" as const,
    title: "Correo Electrónico",
    value: "Shalomeventosec@gmail.com",
    url: "mailto:Shalomeventosec@gmail.com",
    active: true,
    order: 5,
    createdAt: Date.now() - 100000,
  },
  {
    id: "c-maps",
    icon: "mapPin" as const,
    title: "Dirección y Mapa",
    value: "Mexico y Juan Montalvo, Quevedo, Ecuador",
    url: "https://maps.google.com/?q=Mexico+y+Juan+Montalvo+Quevedo+Ecuador",
    active: true,
    order: 6,
    createdAt: Date.now(),
  },
]
