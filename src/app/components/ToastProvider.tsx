import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import styles from "./ToastProvider.module.css"

type ToastVariant = "success" | "error" | "warning" | "info"

type ToastInput = {
  title: string
  description?: string
  variant?: ToastVariant
  durationMs?: number
}

type ToastItem = {
  id: number
  title: string
  description?: string
  variant: ToastVariant
  durationMs: number
}

type ToastContextValue = {
  showToast: (toast: ToastInput) => number
  dismissToast: (id: number) => void
  clearToasts: () => void
  success: (toast: Omit<ToastInput, "variant">) => number
  error: (toast: Omit<ToastInput, "variant">) => number
  warning: (toast: Omit<ToastInput, "variant">) => number
  info: (toast: Omit<ToastInput, "variant">) => number
}

type ToastProviderProps = {
  children: ReactNode
}

const DEFAULT_DURATION_MS = 4000
const ToastContext = createContext<ToastContextValue | null>(null)

function ToastCard({ toast, onClose }: { toast: ToastItem; onClose: (id: number) => void }) {
  useEffect(() => {
    const timer = window.setTimeout(() => onClose(toast.id), toast.durationMs)
    return () => window.clearTimeout(timer)
  }, [onClose, toast.durationMs, toast.id])

  return (
    <div
      className={`${styles.toast} ${styles[toast.variant]}`}
      role={toast.variant === "error" || toast.variant === "warning" ? "alert" : "status"}
      aria-live={toast.variant === "error" || toast.variant === "warning" ? "assertive" : "polite"}
    >
      <div className={styles.body}>
        <p className={styles.title}>{toast.title}</p>
        {toast.description ? <p className={styles.description}>{toast.description}</p> : null}
      </div>
      <button
        type="button"
        className={styles.closeButton}
        aria-label="Fermer la notification"
        onClick={() => onClose(toast.id)}
      >
        x
      </button>
    </div>
  )
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismissToast = useCallback((id: number) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((toast: ToastInput) => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    const nextToast: ToastItem = {
      id,
      title: toast.title,
      description: toast.description,
      variant: toast.variant ?? "info",
      durationMs: toast.durationMs ?? DEFAULT_DURATION_MS,
    }
    setToasts((previous) => [...previous, nextToast])
    return id
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      dismissToast,
      clearToasts,
      success: (toast) => showToast({ ...toast, variant: "success" }),
      error: (toast) => showToast({ ...toast, variant: "error" }),
      warning: (toast) => showToast({ ...toast, variant: "warning" }),
      info: (toast) => showToast({ ...toast, variant: "info" }),
    }),
    [clearToasts, dismissToast, showToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.viewport} aria-live="polite" aria-label="Notifications">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast doit etre utilise dans un ToastProvider")
  }
  return context
}
