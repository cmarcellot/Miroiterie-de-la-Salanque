/* eslint-disable @next/next/no-img-element -- photos des auteurs servies par Google, affichées telles quelles */
import { Star } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import ReviewText from "@/components/home/ReviewText";
import { ArrowRight } from "@/components/icons";
import { getGoogleReviews, type GoogleReview } from "@/lib/google-reviews";

/**
 * Avis Google (Places API). Règles d'attribution appliquées :
 * https://developers.google.com/maps/documentation/places/web-service/policies
 * - mention "Google Maps" dans le même bloc (Roboto/sans-serif, 400, 12-16px, #5E5E5E) ;
 * - auteur : photo, nom et lien vers son profil ;
 * - date de visite (obligatoire pour les lieux en France) ;
 * - lien vers chaque avis sur Google Maps ;
 * - mention de l'ordre des avis (pertinence, sans filtre).
 * Pas de JSON-LD AggregateRating/Review : interdit pour ses propres avis.
 */
export default async function GoogleReviews() {
  const data = await getGoogleReviews();
  if (!data) return null;

  const rating = data.rating.toLocaleString("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <section className="py-16 sm:py-20">
      <div className="container-mds">
        <SectionHeading>Avis de nos clients</SectionHeading>

        <div className="mt-8 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold text-navy">{rating}</span>
            <Stars value={data.rating} className="h-6 w-6" />
          </div>
          <a
            href={data.reviewsUri}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-600 hover:text-royal hover:underline"
          >
            {data.count.toLocaleString("fr-FR")} avis sur Google
          </a>
        </div>

        <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data.reviews.map((r, i) => (
            <li key={i}>
              <ReviewCard review={r} />
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col items-center gap-2 text-center">
          <p className="text-xs text-slate-500">
            Les avis les plus pertinents selon Google, affichés sans filtre ni
            modification.
          </p>
          <GoogleMapsAttribution />
        </div>

        <div className="mt-8 flex justify-center">
          <a
            href={data.reviewsUri}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
          >
            Voir tous les avis sur Google <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ review: r }: { review: GoogleReview }) {
  const author = r.authorUri ? (
    <a
      href={r.authorUri}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-royal hover:underline"
    >
      {r.author}
    </a>
  ) : (
    r.author
  );

  const visit = r.visitDate
    ? new Date(r.visitDate.year, r.visitDate.month - 1).toLocaleDateString(
        "fr-FR",
        { month: "long", year: "numeric" },
      )
    : null;

  return (
    <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex items-center gap-3">
        {r.authorPhotoUri ? (
          <img
            src={r.authorPhotoUri}
            alt=""
            width={40}
            height={40}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-10 w-10 shrink-0 rounded-full bg-slate-100 object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-royal font-semibold text-white"
          >
            {r.author.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold text-navy">{author}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Stars value={r.rating} className="h-3.5 w-3.5" />
            <span>{r.relativeTime}</span>
          </div>
        </div>
      </header>

      {r.text && <ReviewText text={r.text} />}

      <footer className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-1 pt-4 text-xs text-slate-500">
        {visit && <span>Visite : {visit}</span>}
        {r.uri && (
          <a
            href={r.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-royal hover:underline"
          >
            Voir l&apos;avis sur Google Maps
          </a>
        )}
      </footer>
    </article>
  );
}

/** Étoiles pleines, avec la dernière remplie partiellement (ex. 4,6). */
function Stars({ value, className }: { value: number; className: string }) {
  return (
    <span
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`${value.toLocaleString("fr-FR")} sur 5`}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className={`relative ${className}`}>
            <Star className={`absolute inset-0 text-slate-300 ${className}`} fill="currentColor" strokeWidth={0} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={`text-amber-400 ${className}`} fill="currentColor" strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** Mention "Google Maps" exigée quand les données sont affichées sans carte Google. */
function GoogleMapsAttribution() {
  return (
    <span
      translate="no"
      className="text-[12px]"
      style={{ fontFamily: "Roboto, sans-serif", fontWeight: 400, color: "#5E5E5E" }}
    >
      Google Maps
    </span>
  );
}
