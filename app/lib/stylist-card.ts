import { averageRating } from '@src/domain/format/rating';
import type { Stylist } from '@src/domain/models/stylist';
import { assetUrl, photoSrcSet } from '@app/config';
import type { CardPhoto } from '@app/ui';

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
