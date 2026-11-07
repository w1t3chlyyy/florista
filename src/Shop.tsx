import { useEffect, useMemo, useState } from 'react';
import { BOUQUETS, BUILDER, CONTACTS, DELIVERY, DISTRICTS, POSTCARDS, type Bouquet } from './data';

export type Page = 'catalog' | 'builder' | 'delivery' | 'about' | 'contacts' | 'cart';
interface CartItem { id: string; title: string; price: number; img?: string; qty: number; note?: string }

const money = (n: number) => `${n.toLocaleString('ru-RU')} ₽`;
const TABS: [Page, string][] = [['catalog', 'Каталог'], ['builder', 'Конструктор'], ['delivery', 'Доставка и уход'], ['about', 'О студии'], ['contacts', 'Контакты'], ['cart', 'Корзина']];
const field = 'w-full bg-[#181814] border border-[#f5efe2]/20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#f5efe2]';
const btn = 'px-6 py-3 rounded-full bg-[#f5efe2] text-[#151510] text-xs font-semibold uppercase tracking-wider hover:bg-white transition-colors disabled:opacity-40';
const chip = (on: boolean) => `px-3 py-2 rounded-lg text-sm border text-left transition-all ${on ? 'border-[#f5efe2] bg-[#f5efe2]/15 text-white' : 'border-[#f5efe2]/20 text-[#f5efe2]/70 hover:border-[#f5efe2]/50'}`;

function Img({ src, alt, className = '' }: { src?: string; alt: string; className?: string }) {
  const [bad, setBad] = useState(!src);
  return bad ? (
    <div className={`${className} bg-gradient-to-br from-[#3a2a30] to-[#1a1a16] grid place-items-center text-3xl`}>🌸</div>
  ) : (
    <img src={src} alt={alt} loading="lazy" onError={() => setBad(true)} className={`${className} object-cover`} />
  );
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('fl-cart') || '[]'); } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem('fl-cart', JSON.stringify(items)); } catch {} }, [items]);
  const add = (i: Omit<CartItem, 'qty'>) =>
    setItems((p) => (p.some((x) => x.id === i.id) ? p.map((x) => (x.id === i.id ? { ...x, qty: x.qty + 1 } : x)) : [...p, { ...i, qty: 1 }]));
  const setQty = (id: string, d: number) =>
    setItems((p) => p.map((x) => (x.id === id ? { ...x, qty: x.qty + d } : x)).filter((x) => x.qty > 0));
  const clear = () => setItems([]);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const sum = items.reduce((s, i) => s + i.qty * i.price, 0);
  return { items, add, setQty, clear, count, sum };
}
type Cart = ReturnType<typeof useCart>;

function Catalog({ cart, toast }: { cart: Cart; toast: (m: string) => void }) {
  const [f, setF] = useState<'all' | Bouquet['category']>('all');
  const [sort, setSort] = useState<'pop' | 'asc' | 'desc'>('pop');
  const list = useMemo(() => {
    const l = BOUQUETS.filter((b) => f === 'all' || b.category === f);
    return sort === 'asc' ? [...l].sort((a, b) => a.price - b.price) : sort === 'desc' ? [...l].sort((a, b) => b.price - a.price) : l;
  }, [f, sort]);
  return (
    <>
      <div className="flex flex-wrap gap-2 items-center mb-6">
        {([['all', 'Все'], ['author', 'Авторские'], ['mono', 'Монобукеты'], ['box', 'В коробках'], ['wedding', 'Свадебные']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setF(k)} className={`px-4 py-1.5 rounded-full border text-sm ${f === k ? 'bg-[#f5efe2] text-[#151510] border-[#f5efe2]' : 'border-[#f5efe2]/25 text-[#f5efe2]/75'}`}>{l}</button>
        ))}
        <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="ml-auto bg-[#181814] border border-[#f5efe2]/25 rounded-full px-3 py-1.5 text-sm">
          <option value="pop">По популярности</option><option value="asc">Сначала дешевле</option><option value="desc">Сначала дороже</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {list.map((b) => (
          <article key={b.id} className="group rounded-2xl overflow-hidden border border-[#f5efe2]/15 bg-[#14140f] flex flex-col">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Img src={b.img} alt={b.title} className="w-full h-full group-hover:scale-105 transition-transform duration-700" />
              <span className="absolute top-3 left-3 text-[11px] uppercase tracking-wider bg-black/60 backdrop-blur px-2.5 py-1 rounded-full">{b.tag}</span>
            </div>
            <div className="p-4 flex flex-col gap-2 flex-1">
              <h3 className="text-lg" style={{ fontFamily: 'Antonio, sans-serif' }}>{b.title}</h3>
              <p className="text-sm text-[#f5efe2]/65">{b.description}</p>
              <p className="text-xs text-[#f5efe2]/45">Состав: {b.composition.join(' · ')}</p>
              <div className="mt-auto pt-3 flex items-center justify-between">
                <span className="text-lg font-medium">{money(b.price)}</span>
                <button className={btn} onClick={() => { cart.add({ id: b.id, title: b.title, price: b.price, img: b.img }); toast(`«${b.title}» в корзине`); }}>В корзину</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function Builder({ cart, toast, go }: { cart: Cart; toast: (m: string) => void; go: (p: Page) => void }) {
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
  const Block = ({ t, children }: { t: string; children: React.ReactNode }) => (
    <div><div className="text-xs uppercase tracking-[0.18em] text-[#f5efe2]/55 mb-2">{t}</div>{children}</div>
  );
  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-8">
      <div className="space-y-6">
        <Block t="Размер">
          <div className="grid sm:grid-cols-3 gap-2">
            {BUILDER.sizes.map((x) => <button key={x.id} onClick={() => setSize(x.id)} className={chip(size === x.id)}><b>{x.label}</b><br /><span className="text-xs opacity-60">{x.stems} · от {money(x.price)}</span></button>)}
          </div>
        </Block>
        <Block t="Повод"><div className="flex flex-wrap gap-2">{BUILDER.occasions.map((x) => <button key={x} onClick={() => setOcc(x)} className={chip(occ === x)}>{x}</button>)}</div></Block>
        <Block t="Палитра"><div className="flex flex-wrap gap-2">{BUILDER.palettes.map((x) => <button key={x} onClick={() => setPal(x)} className={chip(pal === x)}>{x}</button>)}</div></Block>
        <Block t="Цветы (до 2 — в базе, каждый следующий +300 ₽)"><div className="flex flex-wrap gap-2">{BUILDER.flowers.map((x) => <button key={x} onClick={() => toggle(x)} className={chip(fl.includes(x))}>{fl.includes(x) ? '✓ ' : '+ '}{x}</button>)}</div></Block>
        <Block t="Упаковка"><div className="flex flex-wrap gap-2">{BUILDER.packs.map((x) => <button key={x.id} onClick={() => setPack(x.id)} className={chip(pack === x.id)}>{x.label}{x.price ? ` +${money(x.price)}` : ''}</button>)}</div></Block>
        <Block t="Пожелания флористу"><textarea rows={3} value={wish} onChange={(e) => setWish(e.target.value)} placeholder="Любимые цветы получателя, аллергии, что точно не нужно…" className={field} /></Block>
      </div>
      <aside className="lg:sticky lg:top-4 self-start rounded-2xl border border-[#f5efe2]/20 bg-[#14140f] p-5 space-y-3 text-sm">
        <div className="text-xs uppercase tracking-[0.18em] text-[#f5efe2]/55">Ваш букет</div>
        <div>{s.label} · {occ}</div>
        <div className="text-[#f5efe2]/70">{pal}<br />{fl.join(', ')}<br />{p.label}</div>
        <div className="text-2xl pt-2 border-t border-[#f5efe2]/15">{money(price)}</div>
        <p className="text-xs text-[#f5efe2]/50">Флорист пришлёт фото до отправки. Итоговая цена может уточниться по наличию цветов.</p>
        <button className={`${btn} w-full`} onClick={() => {
          cart.add({ id: `custom-${Date.now()}`, title: `Свой букет: ${s.label}`, price, note: `${occ}; ${pal}; ${fl.join(', ')}; ${p.label}${wish ? `; ${wish}` : ''}` });
          toast('Букет добавлен в корзину'); go('cart');
        }}>В корзину</button>
      </aside>
    </div>
  );
}

function CartPage({ cart, go }: { cart: Cart; go: (p: Page) => void }) {
  const [step, setStep] = useState<'cart' | 'form' | 'done'>('cart');
  const [d, setD] = useState({ name: '', phone: '', district: DISTRICTS[0], address: '', date: '', time: '', pickup: false, surprise: false, card: 'cotton', text: '', pay: 'card' });
  const [order, setOrder] = useState<{ n: string; total: number } | null>(null);
  const set = (k: string, v: any) => setD((x) => ({ ...x, [k]: v }));
  const pc = POSTCARDS.find((x) => x.id === d.card)!;
  const delivery = d.pickup || cart.sum >= DELIVERY.free ? 0 : DELIVERY.fee;
  const total = cart.sum + delivery + pc.price;

  if (step === 'done' && order) return (
    <div className="max-w-md mx-auto text-center py-16 space-y-4">
      <div className="text-5xl">🌸</div>
      <h3 className="text-2xl" style={{ fontFamily: 'Antonio, sans-serif' }}>Заказ №{order.n} принят</h3>
      <p className="text-[#f5efe2]/75 text-sm">Спасибо, {d.name}! Мы позвоним на {d.phone} для подтверждения и пришлём фото букета до отправки. Сумма: {money(order.total)}.</p>
      <button className={btn} onClick={() => { setStep('cart'); go('catalog'); }}>Вернуться в каталог</button>
    </div>
  );
  if (!cart.items.length) return (
    <div className="text-center py-20 space-y-4"><div className="text-5xl">🛒</div><p className="text-[#f5efe2]/70">В корзине пока пусто</p>
      <button className={btn} onClick={() => go('catalog')}>Выбрать букет</button></div>
  );
  const Summary = (
    <aside className="rounded-2xl border border-[#f5efe2]/20 bg-[#14140f] p-5 space-y-2 text-sm self-start">
      <div className="flex justify-between"><span>Товары</span><span>{money(cart.sum)}</span></div>
      <div className="flex justify-between"><span>Открытка</span><span>{pc.price ? money(pc.price) : 'бесплатно'}</span></div>
      <div className="flex justify-between"><span>Доставка</span><span>{d.pickup ? 'самовывоз' : delivery ? money(delivery) : 'бесплатно'}</span></div>
      {!d.pickup && cart.sum < DELIVERY.free && <div className="text-xs text-[#f5efe2]/50">Ещё {money(DELIVERY.free - cart.sum)} до бесплатной доставки</div>}
      <div className="flex justify-between text-lg pt-2 border-t border-[#f5efe2]/15"><span>Итого</span><span>{money(total)}</span></div>
      {step === 'cart' && <button className={`${btn} w-full mt-2`} onClick={() => setStep('form')}>Оформить заказ</button>}
    </aside>
  );
  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-8">
      {step === 'cart' ? (
        <div className="space-y-3">
          {cart.items.map((i) => (
            <div key={i.id} className="flex gap-4 rounded-xl border border-[#f5efe2]/15 bg-[#14140f] p-3">
              <Img src={i.img} alt={i.title} className="w-20 h-24 rounded-lg shrink-0" />
              <div className="flex-1 min-w-0"><div className="font-medium">{i.title}</div>{i.note && <div className="text-xs text-[#f5efe2]/50 mt-1">{i.note}</div>}
                <div className="mt-2 flex items-center gap-3 text-sm">
                  <button onClick={() => cart.setQty(i.id, -1)} className="w-7 h-7 rounded-full border border-[#f5efe2]/30">−</button>{i.qty}
                  <button onClick={() => cart.setQty(i.id, 1)} className="w-7 h-7 rounded-full border border-[#f5efe2]/30">+</button></div></div>
              <div className="text-right"><div>{money(i.price * i.qty)}</div><button onClick={() => cart.setQty(i.id, -i.qty)} className="text-xs text-[#f5efe2]/45 mt-2 hover:text-white">Удалить</button></div>
            </div>
          ))}
        </div>
      ) : (
        <form className="space-y-5" onSubmit={(e) => {
          e.preventDefault();
          const n = String(Date.now()).slice(-6);
          try { localStorage.setItem('fl-last-order', JSON.stringify({ n, d, items: cart.items, total })); } catch {}
          setOrder({ n, total }); cart.clear(); setStep('done'); // TODO: подключить реальную оплату и отправку заказа
        }}>
          <button type="button" onClick={() => setStep('cart')} className="text-sm text-[#f5efe2]/60 hover:text-white">← К корзине</button>
          <div className="grid sm:grid-cols-2 gap-3">
            <input required className={field} placeholder="Ваше имя" value={d.name} onChange={(e) => set('name', e.target.value)} />
            <input required type="tel" className={field} placeholder="+7 (949) 000-00-00" value={d.phone} onChange={(e) => set('phone', e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={d.pickup} onChange={(e) => set('pickup', e.target.checked)} /> Самовывоз из мастерской</label>
          {!d.pickup && (<>
            <div className="grid sm:grid-cols-2 gap-3">
              <select className={field} value={d.district} onChange={(e) => set('district', e.target.value)}>{DISTRICTS.map((x) => <option key={x}>{x} район</option>)}</select>
              <input required={!d.surprise} className={field} placeholder="Улица, дом, квартира" value={d.address} onChange={(e) => set('address', e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={d.surprise} onChange={(e) => set('surprise', e.target.checked)} /> Сюрприз: уточните адрес у получателя сами (укажите его телефон в адресе)</label>
          </>)}
          <div className="grid sm:grid-cols-2 gap-3">
            <input required type="date" className={field} value={d.date} onChange={(e) => set('date', e.target.value)} />
            <input required className={field} placeholder="Время: напр. 16:00–18:00" value={d.time} onChange={(e) => set('time', e.target.value)} />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-[#f5efe2]/55 mb-2">Открытка</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {POSTCARDS.map((c) => (
                <button type="button" key={c.id} onClick={() => set('card', c.id)} className={`${chip(d.card === c.id)} p-2`}>
                  {c.img ? <Img src={c.img} alt={c.name} className="w-full h-16 rounded mb-1" /> : <div className="h-16 grid place-items-center text-xl opacity-50">—</div>}
                  <div className="text-xs">{c.name}</div><div className="text-[11px] opacity-60">{c.price ? money(c.price) : 'бесплатно'}</div>
                </button>
              ))}
            </div>
            {d.card !== 'none' && <textarea rows={3} maxLength={300} className={`${field} mt-2`} placeholder="Текст открытки (до 300 символов)" value={d.text} onChange={(e) => set('text', e.target.value)} />}
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-[#f5efe2]/55 mb-2">Оплата</div>
            <div className="flex flex-wrap gap-2">
              {[['card', 'Картой онлайн'], ['cash', 'Наличными курьеру'], ['transfer', 'Переводом']].map(([k, l]) => <button type="button" key={k} onClick={() => set('pay', k)} className={chip(d.pay === k)}>{l}</button>)}
            </div>
            {d.pay === 'card' && <div className="mt-3 rounded-xl border border-dashed border-[#f5efe2]/30 p-4 text-xs text-[#f5efe2]/60">Онлайн-оплата пока в режиме заглушки: деньги не списываются. Платёжный шлюз подключим позже.</div>}
          </div>
          <button type="submit" className={`${btn} w-full sm:w-auto`}>{d.pay === 'card' ? `Оплатить ${money(total)}` : 'Подтвердить заказ'}</button>
        </form>
      )}
      {Summary}
    </div>
  );
}

function Delivery() {
  return (
    <div className="grid md:grid-cols-2 gap-6 text-sm text-[#f5efe2]/80 leading-relaxed">
      <section className="rounded-2xl border border-[#f5efe2]/15 p-6 bg-[#14140f] space-y-3">
        <h3 className="text-xl text-white" style={{ fontFamily: 'Antonio, sans-serif' }}>Доставка по Макеевке</h3>
        <p>Доставляем по всему городу: {DISTRICTS.map((d) => `${d} район`).join(', ')}.</p>
        <ul className="list-disc list-inside space-y-1"><li>Экспресс 60–90 минут</li><li>{money(DELIVERY.fee)} — доставка, бесплатно от {money(DELIVERY.free)}</li><li>Можно выбрать интервал времени</li><li>Анонимная доставка и сюрприз по телефону получателя</li><li>Самовывоз из мастерской — бесплатно</li></ul>
        <p className="text-xs text-[#f5efe2]/50">За пределы города — по договорённости с флористом.</p>
      </section>
      <section className="rounded-2xl border border-[#f5efe2]/15 p-6 bg-[#14140f] space-y-3">
        <h3 className="text-xl text-white" style={{ fontFamily: 'Antonio, sans-serif' }}>Как ухаживать за букетом</h3>
        <ol className="list-decimal list-inside space-y-1"><li>Подрежьте стебли на 1,5–2 см под углом 45°.</li><li>Растворите подкормку в прохладной воде.</li><li>Меняйте воду и обновляйте срез каждые 1–2 дня.</li><li>Держите вдали от батарей, сквозняков и прямого солнца.</li></ol>
      </section>
    </div>
  );
}

function About() {
  const items = [['🌿', 'Свежие поставки', 'Цветы приходят регулярно и не лежат на витрине неделями.'], ['✍️', 'Открытка от руки', 'Напишем ваши слова каллиграфией.'], ['📸', 'Фото до отправки', 'Покажем готовый букет в мессенджере.'], ['💧', 'Бережная упаковка', 'Цветы доезжают свежими.']];
  return (
    <div className="max-w-3xl space-y-6 text-[#f5efe2]/80 leading-relaxed">
      <p className="text-lg">FloRista — цветочная мастерская в Макеевке. Мы собираем каждый букет под момент: как признание, комплимент или тёплую поддержку.</p>
      <div className="grid sm:grid-cols-2 gap-3">{items.map(([i, t, d]) => <div key={t} className="rounded-xl border border-[#f5efe2]/15 bg-[#14140f] p-4"><div className="text-2xl">{i}</div><div className="text-white mt-1">{t}</div><div className="text-sm text-[#f5efe2]/60">{d}</div></div>)}</div>
    </div>
  );
}

function Contacts() {
  const [sent, setSent] = useState(false);
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-4 text-sm">
        {[['Телефон', CONTACTS.phone], ['Адрес', CONTACTS.address], ['Время работы', CONTACTS.hours]].map(([k, v]) => <div key={k}><div className="text-xs uppercase tracking-[0.18em] text-[#f5efe2]/55">{k}</div><div className="text-base mt-0.5">{v}</div></div>)}
        <div className="flex gap-3 pt-2"><a className={btn} href={CONTACTS.telegram} target="_blank" rel="noreferrer">Telegram</a><a className={btn} href={CONTACTS.instagram} target="_blank" rel="noreferrer">Instagram</a></div>
      </div>
      {sent ? <div className="rounded-2xl border border-[#f5efe2]/20 p-8 text-center">Спасибо! Мы свяжемся с вами в ближайшее время 🌸</div> : (
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <input required className={field} placeholder="Имя" /><input required className={field} placeholder="Телефон" />
          <textarea required rows={4} className={field} placeholder="Ваш вопрос" /><button className={btn}>Отправить</button>
        </form>
      )}
    </div>
  );
}

export default function Shop({ page, setPage, cart }: { page: Page | null; setPage: (p: Page | null) => void; cart: Cart }) {
  const [msg, setMsg] = useState('');
  const toast = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 2200); };
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setPage(null);
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [setPage]);
  if (!page) return null;
  const titles: Record<Page, string> = { catalog: 'Готовые букеты', builder: 'Собрать свой букет', delivery: 'Доставка и уход', about: 'О студии', contacts: 'Контакты', cart: 'Корзина и оформление' };
  return (
    <div className="fixed inset-0 z-50 bg-[#0c0c09]/97 backdrop-blur-xl overflow-y-auto text-[#f5efe2]" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <div className="sticky top-0 z-10 bg-[#0c0c09]/90 backdrop-blur border-b border-[#f5efe2]/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3 flex items-center gap-4">
          <button onClick={() => setPage(null)} className="text-xl font-medium" aria-label="На главную">FloRista</button>
          <div className="flex-1 flex gap-1 overflow-x-auto text-sm">
            {TABS.map(([k, l]) => (
              <button key={k} onClick={() => setPage(k)} className={`px-3 py-1.5 rounded-full whitespace-nowrap ${page === k ? 'bg-[#f5efe2] text-[#151510]' : 'text-[#f5efe2]/70 hover:text-white'}`}>
                {l}{k === 'cart' && cart.count > 0 ? ` (${cart.count})` : ''}
              </button>
            ))}
          </div>
          <button onClick={() => setPage(null)} className="w-9 h-9 rounded-full border border-[#f5efe2]/30" aria-label="Закрыть">✕</button>
        </div>
      </div>
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <h2 className="text-4xl sm:text-6xl mb-8" style={{ fontFamily: 'Antonio, sans-serif' }}>{titles[page]}</h2>
        {page === 'catalog' && <Catalog cart={cart} toast={toast} />}
        {page === 'builder' && <Builder cart={cart} toast={toast} go={setPage} />}
        {page === 'cart' && <CartPage cart={cart} go={setPage} />}
        {page === 'delivery' && <Delivery />}
        {page === 'about' && <About />}
        {page === 'contacts' && <Contacts />}
      </main>
      {msg && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#f5efe2] text-[#151510] px-5 py-2.5 rounded-full text-sm shadow-xl">{msg}</div>}
    </div>
  );
}
