import { useId, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Plus } from "lucide-react"
import listStyles from "../RestaurationsPage.module.css"
import pageStyles from "./NouveauRepasPage.module.css"
import { useCreateRestauration } from "@/features/restauration/hooks/useRestauration"
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
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const prix = Number(form.prix)
    if (!form.nom.trim() || Number.isNaN(prix) || prix < 0) return

    setSubmitError(null)
    try {
      await createRestauration.mutateAsync({
        nom: form.nom.trim(),
        prix,
        description: form.description.trim(),
      })
      navigate("/carte")
    } catch {
      setSubmitError("La creation du repas a echoue.")
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
            <input
              className={pageStyles.input}
              value={form.categorie}
              onChange={(e) => setForm((prev) => ({ ...prev, categorie: e.target.value }))}
              placeholder="Ex: Plat principal"
            />
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

        <div className={pageStyles.actions}>
          <button type="button" className={pageStyles.btnGhost} onClick={() => navigate("/carte")}>
            Annuler
          </button>
          <button type="submit" className={pageStyles.btnPrimary}>
            <Plus size={16} strokeWidth={2} aria-hidden />
            {createRestauration.isPending ? "Ajout en cours..." : "Ajouter le repas"}
          </button>
        </div>
      </form>
    </div>
  )
}
