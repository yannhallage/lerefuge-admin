import { parseLogement, type Logement } from "./createLogement"

export const STORAGE_KEY = "lerefuge-logements-v1"

export const EXEMPLES: Logement[] = [
  {
    id: "demo-1",
    nom: "Chambre vue jardin",
    prix: 85,
    photosPresentation: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
    ],
    galeriePhotos: [
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
    ],
    descriptionChambre: "Chambre lumineuse avec vue sur le jardin, idéale pour un séjour au calme.",
    criteresIds: [],
  },
]

export function loadLogements(): Logement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EXEMPLES
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) return EXEMPLES
    return parsed.map(parseLogement).filter((x): x is Logement => x !== null)
  } catch {
    return EXEMPLES
  }
}

export function saveLogements(items: Logement[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}
