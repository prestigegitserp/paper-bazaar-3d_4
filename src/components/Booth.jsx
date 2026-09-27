import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Edges,
  Float,
  MeshTransmissionMaterial,
  RoundedBox,
  Sparkles,
  useCursor,
} from '@react-three/drei'
import * as THREE from 'three'

function GlowBar({ position, scale, color, intensity = 2.6 }) {
  return (
    <mesh position={position} scale={scale}>
      <boxGeometry />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={intensity}
        toneMapped={false}
      />
    </mesh>
  )
}

function PaperRibbon({ color, position, mirrored = false, phase = 0 }) {
  const ref = useRef()

  const geometry = useMemo(() => {
    const direction = mirrored ? -1 : 1
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.55 * direction, -0.25, 0),
      new THREE.Vector3(-0.95 * direction, 0.65, 0.25),
      new THREE.Vector3(-0.15 * direction, 0.05, -0.25),
      new THREE.Vector3(0.7 * direction, 0.92, 0.14),
      new THREE.Vector3(1.55 * direction, 0.18, 0),
    ])
    return new THREE.TubeGeometry(curve, 96, 0.055, 10, false)
  }, [mirrored])

  useFrame(({ clock }, delta) => {
    if (!ref.current) return
    const time = clock.elapsedTime * 0.55 + phase
    ref.current.rotation.z = THREE.MathUtils.damp(
      ref.current.rotation.z,
      Math.sin(time) * 0.035,
      3,
      delta,
    )
    ref.current.rotation.y = THREE.MathUtils.damp(
      ref.current.rotation.y,
      Math.cos(time * 0.7) * 0.05,
      3,
      delta,
    )
  })

  return (
    <group ref={ref} position={position}>
      <mesh geometry={geometry} castShadow>
        <meshPhysicalMaterial
          color={color}
          roughness={0.22}
          metalness={0.03}
          clearcoat={0.75}
          clearcoatRoughness={0.18}
          emissive={color}
          emissiveIntensity={0.035}
        />
      </mesh>
    </group>
  )
}

function GlassBackdrop({ tint }) {
  return (
    <RoundedBox
      args={[5.72, 3.55, 0.12]}
      radius={0.14}
      smoothness={5}
      position={[0, 2.02, -2.12]}
      castShadow
    >
      <MeshTransmissionMaterial
        samples={4}
        resolution={256}
        transmission={0.94}
        roughness={0.18}
        thickness={0.45}
        ior={1.25}
        chromaticAberration={0.018}
        anisotropy={0.08}
        distortion={0.04}
        distortionScale={0.12}
        temporalDistortion={0.02}
        attenuationDistance={1.8}
        attenuationColor={tint}
        color={tint}
      />
      <Edges color={tint} threshold={12} />
    </RoundedBox>
  )
}

function StructuralFrame({ accent }) {
  const columns = [-2.72, 2.72]
  return (
    <group>
      {columns.map((x) => (
        <RoundedBox
          key={x}
          args={[0.12, 3.85, 0.18]}
          radius={0.035}
          smoothness={3}
          position={[x, 1.95, -1.92]}
          castShadow
        >
          <meshStandardMaterial color="#22272e" roughness={0.32} metalness={0.72} />
        </RoundedBox>
      ))}
      <RoundedBox
        args={[5.56, 0.12, 0.18]}
        radius={0.035}
        smoothness={3}
        position={[0, 3.82, -1.92]}
        castShadow
      >
        <meshStandardMaterial color="#22272e" roughness={0.32} metalness={0.72} />
      </RoundedBox>
      <GlowBar position={[0, 3.68, -1.78]} scale={[2.22, 0.025, 0.025]} color={accent} intensity={3.2} />
    </group>
  )
}

function AtlasDisplay({ booth, onSelectProduct }) {
  const fan = [-2, -1, 0, 1, 2, 3, 4]

  return (
    <group>
      <RoundedBox
        args={[3.9, 0.26, 1.45]}
        radius={0.09}
        smoothness={4}
        position={[0, 0.62, 0.22]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#17191c" roughness={0.34} metalness={0.35} />
      </RoundedBox>

      <group position={[-0.2, 1.18, 0.08]} rotation={[-0.08, 0, 0]}>
        {fan.map((slot, index) => {
          const x = slot * 0.38
          const rotation = (slot - 1) * 0.065
          const product = booth.products[index % booth.products.length]
          return (
            <RoundedBox
              key={slot}
              args={[0.72, 1.18 + (index % 2) * 0.1, 0.035]}
              radius={0.025}
              smoothness={3}
              position={[x, Math.abs(slot - 1) * 0.02, -Math.abs(slot - 1) * 0.055]}
              rotation={[0, rotation, (slot - 1) * 0.028]}
              castShadow
              onClick={(event) => {
                event.stopPropagation()
                onSelectProduct(product.id)
              }}
            >
              <meshPhysicalMaterial
                color={index === 3 ? booth.accent : index % 2 ? '#efe7d7' : '#f7f0e6'}
                roughness={0.62}
                clearcoat={0.08}
              />
              <Edges color={index === 3 ? '#fff2d8' : '#cdbfa8'} threshold={18} />
              <group position={[0, 0, 0.023]}>
                <mesh position={[0, 0.31, 0]}>
                  <planeGeometry args={[0.42, 0.035]} />
                  <meshBasicMaterial color={index === 3 ? '#24180f' : booth.accent} toneMapped={false} />
                </mesh>
                <mesh position={[-0.13, -0.26, 0]}>
                  <planeGeometry args={[0.14, 0.14]} />
                  <meshBasicMaterial color={index % 2 ? '#27221d' : booth.secondary} toneMapped={false} />
                </mesh>
                <mesh position={[0.11, -0.22, 0]}>
                  <planeGeometry args={[0.21, 0.025]} />
                  <meshBasicMaterial color="#8f8172" />
                </mesh>
                <mesh position={[0.11, -0.28, 0]}>
                  <planeGeometry args={[0.21, 0.018]} />
                  <meshBasicMaterial color="#b5a898" />
                </mesh>
              </group>
            </RoundedBox>
          )
        })}
      </group>

      <group position={[-1.55, 0.92, 1.02]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0, i * 0.07, 0]} rotation={[0, i * 0.035, 0]} castShadow>
            <boxGeometry args={[1.05, 0.055, 0.72]} />
            <meshStandardMaterial color={i === 3 ? '#d0a76b' : '#e7dfd0'} roughness={0.78} />
          </mesh>
        ))}
      </group>

      <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.16}>
        <group position={[1.62, 2.0, 0.28]}>
          <PaperRibbon color={booth.accent} position={[0, 0, 0]} phase={0.2} />
          <PaperRibbon color="#f4e4c6" position={[0.08, -0.28, -0.22]} mirrored phase={1.1} />
        </group>
      </Float>
    </group>
  )
}

function PackLabDisplay({ booth, onSelectProduct }) {
  return (
    <group>
      <RoundedBox
        args={[4.15, 0.24, 1.52]}
        radius={0.08}
        smoothness={4}
        position={[0, 0.59, 0.18]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#11161a" roughness={0.28} metalness={0.48} />
      </RoundedBox>

      <group position={[-0.32, 1.35, 0.1]}>
        {[-1.35, -0.45, 0.45, 1.35].map((x, index) => {
          const product = booth.products[index % booth.products.length]
          return (
            <group
              key={x}
              position={[x, index % 2 ? 0.06 : 0, 0]}
              onClick={(event) => {
                event.stopPropagation()
                onSelectProduct(product.id)
              }}
            >
              <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.39, 0.39, 0.72, 36, 1, false]} />
                <meshStandardMaterial
                  color={index === 1 ? booth.accent : index % 2 ? '#ad8657' : '#ccb487'}
                  roughness={0.78}
                />
              </mesh>
              <mesh position={[0, 0, 0.37]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.12, 0.12, 0.012, 24]} />
                <meshStandardMaterial
                  color={booth.secondary}
                  emissive={booth.secondary}
                  emissiveIntensity={index === 1 ? 0.85 : 0.16}
                  toneMapped={false}
                />
              </mesh>
            </group>
          )
        })}
      </group>

      <group position={[0.1, 0.98, 1.08]}>
        {[[-1.42, 0.0, 0.84, 0.62], [-0.48, 0.0, 0.7, 0.84], [0.48, 0.0, 0.82, 0.54], [1.42, 0.0, 0.72, 0.72]].map(
          ([x, z, w, h], index) => (
            <RoundedBox
              key={x}
              args={[w, h, 0.68]}
              radius={0.035}
              smoothness={3}
              position={[x, h / 2, z]}
              rotation={[0, (index - 1.5) * 0.035, 0]}
              castShadow
            >
              <meshStandardMaterial color={index === 2 ? '#6e563b' : '#866847'} roughness={0.86} />
              <Edges color="#b8996b" threshold={18} />
              <group position={[0, 0, 0.345]}>
                <mesh position={[0, 0.07, 0]}>
                  <planeGeometry args={[w * 0.54, Math.min(0.15, h * 0.22)]} />
                  <meshBasicMaterial color={index === 2 ? booth.accent : '#e6d3a9'} toneMapped={false} />
                </mesh>
                <mesh position={[0, -0.08, 0.002]}>
                  <planeGeometry args={[w * 0.38, 0.025]} />
                  <meshBasicMaterial color="#2c251d" />
                </mesh>
                {[-0.08, -0.04, 0, 0.04, 0.08].map((offset) => (
                  <mesh key={offset} position={[offset, -0.15, 0.003]}>
                    <planeGeometry args={[0.012, 0.065]} />
                    <meshBasicMaterial color="#3b3025" />
                  </mesh>
                ))}
              </group>
            </RoundedBox>
          ),
        )}
      </group>

      <Float speed={1.35} rotationIntensity={0.12} floatIntensity={0.2}>
        <mesh position={[1.62, 2.42, 0.18]} rotation={[Math.PI / 2.5, 0.25, 0.2]} castShadow>
          <torusGeometry args={[0.72, 0.085, 18, 72]} />
          <meshPhysicalMaterial
            color={booth.accent}
            roughness={0.24}
            metalness={0.14}
            clearcoat={0.7}
            emissive={booth.accent}
            emissiveIntensity={0.12}
          />
        </mesh>
      </Float>
    </group>
  )
}

export default function Booth({ booth, position, active, onSelect, onSelectProduct }) {
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

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
      }}
      onPointerOut={() => setHovered(false)}
    >
      <RoundedBox
        args={[6.35, 0.18, 5.0]}
        radius={0.08}
        smoothness={4}
        position={[0, 0.05, 0]}
        receiveShadow
      >
        <meshStandardMaterial color={active ? '#151a20' : '#101318'} roughness={0.52} metalness={0.3} />
      </RoundedBox>

      <GlassBackdrop tint={booth.id === 'atlas' ? '#6b5545' : '#245160'} />
      <StructuralFrame accent={booth.accent} />

      <GlowBar position={[-2.86, 1.93, -1.86]} scale={[0.025, 1.15, 0.025]} color={booth.accent} intensity={active ? 4 : 1.4} />
      <GlowBar position={[2.86, 1.93, -1.86]} scale={[0.025, 1.15, 0.025]} color={booth.secondary} intensity={active ? 3.4 : 1.2} />

      {booth.id === 'atlas' ? (
        <AtlasDisplay booth={booth} onSelectProduct={onSelectProduct} />
      ) : (
        <PackLabDisplay booth={booth} onSelectProduct={onSelectProduct} />
      )}

      <Sparkles
        count={active ? 34 : 18}
        scale={[5.7, 3.3, 3.6]}
        position={[0, 1.9, 0]}
        size={active ? 2.2 : 1.2}
        speed={0.16}
        opacity={active ? 0.34 : 0.14}
        color={booth.accent}
      />
    </group>
  )
}
