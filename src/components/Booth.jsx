import { useMemo, useState } from 'react'
import { Edges, RoundedBox, useCursor } from '@react-three/drei'
import * as THREE from 'three'

function makeBoothTexture(booth) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#ece9e1'
  ctx.fillRect(0, 0, 1024, 512)

  const gradient = ctx.createLinearGradient(0, 0, 1024, 512)
  gradient.addColorStop(0, booth.accent)
  gradient.addColorStop(1, booth.secondary)
  ctx.globalAlpha = 0.92
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 330, 512)
  ctx.globalAlpha = 1

  ctx.fillStyle = '#1b1d1c'
  ctx.font = '700 62px Arial, sans-serif'
  ctx.fillText(booth.number, 52, 105)

  ctx.fillStyle = '#f7f3eb'
  ctx.font = '700 25px Arial, sans-serif'
  ctx.fillText('PAPER BAZAAR', 52, 445)

  ctx.fillStyle = '#222523'
  ctx.font = '700 42px Arial, sans-serif'
  ctx.fillText(booth.name.toUpperCase(), 382, 102)

  ctx.fillStyle = '#666b66'
  ctx.font = '500 19px Arial, sans-serif'
  ctx.fillText(booth.kicker.toUpperCase(), 384, 142)

  ctx.strokeStyle = '#a8aaa5'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(384, 176)
  ctx.lineTo(940, 176)
  ctx.stroke()

  booth.products.forEach((product, index) => {
    const y = 236 + index * 70
    ctx.fillStyle = '#343734'
    ctx.font = '600 19px Arial, sans-serif'
    ctx.fillText(`0${index + 1}`, 385, y)
    ctx.font = '600 20px Arial, sans-serif'
    ctx.fillText(product.name.toUpperCase(), 438, y)
    ctx.fillStyle = '#868983'
    ctx.font = '500 15px Arial, sans-serif'
    ctx.fillText(product.meta.toUpperCase(), 438, y + 24)
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

function BoothSign({ booth }) {
  const texture = useMemo(() => makeBoothTexture(booth), [booth])
  return (
    <mesh position={[0, 2.72, -2.28]}>
      <planeGeometry args={[5.15, 2.58]} />
      <meshStandardMaterial map={texture} roughness={0.72} />
    </mesh>
  )
}

function Extrusion({ position, scale, color = '#6f716e' }) {
  return (
    <mesh position={position} scale={scale} castShadow>
      <boxGeometry />
      <meshStandardMaterial color={color} roughness={0.48} metalness={0.52} />
    </mesh>
  )
}

function BoothShell({ booth, active }) {
  return (
    <group>
      <mesh position={[0, 0.025, 0]} receiveShadow>
        <boxGeometry args={[5.9, 0.045, 5]} />
        <meshStandardMaterial color="#c7c4bc" roughness={0.88} />
      </mesh>

      <mesh position={[0, 2.05, -2.4]} receiveShadow castShadow>
        <boxGeometry args={[5.85, 4.1, 0.14]} />
        <meshStandardMaterial color="#e4e1d9" roughness={0.82} />
      </mesh>

      {[-2.82, 2.82].map((x) => (
        <mesh key={x} position={[x, 1.95, -1.15]} castShadow>
          <boxGeometry args={[0.11, 3.9, 2.5]} />
          <meshStandardMaterial color="#dad7cf" roughness={0.86} />
        </mesh>
      ))}

      {[-2.86, 2.86].map((x) => (
        <Extrusion key={x} position={[x, 2.06, -0.02]} scale={[0.055, 2.08, 2.45]} />
      ))}
      <Extrusion position={[0, 4.11, -0.02]} scale={[2.86, 0.055, 2.45]} />
      <Extrusion position={[0, 0.12, -2.32]} scale={[2.82, 0.045, 0.04]} />

      <BoothSign booth={booth} />

      <mesh position={[0, 3.95, 0.05]}>
        <boxGeometry args={[3.2, 0.055, 0.055]} />
        <meshStandardMaterial
          color={booth.accent}
          emissive={booth.accent}
          emissiveIntensity={active ? 1.1 : 0.38}
          toneMapped={false}
        />
      </mesh>

      {[-1.8, 0, 1.8].map((x) => (
        <spotLight
          key={x}
          position={[x, 3.78, 0.55]}
          target-position={[x, 1.2, -0.4]}
          intensity={5}
          distance={5.2}
          angle={0.48}
          penumbra={0.72}
          color="#fff4dd"
          castShadow={false}
        />
      ))}
    </group>
  )
}

function SampleCard({ booth, product, position, rotation = [0, 0, 0], accent = false, onSelectProduct }) {
  return (
    <RoundedBox
      args={[0.74, 1.06, 0.035]}
      radius={0.018}
      smoothness={2}
      position={position}
      rotation={rotation}
      castShadow
      onClick={(event) => {
        event.stopPropagation()
        onSelectProduct(product.id)
      }}
    >
      <meshStandardMaterial
        color={accent ? booth.accent : '#eee9dd'}
        roughness={0.88}
      />
      <Edges color={accent ? '#7c694e' : '#b8b1a4'} threshold={16} />
      <group position={[0, 0, 0.021]}>
        <mesh position={[0, 0.33, 0]}>
          <planeGeometry args={[0.48, 0.055]} />
          <meshBasicMaterial color={accent ? '#eee7db' : booth.accent} />
        </mesh>
        <mesh position={[-0.13, -0.25, 0]}>
          <planeGeometry args={[0.14, 0.14]} />
          <meshBasicMaterial color={booth.secondary} />
        </mesh>
        <mesh position={[0.11, -0.2, 0]}>
          <planeGeometry args={[0.22, 0.024]} />
          <meshBasicMaterial color="#8d887f" />
        </mesh>
        <mesh position={[0.11, -0.26, 0]}>
          <planeGeometry args={[0.22, 0.018]} />
          <meshBasicMaterial color="#b5b0a7" />
        </mesh>
      </group>
    </RoundedBox>
  )
}

function PaperStack({ position, color = '#e6e0d4', size = [0.95, 0.24, 0.72], layers = 7 }) {
  return (
    <group position={position}>
      {Array.from({ length: layers }).map((_, index) => (
        <mesh
          key={index}
          position={[(index % 2) * 0.012, index * 0.025, (index % 3) * 0.008]}
          rotation={[0, (index - layers / 2) * 0.003, 0]}
          castShadow
        >
          <boxGeometry args={[size[0], 0.021, size[2]]} />
          <meshStandardMaterial color={index === layers - 1 ? color : '#ddd7ca'} roughness={0.94} />
        </mesh>
      ))}
    </group>
  )
}

function Roll({ booth, position, rotation = [Math.PI / 2, 0, 0], radius = 0.37, length = 0.74, onSelectProduct, product }) {
  return (
    <group
      position={position}
      rotation={rotation}
      onClick={(event) => {
        event.stopPropagation()
        if (product) onSelectProduct(product.id)
      }}
    >
      <mesh castShadow>
        <cylinderGeometry args={[radius, radius, length, 40, 1, false]} />
        <meshStandardMaterial color="#c9b18a" roughness={0.92} />
      </mesh>
      <mesh position={[0, length / 2 + 0.008, 0]}>
        <cylinderGeometry args={[radius * 0.28, radius * 0.28, 0.018, 28]} />
        <meshStandardMaterial color={booth.accent} roughness={0.7} />
      </mesh>
      <mesh position={[0, length / 2 + 0.019, 0]}>
        <cylinderGeometry args={[radius * 0.09, radius * 0.09, 0.02, 24]} />
        <meshStandardMaterial color="#3c3a35" roughness={0.82} />
      </mesh>
    </group>
  )
}

function AtlasInterior({ booth, onSelectProduct }) {
  return (
    <group>
      <RoundedBox args={[3.65, 0.2, 1.25]} radius={0.045} smoothness={3} position={[0, 0.72, 0.65]} castShadow>
        <meshStandardMaterial color="#aa8b66" roughness={0.68} />
      </RoundedBox>
      {[-1.45, 1.45].map((x) => (
        <mesh key={x} position={[x, 0.36, 0.65]} castShadow>
          <boxGeometry args={[0.12, 0.7, 0.96]} />
          <meshStandardMaterial color="#6b6257" roughness={0.72} />
        </mesh>
      ))}

      <group position={[0, 1.37, 0.64]} rotation={[-0.1, 0, 0]}>
        {[-1.18, -0.59, 0, 0.59, 1.18].map((x, index) => (
          <SampleCard
            key={x}
            booth={booth}
            product={booth.products[index % booth.products.length]}
            position={[x, Math.abs(index - 2) * 0.025, -Math.abs(index - 2) * 0.04]}
            rotation={[0, (index - 2) * 0.055, (index - 2) * 0.018]}
            accent={index === 2}
            onSelectProduct={onSelectProduct}
          />
        ))}
      </group>

      <PaperStack position={[-1.9, 0.82, -0.55]} color="#d6b678" />
      <PaperStack position={[1.8, 0.82, -0.65]} color="#d9d4c9" size={[1.05, 0.22, 0.72]} layers={6} />

      {[-1.95, -0.98, 0, 0.98, 1.95].map((x, index) => (
        <mesh key={x} position={[x, 1.6, -2.14]} castShadow>
          <boxGeometry args={[0.04, 1.0 + (index % 2) * 0.18, 0.05]} />
          <meshStandardMaterial color={index % 2 ? booth.secondary : booth.accent} roughness={0.82} />
        </mesh>
      ))}
    </group>
  )
}

function PackLabInterior({ booth, onSelectProduct }) {
  return (
    <group>
      <group position={[0, 1.25, -0.65]}>
        <Extrusion position={[-2.1, 0, 0]} scale={[0.055, 1.25, 0.72]} color="#555b59" />
        <Extrusion position={[2.1, 0, 0]} scale={[0.055, 1.25, 0.72]} color="#555b59" />
        <Extrusion position={[0, -1.12, 0]} scale={[2.14, 0.055, 0.72]} color="#555b59" />
        <Extrusion position={[0, 1.12, 0]} scale={[2.14, 0.055, 0.72]} color="#555b59" />
        {[-1.32, 0, 1.32].map((x, index) => (
          <Roll
            key={x}
            booth={booth}
            position={[x, 0.03 + (index % 2) * 0.06, 0.02]}
            radius={0.42}
            length={0.78}
            product={booth.products[index]}
            onSelectProduct={onSelectProduct}
          />
        ))}
      </group>

      <group position={[0, 0.55, 1.02]}>
        {[
          [-1.55, 0.8, 0.7],
          [-0.55, 0.68, 0.92],
          [0.5, 0.86, 0.62],
          [1.52, 0.74, 0.76],
        ].map(([x, w, h], index) => (
          <RoundedBox key={x} args={[w, h, 0.72]} radius={0.02} smoothness={2} position={[x, h / 2, 0]} castShadow>
            <meshStandardMaterial color={index === 2 ? '#8a6945' : '#9b7951'} roughness={0.96} />
            <Edges color="#6d543a" threshold={14} />
            <mesh position={[0, 0.02, 0.365]}>
              <planeGeometry args={[w * 0.58, Math.min(0.16, h * 0.22)]} />
              <meshBasicMaterial color={index === 2 ? booth.accent : '#d8c497'} />
            </mesh>
          </RoundedBox>
        ))}
      </group>
    </group>
  )
}

function ChromaInterior({ booth, onSelectProduct }) {
  const palette = ['#7b302e', '#bc6d42', '#d0a44a', '#827f4d', '#3d6764', '#3f566d', '#685067', '#b7a38a']
  return (
    <group>
      <group position={[0, 2.0, -2.13]}>
        {palette.map((color, index) => {
          const col = index % 4
          const row = Math.floor(index / 4)
          return (
            <mesh
              key={color}
              position={[(col - 1.5) * 0.82, 0.48 - row * 1.02, 0]}
              rotation={[0, 0, (index - 3.5) * 0.003]}
              castShadow
            >
              <boxGeometry args={[0.72, 0.9, 0.045]} />
              <meshStandardMaterial color={color} roughness={0.92} />
            </mesh>
          )
        })}
      </group>

      <RoundedBox args={[2.8, 0.18, 1.55]} radius={0.04} smoothness={3} position={[0, 0.72, 0.82]} castShadow>
        <meshStandardMaterial color="#d8d4ca" roughness={0.88} />
      </RoundedBox>
      <group position={[0, 1.18, 0.82]}>
        {[-0.78, 0, 0.78].map((x, index) => (
          <SampleCard
            key={x}
            booth={booth}
            product={booth.products[index]}
            position={[x, 0, 0]}
            rotation={[0, (index - 1) * 0.05, 0]}
            accent={index === 1}
            onSelectProduct={onSelectProduct}
          />
        ))}
      </group>
    </group>
  )
}

function CirculaInterior({ booth, onSelectProduct }) {
  return (
    <group>
      <PaperStack position={[-1.55, 0.28, -0.6]} color="#a4a28d" size={[1.4, 0.3, 1.1]} layers={11} />
      <PaperStack position={[0.1, 0.28, -0.85]} color="#b3a17c" size={[1.25, 0.3, 0.95]} layers={9} />
      <PaperStack position={[1.55, 0.28, -0.55]} color="#8e927e" size={[1.18, 0.3, 1.08]} layers={10} />

      <group position={[0, 1.18, 0.86]}>
        {[-1.25, 0, 1.25].map((x, index) => (
          <Roll
            key={x}
            booth={booth}
            position={[x, 0, 0]}
            rotation={[Math.PI / 2, 0, index * 0.05]}
            radius={0.34 + index * 0.03}
            length={0.64}
            product={booth.products[index]}
            onSelectProduct={onSelectProduct}
          />
        ))}
      </group>

      {[-2.05, 2.05].map((x, index) => (
        <mesh key={x} position={[x, 1.85, -1.75]} rotation={[0, 0, index ? -0.025 : 0.03]} castShadow>
          <boxGeometry args={[0.82, 1.45, 0.08]} />
          <meshStandardMaterial color={index ? '#8a856f' : '#a69b7f'} roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

function BoothInterior({ booth, onSelectProduct }) {
  if (booth.id === 'atlas') return <AtlasInterior booth={booth} onSelectProduct={onSelectProduct} />
  if (booth.id === 'packlab') return <PackLabInterior booth={booth} onSelectProduct={onSelectProduct} />
  if (booth.id === 'chroma') return <ChromaInterior booth={booth} onSelectProduct={onSelectProduct} />
  return <CirculaInterior booth={booth} onSelectProduct={onSelectProduct} />
}

export default function Booth({ booth, position, rotation, active, onSelect, onSelectProduct }) {
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(booth.id)
      }}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      <BoothShell booth={booth} active={active} />
      <BoothInterior booth={booth} onSelectProduct={onSelectProduct} />

      {active && (
        <mesh position={[0, 0.035, 2.1]}>
          <boxGeometry args={[2.2, 0.018, 0.045]} />
          <meshStandardMaterial color={booth.accent} emissive={booth.accent} emissiveIntensity={0.7} toneMapped={false} />
        </mesh>
      )}
    </group>
  )
}
