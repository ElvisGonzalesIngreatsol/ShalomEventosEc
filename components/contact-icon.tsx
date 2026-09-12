import React from "react"
import { Phone, Mail, MapPin, Globe, Send } from "lucide-react"
import type { ContactIconType } from "@/lib/types"

export const AVAILABLE_ICONS: {
  id: ContactIconType
  name: string
  defaultTitle: string
  placeholder: string
  color: string
}[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    defaultTitle: "WhatsApp",
    placeholder: "https://wa.me/593991748342",
    color: "#25D366",
  },
  {
    id: "instagram",
    name: "Instagram",
    defaultTitle: "Instagram",
    placeholder: "https://instagram.com/shalom_quevedo",
    color: "#E1306C",
  },
  {
    id: "facebook",
    name: "Facebook",
    defaultTitle: "Facebook",
    placeholder: "https://facebook.com/share/...",
    color: "#1877F2",
  },
  {
    id: "tiktok",
    name: "TikTok",
    defaultTitle: "TikTok",
    placeholder: "https://tiktok.com/@shalomeventosec",
    color: "#000000",
  },
  {
    id: "youtube",
    name: "YouTube",
    defaultTitle: "YouTube",
    placeholder: "https://youtube.com/@shalomeventosec",
    color: "#FF0000",
  },
  {
    id: "phone",
    name: "Teléfono / Llamada",
    defaultTitle: "Teléfono",
    placeholder: "tel:+593991748342",
    color: "#10B981",
  },
  {
    id: "mail",
    name: "Correo Electrónico",
    defaultTitle: "Email",
    placeholder: "mailto:Shalomeventosec@gmail.com",
    color: "#D97706",
  },
  {
    id: "mapPin",
    name: "Dirección / Google Maps",
    defaultTitle: "Ubicación",
    placeholder: "https://maps.google.com/?q=...",
    color: "#EF4444",
  },
  {
    id: "telegram",
    name: "Telegram",
    defaultTitle: "Telegram",
    placeholder: "https://t.me/shalomeventosec",
    color: "#0088CC",
  },
  {
    id: "globe",
    name: "Página Web / Otro",
    defaultTitle: "Sitio Web",
    placeholder: "https://...",
    color: "#6366F1",
  },
]

export function ContactIcon({
  icon,
  className = "size-5",
}: {
  icon: ContactIconType
  className?: string
}) {
  switch (icon) {
    case "whatsapp":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.98-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.4-1.76-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.45 1.03 2.61.13.17 1.78 2.72 4.31 3.81.6.26 1.07.42 1.44.53.61.2 1.16.17 1.6-.1.49-.3 1.47-1.2 1.68-1.66.2-.47.2-.87.14-.98-.06-.11-.23-.17-.48-.3z" />
        </svg>
      )

    case "instagram":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
        </svg>
      )

    case "facebook":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
        </svg>
      )

    case "tiktok":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.86-4.48V8.75a8.16 8.16 0 0 0 4.74 1.5V6.8c-.28-.03-.56-.07-.83-.11z" />
        </svg>
      )

    case "youtube":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )

    case "telegram":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l-.313 4.671c.458 0 .66-.21.916-.458l2.199-2.138 4.573 3.378c.843.465 1.448.225 1.658-.783l2.996-14.116c.307-1.233-.473-1.791-1.205-1.421z" />
        </svg>
      )

    case "phone":
      return <Phone className={className} />

    case "mail":
      return <Mail className={className} />

    case "mapPin":
      return <MapPin className={className} />

    case "globe":
    default:
      return <Globe className={className} />
  }
}
