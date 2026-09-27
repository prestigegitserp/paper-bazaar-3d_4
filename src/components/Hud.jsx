import { booths } from '../data/booths.js'

export default function Hud({ activeBooth, selectedProduct, sampleBag, onSelectBooth, onSelectProduct, onAddSample, onReset }) {
  return (
    <div className="hud-shell">
      <header className="topbar glass-panel">
        <div className="brand-lockup">
          <span className="brand-mark">PB</span>
          <div>
            <strong>Paper Bazaar</strong>
            <small>Investor demo · rebuilt from zero</small>
          </div>
        </div>
        <div className="runtime-badges" aria-label="runtime metrics">
          <span><b>2</b> booths</span>
          <span><b>0</b> external 3D assets</span>
          <span><b>Demand</b> render loop</span>
        </div>
        <button className="bag-button" type="button" aria-label="Sample bag">
          Sample bag <b>{sampleBag.length}</b>
        </button>
      </header>

      <section className={`hero-copy ${activeBooth ? 'hero-copy--compact' : ''}`}>
        <div className="eyebrow"><span /> LIVE B2B EXPERIENCE</div>
        <h1>{activeBooth ? activeBooth.name : 'بازار کاغذ، این بار به شکل یک تجربه.'}</h1>
        <p>
          {activeBooth
            ? activeBooth.short
            : 'دو غرفه‌ی curated، مسیر دوربین سینمایی، انتخاب محصول و sample flow؛ بدون asset سنگین و بدون انتظار برای لود.'}
        </p>
        {!activeBooth && (
          <div className="hero-actions">
            <button className="primary-button" type="button" onClick={() => onSelectBooth('atlas')}>شروع تور ۴۵ ثانیه‌ای</button>
            <span>روی هر غرفه کلیک کن · کلیدهای 1 و 2</span>
          </div>
        )}
      </section>

      {activeBooth && (
        <aside className="detail-panel glass-panel" style={{ '--accent': activeBooth.accent }}>
          <div className="detail-heading">
            <div>
              <span className="booth-number">BOOTH {activeBooth.number}</span>
              <h2>{activeBooth.name}</h2>
              <p>{activeBooth.kicker}</p>
            </div>
            <button className="icon-button" type="button" onClick={onReset} aria-label="Close booth details">×</button>
          </div>

          <div className="stat-grid">
            {activeBooth.stats.map(([value, label]) => (
              <div key={label}><strong>{value}</strong><span>{label}</span></div>
            ))}
          </div>

          <div className="product-list">
            {activeBooth.products.map((product) => {
              const isActive = selectedProduct?.id === product.id
              return (
                <button
                  key={product.id}
                  type="button"
                  className={`product-row ${isActive ? 'product-row--active' : ''}`}
                  onClick={() => onSelectProduct(product.id)}
                >
                  <span>
                    <strong>{product.name}</strong>
                    <small>{product.meta}</small>
                  </span>
                  <em>{isActive ? '−' : '+'}</em>
                </button>
              )
            })}
          </div>

          {selectedProduct && (
            <div className="product-detail">
              <div className="product-detail__top">
                <span>Interactive SKU</span>
                <strong>{selectedProduct.price}</strong>
              </div>
              <p>{selectedProduct.note}</p>
              <button className="sample-button" type="button" onClick={() => onAddSample(selectedProduct)}>
                افزودن نمونه به کیف
              </button>
            </div>
          )}
        </aside>
      )}

      <nav className="booth-nav" aria-label="Booth navigation">
        {booths.map((booth) => (
          <button
            key={booth.id}
            type="button"
            className={`booth-chip ${activeBooth?.id === booth.id ? 'booth-chip--active' : ''}`}
            onClick={() => onSelectBooth(booth.id)}
            style={{ '--accent': booth.accent }}
          >
            <span className="chip-index">{booth.number}</span>
            <span><strong>{booth.name}</strong><small>{booth.kicker}</small></span>
            <i>→</i>
          </button>
        ))}
        <button className="booth-chip booth-chip--home" type="button" onClick={onReset}>
          <span className="chip-index">⌂</span>
          <span><strong>Wide view</strong><small>هر دو غرفه در یک فریم</small></span>
        </button>
      </nav>

      <footer className="micro-footer">
        <span>Procedural geometry · baked shadows · reusable instances</span>
        <span>ESC بازگشت · 1/2 پرش بین غرفه‌ها</span>
      </footer>
    </div>
  )
}
