import { Camera, CheckCircle2, ImagePlus, Trash2, X } from "lucide-react"
import { useEffect, useMemo, useState, type DragEvent } from "react"
import { createPortal } from "react-dom"
import styles from "./DrawerMobile.module.css"

type DrawerMobileProps = {
  isOpen: boolean
  isSubmitting: boolean
  canSubmit: boolean
  fieldValue: string
  imageFile?: File
  onClose: () => void
  onFieldChange: (value: string) => void
  onFilePick: () => void
  onFileRemove: () => void
  onSubmit: () => void
  onDropAreaDragOver: (event: DragEvent<HTMLDivElement>) => void
  onDropAreaDragEnter: (event: DragEvent<HTMLDivElement>) => void
  onDropAreaDragLeave: (event: DragEvent<HTMLDivElement>) => void
  onDropAreaDrop: (event: DragEvent<HTMLDivElement>) => void
  isDropActive?: boolean
  title?: string
  description?: string
  trustText?: string
  fieldLabel?: string
  fieldPlaceholder?: string
  fieldKind?: "text" | "select"
  fieldOptions?: Array<{ value: string; label: string }>
  fieldDisabled?: boolean
  idleTitle?: string
  idleSub?: string
  submitLabel?: string
  submittingLabel?: string
  disabledReason?: string
}

export function DrawerMobile({
  isOpen,
  isSubmitting,
  canSubmit,
  fieldValue,
  imageFile,
  onClose,
  onFieldChange,
  onFilePick,
  onFileRemove,
  onSubmit,
  onDropAreaDragOver,
  onDropAreaDragEnter,
  onDropAreaDragLeave,
  onDropAreaDrop,
  isDropActive = false,
  title = "Verification de votre activite",
  description = "Ajoutez une preuve de votre activite pour finaliser la verification.",
  trustText = "Votre photo est utilisee uniquement pour verifier votre activite.",
  fieldLabel = "Nom de l'activite",
  fieldPlaceholder = "Ex: Randonnee guidee",
  fieldKind = "text",
  fieldOptions = [],
  fieldDisabled = false,
  idleTitle = "Ajoutez une photo de votre activite",
  idleSub = "PNG, JPG ou WEBP",
  submitLabel = "Verifier mon activite",
  submittingLabel = "Verification en cours...",
  disabledReason = "Ajoutez une photo pour continuer.",
}: DrawerMobileProps) {
  const ANIMATION_MS = 280
  const [shouldRender, setShouldRender] = useState(isOpen)
  const [isClosing, setIsClosing] = useState(false)
  const previewUrl = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : ""), [imageFile])
  const hasTitle = title.trim().length > 0

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  useEffect(() => {
    if (!shouldRender) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [shouldRender])

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      setIsClosing(false)
      return
    }
    if (!shouldRender) return
    setIsClosing(true)
    const timeoutId = window.setTimeout(() => {
      setShouldRender(false)
      setIsClosing(false)
    }, ANIMATION_MS)
    return () => window.clearTimeout(timeoutId)
  }, [isOpen, shouldRender])

  if (!shouldRender) return null

  const drawer = (
    <div className={`${styles.overlay} ${isClosing ? styles.overlayClosing : ""}`} role="presentation" onClick={onClose}>
      <section
        className={`${styles.drawer} ${isClosing ? styles.drawerClosing : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={hasTitle ? "mobile-upload-title" : undefined}
        aria-label={hasTitle ? undefined : "Upload mobile"}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.content}>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Fermer le drawer">
            <X size={18} aria-hidden />
          </button>

          {hasTitle ? (
            <h2 id="mobile-upload-title" className={styles.title}>
              {title}
            </h2>
          ) : null}
          <p className={styles.subtitle}>{description}</p>
          <p className={styles.trustText}>{trustText}</p>

          {/* <label className={styles.label}>
            {fieldLabel}
            {fieldKind === "select" ? (
              <select
                className={styles.input}
                value={fieldValue}
                onChange={(event) => onFieldChange(event.target.value)}
                disabled={fieldDisabled}
                required
              >
                {fieldOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className={styles.input}
                type="text"
                value={fieldValue}
                onChange={(event) => onFieldChange(event.target.value)}
                placeholder={fieldPlaceholder}
                autoFocus
                required
              />
            )}
          </label> */}

          <div
            className={`${styles.dropZone} ${isDropActive ? styles.dropZoneActive : ""}`}
            onClick={() => {
              if (!imageFile) onFilePick()
            }}
            onDragOver={onDropAreaDragOver}
            onDragEnter={onDropAreaDragEnter}
            onDragLeave={onDropAreaDragLeave}
            onDrop={onDropAreaDrop}
          >
            {imageFile ? (
              <div className={styles.uploadDone}>
                <CheckCircle2 size={30} className={styles.successIcon} aria-hidden />
                <p className={styles.doneTitle}>Photo ajoutee</p>
                <p className={styles.doneSub}>{imageFile.name}</p>
                {previewUrl ? <img src={previewUrl} alt="Apercu de la photo selectionnee" className={styles.previewImage} /> : null}
                <button type="button" className={styles.clearButton} onClick={onFileRemove}>
                  <Trash2 size={14} aria-hidden />
                  Changer la photo
                </button>
              </div>
            ) : (
              <div className={styles.uploadIdle}>
                <div className={styles.iconWrap}>
                  <ImagePlus size={22} aria-hidden />
                </div>
                <p className={styles.idleTitle}>{idleTitle}</p>
                <p className={styles.idleSub}>{idleSub}</p>
                <div className={styles.primaryAction} aria-hidden>
                  <Camera size={16} />
                  <span>Ajouter une photo</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.submitButton} disabled={!canSubmit} onClick={onSubmit}>
            {isSubmitting ? submittingLabel : submitLabel}
          </button>
          {!canSubmit ? <p className={styles.disabledReason}>{disabledReason}</p> : null}
        </footer>
      </section>
    </div>
  )

  if (typeof document === "undefined") return drawer
  return createPortal(drawer, document.body)
}
