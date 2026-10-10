import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useServices } from '@app/services';

interface NoticeContextValue {
  isOpen: boolean;
  /** Re-open the notice (from the strip or the footer). */
  open: () => void;
  close: () => void;
}

const NoticeContext = createContext<NoticeContextValue | null>(null);

/**
 * Owns whether the early-prototype notice is showing. It opens by itself the first time
 * someone visits, and once it has been closed it stays closed until they ask for it again.
 */
export function NoticeProvider({ children }: { children: ReactNode }) {
  const { preferences } = useServices();
  const [isOpen, setOpen] = useState(() => !preferences.getSnapshot().noticeDismissed);

  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => {
    setOpen(false);
    preferences.dismissNotice();
  }, [preferences]);

  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);
  return <NoticeContext.Provider value={value}>{children}</NoticeContext.Provider>;
}

export function useNotice(): NoticeContextValue {
  const context = useContext(NoticeContext);
  if (!context) throw new Error('useNotice must be used inside <NoticeProvider>');
  return context;
}
