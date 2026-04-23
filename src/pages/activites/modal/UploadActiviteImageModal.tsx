import { useEffect, useMemo, useRef, useState, type DragEvent, type FormEvent } from "react"
import { Camera, ImagePlus, X } from "lucide-react"
import { useToast } from "@/app/components/ToastProvider"
import { DrawerMobile } from "../components/DrawerMobile"
import styles from "./AddActiviteModal.module.css"

type UploadActiviteImageModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: { image: File }) => void | Promise<void>
  isSubmitting?: boolean
  errorMessage?: string
}

export function UploadActiviteImageModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  errorMessage,
}: UploadActiviteImageModalProps) {
  const toast = useToast()
  const [isMobile, setIsMobile] = useState(false)
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
        handleClose()
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen])

  const previewUrl = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : ""), [imageFile])
  const canSubmit = Boolean(imageFile) && !isSubmitting

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function handleClose() {
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

  async function submitUpload() {
    if (!imageFile) {
      toast.warning({
        title: "Image requise",
        description: "Ajoutez une image avant de continuer.",
      })
      return
    }
    try {
      await onSubmit({ image: imageFile })
      toast.success({
        title: "Image envoyee",
        description: "L'image d'activite a ete enregistree.",
      })
      handleClose()
    } catch {
      // L'erreur est affichée via errorMessage depuis le parent.
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await submitUpload()
  }

  const content = (
    <>
      {isMobile ? <div className={styles.drawerHandle} aria-hidden /> : null}
      <h2 id="upload-activite-image-title" className={styles.title}>
        Ajouter une image d'activite
      </h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.label}>
          Image
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
                <img src={previewUrl} alt="Apercu de l'image" className={styles.previewImage} />
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
          <button type="submit" className={styles.submitButton} disabled={!canSubmit}>
            {isSubmitting ? "Upload..." : "Uploader"}
          </button>
          <button type="button" className={styles.cancelButton} onClick={handleClose} disabled={isSubmitting}>
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
          fieldLabel="Image"
          fieldValue="Image d'activite"
          fieldDisabled
          title=""
          description="Ajoutez l'image de votre activite."
          trustText="L'image est utilisee uniquement pour la galerie des activites."
          idleTitle="Ajoutez une image d'activite"
          idleSub="PNG, JPG ou WEBP - 1 image requise"
          submitLabel="Uploader l'image"
          submittingLabel="Upload en cours..."
          disabledReason="Ajoutez une image pour continuer."
          imageFile={imageFile}
          isDropActive={isDropActive}
          onClose={handleClose}
          onFieldChange={() => {}}
          onFilePick={() => fileInputRef.current?.click()}
          onFileRemove={() => {
            setImageFile(undefined)
            if (fileInputRef.current) fileInputRef.current.value = ""
          }}
          onSubmit={() => {
            void submitUpload()
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
    <div className={styles.overlay} role="presentation" onClick={handleClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-activite-image-title"
        onClick={(event) => event.stopPropagation()}
      >
        {content}
      </div>
    </div>
  )
}
