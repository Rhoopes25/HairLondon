import { formatExperience } from '@src/domain/format/experience';
import { averageRating } from '@src/domain/format/rating';
import type { Stylist } from '@src/domain/models/stylist';
import { assetUrl, photoSrcSet } from '@app/config';
import type { CardPhoto, StylistPreview } from '@app/ui';

/** The "who" half of a StylistCard, the same on every list she appears in. */
export function stylistCardIdentity(stylist: Stylist) {
  return {
    name: stylist.name,
    photoUrl: stylist.photo ? assetUrl(stylist.photo) : null,
    photoSrcSet: stylist.photo ? photoSrcSet(stylist.photo) : undefined,
    studio: stylist.studio,
    city: stylist.city,
    average: averageRating(stylist.reviews),
    reviewCount: stylist.reviews.length,
  };
}

/** Her first photos, for the thumbnails on a card. */
export function workThumbnails(stylist: Stylist): CardPhoto[] {
  return stylist.portfolio.slice(0, 3).map((photo) => ({
    src: assetUrl(photo.src),
    srcSet: photoSrcSet(photo.src),
  }));
}

/**
 * What "Quick look" opens. Her photos and rating are already on the card, so it adds only what the
 * card does not say: how long she has been at it, and what she is known for.
 */
export function stylistPreview(stylist: Stylist, profileTo: string): StylistPreview {
  return {
    experience: formatExperience(stylist.yearsDoingHair),
    specialties: stylist.specialties,
    profileTo,
  };
}
