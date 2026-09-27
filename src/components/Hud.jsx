import { booths } from '../data/booths.js'

export default function Hud({
  activeBooth,
  selectedProduct,
  onSelectBooth,
  onSelectProduct,
  onReset,
}) {
  return (
    <div className="hud">
      <header className="masthead">
        <button className="wordmark" type="button" onClick={onReset}>
          <span className="wordmark__seal">PB</span>
          <span>
            <strong>PAPER BAZAAR</strong>
            <small>DIGITAL MATERIAL FAIR / 02</small>
          </span>
        </button>

        <div className="masthead__meta">
          <span>TEHRAN / B2B MATERIALS</span>
          <i />
          <span>2 CURATED PAVILIONS</span>
        </div>

        <div className="status">
          <span className="status__dot" />
          LIVE EXPERIENCE
        </div>
      </header>

      {!activeBooth && (
        <section className="opening-copy">
          <div className="opening-copy__eyebrow">MATERIAL COMMERCE, REIMAGINED</div>
          <h1>
            کاغذ را
            <span> فقط نبین.</span>
            <br />
            داخلش قدم بزن.
          </h1>
          <p>
            یک نمایشگاه دیجیتال فشرده برای خرید حرفه‌ای کاغذ؛
            دو غرفه، دو زبان بصری و یک تجربه‌ی سه‌بعدی که برای ارائه ساخته شده.
          </p>
          <div className="opening-copy__actions">
            <button type="button" onClick={() => onSelectBooth('atlas')}>
              شروع تور
              <b>↗</b>
            </button>
            <span>Drag the scene · choose a pavilion · inspect material</span>
          </div>
        </section>
      )}

      {activeBooth && (
        <aside className="booth-story" style={{ '--accent': activeBooth.accent }}>
          <div className="booth-story__index">PAVILION {activeBooth.number}</div>
          <h2>{activeBooth.name}</h2>
          <p>{activeBooth.short}</p>

          <div className="booth-story__stats">
            {activeBooth.stats.map(([value, label]) => (
              <div key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="material-list">
            <span className="material-list__label">SELECTED MATERIALS</span>
            {activeBooth.products.map((product, index) => (
              <button
                key={product.id}
                type="button"
                className={selectedProduct?.id === product.id ? 'is-active' : ''}
                onClick={() => onSelectProduct(product.id)}
              >
                <span className="material-list__number">0{index + 1}</span>
                <span>
                  <strong>{product.name}</strong>
                  <small>{product.meta}</small>
                </span>
                <b>↗</b>
              </button>
            ))}
          </div>
        </aside>
      )}

      {selectedProduct && (
        <aside className="product-card" style={{ '--accent': activeBooth?.accent }}>
          <div className="product-card__topline">
            <span>LIVE MATERIAL CARD</span>
            <button type="button" onClick={() => onSelectProduct(null)}>×</button>
          </div>
          <h3>{selectedProduct.name}</h3>
          <p>{selectedProduct.note}</p>
          <div className="product-card__price">
            <span>INDICATIVE PRICE</span>
            <strong>{selectedProduct.price}</strong>
          </div>
          <button className="product-card__cta" type="button">
            REQUEST SAMPLE
            <span>↗</span>
          </button>
        </aside>
      )}

      <nav className="pavilion-rail" aria-label="Pavilion navigation">
        <button
          type="button"
          className={!activeBooth ? 'is-active pavilion-rail__overview' : 'pavilion-rail__overview'}
          onClick={onReset}
        >
          <span>00</span>
          <strong>OVERVIEW</strong>
        </button>

        {booths.map((booth) => (
          <button
            key={booth.id}
            type="button"
            className={activeBooth?.id === booth.id ? 'is-active' : ''}
            style={{ '--accent': booth.accent }}
            onClick={() => onSelectBooth(booth.id)}
          >
            <span>{booth.number}</span>
            <strong>{booth.name}</strong>
            <i />
          </button>
        ))}
      </nav>

      <div className="corner-note">
        <span>SCROLL / POINTER</span>
        <span>REAL-TIME WEBGL</span>
      </div>
    </div>
  )
}
