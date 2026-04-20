import { useEffect, useState, type FormEvent } from "react"
import styles from "./AddActiviteModal.module.css"

type AddActiviteModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (titre: string) => void
}

export function AddActiviteModal({ isOpen, onClose, onSubmit }: AddActiviteModalProps) {
  const [titre, setTitre] = useState("")

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
    if (!titre.trim()) return
    onSubmit(titre)
    setTitre("")
  }

  function handleClose() {
    setTitre("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay} role="presentation" onClick={handleClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-activite-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="add-activite-title" className={styles.title}>
          Ajouter une activité
        </h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            Nom de l'activité
            <input
              className={styles.input}
              type="text"
              value={titre}
              onChange={(event) => setTitre(event.target.value)}
              placeholder="Ex: Randonnée guidée"
              autoFocus
              required
            />
          </label>
          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={handleClose}>
              Annuler
            </button>
            <button type="submit" className={styles.submitButton}>
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
