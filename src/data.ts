export type Category = 'author' | 'mono' | 'box' | 'wedding';

export interface Bouquet {
  id: string;
  title: string;
  subtitle: string;
  category: Category;
  price: number;
  composition: string[];
  tag: string;
  description: string;
  img: string;
}

const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=75`;

// Фото — Unsplash. Замените на свои, когда будут реальные снимки букетов.
export const BOUQUETS: Bouquet[] = [
  { id: 'b1', title: 'Розовый рассвет', subtitle: 'Воздушная гармония утреннего света', category: 'author', price: 7400, tag: 'Хит сезона',
    composition: ['Пионовидные розы', 'Матиола', 'Эвкалипт', 'Оксипеталум'], description: 'Пудрово-персиковые оттенки и свежий аромат эвкалипта.', img: u('photo-1490750967868-88aa4486c946') },
  { id: 'b2', title: 'Ночная нимфа', subtitle: 'Глубокий таинственный акцент', category: 'author', price: 9800, tag: 'Эксклюзив',
    composition: ['Гортензия', 'Скабиоза', 'Калла', 'Антуриум'], description: 'Сумеречно-винные и лавандовые тона для особых поводов.', img: u('photo-1582794543139-8ac9cb0f7b11') },
  { id: 'b3', title: 'Лунная рапсодия', subtitle: 'Белоснежное изящество', category: 'author', price: 12500, tag: 'Премиум',
    composition: ['Белые пионы', 'Ранункулюсы', 'Фрезия', 'Эустома'], description: 'Пышный облачный букет в нежном авторском обрамлении.', img: u('photo-1563241527-3004b7be0ffd') },
  { id: 'b4', title: 'Шепот лепестков', subtitle: 'Французский романтичный шарм', category: 'author', price: 6400, tag: 'Бестселлер',
    composition: ['Кремовые розы', 'Диантусы', 'Озотамнус', 'Латирус'], description: 'Стойкий ароматный букет с нотками ванили.', img: u('photo-1455659817273-f96807779a8a') },
  { id: 'b5', title: 'Бархатные розы', subtitle: 'Классика чувств', category: 'mono', price: 8900, tag: 'Монобукет',
    composition: ['25 роз (70 см)', 'Дизайнерская упаковка', 'Атласная лента'], description: 'Глубокий гранатовый оттенок, крупные бутоны.', img: u('photo-1487530811176-3780de880c2d') },
  { id: 'b6', title: 'Северное сияние', subtitle: 'Магия в шляпной коробке', category: 'box', price: 11200, tag: 'В коробке',
    composition: ['Голубая гортензия', 'Розы', 'Озотамнус', 'Бруния'], description: 'Коробка с оазисом — не нужна ваза, радует до 14 дней.', img: u('photo-1561181286-d3fee7d55364') },
  { id: 'b7', title: 'Нежное облако', subtitle: 'Для самого важного дня', category: 'wedding', price: 15000, tag: 'Свадебный',
    composition: ['Пионовидные розы', 'Эустома', 'Гипсофила', 'Зелень'], description: 'Букет невесты — можно подобрать под образ.', img: u('photo-1519225421980-715cb0215aed') },
  { id: 'b8', title: 'Тюльпановое утро', subtitle: 'Весна в руках', category: 'mono', price: 4500, tag: 'Сезонный',
    composition: ['35 тюльпанов', 'Крафт-бумага'], description: 'Свежие тюльпаны — простой и тёплый комплимент.', img: u('photo-1520763185298-1b434c919102') }
];

export interface Postcard { id: string; name: string; price: number; img: string }
export const POSTCARDS: Postcard[] = [
  { id: 'none', name: 'Без открытки', price: 0, img: '' },
  { id: 'cotton', name: 'Хлопковая, от руки', price: 0, img: u('photo-1513201099705-a9746e1e201f') },
  { id: 'kraft', name: 'Крафт с сургучом', price: 150, img: u('photo-1607344645866-009c320b63e0') },
  { id: 'mini', name: 'Мини-открытка с сердцем', price: 100, img: u('photo-1518199266791-5375a83190b7') }
];

export const DISTRICTS = ['Центрально-Городской', 'Гданцевский', 'Кировский', 'Червоногвардейский'];
export const DELIVERY = { free: 5000, fee: 300, city: 'Макеевка (Донецкая обл.)' };

export const BUILDER = {
  sizes: [
    { id: 's', label: 'Компактный', stems: '9–11 стеблей', price: 3900 },
    { id: 'm', label: 'Классический', stems: '19–25 стеблей', price: 7500 },
    { id: 'l', label: 'Гранд', stems: '35–45 стеблей', price: 13500 }
  ],
  flowers: ['Пионовидные розы', 'Гортензии', 'Ранункулюсы', 'Тюльпаны', 'Эустома', 'Диантусы', 'Эвкалипт и травы'],
  palettes: ['Нежная пастель', 'Пудровый и розовый', 'Белоснежный', 'Бордо', 'Закатный', 'На усмотрение флориста'],
  occasions: ['Любимой', 'День рождения', 'Годовщина', 'Спасибо', 'Без повода'],
  packs: [
    { id: 'paper', label: 'Дизайнерская бумага', price: 0 },
    { id: 'aqua', label: 'Аквабокс с водой', price: 400 },
    { id: 'hat', label: 'Шляпная коробка', price: 900 }
  ]
};

export const CONTACTS = {
  phone: '+7 (949) 000-00-00',
  address: 'г. Макеевка, ул. Ленина, 1 (укажите реальный адрес)',
  hours: 'Ежедневно 08:00 – 21:00',
  telegram: 'https://t.me/florista',
  instagram: 'https://instagram.com/florista'
};
