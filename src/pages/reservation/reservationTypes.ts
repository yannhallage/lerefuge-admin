export type StatutReservation = "en-attente" | "confirmee" | "annulee"

export type Reservation = {
  // id: string
  /** ISO date (YYYY-MM-DD) */
  dateArrivee: string
  /** ISO date (YYYY-MM-DD) */
  dateDepart: string
  adultes: number
  enfants: number
  nombreChambres: number
  typeChambre: string
  nomClient: string
  email: string
  telephone: string
  message: string
  statut: StatutReservation
}

function parseStatut(x: unknown): StatutReservation {
  if (x === "confirmee" || x === "annulee" || x === "en-attente") return x
  return "en-attente"
}

function isIsoDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s)
}

/** Parse une entrée stockée (localStorage ou API). */
export function parseReservation(x: unknown): Reservation | null {
  if (!x || typeof x !== "object") return null
  const o = x as Record<string, unknown>
  if (typeof o.id !== "string") return null
  if (typeof o.dateArrivee !== "string" || !isIsoDate(o.dateArrivee)) return null
  if (typeof o.dateDepart !== "string" || !isIsoDate(o.dateDepart)) return null
  if (typeof o.adultes !== "number" || Number.isNaN(o.adultes) || o.adultes < 0) return null
  if (typeof o.enfants !== "number" || Number.isNaN(o.enfants) || o.enfants < 0) return null
  if (typeof o.nombreChambres !== "number" || Number.isNaN(o.nombreChambres) || o.nombreChambres < 1) {
    return null
  }
  if (typeof o.typeChambre !== "string") return null
  if (typeof o.nomClient !== "string") return null
  if (typeof o.email !== "string") return null
  if (typeof o.telephone !== "string") return null
  if (typeof o.message !== "string") return null

  return {
    // id: o.id,
    dateArrivee: o.dateArrivee,
    dateDepart: o.dateDepart,
    adultes: Math.floor(o.adultes),
    enfants: Math.floor(o.enfants),
    nombreChambres: Math.floor(o.nombreChambres),
    typeChambre: o.typeChambre,
    nomClient: o.nomClient,
    email: o.email,
    telephone: o.telephone,
    message: o.message,
    statut: parseStatut(o.statut),
  }
}
