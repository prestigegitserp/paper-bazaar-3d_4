import { BakeShadows, Grid } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three'
import Booth from './Booth.jsx'
import CameraDirector from './CameraDirector.jsx'
import { boothById, booths } from '../data/booths.js'

function Hall({ activeId, onSelect, onSelectProduct }) {
  return (
    <>
      <color attach="background" args={['#090b0e']} />
      <fog attach="fog" args={['#090b0e', 15, 31]} />

      <hemisphereLight args={['#b8d6ff', '#19130f', 1.45]} />
      <directionalLight
        position={[3.5, 9, 7]}
        intensity={2.3}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-13}
        shadow-camera-right={13}
        shadow-camera-top={10}
        shadow-camera-bottom={-8}
        shadow-bias={-0.00015}
      />
      <pointLight position={[-4.3, 4.3, 2.5]} color={booths[0].accent} intensity={22} distance={8.5} decay={2.2} />
      <pointLight position={[4.4, 4.3, 2.5]} color={booths[1].accent} intensity={22} distance={8.5} decay={2.2} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]} receiveShadow onClick={() => onSelect(null)}>
        <planeGeometry args={[36, 28]} />
        <meshStandardMaterial color="#0e1115" roughness={0.78} metalness={0.16} />
      </mesh>

      <Grid
        position={[0, 0.03, 0]}
        args={[32, 22]}
        cellSize={0.65}
        cellThickness={0.45}
        cellColor="#1d232b"
        sectionSize={3.25}
        sectionThickness={0.75}
        sectionColor="#2c333d"
        fadeDistance={16}
        fadeStrength={1.8}
        infiniteGrid={false}
      />

      <Booth
        booth={booths[0]}
        position={[-4.45, 0, -0.25]}
        active={activeId === booths[0].id}
        onSelect={onSelect}
        onSelectProduct={onSelectProduct}
      />
      <Booth
        booth={booths[1]}
        position={[4.45, 0, -0.25]}
        active={activeId === booths[1].id}
        onSelect={onSelect}
        onSelectProduct={onSelectProduct}
      />

      <mesh position={[0, 3.65, -2.56]}>
        <boxGeometry args={[17.4, 0.08, 0.08]} />
        <meshStandardMaterial color="#20252c" emissive="#20252c" emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[0, 0.02, 3.35]} receiveShadow>
        <boxGeometry args={[3.1, 0.05, 0.18]} />
        <meshStandardMaterial color="#c6a15b" emissive="#c6a15b" emissiveIntensity={0.55} />
      </mesh>

      <CameraDirector activeBooth={activeId ? boothById[activeId] : null} />
      <BakeShadows />
    </>
  )
}

export default function Experience({ activeId, onSelect, onSelectProduct }) {
  return (
    <Canvas
      className="experience-canvas"
      frameloop="demand"
      dpr={[1, 1.5]}
      shadows
      camera={{ position: [0, 5.8, 13.4], fov: 43, near: 0.1, far: 60 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        toneMapping: ACESFilmicToneMapping,
        outputColorSpace: SRGBColorSpace,
      }}
      onPointerMissed={() => onSelect(null)}
    >
      <Hall activeId={activeId} onSelect={onSelect} onSelectProduct={onSelectProduct} />
    </Canvas>
  )
}
