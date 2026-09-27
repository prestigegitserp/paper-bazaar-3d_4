import { useEffect, useMemo, useState } from 'react'
import Experience from './components/Experience.jsx'
import Hud from './components/Hud.jsx'
import { boothById } from './data/booths.js'

export default function App() {
  const [activeId, setActiveId] = useState(null)
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [sampleBag, setSampleBag] = useState([])

  const activeBooth = activeId ? boothById[activeId] : null
  const selectedProduct = useMemo(
    () => activeBooth?.products.find((product) => product.id === selectedProductId) ?? null,
    [activeBooth, selectedProductId],
  )

  const selectBooth = (id) => {
    setActiveId(id)
    if (!id) setSelectedProductId(null)
    else setSelectedProductId((current) => boothById[id].products.some((product) => product.id === current) ? current : null)
  }

  const reset = () => {
    setActiveId(null)
    setSelectedProductId(null)
  }

  const addSample = (product) => {
    setSampleBag((items) => items.some((item) => item.id === product.id) ? items : [...items, product])
  }

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === '1') selectBooth('atlas')
      if (event.key === '2') selectBooth('packlab')
      if (event.key === 'Escape') reset()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <main className="app-shell">
      <div className="ambient-orb ambient-orb--left" />
      <div className="ambient-orb ambient-orb--right" />
      <Experience
        activeId={activeId}
        onSelect={selectBooth}
        onSelectProduct={setSelectedProductId}
      />
      <Hud
        activeBooth={activeBooth}
        selectedProduct={selectedProduct}
        sampleBag={sampleBag}
        onSelectBooth={selectBooth}
        onSelectProduct={setSelectedProductId}
        onAddSample={addSample}
        onReset={reset}
      />
    </main>
  )
}
