import { useMemo, useState } from 'react'
import { Instance, Instances, RoundedBox } from '@react-three/drei'

function PaperStacks({ accent }) {
  const stacks = useMemo(
    () => [
      [-1.25, 0.62, 0.58, 0.0],
      [-0.55, 0.64, 0.52, 0.05],
      [0.2, 0.66, 0.55, -0.03],
      [0.92, 0.64, 0.5, 0.04],
      [1.45, 0.61, 0.45, -0.02],
    ],
    [],
  )

  return (
    <Instances limit={20} range={20} castShadow receiveShadow>
      <boxGeometry args={[0.52, 0.035, 0.7]} />
      <meshStandardMaterial color="#f5efe5" roughness={0.72} />
      {stacks.flatMap(([x, y, z, r], stackIndex) =>
        Array.from({ length: 4 }, (_, layer) => (
          <Instance
            key={`${stackIndex}-${layer}`}
            position={[x, y + layer * 0.042, z]}
            rotation={[0, r + layer * 0.008, 0]}
            color={layer === 3 ? accent : '#f5efe5'}
          />
        )),
      )}
    </Instances>
  )
}

function RollRack({ accent }) {
  const rolls = useMemo(
    () => [
      [-1.2, 0.83, 0.55],
      [-0.35, 0.83, 0.55],
      [0.55, 0.83, 0.55],
      [1.35, 0.83, 0.55],
    ],
    [],
  )

  return (
    <group>
      {rolls.map((position, index) => (
        <group key={position[0]} position={position}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.34, 0.34, 0.68, 24]} />
            <meshStandardMaterial
              color={index % 2 ? '#d9c4a0' : '#b99566'}
              roughness={0.78}
            />
          </mesh>
          <mesh position={[0, 0, -0.355]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 0.01, 20]} />
            <meshStandardMaterial color={accent} roughness={0.35} metalness={0.25} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Shelf({ x = 0, width = 3.7 }) {
  return (
    <group position={[x, 0, 0.63]}>
      <mesh position={[0, 0.53, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.12, 1.15]} />
        <meshStandardMaterial color="#171a1f" roughness={0.4} metalness={0.3} />
      </mesh>
      {[-width / 2 + 0.12, width / 2 - 0.12].map((leg) => (
        <mesh key={leg} position={[leg, 0.22, 0]} castShadow>
          <boxGeometry args={[0.1, 0.62, 0.85]} />
          <meshStandardMaterial color="#101216" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export default function Booth({ booth, position, active, onSelect, onSelectProduct }) {
  const [hovered, setHovered] = useState(false)
  const isAtlas = booth.id === 'atlas'
  const glow = active || hovered ? booth.accent : '#262a31'

  return (
    <group
      position={position}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(booth.id)
      }}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'default'
      }}
    >
      <RoundedBox args={[6.6, 0.22, 5.2]} radius={0.12} smoothness={3} position={[0, 0.05, 0]} receiveShadow>
        <meshStandardMaterial color="#111419" roughness={0.5} metalness={0.25} />
      </RoundedBox>

      <RoundedBox args={[6.25, 3.25, 0.18]} radius={0.12} smoothness={3} position={[0, 1.68, -2.23]} castShadow receiveShadow>
        <meshStandardMaterial color={isAtlas ? '#2a201b' : '#13201f'} roughness={0.68} />
      </RoundedBox>

      <mesh position={[0, 3.15, -2.02]} castShadow>
        <boxGeometry args={[4.45, 0.34, 0.24]} />
        <meshStandardMaterial color="#111319" roughness={0.38} metalness={0.42} />
      </mesh>
      <mesh position={[0, 3.15, -1.88]}>
        <boxGeometry args={[3.92, 0.075, 0.04]} />
        <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={active ? 2.2 : hovered ? 1.35 : 0.4} toneMapped={false} />
      </mesh>

      <Shelf />
      {isAtlas ? <PaperStacks accent={booth.accent} /> : <RollRack accent={booth.accent} />}

      {isAtlas ? (
        <group position={[0, 0, -0.5]}>
          {[-1.38, -0.69, 0, 0.69, 1.38].map((x, index) => (
            <mesh
              key={x}
              position={[x, 1.4 + index * 0.01, -1.52]}
              rotation={[0, 0, (index - 2) * 0.035]}
              castShadow
              onClick={(event) => {
                event.stopPropagation()
                onSelect(booth.id)
                onSelectProduct(booth.products[index % booth.products.length].id)
              }}
            >
              <boxGeometry args={[0.56, 0.78, 0.035]} />
              <meshStandardMaterial color={index === 2 ? booth.accent : '#eee7dc'} roughness={0.7} />
            </mesh>
          ))}
        </group>
      ) : (
        <group position={[0, 0.54, -1.23]}>
          {[-1.4, -0.45, 0.5, 1.45].map((x, index) => (
            <RoundedBox
              key={x}
              args={[0.78, 0.72 + index * 0.08, 0.62]}
              radius={0.04}
              smoothness={2}
              position={[x, 0.34 + index * 0.04, 0]}
              castShadow
              onClick={(event) => {
                event.stopPropagation()
                onSelect(booth.id)
                onSelectProduct(booth.products[index % booth.products.length].id)
              }}
            >
              <meshStandardMaterial color={index === 1 ? booth.accent : '#92704f'} roughness={0.82} />
            </RoundedBox>
          ))}
        </group>
      )}

      <mesh position={[-2.72, 1.28, -1.94]}>
        <boxGeometry args={[0.06, 2.1, 0.08]} />
        <meshStandardMaterial color={booth.accent} emissive={booth.accent} emissiveIntensity={active ? 1.8 : 0.55} toneMapped={false} />
      </mesh>
      <mesh position={[2.72, 1.28, -1.94]}>
        <boxGeometry args={[0.06, 2.1, 0.08]} />
        <meshStandardMaterial color={booth.accent} emissive={booth.accent} emissiveIntensity={active ? 1.8 : 0.55} toneMapped={false} />
      </mesh>
    </group>
  )
}
