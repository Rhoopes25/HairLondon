import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Services } from './create-services';

const ServicesContext = createContext<Services | null>(null);

/** Provider: hands the repositories, clock, and catalog to the tree. Tests pass in fakes. */
export function ServicesProvider({
  services,
  children,
}: {
  services: Services;
  children: ReactNode;
}) {
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

export function useServices(): Services {
  const services = useContext(ServicesContext);
  if (!services) throw new Error('useServices must be used inside <ServicesProvider>');
  return services;
}
