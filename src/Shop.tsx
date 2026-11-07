import { useEffect, useMemo, useState } from 'react';
import { BOUQUETS, BUILDER, CONTACTS, DELIVERY, DISTRICTS, POSTCARDS, type Bouquet } from './data';

export type Page = 'catalog' | 'builder' | 'delivery' | 'about' | 'contacts' | 'cart';
interface CartItem { id: string; title: string; price: number; img?: string; qty: number; note?: string }

const money = (n: number) => `${n.toLocaleString('ru-RU')} ₽`;
const TABS: [Page, string][] = [['catalog', 'Каталог'], ['builder', 'Конструктор'], ['delivery', 'Доставка и уход'], ['about', 'О студии'], ['contacts', 'Контакты'], ['cart', 'Корзина']];
const field = 'w-full min-h-12 bg-[#171612] border border-[#3d3b33] rounded-xl px-4 py-3 text-sm text-[#f5efe2] placeholder:text-[#8f8a7c] focus:outline-none focus:border-[#f5efe2]';
const btn = 'inline-flex items-center justify-center gap-3 h-12 px-6 rounded-full bg-[#f5efe2] text-[#151510] text-[13px] font-semibold uppercase tracking-[0.08em] hover:bg-white transition-colors disabled:opacity-40';
const ghost = 'inline-flex items-center justify-center h-12 px-6 rounded-full border border-[#5a574c] text-[13px] font-semibold uppercase tracking-[0.08em] hover:border-[#f5efe2] transition-colors';
const chip = (on: boolean) => `min-h-11 px-4 py-2.5 rounded-xl text-sm text-left border transition-all ${on ? 'border-[#f5efe2] bg-[#26241d] text-white' : 'border-[#3d3b33] text-[#d9d3c4] hover:border-[#8f8a7c]'}`;
const H2 = 'text-[32px] leading-[1.1] uppercase mb-6';
const LAB = 'text-xs uppercase tracking-[0.18em] font-semibold text-[#b8b2a3]';
const ANT = { fontFamily: 'Antonio, sans-serif', fontWeight: 400 } as const;
const PRICE = 'font-semibold tabular-nums';

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

function Catalog({ cart, toast, go }: { cart: Cart; toast: (m: string) => void; go: (p: Page) => void }) {
  const [f, setF] = useState<'all' | Bouquet['category']>('all');
  const [sort, setSort] = useState<'pop' | 'asc' | 'desc'>('pop');
  const [fav, setFav] = useState<string[]>([]);
  const list = useMemo(() => {
    const l = BOUQUETS.filter((b) => f === 'all' || b.category === f);
    return sort === 'asc' ? [...l].sort((a, b) => a.price - b.price) : sort === 'desc' ? [...l].sort((a, b) => b.price - a.price) : l;
  }, [f, sort]);
  return (
    <>
      <section className="grid md:grid-cols-2 overflow-hidden rounded-[24px] border border-[#2b2a24] bg-[#171612] mb-12">
        <div className="relative min-h-[320px] md:min-h-[440px]">
          <Img src={BOUQUETS[0].img} alt={BOUQUETS[0].title} className="absolute inset-0 w-full h-full" />
        </div>
        <div className="p-8 sm:p-12 flex flex-col justify-center gap-5">
          <span className="self-start rounded-full bg-[#f5efe2] text-[#151510] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em]">Новинка</span>
          <h2 className="text-[44px] sm:text-[56px] leading-none uppercase" style={ANT}>{BOUQUETS[0].title}</h2>
          <p className="text-[#d9d3c4] text-lg max-w-md">{BOUQUETS[0].description}</p>
          <p className="text-sm text-[#b8b2a3]">Состав: {BOUQUETS[0].composition.join(', ')}</p>
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <span className={`text-[28px] ${PRICE}`}>{money(BOUQUETS[0].price)}</span>
            <button className={btn} onClick={() => { const b = BOUQUETS[0]; cart.add({ id: b.id, title: b.title, price: b.price, img: b.img }); toast(`«${b.title}» в корзине`); }}>В корзину</button>
          </div>
        </div>
      </section>
      <div className="flex flex-wrap items-center justify-between gap-4 py-5 border-y border-[#2b2a24]">
        <div className="flex flex-wrap gap-3">
          {([['all', 'Все'], ['author', 'Авторские'], ['mono', 'Монобукеты'], ['box', 'В коробках'], ['wedding', 'Свадебные']] as const).map(([k, l]) => (
            <button key={k} onClick={() => setF(k)} className={chip(f === k)}>{l}</button>
          ))}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="h-11 bg-[#171612] border border-[#3d3b33] rounded-xl px-4 text-sm">
          <option value="pop">Сначала популярные</option><option value="asc">Сначала дешевле</option><option value="desc">Сначала дороже</option>
        </select>
      </div>
      <p className="text-sm text-[#b8b2a3] pt-6 pb-8">Показано букетов: {list.length}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
        {list.map((b) => (
          <article key={b.id}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <Img src={b.img} alt={b.title} className="w-full h-full" />
              <span className="absolute top-3 left-3 bg-[#0f0f0c]/85 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em]">{b.tag}</span>
              <button aria-label="В избранное" onClick={() => setFav((x) => (x.includes(b.id) ? x.filter((y) => y !== b.id) : [...x, b.id]))}
                className="absolute top-2 right-2 w-11 h-11 rounded-full bg-[#0f0f0c]/85 grid place-items-center text-lg">{fav.includes(b.id) ? '♥' : '♡'}</button>
            </div>
            <div className="pt-4 px-1">
              <h3 className="text-lg font-semibold leading-snug">{b.title}</h3>
              <p className="text-sm text-[#b8b2a3] mt-1 min-h-[42px]">{b.composition.join(', ')}</p>
              <div className="flex items-center justify-between mt-3">
                <span className={`text-xl ${PRICE}`}>{money(b.price)}</span>
                <button aria-label={`Добавить «${b.title}» в корзину`} className="w-12 h-12 rounded-full bg-[#f5efe2] text-[#151510] grid place-items-center text-xl hover:bg-white"
                  onClick={() => { cart.add({ id: b.id, title: b.title, price: b.price, img: b.img }); toast(`«${b.title}» в корзине`); }}>+</button>
              </div>
            </div>
          </article>
        ))}
        <div className="rounded-[20px] bg-[#26241d] border border-[#2b2a24] p-8 flex flex-col justify-between aspect-[4/5] self-start">
          <div><div className={LAB + ' mb-4'}>Нет подходящего?</div><h3 className="text-[32px] leading-[1.1] uppercase" style={ANT}>Соберите свой букет</h3>
            <p className="text-[#b8b2a3] mt-4">Выберите размер, палитру и цветы — флорист пришлёт фото до отправки.</p></div>
          <button className={btn} onClick={() => go('builder')}>В конструктор →</button>
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-8 mt-24 py-10 border-y border-[#2b2a24]">
        {[['Фото до отправки', 'Покажем готовый букет в мессенджере'], ['Открытка от руки', 'Напишем ваши слова каллиграфией'], ['Доставка по Макеевке', `От 60 минут, бесплатно от ${money(DELIVERY.free)}`]].map(([t, d]) => (
          <div key={t}><h3 className="text-lg font-semibold">{t}</h3><p className="text-sm text-[#b8b2a3] mt-1">{d}</p></div>
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
    <div><div className="text-xs uppercase tracking-[0.18em] font-semibold text-[#b8b2a3] mb-4">{t}</div>{children}</div>
  );
  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-16">
      <div className="space-y-10">
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
      <aside className="lg:sticky lg:top-4 self-start rounded-[20px] border border-[#2b2a24] bg-[#171612] p-6 space-y-3 text-sm">
        <div className="text-xs uppercase tracking-[0.18em] text-[#b8b2a3]">Ваш букет</div>
        <div>{s.label} · {occ}</div>
        <div className="text-[#f5efe2]/70">{pal}<br />{fl.join(', ')}<br />{p.label}</div>
        <div className="flex items-baseline justify-between pt-4 border-t border-[#2b2a24]"><span className="text-sm text-[#b8b2a3]">Итого</span><span className={`text-[28px] ${PRICE}`}>{money(price)}</span></div>
        <p className="text-xs text-[#b8b2a3]">Флорист пришлёт фото до отправки. Итоговая цена может уточниться по наличию цветов.</p>
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
    <aside className="rounded-[20px] border border-[#2b2a24] bg-[#171612] p-6 space-y-2 text-sm self-start">
      <div className="flex justify-between"><span>Товары</span><span>{money(cart.sum)}</span></div>
      <div className="flex justify-between"><span>Открытка</span><span>{pc.price ? money(pc.price) : 'бесплатно'}</span></div>
      <div className="flex justify-between"><span>Доставка</span><span>{d.pickup ? 'самовывоз' : delivery ? money(delivery) : 'бесплатно'}</span></div>
      {!d.pickup && cart.sum < DELIVERY.free && <div className="text-xs text-[#b8b2a3]">Ещё {money(DELIVERY.free - cart.sum)} до бесплатной доставки</div>}
      <div className="flex items-baseline justify-between pt-4 border-t border-[#2b2a24]"><span className="font-semibold">К оплате</span><span className={`text-[28px] ${PRICE}`}>{money(total)}</span></div>
      {step === 'cart' && <button className={`${btn} w-full mt-2`} onClick={() => setStep('form')}>Оформить заказ</button>}
    </aside>
  );
  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-16">
      {step === 'cart' ? (
        <div className="space-y-3">
          {cart.items.map((i) => (
            <div key={i.id} className="flex gap-4 rounded-xl border border-[#2b2a24] bg-[#171612] p-3">
              <Img src={i.img} alt={i.title} className="w-20 h-24 rounded-lg shrink-0" />
              <div className="flex-1 min-w-0"><div className="font-medium">{i.title}</div>{i.note && <div className="text-xs text-[#b8b2a3] mt-1">{i.note}</div>}
                <div className="mt-2 flex items-center gap-3 text-sm">
                  <button onClick={() => cart.setQty(i.id, -1)} className="w-7 h-7 rounded-full border border-[#f5efe2]/30">−</button>{i.qty}
                  <button onClick={() => cart.setQty(i.id, 1)} className="w-7 h-7 rounded-full border border-[#f5efe2]/30">+</button></div></div>
              <div className="text-right"><div className={PRICE}>{money(i.price * i.qty)}</div><button onClick={() => cart.setQty(i.id, -i.qty)} className="text-xs text-[#b8b2a3] mt-2 hover:text-white">Удалить</button></div>
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
          <button type="button" onClick={() => setStep('cart')} className="text-sm text-[#b8b2a3] hover:text-white">← К корзине</button>
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
            <div className="text-xs uppercase tracking-[0.18em] font-semibold text-[#b8b2a3] mb-4">Открытка</div>
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
            <div className="text-xs uppercase tracking-[0.18em] font-semibold text-[#b8b2a3] mb-4">Оплата</div>
            <div className="flex flex-wrap gap-2">
              {[['card', 'Картой онлайн'], ['cash', 'Наличными курьеру'], ['transfer', 'Переводом']].map(([k, l]) => <button type="button" key={k} onClick={() => set('pay', k)} className={chip(d.pay === k)}>{l}</button>)}
            </div>
            {d.pay === 'card' && <div className="mt-3 rounded-xl border border-dashed border-[#f5efe2]/30 p-4 text-xs text-[#b8b2a3]">Онлайн-оплата пока в режиме заглушки: деньги не списываются. Платёжный шлюз подключим позже.</div>}
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
      <section className="rounded-2xl border border-[#2b2a24] p-6 bg-[#171612] space-y-3">
        <h3 className={H2 + ' text-white'} style={ANT}>Доставка по Макеевке</h3>
        <p>Доставляем по всему городу: {DISTRICTS.map((d) => `${d} район`).join(', ')}.</p>
        <ul className="list-disc list-inside space-y-1"><li>Экспресс 60–90 минут</li><li>{money(DELIVERY.fee)} — доставка, бесплатно от {money(DELIVERY.free)}</li><li>Можно выбрать интервал времени</li><li>Анонимная доставка и сюрприз по телефону получателя</li><li>Самовывоз из мастерской — бесплатно</li></ul>
        <p className="text-xs text-[#b8b2a3]">За пределы города — по договорённости с флористом.</p>
      </section>
      <section className="rounded-2xl border border-[#2b2a24] p-6 bg-[#171612] space-y-3">
        <h3 className={H2 + ' text-white'} style={ANT}>Как ухаживать за букетом</h3>
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
      <div className="grid sm:grid-cols-2 gap-3">{items.map(([i, t, d]) => <div key={t} className="rounded-xl border border-[#2b2a24] bg-[#171612] p-4"><div className="text-2xl">{i}</div><div className="text-white mt-1">{t}</div><div className="text-sm text-[#b8b2a3]">{d}</div></div>)}</div>
    </div>
  );
}

function Contacts() {
  const [sent, setSent] = useState(false);
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-4 text-sm">
        {[['Телефон', CONTACTS.phone], ['Адрес', CONTACTS.address], ['Время работы', CONTACTS.hours]].map(([k, v]) => <div key={k}><div className="text-xs uppercase tracking-[0.18em] text-[#b8b2a3]">{k}</div><div className="text-base mt-0.5">{v}</div></div>)}
        <div className="flex gap-3 pt-2"><a className={btn} href={CONTACTS.telegram} target="_blank" rel="noreferrer">Telegram</a><a className={btn} href={CONTACTS.instagram} target="_blank" rel="noreferrer">Instagram</a></div>
      </div>
      {sent ? <div className="rounded-2xl border border-[#2b2a24] p-8 text-center">Спасибо! Мы свяжемся с вами в ближайшее время 🌸</div> : (
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
  const eyebrows: Record<Page, string> = { catalog: 'Коллекция', builder: 'Индивидуально', delivery: 'Макеевка', about: 'FloRista', contacts: 'Макеевка', cart: 'Оформление' };
  return (
    <div className="fixed inset-0 z-50 bg-[#0c0c09]/97 backdrop-blur-xl overflow-y-auto text-[#f5efe2]" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <div className="sticky top-0 z-10 bg-[#0c0c09]/90 backdrop-blur border-b border-[#f5efe2]/10">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-10 h-20 flex items-center gap-4">
          <button onClick={() => setPage(null)} className="text-xl font-medium" aria-label="На главную">FloRista</button>
          <div className="flex-1 flex gap-1 overflow-x-auto text-sm">
            {TABS.map(([k, l]) => (
              <button key={k} onClick={() => setPage(k)} className={`px-4 h-10 rounded-full whitespace-nowrap ${page === k ? 'bg-[#f5efe2] text-[#151510]' : 'text-[#f5efe2]/70 hover:text-white'}`}>
                {l}{k === 'cart' && cart.count > 0 ? ` (${cart.count})` : ''}
              </button>
            ))}
          </div>
          <button onClick={() => setPage(null)} className="w-9 h-9 rounded-full border border-[#f5efe2]/30" aria-label="Закрыть">✕</button>
        </div>
      </div>
      <main className="max-w-[1200px] mx-auto px-5 sm:px-10 pt-12 pb-24">
        <div className="py-8 sm:py-12"><div className={LAB + ' mb-4'}>{eyebrows[page]}</div><h1 className="text-[44px] sm:text-[72px] leading-none uppercase" style={ANT}>{titles[page]}</h1></div>
        {page === 'catalog' && <Catalog cart={cart} toast={toast} go={setPage} />}
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
