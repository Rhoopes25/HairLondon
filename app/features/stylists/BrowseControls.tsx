import { useId, useState } from 'react';
import {
  activeFilterCount,
  DISTANCE_LIMITS,
  PRICE_LIMITS,
  SORT_LABELS,
} from '@src/domain/stylists/browse';
import type { BrowseOptions, SortKey } from '@src/domain/stylists/browse';
import { SPECIALTY_AREAS, SPECIALTY_LABELS } from '@src/domain/models/specialty';
import { Chip, ChipRow, Icon, TextButton } from '@app/ui';
import { cx } from '@app/lib/cx';
import styles from './BrowseControls.module.css';

export interface BrowseControlsProps {
  /** What the link says. Sorting and filtering live in the URL, so a refresh and the back button keep them. */
  browse: BrowseOptions;
  /** The order the list is actually in: what the link says, or the default when it says nothing. */
  sort: SortKey;
  /** She has typed a search, so "Best match" is a real choice. */
  searching: boolean;
  onChange: (next: BrowseOptions) => void;
}

/**
 * Sort by nearest or price, and narrow by price, distance, and specialty. It folds away on a phone
 * so the list stays the first thing she sees, and says how many filters are on when it is closed.
 * Each group is a row of toggle chips (a real button each); tapping the one that is on turns it off.
 */
export function BrowseControls({ browse, sort, searching, onChange }: BrowseControlsProps) {
  const panelId = useId();
  const active = activeFilterCount(browse);
  // Open from the start when a link already narrows the list, so she can see why it is short.
  const [open, setOpen] = useState(() => active > 0 || browse.sort !== undefined);

  const sorts: SortKey[] = searching ? ['best', 'nearest', 'price'] : ['nearest', 'price'];

  return (
    <div className={styles.controls}>
      <button
        type="button"
        className={cx(styles.toggle, open && styles.toggleOpen)}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((now) => !now)}
      >
        <span>Sort and filter{active > 0 ? ` (${active})` : ''}</span>
        <Icon name="chevron-down" className={styles.chevron} />
      </button>

      <div id={panelId} className={styles.panel} hidden={!open}>
        <div className={styles.group}>
          <p className={styles.groupLabel}>Sort by</p>
          <ChipRow label="Sort by" wrap>
            {sorts.map((key) => (
              <Chip
                key={key}
                selected={sort === key}
                onClick={() => onChange({ ...browse, sort: key })}
              >
                {SORT_LABELS[key]}
              </Chip>
            ))}
          </ChipRow>
        </div>

        <div className={styles.group}>
          <p className={styles.groupLabel}>Starting price</p>
          <ChipRow label="Starting price" wrap>
            <Chip
              selected={browse.maxPrice === undefined}
              onClick={() => onChange({ ...browse, maxPrice: undefined })}
            >
              Any price
            </Chip>
            {PRICE_LIMITS.map((limit) => (
              <Chip
                key={limit}
                selected={browse.maxPrice === limit}
                onClick={() =>
                  onChange({ ...browse, maxPrice: browse.maxPrice === limit ? undefined : limit })
                }
              >
                Up to ${limit}
              </Chip>
            ))}
          </ChipRow>
        </div>

        <div className={styles.group}>
          <p className={styles.groupLabel}>Distance</p>
          <ChipRow label="Distance" wrap>
            <Chip
              selected={browse.maxMiles === undefined}
              onClick={() => onChange({ ...browse, maxMiles: undefined })}
            >
              Any distance
            </Chip>
            {DISTANCE_LIMITS.map((limit) => (
              <Chip
                key={limit}
                selected={browse.maxMiles === limit}
                onClick={() =>
                  onChange({ ...browse, maxMiles: browse.maxMiles === limit ? undefined : limit })
                }
              >
                Within {limit} mi
              </Chip>
            ))}
          </ChipRow>
        </div>

        <div className={styles.group}>
          <p className={styles.groupLabel}>Specialty</p>
          <ChipRow label="Specialty" wrap>
            <Chip
              selected={browse.area === undefined}
              onClick={() => onChange({ ...browse, area: undefined })}
            >
              Any specialty
            </Chip>
            {SPECIALTY_AREAS.map((area) => (
              <Chip
                key={area}
                selected={browse.area === area}
                onClick={() =>
                  onChange({ ...browse, area: browse.area === area ? undefined : area })
                }
              >
                {SPECIALTY_LABELS[area]}
              </Chip>
            ))}
          </ChipRow>
        </div>

        {active > 0 ? (
          <TextButton
            onClick={() =>
              onChange({
                sort: browse.sort,
                maxPrice: undefined,
                maxMiles: undefined,
                area: undefined,
              })
            }
          >
            Clear filters ({active})
          </TextButton>
        ) : null}
      </div>
    </div>
  );
}
