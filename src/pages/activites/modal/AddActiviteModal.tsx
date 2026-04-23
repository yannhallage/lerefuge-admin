import { useEffect, useMemo, useState, type FormEvent } from "react"
import { useToast } from "@/app/components/ToastProvider"
import styles from "./AddActiviteModal.module.css"

type AddActiviteModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: { nom: string }) => void | Promise<void>
  isSubmitting?: boolean
  errorMessage?: string
  title?: string
  submitLabel?: string
  submittingLabel?: string
  successTitle?: string
  successDescription?: (nom: string) => string
}

export function AddActiviteModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  errorMessage,
  title = "Creer une activite",
  submitLabel = "Creer l'activite",
  submittingLabel = "Creation...",
  successTitle = "Activite creee",
  successDescription = (nom) => `L'activite "${nom}" a ete creee avec succes.`,
}: AddActiviteModalProps) {
  const toast = useToast()
  const [nom, setNom] = useState("")

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

  async function submitForm() {
    const nomTrimmed = nom.trim()
    if (!nomTrimmed) {
      toast.warning({
        title: "Nom obligatoire",
        description: "Veuillez renseigner le nom de l'activite avant de valider.",
      })
      return
    }
    try {
      await onSubmit({ nom: nomTrimmed })
      setNom("")
      toast.success({
        title: successTitle,
        description: successDescription(nomTrimmed),
      })
    } catch {
      // L'erreur est affichée via errorMessage depuis le parent.
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await submitForm()
  }

  const canSubmit = useMemo(() => nom.trim().length > 0 && !isSubmitting, [nom, isSubmitting])

  function handleClose() {
    setNom("")
    onClose()
  }

  const content = (
    <>
      <h2 id="add-activite-title" className={styles.title}>
        {title}
      </h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          Nom de l'activité
          <input
            className={styles.input}
            type="text"
            value={nom}
            onChange={(event) => setNom(event.target.value)}
            placeholder="Ex: Randonnée guidée"
            autoFocus
            required
          />
        </label>
        {errorMessage ? <p className={styles.errorMessage}>{errorMessage}</p> : null}
        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={!canSubmit}
          >
            {isSubmitting ? submittingLabel : submitLabel}
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Annuler
          </button>
        </div>
      </form>
    </>
  )

  if (!isOpen) return null

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={handleClose}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-activite-title"
        onClick={(event) => event.stopPropagation()}
      >
        {content}
      </div>
    </div>
  )
}
