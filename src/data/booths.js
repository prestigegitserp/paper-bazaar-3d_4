export const booths = [
  {
    id: 'atlas',
    number: '01',
    name: 'Atlas Paper House',
    kicker: 'Fine paper · premium sheets',
    short: 'کاغذهای خاص و نمونه‌های لمسی برای برندها، ناشرها و چاپخانه‌ها.',
    accent: '#ffb86b',
    secondary: '#ff6f61',
    camera: [-7.4, 4.7, 8.2],
    target: [-4.4, 1.25, 0.1],
    stats: [
      ['48h', 'Sample SLA'],
      ['120+', 'Stock SKUs'],
      ['A4→B1', 'Cut range'],
    ],
    products: [
      {
        id: 'cotton-ivory',
        name: 'Cotton Ivory 320',
        meta: '320 gsm · uncoated · warm white',
        price: 'Demo · 1.9M / ream',
        note: 'برای بسته‌بندی لوکس، کارت و جلد با حس الیاف طبیعی.',
      },
      {
        id: 'book-cream',
        name: 'Book Cream 80',
        meta: '80 gsm · bulk 1.8 · low glare',
        price: 'Demo · 890K / ream',
        note: 'برای کتاب‌های طولانی‌خوان با حجم مناسب و بازتاب کم.',
      },
      {
        id: 'digital-silk',
        name: 'Digital Silk 250',
        meta: '250 gsm · coated · HP Indigo ready',
        price: 'Demo · 1.4M / ream',
        note: 'خروجی رنگی کنترل‌شده برای سفارش‌های کوتاه و پریمیوم.',
      },
    ],
  },
  {
    id: 'packlab',
    number: '02',
    name: 'PackLab Supply',
    kicker: 'Roll stock · carton · converting',
    short: 'رول، کرافت و مقوای صنعتی با تمرکز روی سفارش‌گیری سریع B2B.',
    accent: '#62e6cf',
    secondary: '#41a5ff',
    camera: [7.7, 4.9, 8.4],
    target: [4.5, 1.2, 0.15],
    stats: [
      ['24h', 'Quote SLA'],
      ['6', 'Core grades'],
      ['2T+', 'Monthly demo'],
    ],
    products: [
      {
        id: 'kraft-125',
        name: 'Kraft Roll 125',
        meta: '125 gsm · 100% kraft · 1.2 m roll',
        price: 'Demo · 78K / kg',
        note: 'گزینه‌ی اقتصادی برای ساک، لفاف و بسته‌بندی با بازیافت‌پذیری بالا.',
      },
      {
        id: 'duplex-350',
        name: 'Duplex 350',
        meta: '350 gsm · grey back · sheeted',
        price: 'Demo · 96K / kg',
        note: 'مناسب جعبه‌های FMCG و تولید تیراژ بالا با ثبات ابعادی.',
      },
      {
        id: 'liner-180',
        name: 'Liner 180',
        meta: '180 gsm · moisture controlled · roll',
        price: 'Demo · 84K / kg',
        note: 'لاینر مقاوم برای ورق‌سازی و زنجیره‌ی بسته‌بندی حمل‌ونقل.',
      },
    ],
  },
]

export const boothById = Object.fromEntries(booths.map((booth) => [booth.id, booth]))
