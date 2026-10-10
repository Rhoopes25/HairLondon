import { formatDuration } from '@src/domain/format/duration';
import type { ServiceId } from '@src/domain/models/service';
import type { Stylist } from '@src/domain/models/stylist';
import { useServices } from '@app/services';
import { LinkButton, Sheet } from '@app/ui';
import styles from './ServiceDetailSheet.module.css';

/** One service in more detail: what it is, how long it takes, what it costs, and a way to book it. */
export function ServiceDetailSheet({
  stylist,
  serviceId,
  onClose,
}: {
  stylist: Stylist;
  /** Null while closed. */
  serviceId: ServiceId | null;
  onClose: () => void;
}) {
  const { catalog } = useServices();
  const service = serviceId ? catalog[serviceId] : null;
  const price = serviceId ? stylist.prices[serviceId] : undefined;

  return (
    <Sheet
      open={service !== null}
      onClose={onClose}
      title={service?.name ?? ''}
      footer={
        service ? (
          <LinkButton to={`/book/${stylist.id}?service=${service.id}`} fullWidth>
            Book {service.name}
          </LinkButton>
        ) : null
      }
    >
      {service ? (
        <>
          <p>{service.description}</p>
          <dl className={styles.facts}>
            <div>
              <dt>Time</dt>
              <dd>{formatDuration(service.durationMin)}</dd>
            </div>
            <div>
              <dt>Price with {stylist.name}</dt>
              <dd>{price === undefined ? '—' : `$${price}`}</dd>
            </div>
          </dl>
        </>
      ) : null}
    </Sheet>
  );
}
