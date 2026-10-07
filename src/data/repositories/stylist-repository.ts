import type { ServiceId } from '../../domain/models/service';
import type { Stylist } from '../../domain/models/stylist';
import { offersService } from '../../domain/pricing/totals';

/** Read-only lookup over the stylists the site lists. (Sample data now; an API later.) */
export class StylistRepository {
  constructor(private readonly stylists: readonly Stylist[]) {}

  list(): readonly Stylist[] {
    return this.stylists;
  }

  get(id: string | null | undefined): Stylist | null {
    return this.stylists.find((stylist) => stylist.id === id) ?? null;
  }

  /** Stylists who offer a service. */
  offering(id: ServiceId): Stylist[] {
    return this.stylists.filter((stylist) => offersService(stylist, id));
  }
}
