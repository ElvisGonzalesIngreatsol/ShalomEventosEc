export const site = {
  name: "Shalom Recepciones & Eventos",
  shortName: "Shalom",
  tagline: "Momentos inolvidables en un salón hecho para celebrar",
  // Edita estos datos con la información real del salón
  phone: "+593991748342 - +593991051826",
  whatsapp: "593991748342", // solo dígitos, con código de país
  email: "Shalomeventosec@gmail.com",
  address: "Mexico y Juan Montalvo, Quevedo, Ecuador",
  hours: "Lun a Dom · 9:00 a 20:00",
  social: {
    instagram: "https://instagram.com/shalom_quevedo?igshid=NTc4MTIwNjQ2YQ==",
    facebook: "https://www.facebook.com/share/1DzysVjXeX/",
  },
}

export const navLinks = [
  { href: "#nosotros", label: "Nosotros" },
  { href: "#servicios", label: "Servicios" },
  { href: "/eventos", label: "Galería" },
  { href: "#opiniones", label: "Opiniones" },
  { href: "#contacto", label: "Contacto" },
]

export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${site.whatsapp}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
