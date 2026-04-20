import { parseRepas, type Repas } from "./repasTypes"

export const STORAGE_KEY_REPAS = "lerefuge-repas-v1"

export const EXEMPLES_REPAS: Repas[] = [
  {
    id: "rep-1",
    nom: "Poulet braise et alloco",
    categorie: "Plat principal",
    prix: 9.5,
    description: "Poulet braise servi avec alloco et sauce piment maison.",
    statut: "disponible",
  },
  {
    id: "rep-2",
    nom: "Poisson grille du jour",
    categorie: "Plat principal",
    prix: 11,
    description: "Poisson frais grille, accompagne de legumes sautes.",
    statut: "disponible",
  },
  {
    id: "rep-3",
    nom: "Salade tropicale",
    categorie: "Entree",
    prix: 5,
    description: "Salade verte, mangue, avocat et vinaigrette citronnee.",
    statut: "rupture",
  },
  {
    id: "rep-4",
    nom: "Jus bissap",
    categorie: "Boisson",
    prix: 2.5,
    description: "Boisson maison a base d'hibiscus.",
    statut: "disponible",
  },
]

export function loadRepas(): Repas[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REPAS)
    if (!raw) return EXEMPLES_REPAS
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) return EXEMPLES_REPAS
    return parsed.map(parseRepas).filter((x): x is Repas => x !== null)
  } catch {
    return EXEMPLES_REPAS
  }
}

export function saveRepas(items: Repas[]) {
  localStorage.setItem(STORAGE_KEY_REPAS, JSON.stringify(items))
}
