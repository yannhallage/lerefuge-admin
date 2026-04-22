export type StatutRepas = "disponible" | "rupture" | "masque"

export type Repas = {
  id: string
  nom: string
  categorie: string
  prix: number
  description: string
  statut: StatutRepas
  image?: string | null
}

function parseStatut(x: unknown): StatutRepas {
  if (x === "disponible" || x === "rupture" || x === "masque") return x
  return "disponible"
}

export function parseRepas(x: unknown): Repas | null {
  if (!x || typeof x !== "object") return null
  const o = x as Record<string, unknown>
  if (typeof o.id !== "string") return null
  if (typeof o.nom !== "string") return null
  if (typeof o.categorie !== "string") return null
  if (typeof o.prix !== "number" || Number.isNaN(o.prix) || o.prix < 0) return null
  if (typeof o.description !== "string") return null

  return {
    id: o.id,
    nom: o.nom,
    categorie: o.categorie,
    prix: Number(o.prix.toFixed(2)),
    description: o.description,
    statut: parseStatut(o.statut),
    image: typeof o.image === "string" ? o.image : null,
  }
}
