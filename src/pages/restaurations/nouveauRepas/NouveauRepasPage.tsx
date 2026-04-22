import { useEffect, useId, useState, type ChangeEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Camera, ImagePlus, Plus, Upload, X } from "lucide-react"
import { BeatLoader } from "react-spinners"
import listStyles from "../RestaurationsPage.module.css"
import pageStyles from "./NouveauRepasPage.module.css"
import { useCreateRestauration } from "@/features/restauration/hooks/useRestauration"
import { useToast } from "@/app/components/ToastProvider"
import type { StatutRepas } from "../repasTypes"

type FormState = {
  nom: string
  categorie: string
  prix: string
  description: string
  statut: StatutRepas
}

const INITIAL_FORM: FormState = {
  nom: "",
  categorie: "Plat principal",
  prix: "",
  description: "",
  statut: "disponible",
}

export function NouveauRepasPage() {
  const baseId = useId()
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const createRestauration = useCreateRestauration()
  const toast = useToast()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  function onImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.warning({
        title: "Fichier non valide",
        description: "Selectionnez uniquement une image (JPG ou PNG).",
      })
      e.target.value = ""
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.warning({
        title: "Fichier trop volumineux",
        description: "La taille maximale autorisee est de 10 Mo.",
      })
      e.target.value = ""
      return
    }
    const objectUrl = URL.createObjectURL(file)
    setSelectedImage(file)
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return objectUrl
    })
    e.target.value = ""
  }

  function clearImagePreview() {
    setSelectedImage(null)
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const prix = Number(form.prix)
    if (!form.nom.trim() || Number.isNaN(prix) || prix < 0) {
      toast.warning({
        title: "Formulaire incomplet",
        description: "Renseignez un nom et un prix valide avant d'enregistrer.",
      })
      return
    }

    setSubmitError(null)
    try {
      await createRestauration.mutateAsync({
        nom: form.nom.trim(),
        prix,
        description: form.description.trim(),
        image: selectedImage ?? undefined,
      })
      toast.success({
        title: "Repas ajoute",
        description: `Le repas "${form.nom.trim()}" a ete enregistre.`,
      })
      navigate("/carte")
    } catch {
      setSubmitError("La creation du repas a echoue.")
      toast.error({
        title: "Creation impossible",
        description: "La creation du repas a echoue.",
      })
    }
  }

  return (
    <div className={listStyles.wrap}>
      <section className={listStyles.intro} aria-labelledby={`${baseId}-title`}>
        <h2 id={`${baseId}-title`} className={listStyles.introTitle}>
          Nouveau repas
        </h2>
        <p className={listStyles.introText}>
          Ajoutez un repas a la carte du restaurant. Les donnees seront envoyees a l API.
        </p>
      </section>

      <div className={listStyles.breadcrumbRow}>
        <nav className={listStyles.breadcrumb} aria-label="Fil d’Ariane">
          <span className={listStyles.breadcrumbMuted}>Pages vitrine</span>
          <span className={listStyles.breadcrumbSep} aria-hidden>
            &gt;
          </span>
          <Link to="/carte" className={listStyles.breadcrumbLink}>
            Carte restaurant
          </Link>
          <span className={listStyles.breadcrumbSep} aria-hidden>
            &gt;
          </span>
          <span>Nouveau</span>
        </nav>
      </div>

      <div className={pageStyles.topRow}>
        <Link to="/carte" className={pageStyles.back}>
          <ArrowLeft size={18} strokeWidth={2} aria-hidden />
          Retour a la carte
        </Link>
        <p className={pageStyles.meta}>Les champs obligatoires sont le nom du repas et le prix.</p>
      </div>

      <form className={pageStyles.formCard} onSubmit={onSubmit}>
        {submitError ? <p className={pageStyles.meta}>{submitError}</p> : null}
        <div className={pageStyles.grid}>
          <label className={pageStyles.field}>
            <span className={pageStyles.label}>Nom du repas</span>
            <input
              required
              className={pageStyles.input}
              value={form.nom}
              onChange={(e) => setForm((prev) => ({ ...prev, nom: e.target.value }))}
              placeholder="Ex: Poulet braise"
            />
          </label>

          <label className={pageStyles.field}>
            <span className={pageStyles.label}>Categorie</span>
            <select
              className={pageStyles.select}
              value={form.categorie}
              onChange={(e) => setForm((prev) => ({ ...prev, categorie: e.target.value }))}
            >
              <option value="Plat principal">Plat principal</option>
              <option value="Entree">Entree</option>
              <option value="Dessert">Dessert</option>
              <option value="Boisson">Boisson</option>
              <option value="Accompagnement">Accompagnement</option>
            </select>
          </label>

          <label className={pageStyles.field}>
            <span className={pageStyles.label}>Prix (XOF)</span>
            <input
              required
              type="number"
              min="0"
              step="1"
              className={pageStyles.input}
              value={form.prix}
              onChange={(e) => setForm((prev) => ({ ...prev, prix: e.target.value }))}
              placeholder="Ex: 3500"
            />
          </label>

          <label className={pageStyles.field}>
            <span className={pageStyles.label}>Statut</span>
            <select
              className={pageStyles.select}
              value={form.statut}
              onChange={(e) => setForm((prev) => ({ ...prev, statut: e.target.value as StatutRepas }))}
            >
              <option value="disponible">Disponible</option>
              <option value="rupture">Rupture</option>
              <option value="masque">Masque</option>
            </select>
          </label>

          <label className={`${pageStyles.field} ${pageStyles.fieldFull}`}>
            <span className={pageStyles.label}>Description</span>
            <textarea
              className={pageStyles.textarea}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Description du repas..."
            />
          </label>
        </div>

        <section className={pageStyles.uploadSection} aria-label="Selection image du repas">
          <div className={pageStyles.uploadHeader}>
            <h3 className={pageStyles.uploadTitle}>Photo du repas</h3>
            <p className={pageStyles.uploadSubtitle}>
              Selectionnez une image nette pour illustrer le repas dans la carte.
            </p>
          </div>

          <div className={pageStyles.uploadCard}>
            <label className={pageStyles.uploadDropzone}>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className={pageStyles.fileInput}
                onChange={onImageChange}
              />
              {imagePreview ? (
                <div className={pageStyles.previewWrap}>
                  <img src={imagePreview} alt="Apercu du repas" className={pageStyles.previewImage} />
                  <button
                    type="button"
                    className={pageStyles.previewRemove}
                    onClick={clearImagePreview}
                    aria-label="Retirer l image selectionnee"
                  >
                    <X size={16} strokeWidth={2} aria-hidden />
                  </button>
                </div>
              ) : (
                <div className={pageStyles.uploadPlaceholder}>
                  <span className={pageStyles.uploadIconWrap}>
                    <Upload size={20} strokeWidth={2} aria-hidden />
                  </span>
                  <p className={pageStyles.uploadMainText}>Deposez une photo ici</p>
                  <p className={pageStyles.uploadSubText}>ou cliquez pour parcourir votre appareil</p>
                  <div className={pageStyles.uploadActions}>
                    <span className={pageStyles.uploadBtnPrimary}>
                      <ImagePlus size={14} strokeWidth={2} aria-hidden />
                      Choisir photo
                    </span>
                    <span className={pageStyles.uploadBtnGhost}>
                      <Camera size={14} strokeWidth={2} aria-hidden />
                      Prendre photo
                    </span>
                  </div>
                  <p className={pageStyles.uploadHint}>JPG, PNG jusqu a 10MB</p>
                </div>
              )}
            </label>
          </div>

          <div className={pageStyles.uploadTips} role="list" aria-label="Conseils photo">
            <p className={pageStyles.uploadTip} role="listitem">
              Utilisez une photo claire, bien centree.
            </p>
            <p className={pageStyles.uploadTip} role="listitem">
              Une bonne luminosite donne un meilleur rendu.
            </p>
            <p className={pageStyles.uploadTip} role="listitem">
              Une seule image par repas.
            </p>
          </div>
        </section>

        <div className={pageStyles.actions}>
          <button type="button" className={pageStyles.btnGhost} onClick={() => navigate("/carte")}>
            Annuler
          </button>
          <button type="submit" className={pageStyles.btnPrimary} disabled={createRestauration.isPending}>
            {createRestauration.isPending ? (
              <BeatLoader size={8} color="#fff" aria-hidden />
            ) : (
              <Plus size={16} strokeWidth={2} aria-hidden />
            )}
            {createRestauration.isPending ? "" : "Ajouter le repas"}
          </button>
        </div>
      </form>
    </div>
  )
}
