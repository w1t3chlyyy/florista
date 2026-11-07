import { useEffect, useRef, useState } from 'react';
import Shop, { useCart, type Page } from './Shop';
import { useRoute } from './useRoute';

declare global {
  interface Window {
    webpackChunk_N_E: any[];
    __req: any;
    __GE: { et: () => any; Y: () => any };
  }
}

function Home({ open }: { open: (p: Page) => void }) {
  const goBtnRef = useRef<HTMLButtonElement>(null);
  const valleyRef = useRef<any>(null);
  const audioRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [introShown, setIntroShown] = useState(false);

  useEffect(() => {
    let unmounted = false;
    let cleanup: (() => void) | undefined;

    const init = () => {
      try {
        if (!window.webpackChunk_N_E) return;
        window.webpackChunk_N_E.push([[90001], {}, (r: any) => { window.__req = r; }]);
        if (typeof window.__req !== 'function') return;
        window.__req(889);
        if (!window.__GE?.et) return;

        const Valley = window.__GE.et();
        audioRef.current = window.__GE.Y();
        const el = document.getElementById('valley');
        if (!el) return;

        const valley = new Valley(
          el,
          () => { if (!unmounted) setIsLoaded(true); },
          () => { if (!unmounted) setIntroShown(true); }
        );
        valleyRef.current = valley;

        try { audioRef.current()?.initAudio?.(); } catch (e) { console.warn(e); }

        const go = goBtnRef.current;
        if (go) {
          const on = () => valley.startHoverTransition?.();
          const off = () => valley.stopHoverTransition?.();
          go.addEventListener('pointerenter', on);
          go.addEventListener('pointerleave', off);
          cleanup = () => { go.removeEventListener('pointerenter', on); go.removeEventListener('pointerleave', off); };
        }
      } catch (err) {
        console.error('Valley init failed:', err);
      }
    };

    const t = setTimeout(init, 50);
    return () => {
      unmounted = true;
      clearTimeout(t);
      cleanup?.();
      try { valleyRef.current?.destroy?.(); } catch (e) { console.warn(e); }
      valleyRef.current = null;
    };
  }, []);

  const link = (p: Page, label: string) => (
    <a href={`#/${p}`}>{label}</a>
  );

  return (
    <>
      <div id="valley" aria-hidden="true"><div className="js-canvas-container" /></div>

      <div className={`ui ${introShown ? 'on' : ''}`} id="ui">
        <header>
          <a className="logo" href="#/" aria-label="FloRista">FloRista</a>
          <nav aria-label="Main">
            {link('catalog', 'Каталог')}
            {link('delivery', 'Доставка')}
            {link('about', 'О студии')}
            {link('contacts', 'Контакты')}
            <button className="pill" onClick={() => open('builder')}>Собрать букет</button>
          </nav>
        </header>

        <section className="hero">
          <h1>Нежность в деталях</h1>
          <p className="cap">
            Для тех, кто выбирает глазами и чувствует сердцем.
            <br />
            Букеты с доставкой по Макеевке.
          </p>
          <button className="go-btn" id="go" ref={goBtnRef} onClick={() => open('catalog')}>
            Выбрать букет
            <svg viewBox="0 0 24 24"><path d="M4 12h16M14 6l6 6-6 6" /></svg>
          </button>
        </section>

        <div className="corner">
          <span>Макеевка</span>
        </div>
      </div>

      <div className={`loader ${isLoaded ? 'gone' : ''}`} id="loader"><span /></div>
    </>
  );
}

export default function App() {
  const [page, setPage] = useRoute();
  const cart = useCart();

  return page
    ? <Shop page={page} setPage={setPage} cart={cart} />
    : <Home open={setPage} />;
}
