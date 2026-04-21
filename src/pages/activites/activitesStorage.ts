export type ActiviteRow = {
  id: string
  titre: string
  sousInfo?: string
}

const STORAGE_KEY = "lerefuge-activites-v2"

const ACTIVITES_PAR_DEFAUT: ActiviteRow[] = [
  { id: "act-1", titre: "Le sauna - Détente et bien-être" },
  { id: "act-2", titre: "Le repos de l'hippopotame" },
  { id: "act-3", titre: "Le nid du milan" },
  { id: "act-4", titre: "Surf et bouée en rivière" },
  { id: "act-5", titre: "La piscine naturelle" },
  { id: "act-6", titre: "Pont du singe suspendu" },
  { id: "act-7", titre: "La nacelle nautique" },
  { id: "act-8", titre: "Pont à pilier au cœur des lotus" },
]

function parseActivite(item: unknown): ActiviteRow | null {
  if (!item || typeof item !== "object") return null
  const o = item as Record<string, unknown>
  if (typeof o.id !== "string" || !o.id.trim()) return null
  if (typeof o.titre !== "string" || !o.titre.trim()) return null

  const sousInfoValue = typeof o.sousInfo === "string" ? o.sousInfo.trim() : ""

  return {
    id: o.id,
    titre: o.titre.trim(),
    sousInfo: sousInfoValue || undefined,
  }
}

export function loadActivites(): ActiviteRow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return ACTIVITES_PAR_DEFAUT
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return ACTIVITES_PAR_DEFAUT

    const items = parsed.map(parseActivite).filter((x): x is ActiviteRow => x !== null)

    return items.length > 0 ? items : ACTIVITES_PAR_DEFAUT
  } catch {
    return ACTIVITES_PAR_DEFAUT
  }
}

export function saveActivites(items: ActiviteRow[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}
