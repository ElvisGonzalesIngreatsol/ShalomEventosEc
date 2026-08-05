import JSZip from "jszip"
import type { GalleryEvent } from "@/lib/types"

/** Descarga una sola imagen forzando la descarga (con fallback a nueva pestaña). */
export async function downloadImage(url: string, filename: string) {
  try {
    const res = await fetch(url, { mode: "cors" })
    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = objectUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(objectUrl)
  } catch {
    window.open(url, "_blank")
  }
}

/** Convierte un título en un nombre de archivo seguro. */
function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

/** Extensión de archivo a partir del content-type o la URL. */
function extFromBlob(blob: Blob, url: string) {
  const type = blob.type
  if (type.includes("png")) return "png"
  if (type.includes("webp")) return "webp"
  if (type.includes("gif")) return "gif"
  if (type.includes("jpeg") || type.includes("jpg")) return "jpg"
  const m = url.split("?")[0].match(/\.(png|webp|gif|jpe?g)$/i)
  return m ? m[1].toLowerCase().replace("jpeg", "jpg") : "jpg"
}

/**
 * Descarga TODAS las fotos de un evento empaquetadas en un archivo .zip.
 * onProgress recibe (completadas, total) para poder mostrar avance.
 */
export async function downloadAlbum(
  event: GalleryEvent,
  onProgress?: (done: number, total: number) => void,
) {
  const zip = new JSZip()
  const folderName = slugify(event.title) || event.id
  const folder = zip.folder(folderName) ?? zip
  const total = event.photos.length
  let done = 0

  await Promise.all(
    event.photos.map(async (photo, i) => {
      try {
        const res = await fetch(photo.url, { mode: "cors" })
        const blob = await res.blob()
        const ext = extFromBlob(blob, photo.url)
        const num = String(i + 1).padStart(2, "0")
        folder.file(`${folderName}-${num}.${ext}`, blob)
      } catch {
        // Si una foto falla (CORS, red), se omite y seguimos con las demás.
      } finally {
        done += 1
        onProgress?.(done, total)
      }
    }),
  )

  const content = await zip.generateAsync({ type: "blob" })
  const objectUrl = URL.createObjectURL(content)
  const a = document.createElement("a")
  a.href = objectUrl
  a.download = `${folderName}.zip`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(objectUrl)
}
