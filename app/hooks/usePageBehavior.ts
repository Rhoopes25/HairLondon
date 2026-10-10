import { useEffect, useRef } from 'react';

/** Sets the browser tab title, e.g. "Find a stylist | Local Locks". */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} | Local Locks`;
  }, [title]);
}

/** Moves keyboard and screen-reader focus to the page heading when a step appears. */
export function useFocusOnMount<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return ref;
}
