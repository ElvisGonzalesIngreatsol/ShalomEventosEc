import Swal from "sweetalert2"

// Instancia base de SweetAlert2 con diseño compacto y refinado
export const CompactSwal = Swal.mixin({
  width: 380,
  padding: "1.5rem",
  buttonsStyling: true,
  customClass: {
    popup: "!rounded-3xl !shadow-2xl !font-sans !border !border-border/60 !bg-card",
    title: "!text-lg !font-bold !font-serif !text-foreground",
    htmlContainer: "!text-sm !text-muted-foreground !leading-relaxed",
    confirmButton:
      "!rounded-full !px-5 !py-2.5 !text-sm !font-semibold !shadow-sm !transition-transform hover:!scale-105",
    cancelButton:
      "!rounded-full !px-5 !py-2.5 !text-sm !font-semibold !shadow-sm !transition-transform hover:!scale-105",
  },
})

/**
 * Muestra una alerta de éxito que se cierra automáticamente
 */
export async function showSuccessAlert(title: string, text?: string, timer = 1900) {
  return CompactSwal.fire({
    icon: "success",
    title,
    text,
    timer,
    timerProgressBar: true,
    showConfirmButton: false,
    iconColor: "#10b981",
  })
}

/**
 * Muestra una alerta informativa
 */
export async function showInfoAlert(title: string, text?: string, timer = 1900) {
  return CompactSwal.fire({
    icon: "info",
    title,
    text,
    timer,
    timerProgressBar: true,
    showConfirmButton: false,
    iconColor: "#3b82f6",
  })
}

/**
 * Muestra una alerta de error con botón de cierre
 */
export async function showErrorAlert(title: string, text?: string) {
  return CompactSwal.fire({
    icon: "error",
    title,
    text: text || "Ocurrió un error inesperado al procesar la solicitud.",
    confirmButtonText: "Entendido",
    confirmButtonColor: "#1a1a1a",
    iconColor: "#ef4444",
  })
}

/**
 * Muestra un diálogo de confirmación elegante
 */
export async function showConfirmAlert({
  title,
  text,
  confirmButtonText = "Sí, continuar",
  cancelButtonText = "Cancelar",
  isDestructive = true,
}: {
  title: string
  text: string
  confirmButtonText?: string
  cancelButtonText?: string
  isDestructive?: boolean
}): Promise<boolean> {
  const result = await CompactSwal.fire({
    icon: isDestructive ? "warning" : "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: isDestructive ? "#e11d48" : "#1a1a1a",
    cancelButtonColor: "#64748b",
    reverseButtons: true,
    iconColor: isDestructive ? "#f59e0b" : "#c59b27",
  })

  return result.isConfirmed
}
