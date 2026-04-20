/** Entrée du catalogue de critères affiché dans les formulaires (données par défaut). */
export type CritereCatalogue = {
  id: string
  libelle: string
  /** Texte d’aide optionnel sous le libellé */
  aide?: string
}

/**
 * Tableau de référence des critères proposés à la création / édition.
 * Les fiches stockent uniquement les `id` cochés dans `Logement.criteresIds`.
 */
export const CRITERES_DEFAUT: CritereCatalogue[] = [
  { id: "wifi", libelle: "Wi‑Fi", aide: "Connexion incluse" },
  { id: "frigo", libelle: "Réfrigérateur / mini-bar", aide: "Conservation des denrées" },
  { id: "tv", libelle: "Télévision", aide: "Écran plat ou connecté" },
  { id: "clim", libelle: "Climatisation ou chauffage", aide: "Confort thermique" },
  { id: "sdb-privee", libelle: "Salle d’eau privative" },
  { id: "lit-double", libelle: "Lit double (160+)" },
  { id: "vue", libelle: "Belle vue", aide: "Jardin, cour ou paysage" },
  { id: "petit-dej", libelle: "Petit-déjeuner", aide: "Formule ou coin déjeuner" },
  { id: "bureau", libelle: "Coin bureau", aide: "Télétravail" },
  { id: "accessibilite", libelle: "Accès PMR", aide: "Rez-de-chaussée ou équipements adaptés" },
]

export function libellesCriteres(ids: string[]): string[] {
  const parId = new Map(CRITERES_DEFAUT.map((c) => [c.id, c.libelle]))
  return ids.map((id) => parId.get(id) ?? id)
}
