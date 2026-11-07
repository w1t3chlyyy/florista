import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    webpackChunk_N_E: any[];
    __req: any;
    __GE: {
      et: () => any; // Valley constructor
      Y: () => any;  // audioStore function
    };
  }
}

interface BouquetItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'author' | 'mono' | 'box' | 'wedding';
  price: number;
  composition: string[];
  tag: string;
  description: string;
}

const BOUQUETS: BouquetItem[] = [
  {
    id: 'b1',
    title: 'Розовый рассвет',
    subtitle: 'Воздушная гармония утреннего света',
    category: 'author',
    price: 7400,
    composition: ['Французские пионовидные розы Kahala', 'Матиола', 'Эвкалипт цинерея', 'Оксипеталум'],
    tag: 'Хит сезона',
    description: 'Мягкие пудрово-персиковые оттенки с утонченным ароматом свежего эвкалипта и матиолы.'
  },
  {
    id: 'b2',
    title: 'Ночная нимфа',
    subtitle: 'Глубокий таинственный акцент',
    category: 'author',
    price: 9800,
    composition: ['Гортензии хамелеон', 'Темная скабиоза', 'Сортовые каллы Black Star', 'Антуриум'],
    tag: 'Эксклюзив',
    description: 'Магическая композиция в сумеречно-винных и лавандовых тонах для самых особенных поводов.'
  },
  {
    id: 'b3',
    title: 'Лунная рапсодия',
    subtitle: 'Чистота и белоснежное изящество',
    category: 'author',
    price: 12500,
    composition: ['Белые пионы Duchesse', 'Ранункулюсы клоны', 'Фрезия', 'Ковыль', 'Белая эустома'],
    tag: 'Премиум',
    description: 'Пышный облачный букет из отборных пионов и ранункулюсов в нежнейшем авторском обрамлении.'
  },
  {
    id: 'b4',
    title: 'Шепот лепестков',
    subtitle: 'Французский романтичный шарм',
    category: 'author',
    price: 6400,
    composition: ['Пудровые розы White O’Hara', 'Диантусы Caramel', 'Озотамнус', 'Латирус'],
    tag: 'Бестселлер',
    description: 'Невероятно стойкий и ароматный букет с тонкими нотками ванили и цветущего миндаля.'
  },
  {
    id: 'b5',
    title: 'Эквадорский бархат',
    subtitle: 'Классика чувств в королевском масштабе',
    category: 'mono',
    price: 8900,
    composition: ['25 отборных роз Explorer (70 см)', 'Матовый дизайнерский шелк', 'Атласная лента'],
    tag: 'Монобукет',
    description: 'Бархатные лепестки глубокого гранатового оттенка с раскрытием до 12 см.'
  },
  {
    id: 'b6',
    title: 'Северное сияние',
    subtitle: 'Цветочная магия в шляпной коробке',
    category: 'box',
    price: 11200,
    composition: ['Небесно-голубая гортензия', 'Розы Quicksand', 'Белый озотамнус', 'Бруния'],
    tag: 'В коробке',
    description: 'Стильная круглая коробка с питательным оазисом внутри — не требует вазы и радует до 14 дней.'
  }
];

export default function App() {
  const valleyRef = useRef<HTMLDivElement>(null);
  const goBtnRef = useRef<HTMLButtonElement>(null);
  const soundBtnRef = useRef<HTMLButtonElement>(null);

  const valleyInstanceRef = useRef<any>(null);
  const audioStoreRef = useRef<any>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [introShown, setIntroShown] = useState(false);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  // Modals
  const [activeModal, setActiveModal] = useState<'builder' | 'catalog' | 'about' | 'delivery' | null>(null);

  // Catalog state
  const [catalogFilter, setCatalogFilter] = useState<'all' | 'author' | 'mono' | 'box'>('all');
  const [selectedBouquetForOrder, setSelectedBouquetForOrder] = useState<BouquetItem | null>(null);

  // Bouquet Builder Interactive State
  const [builderStep, setBuilderStep] = useState<number>(1);
  const [occasion, setOccasion] = useState<string>('Для любимой');
  const [palette, setPalette] = useState<string>('Нежная пастель');
  const [selectedFlowers, setSelectedFlowers] = useState<string[]>(['Пионовидные розы', 'Гортензии']);
  const [budgetTier, setBudgetTier] = useState<string>('Классический авторский (~ 8 500 ₽)');
  const [packaging, setPackaging] = useState<string>('Дизайнерская бумага & шелковые ленты');
  const [postcardText, setPostcardText] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<string>('Сегодня, в ближайшее время');
  const [isBuilderSubmitted, setIsBuilderSubmitted] = useState<boolean>(false);

  useEffect(() => {
    let unmounted = false;

    const initValley = () => {
      try {
        if (!window.webpackChunk_N_E) {
          console.warn('webpackChunk_N_E not found yet');
          return;
        }

        // Boot the original flower valley from its own bundle
        window.webpackChunk_N_E.push([
          [90001],
          {},
          function (r: any) {
            window.__req = r;
          }
        ]);

        if (typeof window.__req !== 'function') {
          console.warn('__req is not a function');
          return;
        }

        window.__req(889);

        if (!window.__GE || typeof window.__GE.et !== 'function') {
          console.error('__GE not exposed properly on window');
          return;
        }

        const ValleyClass = window.__GE.et();
        const getAudioStore = window.__GE.Y();
        audioStoreRef.current = getAudioStore;

        const valleyElement = document.getElementById('valley');
        if (!valleyElement) return;

        // Instantiate original valley engine
        const valley = new ValleyClass(
          valleyElement,
          () => {
            if (!unmounted) {
              setIsLoaded(true);
              const loaderEl = document.getElementById('loader');
              if (loaderEl) loaderEl.classList.add('gone');
            }
          },
          () => {
            if (!unmounted) {
              setIntroShown(true);
              const uiEl = document.getElementById('ui');
              if (uiEl) uiEl.classList.add('on');
            }
          }
        );

        valleyInstanceRef.current = valley;

        // Initialize audio store
        try {
          const store = getAudioStore();
          if (store && typeof store.initAudio === 'function') {
            store.initAudio();
          }
        } catch (e) {
          console.warn('Audio store init error:', e);
        }

        // Wire arrow button hover transition
        const goEl = goBtnRef.current || document.getElementById('go');
        if (goEl && valley) {
          const onEnter = () => {
            try {
              valley.startHoverTransition?.();
            } catch (err) {
              console.warn(err);
            }
          };
          const onLeave = () => {
            try {
              valley.stopHoverTransition?.();
            } catch (err) {
              console.warn(err);
            }
          };
          goEl.addEventListener('pointerenter', onEnter);
          goEl.addEventListener('pointerleave', onLeave);

          return () => {
            goEl.removeEventListener('pointerenter', onEnter);
            goEl.removeEventListener('pointerleave', onLeave);
          };
        }
      } catch (err) {
        console.error('Failed to initialize valley engine:', err);
      }
    };

    const timer = setTimeout(initValley, 50);

    return () => {
      unmounted = true;
      clearTimeout(timer);
      try {
        if (valleyInstanceRef.current && typeof valleyInstanceRef.current.destroy === 'function') {
          valleyInstanceRef.current.destroy();
        }
      } catch (e) {
        console.warn(e);
      }
    };
  }, []);

  const handleToggleSound = () => {
    try {
      if (!audioStoreRef.current) return;
      const s = audioStoreRef.current();
      if (!s || !s.isInitialized) {
        if (s && typeof s.initAudio === 'function') {
          s.initAudio();
        }
      }
      if (s && typeof s.toggleMute === 'function') {
        const muted = s.toggleMute();
        setIsPlayingSound(!muted);
        const soundEl = soundBtnRef.current || document.getElementById('sound');
        if (soundEl) {
          soundEl.setAttribute('aria-pressed', String(!muted));
        }
      }
    } catch (err) {
      console.warn('Sound toggle error:', err);
    }
  };

  const openModal = (modal: 'builder' | 'catalog' | 'about' | 'delivery') => {
    setActiveModal(modal);
    if (modal === 'builder') {
      setIsBuilderSubmitted(false);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedBouquetForOrder(null);
  };

  const toggleFlowerSelection = (flower: string) => {
    if (selectedFlowers.includes(flower)) {
      if (selectedFlowers.length > 1) {
        setSelectedFlowers(selectedFlowers.filter((f) => f !== flower));
      }
    } else {
      setSelectedFlowers([...selectedFlowers, flower]);
    }
  };

  const filteredBouquets =
    catalogFilter === 'all'
      ? BOUQUETS
      : BOUQUETS.filter((b) => b.category === catalogFilter);

  return (
    <>
      {/* 3D Valley canvas mount point */}
      <div id="valley" aria-hidden="true" ref={valleyRef}>
        <div className="js-canvas-container"></div>
      </div>

      {/* Main UI Overlay */}
      <div className={`ui ${introShown ? 'on' : ''}`} id="ui">
        <header>
          <a
            className="logo"
            href="#"
            aria-label="FloRista"
            onClick={(e) => {
              e.preventDefault();
              closeModal();
            }}
          >
            FloRista
          </a>
          <nav aria-label="Main">
            <a
              href="#catalog"
              onClick={(e) => {
                e.preventDefault();
                openModal('catalog');
              }}
            >
              Каталог
            </a>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                openModal('about');
              }}
            >
              О студии
            </a>
            <a
              href="#delivery"
              onClick={(e) => {
                e.preventDefault();
                openModal('delivery');
              }}
            >
              Доставка & Уход
            </a>
            <button
              className="pill"
              onClick={() => openModal('builder')}
            >
              Собрать букет
            </button>
          </nav>
        </header>

        <section className="hero">
          <h1>Нежность в деталях</h1>
          <p className="cap">
            Для тех, кто выбирает глазами и чувствует сердцем.
            <br />
            Ваш букет собирается под ваш момент.
          </p>
          <button
            className="go-btn"
            id="go"
            ref={goBtnRef}
            
            onClick={() => openModal('builder')}
          >
            
            <svg viewBox="0 0 24 24">
              <path d="M4 12h16M14 6l6 6-6 6" />
            </svg>
          </button>
        </section>

        
      </div>

      {/* Full-screen Loading Veil */}
      <div className={`loader ${isLoaded ? 'gone' : ''}`} id="loader">
        <span></span>
      </div>

      {/* Interactive FloRista Modals */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md transition-all duration-300"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#10100d]/95 border border-[#f5efe2]/20 rounded-2xl p-5 sm:p-9 text-[#f5efe2] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 w-8 h-8 rounded-full border border-[#f5efe2]/30 flex items-center justify-center text-[#f5efe2]/70 hover:text-[#f5efe2] hover:border-[#f5efe2] transition-colors z-10"
              aria-label="Закрыть окно"
            >
              ✕
            </button>

            {/* 1. BUILDER MODAL: "Собрать букет" */}
            {activeModal === 'builder' && (
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[#f5efe2]/60 font-medium">Индивидуальная флористика</span>
                <h2 className="text-2xl sm:text-3xl font-normal mt-1 mb-2" style={{ fontFamily: 'Antonio, sans-serif' }}>
                  Собрать букет под ваш момент
                </h2>
                <p className="text-xs sm:text-sm text-[#f5efe2]/75 mb-6">
                  Флорист мастерской составит неповторимую композицию по вашим пожеланиям и пришлет фото до отправки.
                </p>

                {isBuilderSubmitted ? (
                  <div className="bg-[#181814] border border-[#f5efe2]/30 rounded-xl p-6 sm:p-8 text-center space-y-4">
                    <div className="text-3xl">🌸</div>
                    <h3 className="text-xl sm:text-2xl font-medium text-[#f5efe2]">Заказ успешно принят!</h3>
                    <p className="text-xs sm:text-sm text-[#f5efe2]/80 leading-relaxed max-w-md mx-auto">
                      Спасибо, <strong>{customerName || 'дорогой гость'}</strong>. Мы уже передали детали старшему флористу.
                      В течение 10 минут свяжемся по номеру <strong>{customerPhone}</strong> для согласования деталей и отправки фото букета.
                    </p>
                    <div className="text-xs text-[#f5efe2]/60 pt-2 border-t border-[#f5efe2]/15">
                      Повод: {occasion} · Гамма: {palette} · Формат: {budgetTier}
                    </div>
                    <button
                      onClick={closeModal}
                      className="mt-4 px-6 py-2.5 rounded-full bg-[#f5efe2] text-[#151510] text-xs font-semibold uppercase tracking-wider hover:bg-white transition-colors"
                    >
                      Вернуться к саду
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Step Tabs */}
                    <div className="flex border-b border-[#f5efe2]/15 mb-6 text-xs overflow-x-auto pb-1 gap-4">
                      {[
                        { step: 1, label: '1. Настроение & Цветы' },
                        { step: 2, label: '2. Формат & Бюджет' },
                        { step: 3, label: '3. Доставка' }
                      ].map((s) => (
                        <button
                          key={s.step}
                          onClick={() => setBuilderStep(s.step)}
                          className={`pb-2 whitespace-nowrap transition-colors ${
                            builderStep === s.step
                              ? 'text-[#f5efe2] border-b-2 border-[#f5efe2] font-semibold'
                              : 'text-[#f5efe2]/50 hover:text-[#f5efe2]/80'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>

                    {/* Step 1: Occasion, Palette, Flowers */}
                    {builderStep === 1 && (
                      <div className="space-y-5">
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-[#f5efe2]/70 mb-2">Для какого повода?</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {[
                              'Для любимой',
                              'День рождения',
                              'Годовщина / Свадьба',
                              'Комплимент / Спасибо',
                              'Интерьерный букет',
                              'Без повода'
                            ].map((item) => (
                              <button
                                key={item}
                                type="button"
                                onClick={() => setOccasion(item)}
                                className={`p-2.5 rounded-lg text-xs text-left border transition-all ${
                                  occasion === item
                                    ? 'border-[#f5efe2] bg-[#f5efe2]/15 text-white font-medium'
                                    : 'border-[#f5efe2]/20 hover:border-[#f5efe2]/40 text-[#f5efe2]/75'
                                }`}
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs uppercase tracking-wider text-[#f5efe2]/70 mb-2">Цветовая палитра</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {[
                              'Нежная пастель',
                              'Пудровый & Розовый',
                              'Белоснежный минимализм',
                              'Глубокий винный / Бордо',
                              'Теплый закатный',
                              'На усмотрение флориста'
                            ].map((item) => (
                              <button
                                key={item}
                                type="button"
                                onClick={() => setPalette(item)}
                                className={`p-2.5 rounded-lg text-xs text-left border transition-all ${
                                  palette === item
                                    ? 'border-[#f5efe2] bg-[#f5efe2]/15 text-white font-medium'
                                    : 'border-[#f5efe2]/20 hover:border-[#f5efe2]/40 text-[#f5efe2]/75'
                                }`}
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs uppercase tracking-wider text-[#f5efe2]/70 mb-2">Любимые акценты (выберите несколько)</label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              'Пионовидные розы',
                              'Гортензии',
                              'Ранункулюсы',
                              'Французские розы',
                              'Эустома',
                              'Диантусы',
                              'Эвкалипт и травы'
                            ].map((fl) => {
                              const active = selectedFlowers.includes(fl);
                              return (
                                <button
                                  key={fl}
                                  type="button"
                                  onClick={() => toggleFlowerSelection(fl)}
                                  className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                                    active
                                      ? 'border-[#f5efe2] bg-[#f5efe2] text-[#151510] font-medium'
                                      : 'border-[#f5efe2]/20 text-[#f5efe2]/70 hover:border-[#f5efe2]/40'
                                  }`}
                                >
                                  {active ? '✓ ' : '+ '} {fl}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setBuilderStep(2)}
                            className="px-6 py-2.5 rounded-full bg-[#f5efe2] text-[#151510] text-xs font-semibold uppercase tracking-wider hover:bg-white transition-colors"
                          >
                            Далее: Формат и открытка →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Budget & Packaging */}
                    {builderStep === 2 && (
                      <div className="space-y-5">
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-[#f5efe2]/70 mb-2">Масштаб и ориентир бюджета</label>
                          <div className="space-y-2">
                            {[
                              { label: 'Компактный комплимент', price: '~ 4 900 ₽', desc: 'Утонченный аккуратный букет для теплого жеста' },
                              { label: 'Классический авторский', price: '~ 8 500 ₽', desc: 'Сбалансированная объемная композиция из редких сортов (Самый популярный выбор)' },
                              { label: 'Роскошный гранд-букет', price: '~ 16 000 ₽', desc: 'Впечатляющая пышная охапка отборных цветов' },
                              { label: 'Премиум коллекция', price: 'от 25 000 ₽', desc: 'Эксклюзивные голландские пионы и розы с вазой в подарок' }
                            ].map((tier) => (
                              <button
                                key={tier.label}
                                type="button"
                                onClick={() => setBudgetTier(`${tier.label} (${tier.price})`)}
                                className={`w-full p-3 rounded-xl text-left border flex items-center justify-between transition-all ${
                                  budgetTier.startsWith(tier.label)
                                    ? 'border-[#f5efe2] bg-[#f5efe2]/15 text-white'
                                    : 'border-[#f5efe2]/20 hover:border-[#f5efe2]/40 text-[#f5efe2]/75'
                                }`}
                              >
                                <div>
                                  <div className="text-xs font-semibold">{tier.label}</div>
                                  <div className="text-[11px] text-[#f5efe2]/60">{tier.desc}</div>
                                </div>
                                <div className="text-xs font-mono font-medium text-[#f5efe2]">{tier.price}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs uppercase tracking-wider text-[#f5efe2]/70 mb-2">Оформление и упаковка</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {[
                              'Дизайнерская бумага & шелковые ленты',
                              'Минималистичный аквабокс с водой',
                              'Премиальная шляпная коробка',
                              'Без упаковки — перевязан лентой'
                            ].map((pack) => (
                              <button
                                key={pack}
                                type="button"
                                onClick={() => setPackaging(pack)}
                                className={`p-2.5 rounded-lg text-xs text-left border transition-all ${
                                  packaging === pack
                                    ? 'border-[#f5efe2] bg-[#f5efe2]/15 text-white font-medium'
                                    : 'border-[#f5efe2]/20 hover:border-[#f5efe2]/40 text-[#f5efe2]/75'
                                }`}
                              >
                                {pack}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs uppercase tracking-wider text-[#f5efe2]/70 mb-1">
                            Текст для открытки от руки (бесплатно)
                          </label>
                          <textarea
                            rows={2}
                            value={postcardText}
                            onChange={(e) => setPostcardText(e.target.value)}
                            placeholder="Напишите слова, которые мы выведем каллиграфическим почерком на хлопковой открытке..."
                            className="w-full bg-[#181814] border border-[#f5efe2]/20 rounded-lg p-2.5 text-xs text-[#f5efe2] focus:outline-none focus:border-[#f5efe2] resize-none"
                          />
                        </div>

                        <div className="pt-2 flex justify-between">
                          <button
                            type="button"
                            onClick={() => setBuilderStep(1)}
                            className="px-4 py-2 text-xs text-[#f5efe2]/70 hover:text-white"
                          >
                            ← Назад
                          </button>
                          <button
                            type="button"
                            onClick={() => setBuilderStep(3)}
                            className="px-6 py-2.5 rounded-full bg-[#f5efe2] text-[#151510] text-xs font-semibold uppercase tracking-wider hover:bg-white transition-colors"
                          >
                            Далее: Контакты и доставка →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Delivery & Checkout */}
                    {builderStep === 3 && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          setIsBuilderSubmitted(true);
                        }}
                        className="space-y-4"
                      >
                        <div className="bg-[#181814]/80 border border-[#f5efe2]/15 rounded-xl p-3 text-xs space-y-1">
                          <div className="text-[#f5efe2]/60">Параметры вашего букета:</div>
                          <div className="font-medium text-white">{occasion} · {palette}</div>
                          <div className="text-[#f5efe2]/80">{budgetTier}</div>
                          <div className="text-[#f5efe2]/60 text-[11px]">Упаковка: {packaging}</div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs uppercase tracking-wider text-[#f5efe2]/70 mb-1">Ваше имя *</label>
                            <input
                              required
                              type="text"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="Анастасия"
                              className="w-full bg-[#181814] border border-[#f5efe2]/20 rounded-lg px-3 py-2 text-xs text-[#f5efe2] focus:outline-none focus:border-[#f5efe2]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs uppercase tracking-wider text-[#f5efe2]/70 mb-1">Телефон для связи и фото *</label>
                            <input
                              required
                              type="tel"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              placeholder="+7 (999) 000-00-00"
                              className="w-full bg-[#181814] border border-[#f5efe2]/20 rounded-lg px-3 py-2 text-xs text-[#f5efe2] focus:outline-none focus:border-[#f5efe2]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs uppercase tracking-wider text-[#f5efe2]/70 mb-1">Адрес доставки</label>
                          <input
                            type="text"
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            placeholder="Улица, дом, квартира (или номер получателя — мы сами уточним)"
                            className="w-full bg-[#181814] border border-[#f5efe2]/20 rounded-lg px-3 py-2 text-xs text-[#f5efe2] focus:outline-none focus:border-[#f5efe2]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs uppercase tracking-wider text-[#f5efe2]/70 mb-1">Время доставки</label>
                          <input
                            type="text"
                            value={deliveryDate}
                            onChange={(e) => setDeliveryDate(e.target.value)}
                            placeholder="Сегодня к 19:00 / Завтра с 10:00 до 12:00"
                            className="w-full bg-[#181814] border border-[#f5efe2]/20 rounded-lg px-3 py-2 text-xs text-[#f5efe2] focus:outline-none focus:border-[#f5efe2]"
                          />
                        </div>

                        <div className="pt-2 flex justify-between items-center">
                          <button
                            type="button"
                            onClick={() => setBuilderStep(2)}
                            className="px-3 py-2 text-xs text-[#f5efe2]/70 hover:text-white"
                          >
                            ← Назад
                          </button>
                          <button
                            type="submit"
                            className="px-8 py-3 rounded-full bg-[#f5efe2] text-[#151510] text-xs font-semibold uppercase tracking-[0.14em] hover:bg-white transition-all transform hover:-translate-y-0.5 shadow-lg"
                          >
                            Отправить заявку флористу
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2. CATALOG MODAL: "Каталог" */}
            {activeModal === 'catalog' && (
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[#f5efe2]/60 font-medium">Коллекция FloRista</span>
                <h2 className="text-2xl sm:text-3xl font-normal mt-1 mb-2" style={{ fontFamily: 'Antonio, sans-serif' }}>
                  Авторские букеты и композиции
                </h2>
                <p className="text-xs sm:text-sm text-[#f5efe2]/75 mb-5">
                  Каждый букет собирается из свежих цветов утренней поставки и доставляется в фирменном аквабоксе с питанием.
                </p>

                {/* Filter tags */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-5 text-xs">
                  {[
                    { key: 'all', label: 'Все букеты' },
                    { key: 'author', label: 'Авторские' },
                    { key: 'mono', label: 'Монобукеты' },
                    { key: 'box', label: 'В коробках' }
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setCatalogFilter(f.key as any)}
                      className={`px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                        catalogFilter === f.key
                          ? 'border-[#f5efe2] bg-[#f5efe2] text-[#151510] font-medium'
                          : 'border-[#f5efe2]/20 text-[#f5efe2]/70 hover:border-[#f5efe2]/40'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Bouquet Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredBouquets.map((b) => (
                    <div
                      key={b.id}
                      className="border border-[#f5efe2]/15 hover:border-[#f5efe2]/40 rounded-xl p-4 bg-[#181814]/60 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[#f5efe2]/50 mb-1">
                          <span className="bg-[#f5efe2]/10 px-2 py-0.5 rounded text-[#f5efe2]/80">{b.tag}</span>
                          <span className="font-mono text-[#f5efe2] font-semibold text-xs">{b.price.toLocaleString('ru-RU')} ₽</span>
                        </div>
                        <h3 className="text-base font-medium text-[#f5efe2] mt-1">{b.title}</h3>
                        <div className="text-xs text-[#f5efe2]/60 italic mb-2">{b.subtitle}</div>
                        <p className="text-xs text-[#f5efe2]/75 mb-3 leading-relaxed">{b.description}</p>
                        <div className="text-[11px] text-[#f5efe2]/60 mb-4">
                          <span className="text-[#f5efe2]/40">Состав: </span>
                          {b.composition.join(' · ')}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedBouquetForOrder(b);
                          setOccasion(b.title);
                          setBudgetTier(`${b.title} (${b.price.toLocaleString('ru-RU')} ₽)`);
                          openModal('builder');
                          setBuilderStep(3);
                        }}
                        className="w-full py-2 rounded-lg border border-[#f5efe2]/30 hover:bg-[#f5efe2] hover:text-[#151510] text-xs font-semibold uppercase tracking-wider transition-all"
                      >
                        Заказать букет
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. ABOUT MODAL: "О студии" */}
            {activeModal === 'about' && (
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[#f5efe2]/60 font-medium">Философия FloRista</span>
                <h2 className="text-2xl sm:text-3xl font-normal mt-1 mb-4" style={{ fontFamily: 'Antonio, sans-serif' }}>
                  Искусство живых цветов
                </h2>
                <div className="space-y-4 text-xs sm:text-sm text-[#f5efe2]/80 leading-relaxed">
                  <p>
                    FloRista — это флористическая мастерская, где каждый букет создается не по шаблону, а как искреннее признание, комплимент или бережная поддержка.
                  </p>
                  <p>
                    Мы отказались от стандартного цветочного ритейла в пользу клубной атмосферы и индивидуальной работы с каждым стеблем.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 rounded-xl border border-[#f5efe2]/15 bg-[#181814]/50">
                      <div className="text-lg mb-1">🌿</div>
                      <h4 className="font-medium text-white text-xs mb-1">Прямые утренние поставки</h4>
                      <p className="text-[11px] text-[#f5efe2]/60">
                        Только отборные плантации Голландии, Эквадора и Кении. Цветы никогда не томятся неделями на витрине.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-[#f5efe2]/15 bg-[#181814]/50">
                      <div className="text-lg mb-1">💧</div>
                      <h4 className="font-medium text-white text-xs mb-1">Аквабокс & Питание</h4>
                      <p className="text-[11px] text-[#f5efe2]/60">
                        Каждый букет доставляется в устойчивой емкости с водой и кризалом. Цветы не вянут в пути.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-[#f5efe2]/15 bg-[#181814]/50">
                      <div className="text-lg mb-1">✍️</div>
                      <h4 className="font-medium text-white text-xs mb-1">Каллиграфия от руки</h4>
                      <p className="text-[11px] text-[#f5efe2]/60">
                        Бесплатная дизайнерская открытка из хлопковой бумаги, подписанная каллиграфическим почерком.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-[#f5efe2]/15 bg-[#181814]/50">
                      <div className="text-lg mb-1">📸</div>
                      <h4 className="font-medium text-white text-xs mb-1">Фото перед отправкой</h4>
                      <p className="text-[11px] text-[#f5efe2]/60">
                        Присылаем видео и фото собранного букета в мессенджер до передачи курьеру.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#f5efe2]/15 text-xs text-[#f5efe2]/60 flex flex-wrap justify-between gap-2">
                    <div>
                      <span className="text-white">Адрес бутика: </span>ул. Большая Полянка, 24
                    </div>
                    <div>
                      <span className="text-white">Время работы: </span>Ежедневно 08:00 – 22:00
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. DELIVERY & CARE MODAL: "Доставка & Уход" */}
            {activeModal === 'delivery' && (
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[#f5efe2]/60 font-medium">Сервис & Забота</span>
                <h2 className="text-2xl sm:text-3xl font-normal mt-1 mb-4" style={{ fontFamily: 'Antonio, sans-serif' }}>
                  Бережная доставка и уход за букетом
                </h2>

                <div className="space-y-5 text-xs sm:text-sm text-[#f5efe2]/80 leading-relaxed">
                  <div>
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span>🚚</span> Условия доставки
                    </h3>
                    <ul className="space-y-1.5 text-xs text-[#f5efe2]/75 list-disc list-inside">
                      <li><strong>Экспресс за 60–90 минут:</strong> соберем и доставим букет в кратчайшие сроки по городу.</li>
                      <li><strong>Бесплатная доставка:</strong> при заказе букета от 5 000 ₽.</li>
                      <li><strong>Сюрприз по номеру телефона:</strong> не знаете адрес? Укажите телефон получателя, мы деликатно договоримся об удобном времени.</li>
                      <li><strong>Анонимная доставка:</strong> курьер сохранит ваше имя в тайне, пока адресат не прочтет открытку.</li>
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-[#f5efe2]/15">
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span>🌸</span> Инструкция по уходу
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-3 rounded-lg bg-[#181814] border border-[#f5efe2]/15">
                        <strong className="text-white block mb-0.5">1. Косой срез</strong>
                        Подрежьте стебли на 1.5–2 см острым ножом под углом 45° перед тем, как поставить в вазу.
                      </div>
                      <div className="p-3 rounded-lg bg-[#181814] border border-[#f5efe2]/15">
                        <strong className="text-white block mb-0.5">2. Питание Chrysal</strong>
                        Растворите пакетик подкормки в прохладной фильтрованной воде.
                      </div>
                      <div className="p-3 rounded-lg bg-[#181814] border border-[#f5efe2]/15">
                        <strong className="text-white block mb-0.5">3. Смена воды</strong>
                        Меняйте воду и обновляйте срез каждые 1-2 дня.
                      </div>
                      <div className="p-3 rounded-lg bg-[#181814] border border-[#f5efe2]/15">
                        <strong className="text-white block mb-0.5">4. Комфортное место</strong>
                        Берегите букет от сквозняков, батарей отопления и прямых солнечных лучей.
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-center">
                    <button
                      onClick={() => openModal('builder')}
                      className="px-6 py-2.5 rounded-full bg-[#f5efe2] text-[#151510] text-xs font-semibold uppercase tracking-wider hover:bg-white transition-colors"
                    >
                      Собрать букет сейчас
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
