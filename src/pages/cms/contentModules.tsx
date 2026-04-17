import { ContentModulePage, type ContentModulePageProps } from "./ContentModulePage"

const modules = {
  accueil: {
    title: "Page d’accueil (index)",
    description:
      "Gestion du hero (carrousel / slides), accroches et blocs d’informations principales visibles sur la page d’accueil du site vitrine.",
    planned: [
      "Slides : image, titre, sous-titre, lien optionnel, ordre",
      "Bloc infos clés (accès, services, coordonnées rapides)",
      "Prévisualisation ou publication planifiée (selon backend)",
    ],
  },
  about: {
    title: "À propos",
    description:
      "Textes et médias de la page « À propos » : histoire de l’établissement, valeurs, équipe, visuels.",
    planned: [
      "Éditeur de texte riche pour les sections narratives",
      "Galerie inline ou image de mise en avant",
      "Ordre des sections",
    ],
  },
  rooms: {
    title: "Logements",
    description:
      "Liste des chambres / hébergements et fiche détail : tarifs, capacité, équipements, galerie photos.",
    planned: [
      "CRUD chambre : nom, slug, description, capacité, prix de base",
      "Galerie multi-images + image principale",
      "Visibilité sur le site (publié / masqué)",
    ],
  },
  booking: {
    title: "Réservations",
    description:
      "Paramètres affichés sur la page réservation : consignes, liens vers les canaux (téléphone, WhatsApp, moteur de résa), textes légaux.",
    planned: [
      "Textes d’intro et mentions (dépôt, annulation, etc.)",
      "Liste des canaux de contact cliquables",
      "Lien ou iframe vers outil externe si besoin",
    ],
  },
  offers: {
    title: "Offres",
    description:
      "Promotions et packages : création, modification, période de validité, statut actif / inactif.",
    planned: [
      "CRUD offre : titre, description, visuel, prix barré / promo",
      "Dates de début / fin + statut actif",
      "Mise en avant sur l’accueil (option)",
    ],
  },
  activities: {
    title: "Activités",
    description:
      "Activités et expériences proposées aux clients, alignées sur la page « Activités » du site.",
    planned: [
      "CRUD activité : titre, texte, image, ordre d’affichage",
      "Lien externe ou fiche détaillée",
    ],
  },
  menu: {
    title: "Carte restaurant",
    description:
      "Menu par catégories : entrées, plats, desserts, boissons — avec prix et disponibilité.",
    planned: [
      "CRUD catégories et plats (nom, description, prix)",
      "Indicateur disponible / épuisé / saisonnier",
      "Ordre des catégories et des plats",
    ],
  },
  blog: {
    title: "Blog / actualités",
    description:
      "Articles d’actualités liés à la page blog et aux pages article (blog-single).",
    planned: [
      "CRUD article : titre, extrait, contenu, image de couverture",
      "Statut brouillon / publié, date de publication",
      "Slug URL pour le site vitrine",
    ],
  },
  gallery: {
    title: "Galerie",
    description:
      "Photos du site : upload, légende optionnelle, ordre d’affichage, visibilité.",
    planned: [
      "Upload (stockage serveur ou S3 selon infra)",
      "Glisser-déposer pour l’ordre",
      "Statut visible / masqué",
    ],
  },
  contact: {
    title: "Contact",
    description:
      "Coordonnées et informations pratiques affichées sur la page contact.",
    planned: [
      "Téléphones, email, adresse postale",
      "Horaires (blocs par jour ou plages)",
      "Carte (URL embed ou coordonnées)",
      "Liens réseaux sociaux",
    ],
  },
  seo: {
    title: "SEO",
    description:
      "Référencement global du site et surcharge par page (titres meta, descriptions, Open Graph).",
    planned: [
      "SEO global : titre du site, meta description par défaut, image OG",
      "SEO par page vitrine (clé = page HTML)",
      "Aperçu snippet Google simplifié",
    ],
  },
  settings: {
    title: "Paramètres globaux",
    description:
      "Réglages transverses : nom du site, langue par défaut, liens utiles, codes analytics, maintenance.",
    planned: [
      "Identité du site (nom court, baseline)",
      "Scripts tiers (analytics, pixel) si autorisés",
      "Mode maintenance bannière (option)",
    ],
  },
} satisfies Record<string, ContentModulePageProps>

export function renderContentModule(id: keyof typeof modules) {
  const props = modules[id]
  return <ContentModulePage {...props} />
}
