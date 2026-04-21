import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type TouchEvent } from "react"

type AddActiviteModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: { nom: string; image?: File }) => void | Promise<void>
  isSubmitting?: boolean
}

export function AddActiviteModal({ isOpen, onClose, onSubmit, isSubmitting = false }: AddActiviteModalProps) {
  const [titre, setTitre] = useState("")
  const [imageFile, setImageFile] = useState<File | undefined>(undefined)
  const [dragOffsetY, setDragOffsetY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const touchStartYRef = useRef<number | null>(null)
  const dragCloseThreshold = 110

  useEffect(() => {
    if (!isOpen) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nom = titre.trim()
    if (!nom) return
    void onSubmit({ nom, image: imageFile })
    setTitre("")
    setImageFile(undefined)
  }

  function handleClose() {
    setTitre("")
    setImageFile(undefined)
    setDragOffsetY(0)
    setIsDragging(false)
    touchStartYRef.current = null
    onClose()
  }

  function handleSheetTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartYRef.current = event.touches[0]?.clientY ?? null
    setIsDragging(true)
  }

  function handleSheetTouchMove(event: TouchEvent<HTMLDivElement>) {
    if (touchStartYRef.current === null) return
    const currentY = event.touches[0]?.clientY ?? touchStartYRef.current
    const nextOffset = Math.max(0, currentY - touchStartYRef.current)
    setDragOffsetY(nextOffset)
  }

  function handleSheetTouchEnd() {
    setIsDragging(false)
    touchStartYRef.current = null
    if (dragOffsetY >= dragCloseThreshold) {
      handleClose()
      return
    }
    setDragOffsetY(0)
  }

  if (!isOpen) return null

  const modalStyle: CSSProperties = {
    transform: `translateY(${dragOffsetY}px)`,
    transition: isDragging ? "none" : "transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)",
  }

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-[2px] max-sm:items-end max-sm:p-0"
      role="presentation"
      onClick={handleClose}
    >
      <div
        className="max-h-[calc(100vh-32px)] w-full max-w-[520px] overflow-y-auto rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_24px_40px_rgba(2,8,20,0.24)] max-sm:max-h-[min(88vh,720px)] max-sm:max-w-full max-sm:rounded-t-2xl max-sm:rounded-b-none max-sm:border-b-0 max-sm:px-4 max-sm:pt-[14px] max-sm:pb-[calc(16px+env(safe-area-inset-bottom,0px))]"
        style={modalStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-activite-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="mx-auto mb-3 mt-0.5 hidden h-[5px] w-11 rounded-full bg-slate-300 touch-none max-sm:block"
          aria-hidden="true"
          onTouchStart={handleSheetTouchStart}
          onTouchMove={handleSheetTouchMove}
          onTouchEnd={handleSheetTouchEnd}
          onTouchCancel={handleSheetTouchEnd}
        />
        <h2 id="add-activite-title" className="mb-[14px] text-[0.96rem] font-bold text-slate-900">
          Ajouter une activité
        </h2>
        <form className="grid gap-[14px]" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-[0.8rem] font-semibold text-slate-700">
            Nom de l'activité
            <input
              className="min-h-[38px] w-full rounded-lg border border-slate-300 px-3 text-[0.82rem] text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
              type="text"
              value={titre}
              onChange={(event) => setTitre(event.target.value)}
              placeholder="Ex: Randonnée guidée"
              autoFocus
              required
            />
          </label>
          <label className="grid gap-2 text-[0.8rem] font-semibold text-slate-700">
            Image (optionnel)
            <input
              className="min-h-[38px] w-full rounded-lg border border-slate-300 px-3 text-[0.82rem] text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
              type="file"
              accept="image/*"
              onChange={(event) => setImageFile(event.target.files?.[0] ?? undefined)}
            />
          </label>
          <div className="flex justify-end gap-2 max-sm:flex-col-reverse max-sm:gap-2.5">
            <button
              type="button"
              className="min-h-[38px] rounded-lg border border-slate-300 bg-white px-[14px] text-[0.82rem] font-semibold text-slate-900 max-sm:min-h-[42px] max-sm:w-full"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="min-h-[38px] rounded-lg border border-slate-900 bg-slate-900 px-[14px] text-[0.82rem] font-semibold text-white max-sm:min-h-[42px] max-sm:w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Ajout..." : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
