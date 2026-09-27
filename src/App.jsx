import { useState } from 'react'
import Experience from './components/Experience.jsx'
import Hud from './components/Hud.jsx'
import { boothById } from './data/booths.js'

export default function App() {
  const [activeId, setActiveId] = useState(null)
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [walking, setWalking] = useState(false)

  const activeBooth = activeId ? boothById[activeId] : null
  const selectedProduct = activeBooth?.products.find((product) => product.id === selectedProductId) ?? null

  const selectBooth = (id) => {
    setActiveId(id)
    setSelectedProductId(null)
  }

  return (
    <main className="app-shell">
      <Experience
        activeId={activeId}
        onSelect={selectBooth}
        onSelectProduct={setSelectedProductId}
        onWalkChange={setWalking}
      />
      <Hud
        activeBooth={activeBooth}
        selectedProduct={selectedProduct}
        walking={walking}
        onSelectBooth={selectBooth}
        onSelectProduct={setSelectedProductId}
        onReset={() => selectBooth(null)}
      />
    </main>
  )
}
