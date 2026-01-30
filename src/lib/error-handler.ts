import { toast } from "sonner"

export function handleError(error: unknown, fallbackMessage?: string) {
  let message = fallbackMessage || "Something went wrong"
  
  if (error instanceof Error) {
    message = error.message
  } else if (typeof error === "string") {
    message = error
  }
  
  toast.error(message)
  console.error(error)
}

export function handleSuccess(message: string) {
  toast.success(message)
}

export function handleWarning(message: string) {
  toast.warning(message)
}

export function handleInfo(message: string) {
  toast.info(message)
}
