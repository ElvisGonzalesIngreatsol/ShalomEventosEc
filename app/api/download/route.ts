import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")
  const filename = searchParams.get("filename") || "foto.jpg"

  if (!url) {
    return new NextResponse("Falta el parámetro 'url'", { status: 400 })
  }

  try {
    const response = await fetch(url)
    if (!response.ok) {
      return new NextResponse("No se pudo obtener la imagen", { status: response.status })
    }

    const contentType = response.headers.get("content-type") || "image/jpeg"
    const arrayBuffer = await response.arrayBuffer()

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch (error) {
    console.error("Error en proxy de descarga:", error)
    return new NextResponse("Error al descargar la imagen", { status: 500 })
  }
}
