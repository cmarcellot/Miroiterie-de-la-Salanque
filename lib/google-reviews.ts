/**
 * Avis Google de l'entreprise, via Places API (New) — Place Details.
 * Doc : https://developers.google.com/maps/documentation/places/web-service/place-details
 *
 * Appel côté serveur uniquement (la clé ne doit jamais partir au navigateur),
 * mis en cache par Next.js et rafraîchi une fois par jour. Toute erreur
 * (variables absentes, API en échec, aucun avis) renvoie null : la section
 * ne s'affiche simplement pas.
 */

/** Durée du cache (secondes) : un appel à l'API par jour au plus. */
export const GOOGLE_REVIEWS_REVALIDATE = 86400;

// Strict nécessaire : note, nombre d'avis, avis, liens vers la fiche.
const FIELD_MASK = "rating,userRatingCount,reviews,googleMapsUri,googleMapsLinks";

export type GoogleReview = {
  author: string;
  authorUri?: string;
  authorPhotoUri?: string;
  rating: number;
  relativeTime: string;
  /** Mois et année de la visite — affichage obligatoire pour les lieux en France. */
  visitDate?: { year: number; month: number };
  text: string;
  /** Lien vers l'avis sur Google Maps. */
  uri?: string;
};

export type GoogleReviewsData = {
  rating: number;
  count: number;
  reviews: GoogleReview[];
  /** Lien vers la liste des avis sur Google Maps. */
  reviewsUri: string;
  /** Lien pour laisser un avis sur la fiche. */
  writeReviewUri?: string;
};

type LocalizedText = { text?: string; languageCode?: string };

type ApiReview = {
  rating?: number;
  relativePublishTimeDescription?: string;
  text?: LocalizedText;
  originalText?: LocalizedText;
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
  googleMapsUri?: string;
  visitDate?: { year?: number; month?: number };
};

type ApiPlace = {
  rating?: number;
  userRatingCount?: number;
  reviews?: ApiReview[];
  googleMapsUri?: string;
  googleMapsLinks?: { reviewsUri?: string; placeUri?: string; writeAReviewUri?: string };
};

export async function getGoogleReviews(): Promise<GoogleReviewsData | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) return null;

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=fr`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": FIELD_MASK,
        },
        // Seules les réponses 200 sont mises en cache par Next.js : une
        // erreur n'est donc pas figée pour la journée.
        next: { revalidate: GOOGLE_REVIEWS_REVALIDATE },
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!res.ok) {
      console.error(
        `[google-reviews] Places API ${res.status} : ${(await res.text()).slice(0, 500)}`,
      );
      return null;
    }

    const place = (await res.json()) as ApiPlace;
    const reviews: GoogleReview[] = (place.reviews ?? [])
      .map((r) => ({
        author: r.authorAttribution?.displayName ?? "",
        authorUri: r.authorAttribution?.uri,
        authorPhotoUri: r.authorAttribution?.photoUri,
        rating: r.rating ?? 0,
        relativeTime: r.relativePublishTimeDescription ?? "",
        visitDate:
          r.visitDate?.year && r.visitDate.month
            ? { year: r.visitDate.year, month: r.visitDate.month }
            : undefined,
        // Texte d'origine, tel que l'auteur l'a écrit (pas de traduction).
        text: (r.originalText?.text ?? r.text?.text ?? "").trim(),
        uri: r.googleMapsUri,
      }))
      .filter((r) => r.author && r.rating > 0);

    const reviewsUri =
      place.googleMapsLinks?.reviewsUri ??
      place.googleMapsLinks?.placeUri ??
      place.googleMapsUri;

    if (!place.rating || !place.userRatingCount || !reviews.length || !reviewsUri) {
      console.error("[google-reviews] Réponse sans note ou sans avis : section masquée.");
      return null;
    }

    return {
      rating: place.rating,
      count: place.userRatingCount,
      reviews,
      reviewsUri,
      writeReviewUri: place.googleMapsLinks?.writeAReviewUri,
    };
  } catch (err) {
    console.error("[google-reviews] Échec de l'appel à Places API :", err);
    return null;
  }
}
