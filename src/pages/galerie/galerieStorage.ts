export type GaleriePhotoSite = {
  id: string
  src: string
  /** Légende affichée sous la vignette (comme sur la page Accueil) */
  alt?: string
  /** Horodatage ISO à l’ajout */
  ajouteeLe: string
}

export const STORAGE_KEY_GALERIE = "lerefuge-galerie-site-v1"

const EXEMPLES: GaleriePhotoSite[] = [
  {
    id: "demo-g-1",
    src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
    // alt: "Façade et piscine d’un hôtel au coucher du soleil",
    ajouteeLe: new Date(0).toISOString(),
  },
  {
    id: "demo-g-2",
    src: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=80",
    // alt: "Chambre d’hôtel lumineuse avec lit king size",
    ajouteeLe: new Date(0).toISOString(),
  },
  {
    id: "demo-g-3",
    src: "https://images.unsplash.com/photo-1611892440504-42a792e63c32?auto=format&fit=crop&w=900&q=80",
    // alt: "Hall d’accueil moderne",
    ajouteeLe: new Date(0).toISOString(),
  },
]

function parseItem(o: unknown): GaleriePhotoSite | null {
  if (!o || typeof o !== "object") return null
  const x = o as Record<string, unknown>
  if (typeof x.id !== "string" || typeof x.src !== "string" || !x.src.trim()) return null
  const ajouteeLe = typeof x.ajouteeLe === "string" ? x.ajouteeLe : new Date().toISOString()
  const alt = typeof x.alt === "string" && x.alt.trim() ? x.alt.trim() : undefined
  return { id: x.id, src: x.src.trim(), alt, ajouteeLe }
}

export function loadGalerieSite(): GaleriePhotoSite[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GALERIE)
    if (!raw) return EXEMPLES
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) return EXEMPLES
    const items = parsed.map(parseItem).filter((x): x is GaleriePhotoSite => x !== null)
    return items.length ? items : EXEMPLES
  } catch {
    return EXEMPLES
  }
}

export function saveGalerieSite(items: GaleriePhotoSite[]) {
  localStorage.setItem(STORAGE_KEY_GALERIE, JSON.stringify(items))
}
