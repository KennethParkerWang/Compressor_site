import React, {useMemo, useRef, useState} from 'react';
import {Canvas, useFrame} from '@react-three/fiber';
import {Environment, Float, OrbitControls} from '@react-three/drei';
import type {Group, Mesh} from 'three';

function DataPackets({variant}: {variant: 'flow' | 'archive' | 'lineage'}) {
  const group = useRef<Group>(null);
  const packets = useMemo(() => Array.from({length: variant === 'archive' ? 18 : 28}, (_, index) => ({
    x: -6 + (index % 7) * 1.65,
    y: ((index * 7) % 9 - 4) * .38,
    z: ((index * 11) % 8 - 4) * .28,
    scale: .16 + (index % 4) * .04,
  })), [variant]);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * .18) * .08;
  });
  return (
    <group ref={group}>
      {packets.map((packet, index) => (
        <Packet key={index} {...packet} speed={.35 + (index % 5) * .07} variant={variant} />
      ))}
    </group>
  );
}

function Packet({x, y, z, scale, speed, variant}: {x: number; y: number; z: number; scale: number; speed: number; variant: string}) {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const span = 12;
    ref.current.position.x = ((x + state.clock.elapsedTime * speed + 6) % span) - 6;
    ref.current.position.y = y + Math.sin(state.clock.elapsedTime + x) * .08;
  });
  const color = variant === 'archive' ? (x > 0 ? '#b44938' : '#2b6d55') : x > 1 ? '#d8f15a' : '#4aa6c5';
  return (
    <mesh ref={ref} position={[x, y, z]} scale={scale}>
      <boxGeometry args={[1.4, .66, .66]} />
      <meshStandardMaterial color={color} roughness={.35} metalness={.25} emissive={color} emissiveIntensity={.15} />
    </mesh>
  );
}

function ModelCore() {
  return (
    <group position={[0, 0, 0]}>
      <Float speed={1.2} rotationIntensity={.12} floatIntensity={.2}>
        <mesh>
          <octahedronGeometry args={[1.25, 1]} />
          <meshStandardMaterial color="#13211e" roughness={.15} metalness={.7} />
        </mesh>
        {[0, 1, 2].map((index) => (
          <mesh key={index} rotation={[Math.PI / 2 * index, .62 * index, 0]}>
            <torusGeometry args={[1.65 + index * .22, .025, 8, 96]} />
            <meshBasicMaterial color={index === 1 ? '#d8f15a' : '#58b4c9'} transparent opacity={.7} />
          </mesh>
        ))}
      </Float>
    </group>
  );
}

export default function CompressionFlowScene({variant = 'flow'}: {variant?: 'flow' | 'archive' | 'lineage'}) {
  const [active, setActive] = useState(false);
  return (
    <Canvas camera={{position: [0, 2.4, 10], fov: 42}} dpr={[1, 1.5]} onPointerMissed={() => setActive(false)}>
      <color attach="background" args={[variant === 'archive' ? '#e9ece5' : '#08100e']} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 6, 6]} intensity={2.4} color="#dfffa2" />
      <pointLight position={[-5, 0, 2]} intensity={18} color="#2d91af" />
      <group onClick={() => setActive(!active)} scale={active ? 1.08 : 1}>
        <DataPackets variant={variant} />
        <ModelCore />
      </group>
      <Environment preset="warehouse" />
      <OrbitControls enablePan={false} minDistance={7} maxDistance={14} autoRotate={!active} autoRotateSpeed={.25} />
    </Canvas>
  );
}
