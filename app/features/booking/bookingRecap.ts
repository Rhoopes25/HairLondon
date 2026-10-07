import { formatDay } from '@src/domain/format/date';
import { formatRange } from '@src/domain/format/time';
import type { CompleteDraft } from '@src/domain/booking/draft';
import type { ServiceCatalog } from '@src/domain/models/service';
import type { Stylist } from '@src/domain/models/stylist';
import { addDuration } from '@src/domain/models/time';
import { totalDuration, totalPrice } from '@src/domain/pricing/totals';
import type { RecapRow } from '@app/ui';

/** The rows shown on the details and review steps. */
export function draftRecapRows(
  draft: CompleteDraft,
  stylist: Stylist,
  catalog: ServiceCatalog,
  extra: readonly RecapRow[] = [],
): RecapRow[] {
  const length = totalDuration(catalog, draft.serviceIds);
  return [
    { label: 'Stylist', value: `${stylist.name}, ${stylist.studio}` },
    { label: 'Services', value: draft.serviceIds.map((id) => catalog[id].name).join(' + ') },
    {
      label: 'When',
      value: `${formatDay(draft.date)}, ${formatRange(draft.start, addDuration(draft.start, length))}`,
    },
    { label: 'Total', value: `$${totalPrice(stylist, draft.serviceIds)}` },
    ...extra,
  ];
}
