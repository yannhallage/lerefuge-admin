import { useCallback, useEffect, useId, useState, type ChangeEvent, type FormEvent } from "react"
import { ImagePlus, X } from "lucide-react"
import { CRITERES_DEFAUT } from "../logementCriteres"
import type { Logement } from "./logementTypes"
import styles from "./CreateLogementForm.module.css"

const VIDE: Omit<Logement, "id"> = {
  nom: "",
  prix: 0,
  photosPresentation: ["", ""],
  galeriePhotos: [],
  descriptionChambre: "",
  criteresIds: [],
}

function fileVersDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(r.error)
    r.readAsDataURL(file)
  })
}

export type CreateLogementFormProps = {
  mode: "creation" | "edition"
  /** Fiche à éditer ; non utilisée en création */
  logementEdition: Logement | null
  onCancel: () => void
  onSaved: (logement: Logement) => void
  /**
   * `page` : pleine page (création), sans en-tête type panneau ni bouton fermer.
   * `modal` : édition dans la liste, avec titre et fermeture.
   */
  presentation?: "page" | "modal"
}

export function CreateLogementForm({
  mode,
  logementEdition,
  onCancel,
  onSaved,
  presentation = "modal",
}: CreateLogementFormProps) {
  const formTitleId = useId()
  const [form, setForm] = useState<Omit<Logement, "id">>(VIDE)

  useEffect(() => {
    if (mode === "edition" && logementEdition) {
      setForm({
        nom: logementEdition.nom,
        prix: logementEdition.prix,
        photosPresentation: [...logementEdition.photosPresentation] as [string, string],
        galeriePhotos: [...logementEdition.galeriePhotos],
        descriptionChambre: logementEdition.descriptionChambre,
        criteresIds: [...logementEdition.criteresIds],
      })
    } else {
      setForm(VIDE)
    }
  }, [mode, logementEdition])

  const handlePresentation = useCallback(
    async (index: 0 | 1, e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file?.type.startsWith("image/")) return
      const url = await fileVersDataUrl(file)
      setForm((prev) => {
        const next: [string, string] = [...prev.photosPresentation] as [string, string]
        next[index] = url
        return { ...prev, photosPresentation: next }
      })
      e.target.value = ""
    },
    [],
  )

  const handleGalerie = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    const urls: string[] = []
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      if (!f.type.startsWith("image/")) continue
      urls.push(await fileVersDataUrl(f))
    }
    if (urls.length) {
      setForm((prev) => ({ ...prev, galeriePhotos: [...prev.galeriePhotos, ...urls] }))
    }
    e.target.value = ""
  }, [])

  const retirerGalerie = useCallback((idx: number) => {
    setForm((prev) => ({
      ...prev,
      galeriePhotos: prev.galeriePhotos.filter((_, i) => i !== idx),
    }))
  }, [])

  function soumettre(e: FormEvent) {
    e.preventDefault()
    const nom = form.nom.trim()
    if (!nom) return
    if (!form.photosPresentation[0] || !form.photosPresentation[1]) {
      window.alert("Ajoutez les deux photos de présentation.")
      return
    }

    const prix = form.prix < 0 ? 0 : form.prix
    const photosPresentation: [string, string] = [form.photosPresentation[0], form.photosPresentation[1]]
    const galeriePhotos = [...form.galeriePhotos]
    const descriptionChambre = form.descriptionChambre.trim()

    const criteresIds = [...form.criteresIds]

    if (mode === "creation") {
      onSaved({
        id: `log-${Date.now()}`,
        nom,
        prix,
        photosPresentation,
        galeriePhotos,
        descriptionChambre,
        criteresIds,
      })
    } else if (logementEdition) {
      onSaved({
        ...logementEdition,
        nom,
        prix,
        photosPresentation,
        galeriePhotos,
        descriptionChambre,
        criteresIds,
      })
    }
  }

  const isPage = presentation === "page"
  const formCardClass = `${styles.formCard}${isPage ? ` ${styles.formCardPage}` : ""}`

  return (
    <form
      className={formCardClass}
      onSubmit={soumettre}
      aria-labelledby={isPage ? undefined : formTitleId}
      aria-label={isPage ? (mode === "creation" ? "Créer un logement" : "Modifier le logement") : undefined}
    >
      {!isPage ? (
        <div className={styles.formHead}>
          <h2 id={formTitleId} className={styles.formTitle}>
            {mode === "creation" ? "Nouveau logement" : "Modifier le logement"}
          </h2>
          <button type="button" className={styles.btnGhost} onClick={onCancel} aria-label="Fermer le formulaire">
            <X size={18} strokeWidth={2} aria-hidden />
          </button>
        </div>
      ) : null}

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Informations</h3>
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span className={styles.label}>Nom du logement</span>
            <input
              className={styles.input}
              value={form.nom}
              onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))}
              placeholder="Ex. Suite familiale"
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Prix (€ / nuit)</span>
            <input
              className={styles.input}
              type="number"
              min={0}
              step={1}
              value={form.prix || ""}
              onChange={(e) => setForm((p) => ({ ...p, prix: Number(e.target.value) || 0 }))}
            />
          </label>
        </div>
      </div>

      <div className={`${styles.section} ${styles.block}`}>
        <h3 className={styles.sectionTitle}>Photos de couverture</h3>
        <p className={styles.sectionLead}>Deux images obligatoires pour l’affiche dans le catalogue.</p>
        <div className={styles.deuxPhotos}>
          {[0, 1].map((i) => (
            <label key={i} className={styles.presDrop}>
              <input
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={(e) => void handlePresentation(i as 0 | 1, e)}
              />
              {form.photosPresentation[i as 0 | 1] ? (
                <>
                  <img className={styles.presImg} src={form.photosPresentation[i as 0 | 1]} alt="" />
                  <span className={styles.presOverlay}>Remplacer la photo</span>
                </>
              ) : (
                <div className={styles.presPlaceholder}>
                  <ImagePlus size={28} strokeWidth={1.5} aria-hidden />
                  <span className={styles.presPlaceholderTitle}>Photo {i + 1}</span>
                  <span className={styles.presPlaceholderHint}>Cliquer pour importer</span>
                </div>
              )}
            </label>
          ))}
        </div>
      </div>

      <fieldset className={styles.criteresFieldset}>
        <legend className={styles.sectionTitle}>Équipements & services</legend>
        <p className={styles.sectionLead}>
          Activez les critères affichés sur la fiche. Liste par défaut : Wi‑Fi, réfrigérateur, TV, etc.
        </p>
        <div className={styles.criteresChips} role="group" aria-label="Critères disponibles">
          {CRITERES_DEFAUT.map((c) => {
            const actif = form.criteresIds.includes(c.id)
            return (
              <label
                key={c.id}
                className={styles.critereChip}
                data-actif={actif ? "true" : "false"}
                title={c.aide}
              >
                <input
                  type="checkbox"
                  className={styles.critereChipInput}
                  checked={actif}
                  onChange={() =>
                    setForm((p) => ({
                      ...p,
                      criteresIds: actif
                        ? p.criteresIds.filter((x) => x !== c.id)
                        : [...p.criteresIds, c.id],
                    }))
                  }
                />
                <span className={styles.critereChipText}>{c.libelle}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <div className={`${styles.section} ${styles.block}`}>
        <h3 className={styles.sectionTitle}>Galerie & description</h3>
        <p className={styles.sectionLead}>Photos complémentaires et texte libre pour le détail du logement.</p>
        <span className={styles.label}>Galerie (optionnel)</span>
        <div className={styles.galerieRow}>
          {form.galeriePhotos.map((src, idx) => (
            <div key={`${src.slice(0, 32)}-${idx}`} className={styles.galerieItem}>
              <img className={styles.galerieThumb} src={src} alt="" />
              <button
                type="button"
                className={styles.galerieRemove}
                onClick={() => retirerGalerie(idx)}
                aria-label={`Retirer la photo ${idx + 1}`}
              >
                <X size={14} strokeWidth={2} aria-hidden />
              </button>
            </div>
          ))}
          <label className={styles.galerieAdd}>
            <input
              type="file"
              accept="image/*"
              multiple
              className={styles.fileInput}
              onChange={(e) => void handleGalerie(e)}
            />
            <ImagePlus size={22} strokeWidth={2} aria-hidden />
            <span>Ajouter</span>
          </label>
        </div>
      </div>

      <div className={`${styles.section} ${styles.block}`}>
        <label className={styles.field}>
          <span className={styles.label}>Description de la chambre</span>
          <textarea
            className={styles.textarea}
            rows={4}
            value={form.descriptionChambre}
            onChange={(e) => setForm((p) => ({ ...p, descriptionChambre: e.target.value }))}
            placeholder="Équipements, capacité, vue, etc."
          />
        </label>
      </div>

      <div className={styles.formActions}>
        <button type="button" className={styles.btnSecondary} onClick={onCancel}>
          Annuler
        </button>
        <button type="submit" className={styles.btnPrimary}>
          {mode === "creation" ? "Enregistrer le logement" : "Enregistrer les modifications"}
        </button>
      </div>
    </form>
  )
}
