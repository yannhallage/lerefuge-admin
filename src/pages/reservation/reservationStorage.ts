import { parseReservation, type Reservation } from "./reservationTypes"

export const STORAGE_KEY = "lerefuge-reservations-v1"

export const EXEMPLES: Reservation[] = [
  {
    id: "resa-demo-1",
    dateArrivee: "2026-04-18",
    dateDepart: "2026-04-19",
    adultes: 1,
    enfants: 0,
    nombreChambres: 1,
    typeChambre: "Chambre standard",
    nomClient: "Marie Dupont",
    email: "marie.dupont@example.com",
    telephone: "+33 6 12 34 56 78",
    message: "Arrivée prévue vers 15 h, merci.",
    statut: "en-attente",
  },
  {
    id: "resa-demo-2",
    dateArrivee: "2026-04-22",
    dateDepart: "2026-04-25",
    adultes: 2,
    enfants: 1,
    nombreChambres: 1,
    typeChambre: "Suite",
    nomClient: "Jean Martin",
    email: "jean.martin@example.com",
    telephone: "+33 7 98 76 54 32",
    message: "",
    statut: "confirmee",
  },
]

export function loadReservations(): Reservation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EXEMPLES
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) return EXEMPLES
    return parsed.map(parseReservation).filter((x): x is Reservation => x !== null)
  } catch {
    return EXEMPLES
  }
}

export function saveReservations(items: Reservation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}
