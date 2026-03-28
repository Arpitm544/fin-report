import { Canvas, useFrame } from '@react-three/fiber'
import { Line, OrbitControls } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useTheme } from '../context/ThemeContext'

/**
 * 3D insight graph: central hub with Revenue / Profit (green), Risk (red), Sentiment node.
 * Connections animate subtly for a live dashboard feel.
 */
function NodeSphere({ position, color, scale = 1 }) {
  const mesh = useRef()
  useFrame((state) => {
    if (!mesh.current) return
    const t = state.clock.elapsedTime
    mesh.current.scale.setScalar(scale + Math.sin(t * 2 + position[0]) * 0.04)
  })
  return (
    <mesh ref={mesh} position={position}>
      <sphereGeometry args={[0.35, 24, 24]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
    </mesh>
  )
}

function AnimatedLines({ pairs, color }) {
  const group = useRef()
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.15
    }
  })

  return (
    <group ref={group}>
      {pairs.map((pair, i) => (
        <Line
          key={i}
          points={pair}
          color={color}
          lineWidth={1.5}
          transparent
          opacity={0.85}
        />
      ))}
    </group>
  )
}

function Scene({ sentiment, backgroundColor }) {
  const core = [0, 0, 0]
  const revenue = [-2.4, 1.1, 0.3]
  const profit = [2.3, 1.0, -0.2]
  const risk = [0.2, -2.1, 0.4]
  const sentimentPos = [0, 0.2, 2.2]

  const sentColor = useMemo(() => {
    const s = (sentiment || '').toLowerCase()
    if (s === 'bullish') return '#22c55e'
    if (s === 'bearish') return '#ef4444'
    return '#94a3b8'
  }, [sentiment])

  const greenPairs = useMemo(
    () => [
      [core, revenue],
      [core, profit],
    ],
    []
  )
  const riskPairs = useMemo(() => [[core, risk]], [])
  const sentPairs = useMemo(() => [[core, sentimentPos]], [])

  return (
    <>
      <color attach="background" args={[backgroundColor]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 4]} intensity={1.1} />
      <pointLight position={[-3, -2, 2]} intensity={0.6} color="#38bdf8" />

      <AnimatedLines pairs={greenPairs} color="#22c55e" />
      <AnimatedLines pairs={riskPairs} color="#f87171" />
      <AnimatedLines pairs={sentPairs} color={sentColor} />

      <NodeSphere position={core} color="#3b82f6" scale={1.15} />
      <NodeSphere position={revenue} color="#22c55e" />
      <NodeSphere position={profit} color="#4ade80" />
      <NodeSphere position={risk} color="#ef4444" />
      <NodeSphere position={sentimentPos} color={sentColor} scale={1.05} />

      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={10}
        autoRotate
        autoRotateSpeed={0.6}
      />
    </>
  )
}

export default function ThreeFinancialGraph({ sentiment = 'Neutral' }) {
  const { isDark } = useTheme()
  const backgroundColor = isDark ? '#0b1220' : '#e8eef5'

  return (
    <div className="canvas-wrap h-[280px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 md:h-[320px] dark:border-slate-700/50 dark:bg-slate-950/80">
      <Canvas
        camera={{ position: [0, 0.5, 6.2], fov: 45 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <Scene sentiment={sentiment} backgroundColor={backgroundColor} />
      </Canvas>
      <div className="pointer-events-none -mt-10 flex justify-center gap-6 pb-2 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-500">
        <span className="text-emerald-600 dark:text-emerald-400">● Revenue / Profit</span>
        <span className="text-red-500 dark:text-red-400">● Risk</span>
        <span className="text-slate-500 dark:text-slate-400">● Sentiment</span>
      </div>
    </div>
  )
}
