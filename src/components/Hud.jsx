import { booths } from '../data/booths.js'

export default function Hud({
  activeBooth,
  selectedProduct,
  walking,
  onSelectBooth,
  onSelectProduct,
  onReset,
}) {
  return (
    <div className={walking ? 'hud is-walking' : 'hud'}>
      <header className="masthead">
        <button className="wordmark" type="button" onClick={onReset}>
          <span className="wordmark__seal">PB</span>
          <span>
            <strong>PAPER BAZAAR</strong>
            <small>DIGITAL TWIN / MATERIAL HALL</small>
          </span>
        </button>

        <div className="masthead__meta">
          <span>1:1 HUMAN SCALE</span>
          <i />
          <span>4 TRADE-FAIR BOOTHS</span>
          <i />
          <span>WALKABLE HALL</span>
        </div>

        <div className="status">
          <span className="status__dot" />
          REAL-TIME TWIN
        </div>
      </header>

      {!walking && !activeBooth && (
        <section className="opening-copy">
          <div className="opening-copy__eyebrow">SCANNED-SPACE STUDY / REAL SCALE</div>
          <h1>
            وارد سالن شو.
            <br />
            <span>مثل یک فضای واقعی.</span>
          </h1>
          <p>
            چهار غرفه در یک سالن با راهروی مرکزی، مقیاس انسانی و حرکت اول‌شخص.
            سطوح عمداً کاملاً تمیز و CG نیستند تا حس یک محیط برداشت‌شده و دیجیتال‌تویین حفظ شود.
          </p>
          <div className="opening-copy__actions">
            <button className="walk-trigger" type="button">
              شروع قدم‌زدن
              <b>↗</b>
            </button>
            <span>WASD حرکت · Mouse نگاه · Shift سریع‌تر · Esc خروج</span>
          </div>
        </section>
      )}

      {!walking && activeBooth && (
        <aside className="booth-story" style={{ '--accent': activeBooth.accent }}>
          <div className="booth-story__index">BOOTH {activeBooth.number}</div>
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
            <span className="material-list__label">MATERIAL SAMPLES</span>
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

      {!walking && selectedProduct && (
        <aside className="product-card" style={{ '--accent': activeBooth?.accent }}>
          <div className="product-card__topline">
            <span>MATERIAL RECORD</span>
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

      {!walking && (
        <nav className="pavilion-rail" aria-label="Booth navigation">
          <button
            type="button"
            className={!activeBooth ? 'is-active pavilion-rail__overview' : 'pavilion-rail__overview'}
            onClick={onReset}
          >
            <span>00</span>
            <strong>HALL</strong>
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
      )}

      {walking && (
        <>
          <div className="crosshair" aria-hidden="true"><i /></div>
          <div className="walk-hint">
            <strong>W A S D</strong>
            <span>MOVE</span>
            <em>SHIFT / FAST</em>
            <em>ESC / RELEASE</em>
          </div>
          {activeBooth && (
            <div className="walk-booth-label" style={{ '--accent': activeBooth.accent }}>
              <span>BOOTH {activeBooth.number}</span>
              <strong>{activeBooth.name}</strong>
            </div>
          )}
        </>
      )}

      {!walking && (
        <button className="walk-trigger walk-trigger--floating" type="button">
          <span>WALK MODE</span>
          <b>WASD</b>
        </button>
      )}
    </div>
  )
}
