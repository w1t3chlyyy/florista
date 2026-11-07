import { useEffect, useMemo, useState, type ReactNode } from 'react';
import './shop.css';
import { BOUQUETS, BUILDER, CONTACTS, DELIVERY, DISTRICTS, POSTCARDS, type Bouquet } from './data';

export type Page = 'catalog' | 'builder' | 'delivery' | 'about' | 'contacts' | 'cart';
interface CartItem { id: string; title: string; price: number; img?: string; qty: number; note?: string }
type Toast = (m: string) => void;

const money = (n: number) => `${n.toLocaleString('ru-RU')} ₽`;
const chip = (on: boolean) => `fl-chip${on ? ' on' : ''}`;
const HEAD: Record<string, [string, string, string?]> = {
  catalog: ['Коллекция', 'Готовые букеты', 'Собираем в день заказа из свежих поставок. Доставка по Макеевке от 60 минут.'],
  builder: ['Индивидуально', 'Свой букет', 'Выберите параметры — флорист соберёт и пришлёт фото до отправки.'],
  delivery: ['Макеевка', 'Доставка и контакты', 'Работаем по всему городу.'],
  cart: ['Оформление', 'Корзина']
};

const Svg = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const I = {
  bag: <Svg><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8a3 3 0 016 0" /></Svg>,
  x: <Svg><path d="M6 6l12 12M18 6L6 18" /></Svg>,
  grid: <Svg><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></Svg>,
  flower: <Svg><circle cx="12" cy="9" r="3" /><path d="M12 6c0-2 1-3 2-3s2 1 1 3M12 6c0-2-1-3-2-3S8 4 9 6M15 9c2 0 3 1 3 2s-1 2-3 1M9 9c-2 0-3 1-3 2s1 2 3 1M12 12v9M12 17c2 0 4-1 5-3" /></Svg>,
  pin: <Svg><path d="M12 21s-6-5.5-6-11a6 6 0 0112 0c0 5.5-6 11-6 11z" /><circle cx="12" cy="10" r="2" /></Svg>
};

function Img({ src, alt }: { src?: string; alt: string }) {
  const [bad, setBad] = useState(!src);
  return bad ? <div className="fl-ph">🌸</div> : <img className="fl-img" src={src} alt={alt} loading="lazy" onError={() => setBad(true)} />;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => { try { return JSON.parse(localStorage.getItem('fl-cart') || '[]'); } catch { return []; } });
  useEffect(() => { try { localStorage.setItem('fl-cart', JSON.stringify(items)); } catch {} }, [items]);
  const add = (i: Omit<CartItem, 'qty'>) => setItems((p) => (p.some((x) => x.id === i.id) ? p.map((x) => (x.id === i.id ? { ...x, qty: x.qty + 1 } : x)) : [...p, { ...i, qty: 1 }]));
  const setQty = (id: string, d: number) => setItems((p) => p.map((x) => (x.id === id ? { ...x, qty: x.qty + d } : x)).filter((x) => x.qty > 0));
  return { items, add, setQty, clear: () => setItems([]), count: items.reduce((s, i) => s + i.qty, 0), sum: items.reduce((s, i) => s + i.qty * i.price, 0) };
}
type Cart = ReturnType<typeof useCart>;

function Catalog({ cart, toast, go }: { cart: Cart; toast: Toast; go: (p: Page) => void }) {
  const [f, setF] = useState<'all' | Bouquet['category']>('all');
  const [sort, setSort] = useState('pop');
  const [fav, setFav] = useState<string[]>([]);
  const list = useMemo(() => {
    const l = BOUQUETS.filter((b) => f === 'all' || b.category === f);
    return sort === 'asc' ? [...l].sort((a, b) => a.price - b.price) : sort === 'desc' ? [...l].sort((a, b) => b.price - a.price) : l;
  }, [f, sort]);
  const n = BOUQUETS[0];
  const put = (b: Bouquet) => { cart.add({ id: b.id, title: b.title, price: b.price, img: b.img }); toast(`«${b.title}» в корзине`); };
  return (
    <>
      <section className="fl-new">
        <div className="fl-new-img"><Img src={n.img} alt={n.title} /></div>
        <div className="fl-new-body">
          <span className="fl-badge">Новинка</span>
          <h2>{n.title}</h2>
          <p className="fl-lead">{n.description}</p>
          <p className="fl-mu">Состав: {n.composition.join(', ')}</p>
          <div className="fl-new-foot"><span className="fl-price big">{money(n.price)}</span><button className="fl-btn" onClick={() => put(n)}>В корзину</button></div>
        </div>
      </section>

      <div className="fl-tools">
        <div className="fl-opts">
          {([['all', 'Все'], ['author', 'Авторские'], ['mono', 'Монобукеты'], ['box', 'В коробках'], ['wedding', 'Свадебные']] as const).map(([k, l]) => (
            <button key={k} className={chip(f === k)} onClick={() => setF(k)}>{l}</button>
          ))}
        </div>
        <select className="fl-in" aria-label="Сортировка" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="pop">Сначала популярные</option><option value="asc">Сначала дешевле</option><option value="desc">Сначала дороже</option>
        </select>
      </div>
      <p className="fl-mu fl-count">Показано букетов: {list.length}</p>

      <div className="fl-grid">
        {list.map((b) => (
          <article key={b.id}>
            <div className="fl-photo">
              <Img src={b.img} alt={b.title} />
              <span className="fl-badge">{b.tag}</span>
              <button className="fl-fav" aria-label="В избранное" onClick={() => setFav((x) => (x.includes(b.id) ? x.filter((y) => y !== b.id) : [...x, b.id]))}>{fav.includes(b.id) ? '♥' : '♡'}</button>
            </div>
            <div className="fl-cardtxt">
              <h3 className="fl-h3">{b.title}</h3>
              <p>{b.composition.join(', ')}</p>
              <div className="fl-cardfoot">
                <span className="fl-price">{money(b.price)}</span>
                <button className="fl-add" aria-label={`Добавить «${b.title}» в корзину`} onClick={() => put(b)}>+</button>
              </div>
            </div>
          </article>
        ))}
        <div className="fl-promo">
          <div><h2 className="fl-h2" style={{ marginBottom: 8 }}>Нет подходящего?</h2><p className="fl-mu">Соберите букет сами: размер, палитра, цветы. Флорист пришлёт фото до отправки.</p></div>
          <button className="fl-btn" onClick={() => go('builder')}>В конструктор</button>
        </div>
      </div>

      <div className="fl-perks">
        {[['Фото до отправки', 'Покажем готовый букет в мессенджере'], ['Открытка от руки', 'Напишем ваши слова каллиграфией'], ['Доставка по Макеевке', `От 60 минут, бесплатно от ${money(DELIVERY.free)}`]].map(([t, d]) => (
          <div key={t}><h3 className="fl-h3">{t}</h3><p className="fl-mu">{d}</p></div>
        ))}
      </div>
    </>
  );
}

const Group = ({ t, children }: { t: string; children: ReactNode }) => <div className="fl-group"><div className="fl-lab">{t}</div>{children}</div>;

function Builder({ cart, toast, go }: { cart: Cart; toast: Toast; go: (p: Page) => void }) {
  const [size, setSize] = useState('m');
  const [occ, setOcc] = useState(BUILDER.occasions[0]);
  const [pal, setPal] = useState(BUILDER.palettes[0]);
  const [fl, setFl] = useState<string[]>(['Пионовидные розы']);
  const [pack, setPack] = useState('paper');
  const [wish, setWish] = useState('');
  const s = BUILDER.sizes.find((x) => x.id === size)!;
  const p = BUILDER.packs.find((x) => x.id === pack)!;
  const price = s.price + p.price + Math.max(0, fl.length - 2) * 300;
  const toggle = (x: string) => setFl((a) => (a.includes(x) ? (a.length > 1 ? a.filter((y) => y !== x) : a) : [...a, x]));
  return (
    <div className="fl-layout">
      <div>
        <Group t="01 · Размер"><div className="fl-opts three">{BUILDER.sizes.map((x) => <button key={x.id} className={chip(size === x.id)} onClick={() => setSize(x.id)}>{x.label}<small>{x.stems} · от {money(x.price)}</small></button>)}</div></Group>
        <Group t="02 · Повод"><div className="fl-opts">{BUILDER.occasions.map((x) => <button key={x} className={chip(occ === x)} onClick={() => setOcc(x)}>{x}</button>)}</div></Group>
        <Group t="03 · Палитра"><div className="fl-opts">{BUILDER.palettes.map((x) => <button key={x} className={chip(pal === x)} onClick={() => setPal(x)}>{x}</button>)}</div></Group>
        <Group t="04 · Цветы"><div className="fl-opts">{BUILDER.flowers.map((x) => <button key={x} className={chip(fl.includes(x))} onClick={() => toggle(x)}>{fl.includes(x) ? '✓ ' : ''}{x}</button>)}</div><p className="fl-mu" style={{ marginTop: 8 }}>Два вида входят в цену, каждый следующий +300 ₽.</p></Group>
        <Group t="05 · Упаковка"><div className="fl-opts">{BUILDER.packs.map((x) => <button key={x.id} className={chip(pack === x.id)} onClick={() => setPack(x.id)}>{x.label}{x.price ? ` · +${money(x.price)}` : ''}</button>)}</div></Group>
        <Group t="06 · Пожелания"><textarea rows={3} className="fl-in" value={wish} onChange={(e) => setWish(e.target.value)} placeholder="Что любит получатель, чего избегать…" /></Group>
      </div>
      <aside className="fl-card fl-aside fl-stack">
        <div className="fl-lab">Ваш букет</div>
        <p className="fl-mu" style={{ fontSize: 15 }}>{s.label} · {occ}<br />{pal}<br />{fl.join(', ')}<br />{p.label}</p>
        <div className="fl-hr" />
        <div className="fl-sp"><span className="fl-mu">Итого</span><span className="fl-price big">{money(price)}</span></div>
        <button className="fl-btn full" onClick={() => {
          cart.add({ id: `custom-${Date.now()}`, title: `Свой букет · ${s.label}`, price, note: `${occ}; ${pal}; ${fl.join(', ')}; ${p.label}${wish ? `; ${wish}` : ''}` });
          toast('Букет добавлен в корзину'); go('cart');
        }}>В корзину</button>
        <p className="fl-mu" style={{ fontSize: 12 }}>Цена может уточниться по наличию цветов.</p>
      </aside>
    </div>
  );
}

function CartPage({ cart, go }: { cart: Cart; go: (p: Page) => void }) {
  const [step, setStep] = useState<'cart' | 'form' | 'done'>('cart');
  const [d, setD] = useState({ name: '', phone: '', district: DISTRICTS[0], address: '', date: '', time: '', pickup: false, card: 'cotton', text: '', pay: 'card' });
  const [order, setOrder] = useState<{ n: string; total: number } | null>(null);
  const set = (k: string, v: any) => setD((x) => ({ ...x, [k]: v }));
  const pc = POSTCARDS.find((x) => x.id === d.card)!;
  const delivery = d.pickup || cart.sum >= DELIVERY.free ? 0 : DELIVERY.fee;
  const total = cart.sum + delivery + pc.price;

  if (step === 'done' && order) return (
    <div className="fl-done">
      <h2 className="fl-h2" style={{ marginBottom: 0 }}>Заказ №{order.n} принят</h2>
      <p className="fl-lead">Спасибо, {d.name}! Мы позвоним на {d.phone} для подтверждения и пришлём фото букета до отправки. Сумма: {money(order.total)}.</p>
      <button className="fl-btn" onClick={() => { setStep('cart'); go('catalog'); }}>В каталог</button>
    </div>
  );
  if (!cart.items.length) return (
    <div className="fl-done"><p className="fl-lead">В корзине пока пусто.</p><button className="fl-btn" onClick={() => go('catalog')}>Выбрать букет</button></div>
  );
  return (
    <div className="fl-layout">
      {step === 'cart' ? (
        <div className="fl-card fl-stack" style={{ gap: 20 }}>
          {cart.items.map((i, k) => (
            <div key={i.id}>
              {k > 0 && <div className="fl-hr" style={{ marginBottom: 20 }} />}
              <div className="fl-item">
                <div className="th"><Img src={i.img} alt={i.title} /></div>
                <div className="info"><div className="fl-h3">{i.title}</div>{i.note && <p className="fl-mu">{i.note}</p>}<button className="fl-del" onClick={() => cart.setQty(i.id, -i.qty)}>Удалить</button></div>
                <div className="ctl">
                  <div className="fl-qty"><button onClick={() => cart.setQty(i.id, -1)} aria-label="Меньше">−</button><span>{i.qty}</span><button onClick={() => cart.setQty(i.id, 1)} aria-label="Больше">+</button></div>
                  <span className="fl-price">{money(i.price * i.qty)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <form id="checkout" onSubmit={(e) => {
          e.preventDefault();
          const n = String(Date.now()).slice(-6);
          try { localStorage.setItem('fl-last-order', JSON.stringify({ n, d, items: cart.items, total })); } catch {}
          setOrder({ n, total }); cart.clear(); setStep('done'); // TODO: реальная оплата и отправка заказа
        }}>
          <button type="button" className="fl-back" onClick={() => setStep('cart')}>← К корзине</button>
          <div className="fl-sec">
            <h2 className="fl-h2">Получатель и доставка</h2>
            <div className="fl-fields">
              <input required className="fl-in" placeholder="Ваше имя" autoComplete="name" value={d.name} onChange={(e) => set('name', e.target.value)} />
              <input required type="tel" className="fl-in" placeholder="Телефон" autoComplete="tel" value={d.phone} onChange={(e) => set('phone', e.target.value)} />
              {!d.pickup && <select className="fl-in" aria-label="Район" value={d.district} onChange={(e) => set('district', e.target.value)}>{DISTRICTS.map((x) => <option key={x} value={x}>{x} район</option>)}</select>}
              {!d.pickup && <input required className="fl-in" placeholder="Улица, дом, квартира" autoComplete="street-address" value={d.address} onChange={(e) => set('address', e.target.value)} />}
              <input required type="date" className="fl-in" aria-label="Дата" value={d.date} onChange={(e) => set('date', e.target.value)} />
              <input required className="fl-in" placeholder="Время, напр. 16:00–18:00" value={d.time} onChange={(e) => set('time', e.target.value)} />
            </div>
            <label className="fl-check"><input type="checkbox" checked={d.pickup} onChange={(e) => set('pickup', e.target.checked)} /> Самовывоз из мастерской</label>
          </div>
          <div className="fl-sec">
            <h2 className="fl-h2">Открытка</h2>
            <div className="fl-pcs">{POSTCARDS.map((c) => (
              <button type="button" key={c.id} className={chip(d.card === c.id)} onClick={() => set('card', c.id)}>
                <div className="th">{c.img ? <Img src={c.img} alt={c.name} /> : <div className="fl-ph" style={{ fontSize: 16 }}>—</div>}</div>
                {c.name}<small>{c.price ? money(c.price) : 'бесплатно'}</small>
              </button>))}</div>
            {d.card !== 'none' && <textarea rows={3} maxLength={300} className="fl-in" style={{ marginTop: 12 }} placeholder="Текст открытки (до 300 символов)" value={d.text} onChange={(e) => set('text', e.target.value)} />}
          </div>
          <div className="fl-sec">
            <h2 className="fl-h2">Оплата</h2>
            <div className="fl-opts">{[['card', 'Картой онлайн'], ['cash', 'Наличными курьеру'], ['transfer', 'Переводом']].map(([k, l]) => <button type="button" key={k} className={chip(d.pay === k)} onClick={() => set('pay', k)}>{l}</button>)}</div>
            {d.pay === 'card' && <p className="fl-note">Онлайн-оплата пока заглушка: деньги не списываются. Платёжный шлюз подключим позже.</p>}
          </div>
        </form>
      )}
      <aside className="fl-card fl-aside fl-stack">
        <div className="fl-lab">Итого</div>
        <div className="fl-sp fl-mu"><span>Товары</span><span>{money(cart.sum)}</span></div>
        <div className="fl-sp fl-mu"><span>Открытка</span><span>{pc.price ? money(pc.price) : 'бесплатно'}</span></div>
        <div className="fl-sp fl-mu"><span>Доставка</span><span>{d.pickup ? 'самовывоз' : delivery ? money(delivery) : 'бесплатно'}</span></div>
        {!d.pickup && cart.sum < DELIVERY.free && <p className="fl-mu" style={{ fontSize: 12 }}>Ещё {money(DELIVERY.free - cart.sum)} до бесплатной доставки</p>}
        <div className="fl-hr" />
        <div className="fl-sp"><span className="fl-h3">К оплате</span><span className="fl-price big">{money(total)}</span></div>
        {step === 'cart' ? <button className="fl-btn full" onClick={() => setStep('form')}>Оформить заказ</button>
          : <button className="fl-btn full" type="submit" form="checkout">{d.pay === 'card' ? 'Оплатить' : 'Подтвердить заказ'}</button>}
      </aside>
    </div>
  );
}

function Info() {
  const [sent, setSent] = useState(false);
  const Card = ({ t, children }: { t: string; children: ReactNode }) => <div className="fl-card"><h2 className="fl-h2">{t}</h2>{children}</div>;
  return (
    <div className="fl-info">
      <Card t="Доставка"><ul><li>Вся Макеевка: {DISTRICTS.join(', ')}</li><li>Экспресс 60–90 минут</li><li>{money(DELIVERY.fee)}, от {money(DELIVERY.free)} — бесплатно</li><li>Анонимно и сюрпризом</li><li>Самовывоз — бесплатно</li></ul></Card>
      <Card t="Уход за букетом"><ul><li>Подрежьте стебли на 1,5–2 см под углом 45°</li><li>Добавьте подкормку в прохладную воду</li><li>Меняйте воду и срез каждые 1–2 дня</li><li>Берегите от батарей, сквозняков и солнца</li></ul></Card>
      <Card t="Контакты">
        <div className="fl-stack" style={{ gap: 16 }}>
          {[['Телефон', CONTACTS.phone], ['Адрес', CONTACTS.address], ['Время работы', CONTACTS.hours]].map(([k, v]) => <div key={k}><div className="fl-lab">{k}</div><div>{v}</div></div>)}
          <div className="fl-opts"><a className="fl-btn" href={CONTACTS.telegram} target="_blank" rel="noreferrer">Telegram</a><a className="fl-ghost" href={CONTACTS.instagram} target="_blank" rel="noreferrer">Instagram</a></div>
        </div>
      </Card>
      <Card t="Напишите нам">
        {sent ? <p className="fl-lead">Спасибо! Мы свяжемся с вами в ближайшее время.</p> : (
          <form className="fl-stack" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <input required className="fl-in" placeholder="Имя" /><input required type="tel" className="fl-in" placeholder="Телефон" />
            <textarea required rows={3} className="fl-in" placeholder="Ваш вопрос" /><button className="fl-btn full">Отправить</button>
          </form>)}
      </Card>
    </div>
  );
}

export default function Shop({ page, setPage, cart }: { page: Page | null; setPage: (p: Page | null) => void; cart: Cart }) {
  const [msg, setMsg] = useState('');
  const toast: Toast = (m) => { setMsg(m); setTimeout(() => setMsg(''), 2200); };
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setPage(null);
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [setPage]);
  useEffect(() => { document.querySelector('.fl')?.scrollTo({ top: 0 }); }, [page]);
  if (!page) return null;
  const tab = page === 'about' || page === 'contacts' ? 'delivery' : page;
  const [eyebrow, title, lead] = HEAD[tab];
  const nav: [Page, string, ReactNode][] = [['catalog', 'Каталог', I.grid], ['builder', 'Конструктор', I.flower], ['delivery', 'Контакты', I.pin], ['cart', 'Корзина', I.bag]];
  const badge = cart.count > 0 && <span className="fl-cnt">{cart.count}</span>;
  return (
    <div className="fl">
      <header className="fl-top"><div className="fl-wrap fl-top-in">
        <button className="fl-logo" onClick={() => setPage(null)} aria-label="На главную">FloRista</button>
        <nav className="fl-tabs" aria-label="Разделы">{nav.slice(0, 3).map(([k, l]) => <button key={k} className={`fl-tab${tab === k ? ' on' : ''}`} onClick={() => setPage(k)}>{k === 'delivery' ? 'Доставка и контакты' : l}</button>)}</nav>
        <button className="fl-ib" onClick={() => setPage('cart')} aria-label="Корзина">{I.bag}{badge}</button>
        <button className="fl-ib" onClick={() => setPage(null)} aria-label="Закрыть">{I.x}</button>
      </div></header>
      <main className="fl-wrap fl-main">
        <div className="fl-head"><div className="fl-lab">{eyebrow}</div><h1 className="fl-h1">{title}</h1>{lead && <p className="fl-lead" style={{ marginTop: 16 }}>{lead}</p>}</div>
        {tab === 'catalog' && <Catalog cart={cart} toast={toast} go={setPage} />}
        {tab === 'builder' && <Builder cart={cart} toast={toast} go={setPage} />}
        {tab === 'cart' && <CartPage cart={cart} go={setPage} />}
        {tab === 'delivery' && <Info />}
      </main>
      <nav className="fl-nav" aria-label="Разделы">{nav.map(([k, l, ic]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setPage(k)}>{ic}{l}{k === 'cart' && badge}</button>)}</nav>
      {msg && <div className="fl-toast" role="status">{msg}</div>}
    </div>
  );
}
