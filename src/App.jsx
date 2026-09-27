import { useMemo, useState } from 'react'
import Experience from './components/Experience.jsx'
import { boothById, booths } from './data/booths.js'

const pillars = [
  {
    number: '01',
    title: 'کشف بصری محصول',
    text: 'خریدار به‌جای فایل PDF و لیست قیمت خشک، وارد یک فضای قابل‌فهم می‌شود و جنس، کاربرد و گروه محصول را سریع‌تر کشف می‌کند.',
  },
  {
    number: '02',
    title: 'تعامل B2B کوتاه‌تر',
    text: 'نمونه، استعلام و مقایسه محصول از همان تجربه‌ی نمایشگاهی شروع می‌شود؛ بدون این‌که کاربر بین چند کانال پراکنده جابه‌جا شود.',
  },
  {
    number: '03',
    title: 'قابل توسعه به بازار واقعی',
    text: 'این نسخه فقط دو غرفه دارد، اما مدل داده و رابط برای اتصال به کاتالوگ، موجودی، CRM و فروشنده‌های واقعی آماده‌ی توسعه است.',
  },
]

const flow = [
  ['کشف', 'ورود به بازار و انتخاب غرفه بر اساس نیاز خرید.'],
  ['بررسی', 'دیدن SKUها، مشخصات و قیمت نمایشی در همان محیط.'],
  ['نمونه', 'اضافه‌کردن محصول به sample bag برای تصمیم‌گیری بعدی.'],
  ['استعلام', 'مسیر بعدی محصول می‌تواند به quote، CRM یا فروش مستقیم متصل شود.'],
]

function ArrowIcon() {
  return <span aria-hidden="true">↗</span>
}

export default function App() {
  const [activeId, setActiveId] = useState('atlas')
  const [selectedProductId, setSelectedProductId] = useState(booths[0].products[0].id)
  const [sampleBag, setSampleBag] = useState([])

  const activeBooth = boothById[activeId] ?? booths[0]
  const selectedProduct = useMemo(
    () => activeBooth.products.find((product) => product.id === selectedProductId) ?? activeBooth.products[0],
    [activeBooth, selectedProductId],
  )

  const selectBooth = (id) => {
    const booth = boothById[id] ?? booths[0]
    setActiveId(booth.id)
    setSelectedProductId(booth.products[0].id)
  }

  const addSample = (product) => {
    setSampleBag((items) => (
      items.some((item) => item.id === product.id) ? items : [...items, product]
    ))
  }

  const scrollToExperience = (id = activeId) => {
    selectBooth(id)
    document.querySelector('#experience')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <main className="site-shell">
      <nav className="site-nav" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="Paper Bazaar home">
          <span className="brand__mark">PB</span>
          <span className="brand__copy">
            <strong>Paper Bazaar</strong>
            <small>B2B paper marketplace · 3D prototype</small>
          </span>
        </a>

        <div className="nav-links">
          <a href="#product">محصول</a>
          <a href="#booths">غرفه‌ها</a>
          <a href="#model">مدل</a>
        </div>

        <button className="nav-cta" type="button" onClick={() => scrollToExperience()}>
          ورود به تجربه سه‌بعدی <ArrowIcon />
        </button>
      </nav>

      <section className="hero section-wrap" id="top">
        <div className="hero__copy">
          <div className="status-pill">
            <span className="status-dot" />
            LIVE PROTOTYPE · TWO BOOTHS
          </div>

          <h1>
            بازار کاغذ،
            <span> این بار قابل قدم‌زدن.</span>
          </h1>

          <p>
            Paper Bazaar یک تجربه‌ی B2B سه‌بعدی برای کشف، مقایسه و شروع خرید کاغذ و
            بسته‌بندی است؛ ترکیبی از showroom دیجیتال و marketplace که برای ارائه‌ی
            سرمایه‌گذار از صفر بازطراحی شده.
          </p>

          <div className="hero__actions">
            <button className="button button--primary" type="button" onClick={() => scrollToExperience('atlas')}>
              تجربه نسخه زنده <ArrowIcon />
            </button>
            <a className="button button--ghost" href="#model">
              دیدن منطق محصول
            </a>
          </div>

          <div className="hero__proof">
            <div>
              <strong>2</strong>
              <span>غرفه curated</span>
            </div>
            <div>
              <strong>6</strong>
              <span>SKU تعاملی</span>
            </div>
            <div>
              <strong>0</strong>
              <span>asset سه‌بعدی خارجی</span>
            </div>
          </div>
        </div>

        <div className="hero__visual" id="experience">
          <div className="stage-frame">
            <div className="stage-frame__top">
              <div>
                <span className="live-dot" />
                <span>Interactive showroom</span>
              </div>
              <div className="stage-frame__meta">
                <span>Demand render</span>
                <span>Procedural scene</span>
              </div>
            </div>

            <div className="stage-canvas">
              <Experience
                activeId={activeId}
                onSelect={(id) => id && selectBooth(id)}
                onSelectProduct={setSelectedProductId}
              />

              <div className="stage-canvas__hint">
                روی غرفه یا محصول کلیک کن
              </div>
            </div>

            <div className="stage-console">
              <div className="booth-switcher" role="tablist" aria-label="Booth selector">
                {booths.map((booth) => (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeId === booth.id}
                    className={activeId === booth.id ? 'booth-tab booth-tab--active' : 'booth-tab'}
                    key={booth.id}
                    onClick={() => selectBooth(booth.id)}
                    style={{ '--accent': booth.accent }}
                  >
                    <span>{booth.number}</span>
                    <div>
                      <strong>{booth.name}</strong>
                      <small>{booth.kicker}</small>
                    </div>
                  </button>
                ))}
              </div>

              <div className="product-console" style={{ '--accent': activeBooth.accent }}>
                <div className="product-console__heading">
                  <div>
                    <span>SELECTED SKU</span>
                    <h3>{selectedProduct.name}</h3>
                  </div>
                  <strong>{selectedProduct.price}</strong>
                </div>

                <p>{selectedProduct.note}</p>

                <div className="sku-list">
                  {activeBooth.products.map((product) => (
                    <button
                      type="button"
                      key={product.id}
                      className={product.id === selectedProduct.id ? 'sku-chip sku-chip--active' : 'sku-chip'}
                      onClick={() => setSelectedProductId(product.id)}
                    >
                      <span>{product.name}</span>
                      <small>{product.meta}</small>
                    </button>
                  ))}
                </div>

                <button
                  className="sample-action"
                  type="button"
                  onClick={() => addSample(selectedProduct)}
                >
                  افزودن به Sample Bag
                  <b>{sampleBag.length}</b>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="signal-strip" aria-label="Product signals">
        <div><span>01</span> showroom تعاملی به‌جای catalog ایستا</div>
        <div><span>02</span> تجربه‌ی سبک و بدون فایل GLB اولیه</div>
        <div><span>03</span> معماری قابل اتصال به داده‌ی واقعی</div>
      </section>

      <section className="section-wrap section-block" id="product">
        <div className="section-heading">
          <span>WHY THIS PRODUCT</span>
          <h2>از ویترین دیجیتال تا شروع معامله، در یک تجربه.</h2>
          <p>
            هدف این نمونه نمایش یک فروشگاه سه‌بعدی صرف نیست؛ هدف نشان دادن یک لایه‌ی
            تجربه برای تجارت B2B است که می‌تواند بالای کاتالوگ، قیمت و عملیات واقعی بنشیند.
          </p>
        </div>

        <div className="pillar-grid">
          {pillars.map((pillar) => (
            <article className="pillar-card" key={pillar.number}>
              <span>{pillar.number}</span>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-wrap booths-section" id="booths">
        <div className="section-heading section-heading--split">
          <div>
            <span>CURATED DEMO</span>
            <h2>دو غرفه، دو سناریوی خرید کاملاً متفاوت.</h2>
          </div>
          <p>
            به‌جای ساختن یک بازار بزرگ و کم‌جزئیات، نسخه‌ی ارائه روی دو use case
            متمرکز شده تا ارزش تجربه سریع‌تر دیده شود.
          </p>
        </div>

        <div className="booth-cards">
          {booths.map((booth) => (
            <article className="booth-card" key={booth.id} style={{ '--accent': booth.accent }}>
              <div className="booth-card__index">{booth.number}</div>
              <div className="booth-card__head">
                <span>{booth.kicker}</span>
                <h3>{booth.name}</h3>
                <p>{booth.short}</p>
              </div>

              <div className="booth-card__stats">
                {booth.stats.map(([value, label]) => (
                  <div key={label}>
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              <div className="booth-card__products">
                {booth.products.map((product) => (
                  <span key={product.id}>{product.name}</span>
                ))}
              </div>

              <button type="button" onClick={() => scrollToExperience(booth.id)}>
                باز کردن غرفه <ArrowIcon />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="model-section" id="model">
        <div className="section-wrap model-layout">
          <div className="section-heading section-heading--light">
            <span>BUYER FLOW</span>
            <h2>یک مسیر کوتاه‌تر از «دیدن» تا «استعلام».</h2>
            <p>
              در نسخه‌ی واقعی، همین flow می‌تواند به موجودی زنده، quote engine، CRM،
              لجستیک و پرداخت متصل شود.
            </p>
          </div>

          <div className="flow-list">
            {flow.map(([title, text], index) => (
              <article key={title}>
                <span>0{index + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-wrap investor-section">
        <div className="investor-panel">
          <div className="investor-panel__copy">
            <span className="section-kicker">INVESTOR VIEW</span>
            <h2>نمونه‌ای کوچک برای نشان دادن یک بازار بزرگ‌تر.</h2>
            <p>
              این prototype عمداً inventory و تعداد غرفه را محدود نگه می‌دارد تا ارزش
              اصلی محصول — تجربه‌ی کشف و خرید B2B — واضح بماند. مرحله‌ی بعدی می‌تواند
              اتصال فروشنده‌های واقعی، داده‌ی زنده و quote workflow باشد.
            </p>
          </div>

          <div className="investor-panel__numbers">
            <div><strong>&lt; 1</strong><span>صفحه برای درک محصول</span></div>
            <div><strong>3D + UI</strong><span>یک تجربه، دو لایه</span></div>
            <div><strong>B2B</strong><span>تمرکز روی lead و quote</span></div>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="section-wrap final-cta__inner">
          <div>
            <span>READY TO EXPLORE</span>
            <h2>اول تجربه‌اش کن، بعد درباره‌ی بازارش حرف بزن.</h2>
          </div>
          <button className="button button--light" type="button" onClick={() => scrollToExperience()}>
            ورود به showroom <ArrowIcon />
          </button>
        </div>
      </section>

      <footer className="site-footer section-wrap">
        <a className="brand brand--footer" href="#top">
          <span className="brand__mark">PB</span>
          <span className="brand__copy"><strong>Paper Bazaar</strong><small>Interactive B2B prototype</small></span>
        </a>
        <p>Built as a from-scratch investor demo · React + React Three Fiber</p>
      </footer>
    </main>
  )
}
