import type { ReactNode } from 'react';
import { NoticeProvider, PrototypeNotice } from '@app/features/prototype-notice';
import { ServicesProvider } from '@app/services';
import type { Services } from '@app/services';

/** Everything that wraps the router: the data services and the early-prototype notice. */
export function AppProviders({ services, children }: { services: Services; children: ReactNode }) {
  return (
    <ServicesProvider services={services}>
      <NoticeProvider>
        {children}
        <PrototypeNotice />
      </NoticeProvider>
    </ServicesProvider>
  );
}
