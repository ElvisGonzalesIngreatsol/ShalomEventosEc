"use server"

import { Resend } from "resend"
import { site } from "@/lib/site"

type ContactResult = { ok: boolean; error?: string }

// Validación simple en el servidor
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function sendContact(_prev: ContactResult | null, formData: FormData): Promise<ContactResult> {
  const name = String(formData.get("name") || "").trim()
  const email = String(formData.get("email") || "").trim()
  const message = String(formData.get("message") || "").trim()

  // Validaciones
  if (!name || !email || !message) {
    return { ok: false, error: "Por favor completa todos los campos." }
  }
  if (!isValidEmail(email)) {
    return { ok: false, error: "El correo electrónico no es válido." }
  }
  if (message.length > 5000) {
    return { ok: false, error: "El mensaje es demasiado largo." }
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return {
      ok: false,
      error: "El servicio de correo aún no está configurado. Intenta por WhatsApp mientras tanto.",
    }
  }

  try {
    const resend = new Resend(apiKey)
    // El remitente usa el dominio de pruebas de Resend (onboarding@resend.dev),
    // que permite enviar a la cuenta dueña del API key sin verificar dominio.
    const from = process.env.CONTACT_FROM_EMAIL || "Shalom Web <onboarding@resend.dev>"

    const { error } = await resend.emails.send({
      from,
      // Resend compara el destinatario de forma exacta contra el correo dueño
      // de la cuenta; lo normalizamos a minúsculas para evitar el error 403.
      to: [site.email.toLowerCase()],
      replyTo: email,
      subject: `Nueva consulta de ${name} — ${site.shortName}`,
      text: `Nombre: ${name}\nCorreo: ${email}\n\nMensaje:\n${message}`,
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1f1a24">
          <h2 style="color:#4a2b52;margin:0 0 16px">Nueva consulta desde la web</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 0;color:#6b6470">Nombre</td><td style="padding:6px 0;font-weight:600">${name}</td></tr>
            <tr><td style="padding:6px 0;color:#6b6470">Correo</td><td style="padding:6px 0;font-weight:600">${email}</td></tr>
          </table>
          <div style="margin-top:16px;padding:16px;background:#f6f3f0;border-radius:12px;white-space:pre-wrap;font-size:14px;line-height:1.6">${message.replace(/</g, "&lt;")}</div>
          <p style="margin-top:20px;font-size:12px;color:#9a949e">Responde directamente a este correo para contactar a ${name}.</p>
        </div>
      `,
    })

    if (error) {
      console.log("[v0] Resend send error:", JSON.stringify(error))
      return { ok: false, error: "No se pudo enviar el correo. Intenta de nuevo o escríbenos por WhatsApp." }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: "Ocurrió un error al enviar. Intenta por WhatsApp mientras tanto." }
  }
}
