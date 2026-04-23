import { useEffect, useMemo, useRef, useState, type DragEvent, type FormEvent } from "react"
import { Camera, ImagePlus, X } from "lucide-react"
import { useToast } from "@/app/components/ToastProvider"
import { DrawerMobile } from "../components/DrawerMobile"
import styles from "./AddActiviteModal.module.css"

type AddActiviteModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: { nom: string; image?: File }) => void | Promise<void>
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
  title = "Ajouter une activité",
  submitLabel = "Ajouter",
  submittingLabel = "Ajout...",
  successTitle = "Activite ajoutee",
  successDescription = (nom) => `L'activite "${nom}" a ete enregistree avec succes.`,
}: AddActiviteModalProps) {
  const toast = useToast()
  const [isMobile, setIsMobile] = useState(false)
  const [titre, setTitre] = useState("")
  const [imageFile, setImageFile] = useState<File | undefined>(undefined)
  const [isDropActive, setIsDropActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)")
    const update = () => setIsMobile(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

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
    const nom = titre.trim()
    if (!nom) {
      toast.warning({
        title: "Nom obligatoire",
        description: "Veuillez renseigner le nom de l'activite avant de valider.",
      })
      return
    }
    try {
      await onSubmit({ nom, image: imageFile })
      setTitre("")
      setImageFile(undefined)
      if (fileInputRef.current) fileInputRef.current.value = ""
      toast.success({
        title: successTitle,
        description: successDescription(nom),
      })
    } catch {
      // L'erreur est affichée depuis la prop errorMessage gérée par le parent.
      toast.error({
        title: "Echec de l'ajout",
        description: "Une erreur est survenue pendant l'enregistrement de l'activite.",
      })
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await submitForm()
  }

  const canSubmit = useMemo(() => titre.trim().length > 0 && !isSubmitting, [titre, isSubmitting])
  const previewUrl = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : ""), [imageFile])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function handleClose() {
    setTitre("")
    setImageFile(undefined)
    setIsDropActive(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
    onClose()
  }

  function handleFileSelection(file?: File) {
    if (!file) return
    setImageFile(file)
    setIsDropActive(false)
  }

  function handleDropAreaDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDropActive(true)
  }

  function handleDropAreaDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDropActive(false)
  }

  function handleDropAreaDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    handleFileSelection(file)
  }

  const content = (
    <>
      {isMobile ? <div className={styles.drawerHandle} aria-hidden /> : null}
      <h2 id="add-activite-title" className={styles.title}>
        {title}
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
        <div className={styles.label}>
          Image (optionnel)
          <input
            ref={fileInputRef}
            className={styles.fileInput}
            type="file"
            accept="image/*"
            onChange={(event) => handleFileSelection(event.target.files?.[0])}
          />
          <div
            className={`${styles.uploadCard} ${isDropActive ? styles.uploadCardActive : ""}`}
            onDragOver={handleDropAreaDragOver}
            onDragEnter={handleDropAreaDragOver}
            onDragLeave={handleDropAreaDragLeave}
            onDrop={handleDropAreaDrop}
          >
            <div className={styles.uploadTopRow}>
              <div className={styles.uploadIconBadge}>
                <ImagePlus size={20} aria-hidden />
              </div>
              <div className={styles.uploadText}>
                <span className={styles.uploadTitle}>Ajouter une image</span>
                <span className={styles.uploadSub}>PNG, JPG, WEBP - 1 image maximum</span>
              </div>
            </div>
            <button
              type="button"
              className={styles.pickImageButton}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Choisir depuis la galerie"
            >
              <Camera size={16} aria-hidden />
              <span>Choisir depuis la galerie</span>
            </button>
            {imageFile ? (
              <div className={styles.previewCard}>
                <img src={previewUrl} alt="Aperçu de l'image" className={styles.previewImage} />
                <div className={styles.previewMeta}>
                  <span className={styles.previewName}>{imageFile.name}</span>
                  <span className={styles.previewSize}>{Math.max(1, Math.round(imageFile.size / 1024))} Ko</span>
                </div>
              </div>
            ) : null}
          </div>
          {imageFile ? (
            <button
              type="button"
              className={styles.removeFileButton}
              onClick={() => {
                setImageFile(undefined)
                if (fileInputRef.current) fileInputRef.current.value = ""
              }}
            >
              <X size={14} aria-hidden />
              <span>Retirer l'image</span>
            </button>
          ) : null}
        </div>
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

  if (isMobile) {
    return (
      <>
        <input
          ref={fileInputRef}
          className={styles.fileInput}
          type="file"
          accept="image/*"
          onChange={(event) => handleFileSelection(event.target.files?.[0])}
        />
        <DrawerMobile
          isOpen={isOpen}
          isSubmitting={isSubmitting}
          canSubmit={canSubmit}
          fieldValue={titre}
          imageFile={imageFile}
          isDropActive={isDropActive}
          onClose={handleClose}
          onFieldChange={setTitre}
          onFilePick={() => fileInputRef.current?.click()}
          onFileRemove={() => {
            setImageFile(undefined)
            if (fileInputRef.current) fileInputRef.current.value = ""
          }}
          onSubmit={() => {
            if (canSubmit) void submitForm()
          }}
          onDropAreaDragOver={handleDropAreaDragOver}
          onDropAreaDragEnter={handleDropAreaDragOver}
          onDropAreaDragLeave={handleDropAreaDragLeave}
          onDropAreaDrop={handleDropAreaDrop}
        />
      </>
    )
  }

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
