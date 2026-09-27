import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  Environment,
  Lightformer,
  MeshReflectorMaterial,
  PerformanceMonitor,
} from '@react-three/drei'
import {
  Bloom,
  EffectComposer,
  N8AO,
  Noise,
  Vignette,
} from '@react-three/postprocessing'
import {
  ACESFilmicToneMapping,
  MathUtils,
  SRGBColorSpace,
  Vector3,
} from 'three'
import Booth from './Booth.jsx'
import { booths } from '../data/booths.js'

const cameraStates = {
  wide: {
    position: new Vector3(0, 4.8, 12.8),
    target: new Vector3(0, 1.45, -0.45),
    fov: 42,
  },
  atlas: {
    position: new Vector3(-6.9, 3.55, 7.7),
    target: new Vector3(-4.45, 1.58, -0.2),
    fov: 37,
  },
  packlab: {
    position: new Vector3(6.95, 3.6, 7.75),
    target: new Vector3(4.45, 1.55, -0.2),
    fov: 37,
  },
}

function CameraRig({ activeId }) {
  const lookAt = useRef(new Vector3(0, 1.45, -0.45))

  useFrame((state, delta) => {
    const config = cameraStates[activeId] ?? cameraStates.wide
    const pointerX = state.pointer.x * (activeId ? 0.22 : 0.46)
    const pointerY = state.pointer.y * (activeId ? 0.12 : 0.24)

    const destination = config.position.clone()
    destination.x += pointerX
    destination.y += pointerY

    const alpha = 1 - Math.exp(-delta * 2.4)
    state.camera.position.lerp(destination, alpha)
    lookAt.current.lerp(config.target, alpha)

    state.camera.fov = MathUtils.damp(state.camera.fov, config.fov, 3.6, delta)
    state.camera.lookAt(lookAt.current)
    state.camera.updateProjectionMatrix()
  })

  return null
}

function StudioEnvironment() {
  return (
    <Environment resolution={128}>
      <Lightformer
        form="rect"
        intensity={4.5}
        color="#ffe8ca"
        position={[-6, 5, 4]}
        rotation={[0, Math.PI / 3, 0]}
        scale={[4, 7, 1]}
      />
      <Lightformer
        form="rect"
        intensity={5.2}
        color="#b9efff"
        position={[7, 4, 2]}
        rotation={[0, -Math.PI / 2.8, 0]}
        scale={[3, 6, 1]}
      />
      <Lightformer
        form="rect"
        intensity={3.2}
        color="#ffffff"
        position={[0, 8, -1]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[8, 5, 1]}
      />
      <Lightformer
        form="ring"
        intensity={2}
        color="#ffb86b"
        position={[-1, 2.4, -7]}
        rotation={[0, 0, 0]}
        scale={[3.5, 3.5, 1]}
      />
      <Lightformer
        form="ring"
        intensity={1.6}
        color="#6de6ff"
        position={[4, 3.5, -6]}
        scale={[2.8, 2.8, 1]}
      />
    </Environment>
  )
}

function GalleryArchitecture() {
  return (
    <>
      <mesh position={[0, 4.3, -3.0]} receiveShadow>
        <boxGeometry args={[18.5, 0.12, 0.16]} />
        <meshStandardMaterial color="#1d2229" roughness={0.35} metalness={0.72} />
      </mesh>

      {[-8.7, 0, 8.7].map((x) => (
        <mesh key={x} position={[x, 2.2, -3]} castShadow>
          <boxGeometry args={[0.12, 4.3, 0.16]} />
          <meshStandardMaterial color="#1d2229" roughness={0.35} metalness={0.72} />
        </mesh>
      ))}

      <mesh position={[0, 1.1, -5.5]}>
        <planeGeometry args={[28, 9]} />
        <meshStandardMaterial color="#0b0e12" roughness={0.9} />
      </mesh>

      <mesh position={[0, 3.95, -2.88]}>
        <boxGeometry args={[8.8, 0.035, 0.04]} />
        <meshStandardMaterial
          color="#eac691"
          emissive="#eac691"
          emissiveIntensity={2.8}
          toneMapped={false}
        />
      </mesh>

      <mesh position={[0, 0.015, 3.35]}>
        <boxGeometry args={[5.0, 0.025, 0.055]} />
        <meshStandardMaterial
          color="#d9bd86"
          emissive="#d9bd86"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
    </>
  )
}

function ReflectiveFloor({ quality, onReset }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.07, 0]}
      receiveShadow
      onClick={() => onReset(null)}
    >
      <planeGeometry args={[34, 26]} />
      <MeshReflectorMaterial
        resolution={quality === 'high' ? 1024 : 512}
        blur={quality === 'high' ? [420, 95] : [160, 45]}
        mixBlur={1}
        mixStrength={quality === 'high' ? 36 : 16}
        roughness={0.58}
        depthScale={0.7}
        minDepthThreshold={0.25}
        maxDepthThreshold={1.35}
        color="#080a0d"
        metalness={0.62}
        mirror={0.18}
      />
    </mesh>
  )
}

function Scene({ activeId, quality, setQuality, onSelect, onSelectProduct }) {
  return (
    <>
      <color attach="background" args={['#07090c']} />
      <fog attach="fog" args={['#07090c', 14, 31]} />

      <ambientLight intensity={0.18} />
      <directionalLight
        castShadow
        position={[1.5, 8.5, 7]}
        intensity={2.15}
        color="#fff0dc"
        shadow-mapSize-width={quality === 'high' ? 1536 : 1024}
        shadow-mapSize-height={quality === 'high' ? 1536 : 1024}
        shadow-camera-left={-13}
        shadow-camera-right={13}
        shadow-camera-top={9}
        shadow-camera-bottom={-6}
        shadow-bias={-0.00012}
      />
      <pointLight position={[-5.1, 3.3, 1.5]} color={booths[0].accent} intensity={22} distance={7} decay={2.1} />
      <pointLight position={[5.2, 3.25, 1.5]} color={booths[1].accent} intensity={24} distance={7} decay={2.1} />

      <ReflectiveFloor quality={quality} onReset={onSelect} />
      <GalleryArchitecture />

      <Booth
        booth={booths[0]}
        position={[-4.55, 0, -0.2]}
        active={activeId === booths[0].id}
        onSelect={onSelect}
        onSelectProduct={onSelectProduct}
      />
      <Booth
        booth={booths[1]}
        position={[4.55, 0, -0.2]}
        active={activeId === booths[1].id}
        onSelect={onSelect}
        onSelectProduct={onSelectProduct}
      />

      <StudioEnvironment />
      <CameraRig activeId={activeId} />

      <PerformanceMonitor
        flipflops={2}
        onDecline={() => setQuality('low')}
        onIncline={() => setQuality('high')}
      />

      <EffectComposer multisampling={0}>
        {quality === 'high' && (
          <N8AO quality="medium" distanceFalloff={1} aoRadius={0.48} intensity={1.75} />
        )}
        <Bloom
          mipmapBlur
          luminanceThreshold={0.72}
          luminanceSmoothing={0.52}
          intensity={quality === 'high' ? 0.82 : 0.55}
        />
        {quality === 'high' && <Noise opacity={0.025} />}
        <Vignette eskil={false} offset={0.13} darkness={0.68} />
      </EffectComposer>
    </>
  )
}

export default function Experience({ activeId, onSelect, onSelectProduct }) {
  const [quality, setQuality] = useState('high')

  return (
    <Canvas
      className="experience-canvas"
      dpr={quality === 'high' ? [1, 1.65] : [1, 1.15]}
      shadows
      camera={{ position: [0, 4.8, 12.8], fov: 42, near: 0.1, far: 80 }}
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
        toneMapping: ACESFilmicToneMapping,
        outputColorSpace: SRGBColorSpace,
      }}
      onPointerMissed={() => onSelect(null)}
    >
      <Scene
        activeId={activeId}
        quality={quality}
        setQuality={setQuality}
        onSelect={onSelect}
        onSelectProduct={onSelectProduct}
      />
    </Canvas>
  )
}
