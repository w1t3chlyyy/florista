import { useEffect, useMemo, useState, type ReactNode } from 'react';
import './shop.css';
import { BOUQUETS, BUILDER, CONTACTS, DELIVERY, DISTRICTS, POSTCARDS, type Bouquet } from './data';

export type Page = 'catalog' | 'builder' | 'delivery' | 'about' | 'contacts' | 'cart';
interface CartItem { id: string; title: string; price: number; img?: string; qty: number; note?: string }

const money = (n: number) => `${n.toLocaleString('ru-RU')} ₽`;
const TABS: [Page, string][] = [['catalog', 'Каталог'], ['builder', 'Конструктор'], ['delivery', 'Доставка и контакты'], ['cart', 'Корзина']];
const HEAD: Record<Page, [string, string]> = {
  catalog: ['Коллекция', 'Готовые букеты'], builder: ['Индивидуально', 'Собрать свой букет'], delivery: ['Макеевка', 'Доставка и контакты'],
  about: ['Макеевка', 'Доставка и контакты'], contacts: ['Макеевка', 'Доставка и контакты'], cart: ['Оформление', 'Корзина']
};
const chip = (on: boolean) => `fl-chip${on ? ' on' : ''}`;

function Img({ src, alt }: { src?: string; alt: string }) {
  const [bad, setBad] = useState(!src);
  return bad ? <div className="fl-ph" style={{ position: 'absolute', inset: 0 }}>🌸</div> : <img className="fl-img" src={src} alt={alt} loading="lazy" onError={() => setBad(true)} />;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => { try { return JSON.parse(localStorage.getItem('fl-cart') || '[]'); } catch { return []; } });
  useEffect(() => { try { localStorage.setItem('fl-cart', JSON.stringify(items)); } catch {} }, [items]);
  const add = (i: Omit<CartItem, 'qty'>) => setItems((p) => (p.some((x) => x.id === i.id) ? p.map((x) => (x.id === i.id ? { ...x, qty: x.qty + 1 } : x)) : [...p, { ...i, qty: 1 }]));
  const setQty = (id: string, d: number) => setItems((p) => p.map((x) => (x.id === id ? { ...x, qty: x.qty + d } : x)).filter((x) => x.qty > 0));
  return { items, add, setQty, clear: () => setItems([]), count: items.reduce((s, i) => s + i.qty, 0), sum: items.reduce((s, i) => s + i.qty * i.price, 0) };
}
type Cart = ReturnType<typeof useCart>;
type Toast = (m: string) => void;

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
        <div className="fl-new-txt">
          <span className="fl-badge">Новинка</span>
          <h2>{n.title}</h2>
          <p className="fl-lead">{n.description}</p>
          <p className="fl-mut">Состав: {n.composition.join(', ')}</p>
          <div className="fl-row" style={{ alignItems: 'center', gap: 24 }}>
            <span className="fl-price big">{money(n.price)}</span>
            <button className="fl-btn" onClick={() => put(n)}>В корзину</button>
          </div>
        </div>
      </section>
      <div className="fl-bar2">
        <div className="fl-row">
          {([['all', 'Все'], ['author', 'Авторские'], ['mono', 'Монобукеты'], ['box', 'В коробках'], ['wedding', 'Свадебные']] as const).map(([k, l]) => (
            <button key={k} className={chip(f === k)} onClick={() => setF(k)}>{l}</button>
          ))}
        </div>
        <select className="fl-sel" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="pop">Сначала популярные</option><option value="asc">Сначала дешевле</option><option value="desc">Сначала дороже</option>
        </select>
      </div>
      <p className="fl-mut" style={{ padding: '24px 0 32px' }}>Показано букетов: {list.length}</p>
      <div className="fl-grid4">
        {list.map((b) => (
          <article key={b.id}>
            <div className="fl-photo">
              <Img src={b.img} alt={b.title} />
              <span className="fl-badge">{b.tag}</span>
              <button className="fl-fav" aria-label="В избранное" onClick={() => setFav((x) => (x.includes(b.id) ? x.filter((y) => y !== b.id) : [...x, b.id]))}>{fav.includes(b.id) ? '♥' : '♡'}</button>
            </div>
            <div className="fl-cardtxt">
              <h3 className="fl-h3">{b.title}</h3>
              <p className="fl-mut">{b.composition.join(', ')}</p>
              <div className="fl-sp" style={{ marginTop: 12, alignItems: 'center' }}>
                <span className="fl-price">{money(b.price)}</span>
                <button className="fl-add" aria-label={`Добавить «${b.title}» в корзину`} onClick={() => put(b)}>+</button>
              </div>
            </div>
          </article>
        ))}
        <div className="fl-promo">
          <div><div className="fl-lab" style={{ marginBottom: 16 }}>Нет подходящего?</div><h2 className="fl-h2" style={{ marginBottom: 16 }}>Соберите свой букет</h2>
            <p className="fl-mut" style={{ fontSize: 16 }}>Выберите размер, палитру и цветы — флорист пришлёт фото до отправки.</p></div>
          <button className="fl-btn" onClick={() => go('builder')}>В конструктор →</button>
        </div>
      </div>
      <div className="fl-perks">
        {[['Фото до отправки', 'Покажем готовый букет в мессенджере'], ['Открытка от руки', 'Напишем ваши слова каллиграфией'], ['Доставка по Макеевке', `От 60 минут, бесплатно от ${money(DELIVERY.free)}`]].map(([t, d]) => (
          <div key={t}><h3 className="fl-h3">{t}</h3><p className="fl-mut" style={{ marginTop: 4 }}>{d}</p></div>
        ))}
      </div>
    </>
  );
}

const Block = ({ t, children }: { t: string; children: ReactNode }) => (
  <div><div className="fl-lab" style={{ marginBottom: 16 }}>{t}</div>{children}</div>
);

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
    <div className="fl-two">
      <div className="fl-stack l">
        <Block t="01 — Размер"><div className="fl-row">{BUILDER.sizes.map((x) => <button key={x.id} className={chip(size === x.id)} onClick={() => setSize(x.id)}>{x.label}<small>{x.stems} · от {money(x.price)}</small></button>)}</div></Block>
        <Block t="02 — Повод"><div className="fl-row">{BUILDER.occasions.map((x) => <button key={x} className={chip(occ === x)} onClick={() => setOcc(x)}>{x}</button>)}</div></Block>
        <Block t="03 — Палитра"><div className="fl-row">{BUILDER.palettes.map((x) => <button key={x} className={chip(pal === x)} onClick={() => setPal(x)}>{x}</button>)}</div></Block>
        <Block t="04 — Цветы (два в базе, каждый следующий +300 ₽)"><div className="fl-row">{BUILDER.flowers.map((x) => <button key={x} className={chip(fl.includes(x))} onClick={() => toggle(x)}>{fl.includes(x) ? '✓ ' : ''}{x}</button>)}</div></Block>
        <Block t="05 — Упаковка"><div className="fl-row">{BUILDER.packs.map((x) => <button key={x.id} className={chip(pack === x.id)} onClick={() => setPack(x.id)}>{x.label}{x.price ? ` +${money(x.price)}` : ''}</button>)}</div></Block>
        <Block t="06 — Пожелания"><textarea rows={3} className="fl-in" value={wish} onChange={(e) => setWish(e.target.value)} placeholder="Что любит получатель, чего избегать…" /></Block>
      </div>
      <aside className="fl-card fl-aside fl-stack" style={{ gap: 16 }}>
        <div className="fl-lab">Ваш букет</div>
        <p className="fl-mut" style={{ fontSize: 16 }}>{s.label} · {occ}<br />{pal}<br />{fl.join(', ')}<br />{p.label}</p>
        <div className="fl-hr" />
        <div className="fl-sp"><span className="fl-mut">Итого</span><span className="fl-price big">{money(price)}</span></div>
        <button className="fl-btn full" onClick={() => {
          cart.add({ id: `custom-${Date.now()}`, title: `Свой букет: ${s.label}`, price, note: `${occ}; ${pal}; ${fl.join(', ')}; ${p.label}${wish ? `; ${wish}` : ''}` });
          toast('Букет добавлен в корзину'); go('cart');
        }}>В корзину</button>
        <p className="fl-mut" style={{ fontSize: 12 }}>Флорист пришлёт фото до отправки. Цена может уточниться по наличию цветов.</p>
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
    <div className="fl-two">
      {step === 'cart' ? (
        <div className="fl-card fl-stack" style={{ gap: 24 }}>
          {cart.items.map((i, k) => (
            <div key={i.id}>
              {k > 0 && <div className="fl-hr" style={{ marginBottom: 24 }} />}
              <div className="fl-item">
                <div className="th"><Img src={i.img} alt={i.title} /></div>
                <div style={{ flex: 1, minWidth: 160 }}><div className="fl-h3">{i.title}</div>{i.note && <p className="fl-mut">{i.note}</p>}
                  <button className="fl-mut" style={{ marginTop: 8, textDecoration: 'underline' }} onClick={() => cart.setQty(i.id, -i.qty)}>Удалить</button></div>
                <div className="fl-qty"><button onClick={() => cart.setQty(i.id, -1)} aria-label="Меньше">−</button><span>{i.qty}</span><button onClick={() => cart.setQty(i.id, 1)} aria-label="Больше">+</button></div>
                <span className="fl-price" style={{ width: 96, textAlign: 'right' }}>{money(i.price * i.qty)}</span>
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
          <button type="button" className="fl-mut" style={{ marginBottom: 32 }} onClick={() => setStep('cart')}>← К корзине</button>
          <div className="fl-sec">
            <h2 className="fl-h2">Получатель и доставка</h2>
            <div className="fl-form2">
              <input required className="fl-in" placeholder="Ваше имя" value={d.name} onChange={(e) => set('name', e.target.value)} />
              <input required type="tel" className="fl-in" placeholder="+7 (949) 000-00-00" value={d.phone} onChange={(e) => set('phone', e.target.value)} />
              {!d.pickup && <select className="fl-in" value={d.district} onChange={(e) => set('district', e.target.value)}>{DISTRICTS.map((x) => <option key={x} value={x}>{x} район</option>)}</select>}
              {!d.pickup && <input required className="fl-in" placeholder="Улица, дом, квартира" value={d.address} onChange={(e) => set('address', e.target.value)} />}
              <input required type="date" className="fl-in" value={d.date} onChange={(e) => set('date', e.target.value)} />
              <input required className="fl-in" placeholder="Время: 16:00–18:00" value={d.time} onChange={(e) => set('time', e.target.value)} />
            </div>
            <label className="fl-mut" style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 16 }}><input type="checkbox" checked={d.pickup} onChange={(e) => set('pickup', e.target.checked)} /> Самовывоз из мастерской</label>
          </div>
          <div className="fl-sec">
            <h2 className="fl-h2">Открытка</h2>
            <div className="fl-cards">{POSTCARDS.map((c) => (
              <button type="button" key={c.id} className={chip(d.card === c.id)} onClick={() => set('card', c.id)}>
                <div className="th" style={{ position: 'relative' }}>{c.img ? <Img src={c.img} alt={c.name} /> : <div className="fl-ph" style={{ position: 'absolute', inset: 0, fontSize: 16 }}>—</div>}</div>
                {c.name}<small>{c.price ? money(c.price) : 'бесплатно'}</small>
              </button>))}</div>
            {d.card !== 'none' && <textarea rows={3} maxLength={300} className="fl-in" style={{ marginTop: 12 }} placeholder="Текст открытки (до 300 символов)" value={d.text} onChange={(e) => set('text', e.target.value)} />}
          </div>
          <div className="fl-sec">
            <h2 className="fl-h2">Оплата</h2>
            <div className="fl-row">{[['card', 'Картой онлайн'], ['cash', 'Наличными курьеру'], ['transfer', 'Переводом']].map(([k, l]) => <button type="button" key={k} className={chip(d.pay === k)} onClick={() => set('pay', k)}>{l}</button>)}</div>
            {d.pay === 'card' && <p className="fl-note">Онлайн-оплата пока заглушка: деньги не списываются. Платёжный шлюз подключим позже.</p>}
          </div>
        </form>
      )}
      <aside className="fl-card fl-aside fl-stack">
        <div className="fl-lab">Итого</div>
        <div className="fl-sp fl-mut"><span>Товары</span><span>{money(cart.sum)}</span></div>
        <div className="fl-sp fl-mut"><span>Открытка</span><span>{pc.price ? money(pc.price) : 'бесплатно'}</span></div>
        <div className="fl-sp fl-mut"><span>Доставка</span><span>{d.pickup ? 'самовывоз' : delivery ? money(delivery) : 'бесплатно'}</span></div>
        {!d.pickup && cart.sum < DELIVERY.free && <p className="fl-mut" style={{ fontSize: 12 }}>Ещё {money(DELIVERY.free - cart.sum)} до бесплатной доставки</p>}
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
      <Card t="Доставка"><ul><li>Работаем по всей Макеевке: {DISTRICTS.join(', ')}</li><li>Экспресс 60–90 минут</li><li>{money(DELIVERY.fee)}, от {money(DELIVERY.free)} — бесплатно</li><li>Анонимно и сюрпризом</li><li>Самовывоз — бесплатно</li></ul></Card>
      <Card t="Уход за букетом"><ol><li>Подрежьте стебли на 1,5–2 см под углом 45°</li><li>Добавьте подкормку в прохладную воду</li><li>Меняйте воду и срез каждые 1–2 дня</li><li>Берегите от батарей, сквозняков и солнца</li></ol></Card>
      <Card t="Контакты">
        <div className="fl-stack">{[['Телефон', CONTACTS.phone], ['Адрес', CONTACTS.address], ['Время работы', CONTACTS.hours]].map(([k, v]) => <div key={k}><div className="fl-lab">{k}</div><div>{v}</div></div>)}
          <div className="fl-row" style={{ marginTop: 8 }}><a className="fl-btn" href={CONTACTS.telegram} target="_blank" rel="noreferrer">Telegram</a><a className="fl-ghost" href={CONTACTS.instagram} target="_blank" rel="noreferrer">Instagram</a></div></div>
      </Card>
      <Card t="Напишите нам">
        {sent ? <p className="fl-lead">Спасибо! Мы свяжемся с вами в ближайшее время.</p> : (
          <form className="fl-stack" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <input required className="fl-in" placeholder="Имя" /><input required className="fl-in" placeholder="Телефон" />
            <textarea required rows={3} className="fl-in" placeholder="Ваш вопрос" /><button className="fl-btn" style={{ alignSelf: 'flex-start' }}>Отправить</button>
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
  if (!page) return null;
  const tab = page === 'about' || page === 'contacts' ? 'delivery' : page;
  const [eyebrow, title] = HEAD[page];
  return (
    <div className="fl">
      <div className="fl-bar"><div className="fl-bar-in">
        <button className="fl-logo" onClick={() => setPage(null)} aria-label="На главную">FloRista</button>
        <nav className="fl-tabs">{TABS.map(([k, l]) => <button key={k} className={`fl-tab${tab === k ? ' on' : ''}`} onClick={() => setPage(k)}>{l}{k === 'cart' && cart.count > 0 ? ` · ${cart.count}` : ''}</button>)}</nav>
        <button className="fl-x" onClick={() => setPage(null)} aria-label="Закрыть">✕</button>
      </div></div>
      <main className="fl-main">
        <div className="fl-head"><div className="fl-lab">{eyebrow}</div><h1 className="fl-h1">{title}</h1></div>
        {tab === 'catalog' && <Catalog cart={cart} toast={toast} go={setPage} />}
        {tab === 'builder' && <Builder cart={cart} toast={toast} go={setPage} />}
        {tab === 'cart' && <CartPage cart={cart} go={setPage} />}
        {tab === 'delivery' && <Info />}
      </main>
      {msg && <div className="fl-toast">{msg}</div>}
    </div>
  );
}
