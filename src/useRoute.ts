import { useCallback, useEffect, useState } from 'react';
import type { Page } from './Shop';

const PAGES: Page[] = ['catalog', 'builder', 'delivery', 'about', 'contacts', 'cart'];

const parse = (): Page | null => {
  const h = window.location.hash.replace(/^#\/?/, '');
  return (PAGES as string[]).includes(h) ? (h as Page) : null;
};

export function useRoute() {
  const [page, setPageState] = useState<Page | null>(parse);

  useEffect(() => {
    const onChange = () => setPageState(parse());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const setPage = useCallback((p: Page | null) => {
    window.location.hash = p ? `/${p}` : '/';
  }, []);

  return [page, setPage] as const;
}
