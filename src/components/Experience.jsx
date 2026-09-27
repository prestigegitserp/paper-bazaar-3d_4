import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Environment,
  Lightformer,
  PerformanceMonitor,
  PointerLockControls,
} from '@react-three/drei'
import {
  EffectComposer,
  N8AO,
  Noise,
  SMAA,
  Vignette,
} from '@react-three/postprocessing'
import {
  ACESFilmicToneMapping,
  CanvasTexture,
  Color,
  MathUtils,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
} from 'three'
import Booth from './Booth.jsx'
import { booths } from '../data/booths.js'

const EYE_HEIGHT = 1.68
const HALL_X = 7.55
const HALL_Z_MIN = -17.1
const HALL_Z_MAX = 17.1
const AISLE_HALF = 2.42

function seeded(seed) {
  let value = seed >>> 0
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

function useConcreteTextures() {
  const procedural = useMemo(() => {
    const colorCanvas = document.createElement('canvas')
    const roughCanvas = document.createElement('canvas')
    colorCanvas.width = colorCanvas.height = 512
    roughCanvas.width = roughCanvas.height = 512

    const colorCtx = colorCanvas.getContext('2d')
    const roughCtx = roughCanvas.getContext('2d')
    const random = seeded(92831)

    colorCtx.fillStyle = '#777774'
    colorCtx.fillRect(0, 0, 512, 512)
    roughCtx.fillStyle = '#d7d7d7'
    roughCtx.fillRect(0, 0, 512, 512)

    for (let i = 0; i < 9000; i += 1) {
      const x = random() * 512
      const y = random() * 512
      const radius = 0.4 + random() * 2.4
      const light = 92 + Math.floor(random() * 52)
      colorCtx.fillStyle = `rgba(${light},${light},${Math.max(70, light - 4)},${0.025 + random() * 0.085})`
      colorCtx.beginPath()
      colorCtx.arc(x, y, radius, 0, Math.PI * 2)
      colorCtx.fill()

      const rough = 160 + Math.floor(random() * 80)
      roughCtx.fillStyle = `rgba(${rough},${rough},${rough},${0.08 + random() * 0.24})`
      roughCtx.fillRect(x, y, 1 + random() * 2.2, 1 + random() * 2.2)
    }

    colorCtx.strokeStyle = 'rgba(35,35,33,.11)'
    colorCtx.lineWidth = 1
    for (let i = 0; i < 14; i += 1) {
      const x = random() * 512
      const y = random() * 512
      colorCtx.beginPath()
      colorCtx.moveTo(x, y)
      for (let p = 0; p < 8; p += 1) {
        colorCtx.lineTo(x + p * 9 + random() * 8, y + (random() - 0.5) * 16)
      }
      colorCtx.stroke()
    }

    const map = new CanvasTexture(colorCanvas)
    map.wrapS = map.wrapT = RepeatWrapping
    map.repeat.set(8, 18)
    map.colorSpace = SRGBColorSpace

    const roughnessMap = new CanvasTexture(roughCanvas)
    roughnessMap.wrapS = roughnessMap.wrapT = RepeatWrapping
    roughnessMap.repeat.set(8, 18)

    return { map, roughnessMap, normalMap: null, source: 'procedural' }
  }, [])

  const [textures, setTextures] = useState(procedural)

  useEffect(() => {
    let cancelled = false
    const loader = new TextureLoader()
    loader.setCrossOrigin('anonymous')

    const base = 'https://cdn.polyhaven.com/asset_img/map_previews/hangar_concrete_floor/'
    const query = '?height=768&quality=92&width=768'
    const urls = [
      `${base}hangar_concrete_floor_diff_1k.jpg${query}`,
      `${base}hangar_concrete_floor_nor_gl_1k.jpg${query}`,
      `${base}hangar_concrete_floor_rough_1k.jpg${query}`,
    ]

    Promise.all(urls.map((url) => loader.loadAsync(url)))
      .then(([map, normalMap, roughnessMap]) => {
        if (cancelled) return
        for (const texture of [map, normalMap, roughnessMap]) {
          texture.wrapS = texture.wrapT = RepeatWrapping
          texture.repeat.set(8, 18)
          texture.anisotropy = 4
          texture.needsUpdate = true
        }
        map.colorSpace = SRGBColorSpace
        setTextures({ map, normalMap, roughnessMap, source: 'polyhaven-cc0' })
      })
      .catch(() => {
        if (!cancelled) setTextures(procedural)
      })

    return () => {
      cancelled = true
    }
  }, [procedural])

  return textures
}

function isBoothRow(z) {
  return Math.abs(z - 6) < 3.05 || Math.abs(z + 6) < 3.05
}

function clampWalkPosition(position, previous) {
  position.z = MathUtils.clamp(position.z, HALL_Z_MIN, HALL_Z_MAX)

  const inEntranceLobby = position.z > 10.2
  const outsideAisle = Math.abs(position.x) > AISLE_HALF

  if (outsideAisle && !isBoothRow(position.z) && !inEntranceLobby) {
    position.z = previous.z
  }

  const permittedX = isBoothRow(position.z) || inEntranceLobby ? HALL_X : AISLE_HALF
  position.x = MathUtils.clamp(position.x, -permittedX, permittedX)

  if (isBoothRow(position.z) && Math.abs(position.x) > 2.6) {
    position.x = MathUtils.clamp(position.x, -7.05, 7.05)
  }
}

function WalkController({ enabled }) {
  const { camera } = useThree()
  const keys = useRef(new Set())
  const velocity = useRef(new Vector3())
  const forward = useRef(new Vector3())
  const right = useRef(new Vector3())
  const elapsedWalk = useRef(0)

  useEffect(() => {
    const down = (event) => keys.current.add(event.code)
    const up = (event) => keys.current.delete(event.code)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useFrame((_, delta) => {
    if (!enabled) {
      velocity.current.multiplyScalar(0)
      camera.position.y = MathUtils.damp(camera.position.y, EYE_HEIGHT, 12, delta)
      return
    }

    const movingForward = Number(keys.current.has('KeyW') || keys.current.has('ArrowUp')) - Number(keys.current.has('KeyS') || keys.current.has('ArrowDown'))
    const movingSide = Number(keys.current.has('KeyD') || keys.current.has('ArrowRight')) - Number(keys.current.has('KeyA') || keys.current.has('ArrowLeft'))
    const moving = movingForward !== 0 || movingSide !== 0
    const speed = keys.current.has('ShiftLeft') || keys.current.has('ShiftRight') ? 3.2 : 1.65

    camera.getWorldDirection(forward.current)
    forward.current.y = 0
    forward.current.normalize()
    right.current.crossVectors(forward.current, camera.up).normalize()

    const desired = new Vector3()
      .addScaledVector(forward.current, movingForward)
      .addScaledVector(right.current, movingSide)

    if (desired.lengthSq() > 0) desired.normalize().multiplyScalar(speed)

    velocity.current.lerp(desired, 1 - Math.exp(-delta * 12))
    const previous = camera.position.clone()
    camera.position.addScaledVector(velocity.current, delta)
    clampWalkPosition(camera.position, previous)

    if (moving) elapsedWalk.current += delta * speed
    const bob = moving ? Math.sin(elapsedWalk.current * 6.4) * 0.014 : 0
    camera.position.y = MathUtils.damp(camera.position.y, EYE_HEIGHT + bob, 16, delta)
  })

  return null
}

function ScanResidue({ quality }) {
  const positions = useMemo(() => {
    const count = quality === 'high' ? 1800 : 700
    const data = new Float32Array(count * 3)
    const random = seeded(18377)

    for (let i = 0; i < count; i += 1) {
      const surface = Math.floor(random() * 4)
      let x = (random() - 0.5) * 15.6
      let y = 0.03 + random() * 5.05
      let z = -17 + random() * 34

      if (surface === 0) x = -7.82 + (random() - 0.5) * 0.045
      if (surface === 1) x = 7.82 + (random() - 0.5) * 0.045
      if (surface === 2) y = 0.015 + random() * 0.028
      if (surface === 3) y = 5.18 + (random() - 0.5) * 0.04

      data[i * 3] = x
      data[i * 3 + 1] = y
      data[i * 3 + 2] = z
    }
    return data
  }, [quality])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.018} color="#c8cbc8" transparent opacity={0.09} depthWrite={false} />
    </points>
  )
}

function CeilingGrid() {
  const zRows = [-14, -10, -6, -2, 2, 6, 10, 14]
  return (
    <group>
      <mesh position={[0, 5.24, 0]} receiveShadow>
        <boxGeometry args={[16.2, 0.18, 35.6]} />
        <meshStandardMaterial color="#4e504d" roughness={0.92} />
      </mesh>

      {zRows.map((z, index) => (
        <group key={z}>
          <mesh position={[0, 5.1, z]}>
            <boxGeometry args={[4.9, 0.035, 0.48]} />
            <meshStandardMaterial color="#ddd8cd" emissive="#fff8e6" emissiveIntensity={1.45} toneMapped={false} />
          </mesh>
          <pointLight
            position={[0, 4.72, z]}
            color={index % 3 === 0 ? '#fff0d5' : '#fff8e8'}
            intensity={19}
            distance={8.5}
            decay={2}
          />
        </group>
      ))}

      {[-5.8, 5.8].map((x) => (
        <mesh key={x} position={[x, 4.82, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 34, 18]} />
          <meshStandardMaterial color="#777a76" roughness={0.55} metalness={0.45} />
        </mesh>
      ))}
    </group>
  )
}

function UtilityDetails() {
  const seams = [-14, -10, -6, -2, 2, 6, 10, 14]
  const scuffs = [
    [-1.4, 13.1, 0.52, 0.18],
    [1.8, 8.8, 0.36, 0.11],
    [-0.7, 4.3, 0.72, 0.1],
    [1.15, -1.8, 0.48, 0.12],
    [-1.85, -7.4, 0.62, 0.09],
    [0.8, -13.2, 0.42, 0.14],
  ]

  return (
    <group>
      {seams.map((z) => (
        <mesh key={z} position={[0, 0.012, z]}>
          <boxGeometry args={[16.0, 0.008, 0.018]} />
          <meshStandardMaterial color="#686966" roughness={1} />
        </mesh>
      ))}

      {scuffs.map(([x, z, radius, opacity], index) => (
        <mesh key={index} position={[x, 0.018, z]} rotation={[-Math.PI / 2, 0, index * 0.47]}>
          <circleGeometry args={[radius, 36]} />
          <meshBasicMaterial color="#4c4d49" transparent opacity={opacity} depthWrite={false} />
        </mesh>
      ))}

      {[-3.55, 3.55].map((x) => (
        <group key={x}>
          <mesh position={[x, 4.93, 0]} castShadow>
            <boxGeometry args={[0.42, 0.11, 34.2]} />
            <meshStandardMaterial color="#757974" roughness={0.58} metalness={0.38} />
          </mesh>
          {[-12, -4, 4, 12].map((z) => (
            <mesh key={z} position={[x, 4.82, z]}>
              <boxGeometry args={[0.52, 0.13, 0.06]} />
              <meshStandardMaterial color="#535753" roughness={0.68} metalness={0.24} />
            </mesh>
          ))}
        </group>
      ))}

      {[-11.5, -1.5, 8.5].map((z, index) => (
        <group key={z} position={[-7.91, 0.48, z]}>
          <mesh>
            <boxGeometry args={[0.07, 0.18, 0.28]} />
            <meshStandardMaterial color="#d1d0c9" roughness={0.8} />
          </mesh>
          <mesh position={[0.039, 0, -0.055]}>
            <boxGeometry args={[0.008, 0.035, 0.024]} />
            <meshBasicMaterial color="#3e403d" />
          </mesh>
          <mesh position={[0.039, 0, 0.055]}>
            <boxGeometry args={[0.008, 0.035, 0.024]} />
            <meshBasicMaterial color="#3e403d" />
          </mesh>
          {index === 2 && (
            <mesh position={[0.045, 0.21, 0]}>
              <boxGeometry args={[0.015, 0.06, 0.18]} />
              <meshBasicMaterial color="#8a8679" />
            </mesh>
          )}
        </group>
      ))}

      <group position={[7.84, 1.15, 12.8]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.72, 1.05, 0.14]} />
          <meshStandardMaterial color="#a2302c" roughness={0.66} metalness={0.12} />
        </mesh>
        <mesh position={[0, 0, 0.076]}>
          <boxGeometry args={[0.5, 0.78, 0.01]} />
          <meshPhysicalMaterial color="#392b28" transmission={0.28} roughness={0.22} thickness={0.02} />
        </mesh>
      </group>

      <group position={[7.75, 0.58, 11.45]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.12, 0.15, 0.82, 24]} />
          <meshStandardMaterial color="#b83a31" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.47, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.32, 12]} />
          <meshStandardMaterial color="#2f3130" roughness={0.5} metalness={0.4} />
        </mesh>
      </group>

      <group position={[-7.84, 2.35, 13.6]}>
        <mesh castShadow>
          <boxGeometry args={[0.13, 0.82, 0.62]} />
          <meshStandardMaterial color="#b7b7b1" roughness={0.62} metalness={0.24} />
        </mesh>
        <mesh position={[0.071, 0.12, 0]}>
          <boxGeometry args={[0.012, 0.22, 0.35]} />
          <meshBasicMaterial color="#50524f" />
        </mesh>
      </group>
    </group>
  )
}

function HallArchitecture({ textures }) {
  const columns = [-13, -9, -5, -1, 3, 7, 11, 15]
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16.4, 35.8]} />
        <meshStandardMaterial
          map={textures.map}
          roughnessMap={textures.roughnessMap}
          normalMap={textures.normalMap}
          normalScale={[0.46, 0.46]}
          bumpMap={!textures.normalMap ? textures.roughnessMap : null}
          bumpScale={0.018}
          roughness={0.92}
          metalness={0.03}
          color="#aaa9a2"
        />
      </mesh>

      {[-8.05, 8.05].map((x) => (
        <mesh key={x} position={[x, 2.55, 0]} receiveShadow>
          <boxGeometry args={[0.2, 5.1, 35.6]} />
          <meshStandardMaterial color="#8e8f8a" roughness={0.95} />
        </mesh>
      ))}

      <mesh position={[0, 2.55, -17.75]} receiveShadow>
        <boxGeometry args={[16.2, 5.1, 0.2]} />
        <meshStandardMaterial color="#898b87" roughness={0.95} />
      </mesh>

      <mesh position={[0, 2.55, 17.75]} receiveShadow>
        <boxGeometry args={[16.2, 5.1, 0.2]} />
        <meshStandardMaterial color="#8b8c88" roughness={0.96} />
      </mesh>

      {columns.map((z, index) => (
        <group key={z}>
          <mesh position={[-7.62, 2.52, z]} castShadow>
            <boxGeometry args={[0.42, 5.02, 0.42]} />
            <meshStandardMaterial color="#666864" roughness={0.7} metalness={0.14} />
          </mesh>
          <mesh position={[7.62, 2.52, z + (index % 2 ? 0.06 : -0.04)]} castShadow>
            <boxGeometry args={[0.42, 5.02, 0.42]} />
            <meshStandardMaterial color="#666864" roughness={0.7} metalness={0.14} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0.016, 0]}>
        <boxGeometry args={[0.055, 0.018, 34.5]} />
        <meshStandardMaterial color="#a49b83" roughness={0.76} />
      </mesh>

      <CeilingGrid />
      <UtilityDetails />

      <group position={[0, 2.1, -17.58]}>
        <mesh>
          <boxGeometry args={[2.25, 4.15, 0.08]} />
          <meshStandardMaterial color="#505450" roughness={0.62} metalness={0.32} />
        </mesh>
        <mesh position={[0, 2.15, 0.055]}>
          <boxGeometry args={[1.2, 0.22, 0.035]} />
          <meshStandardMaterial color="#3c6b50" emissive="#4e9d6e" emissiveIntensity={1.15} toneMapped={false} />
        </mesh>
      </group>

      <group position={[0, 0.03, 12.4]}>
        {[-1.35, -0.45, 0.45, 1.35].map((x) => (
          <mesh key={x} position={[x, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.035, 4.1]} />
            <meshBasicMaterial color="#e8e0c5" transparent opacity={0.33} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function NeutralEnvironment() {
  return (
    <Environment resolution={96}>
      <Lightformer form="rect" intensity={2.2} color="#f1eadc" position={[0, 4, 9]} rotation={[0, Math.PI, 0]} scale={[7, 5, 1]} />
      <Lightformer form="rect" intensity={1.3} color="#cbd5d0" position={[-8, 2, 0]} rotation={[0, Math.PI / 2, 0]} scale={[5, 12, 1]} />
      <Lightformer form="rect" intensity={1.3} color="#d3d6cf" position={[8, 2, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[5, 12, 1]} />
      <Lightformer form="rect" intensity={1.8} color="#e9e4d8" position={[0, 5, -10]} rotation={[Math.PI / 2, 0, 0]} scale={[7, 7, 1]} />
    </Environment>
  )
}

const boothPlacements = [
  { position: [-5.12, 0.02, 6], rotation: [0, Math.PI / 2, 0] },
  { position: [5.12, 0.02, 6], rotation: [0, -Math.PI / 2, 0] },
  { position: [-5.12, 0.02, -6], rotation: [0, Math.PI / 2, 0] },
  { position: [5.12, 0.02, -6], rotation: [0, -Math.PI / 2, 0] },
]

function Scene({ activeId, quality, setQuality, onSelect, onSelectProduct, walkLocked, setWalkLocked }) {
  const textures = useConcreteTextures()

  return (
    <>
      <color attach="background" args={['#777973']} />
      <fog attach="fog" args={['#777973', 20, 43]} />

      <hemisphereLight intensity={0.75} color="#f7f0df" groundColor="#4c504c" />
      <directionalLight
        castShadow
        position={[-5, 10, 9]}
        intensity={1.25}
        color="#fff5df"
        shadow-mapSize-width={quality === 'high' ? 2048 : 1024}
        shadow-mapSize-height={quality === 'high' ? 2048 : 1024}
        shadow-camera-left={-11}
        shadow-camera-right={11}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.00012}
      />

      <HallArchitecture textures={textures} />
      {booths.map((booth, index) => (
        <Booth
          key={booth.id}
          booth={booth}
          position={boothPlacements[index].position}
          rotation={boothPlacements[index].rotation}
          active={activeId === booth.id}
          onSelect={onSelect}
          onSelectProduct={onSelectProduct}
        />
      ))}

      <ScanResidue quality={quality} />
      <NeutralEnvironment />
      <WalkController enabled={walkLocked} />
      <PointerLockControls
        selector=".walk-trigger"
        pointerSpeed={0.72}
        onLock={() => setWalkLocked(true)}
        onUnlock={() => setWalkLocked(false)}
      />

      <PerformanceMonitor
        flipflops={2}
        onDecline={() => setQuality('low')}
        onIncline={() => setQuality('high')}
      />

      <EffectComposer multisampling={0}>
        {quality === 'high' && <N8AO quality="medium" distanceFalloff={1} aoRadius={0.52} intensity={2.15} />}
        <SMAA />
        {quality === 'high' && <Noise opacity={0.016} />}
        <Vignette eskil={false} offset={0.07} darkness={0.34} />
      </EffectComposer>
    </>
  )
}

export default function Experience({ activeId, onSelect, onSelectProduct, onWalkChange }) {
  const [quality, setQuality] = useState('high')
  const [walkLocked, setWalkLockedState] = useState(false)

  const setWalkLocked = (value) => {
    setWalkLockedState(value)
    onWalkChange?.(value)
  }

  return (
    <Canvas
      className="experience-canvas"
      dpr={quality === 'high' ? [1, 1.45] : [1, 1.05]}
      shadows
      camera={{ position: [0, EYE_HEIGHT, 15.3], fov: 66, near: 0.04, far: 70 }}
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 0.9,
        outputColorSpace: SRGBColorSpace,
      }}
      onCreated={({ camera }) => camera.lookAt(0, EYE_HEIGHT, -7)}
      onPointerMissed={() => {
        if (!walkLocked) onSelect(null)
      }}
    >
      <Scene
        activeId={activeId}
        quality={quality}
        setQuality={setQuality}
        onSelect={onSelect}
        onSelectProduct={onSelectProduct}
        walkLocked={walkLocked}
        setWalkLocked={setWalkLocked}
      />
    </Canvas>
  )
}
