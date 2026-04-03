'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { Environment, Text, Float, MeshTransmissionMaterial, MeshRefractionMaterial } from '@react-three/drei';
import * as THREE from 'three';
export { Text, Float, Environment };

extend({ MeshTransmissionMaterial, MeshRefractionMaterial });

// ════════════════════════════════════════════
// SHARED MOUSE STATE
// ════════════════════════════════════════════
const mouseTarget = new THREE.Vector2(0, 0);
const mouseSmooth = new THREE.Vector2(0, 0);

// ════════════════════════════════════════════
// CFENTER-STYLE 3D KDS HERO
// 
// Dark void, floating metallic 3D text "KDS"
// Chrome/gold material, studio rim lighting,
// subtle particles, slow cinematic rotation.
// ════════════════════════════════════════════

function KDS3DText() {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;

    // Smooth mouse
    mouseSmooth.lerp(mouseTarget, 0.04);
    const t = state.clock.elapsedTime;

    // Slow cinematic rotation like CFenter
    group.current.rotation.y = t * 0.06 + mouseSmooth.x * 0.5;
    group.current.rotation.x = Math.sin(t * 0.04) * 0.06 + mouseSmooth.y * 0.3;
    group.current.rotation.z = Math.sin(t * 0.03) * 0.04;

    // Float
    group.current.position.y = Math.sin(t * 0.2) * 0.08;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.15}>
      <group ref={group}>
        {/* Main KDS text — chrome/glass */}
        <Text
          font="/fonts/Cinzel-Black.ttf"
          fontSize={1.4}
          letterSpacing={0.08}
          anchorX="center"
          anchorY="middle"
          material-toneMapped={false}
        >
          KDS
          <meshPhysicalMaterial
            color="#d4af37"
            metalness={0.95}
            roughness={0.06}
            clearcoat={1}
            clearcoatRoughness={0.05}
            envMapIntensity={1.5}
            reflectivity={1}
            ior={1.8}
          />
        </Text>

        {/* Glass reflection layer */}
        <Text
          font="/fonts/Cinzel-Black.ttf"
          fontSize={1.41}
          letterSpacing={0.08}
          anchorX="center"
          anchorY="middle"
          material-toneMapped={false}
        >
          KDS
          <meshPhysicalMaterial
            color="#BFF549"
            metalness={0.8}
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.02}
            transparent
            opacity={0.08}
            envMapIntensity={2}
          />
        </Text>

        {/* Subtitle — thin line */}
        <mesh position={[0, -1, 0]}>
          <planeGeometry args={[3, 0.003]} />
          <meshBasicMaterial color="#BFF549" transparent opacity={0.3} />
        </mesh>

        <mesh position={[0, -1.1, 0]}>
          <Text
            font="/fonts/SpaceGrotesk-Regular.ttf"
            fontSize={0.12}
            letterSpacing={0.15}
            anchorX="center"
            anchorY="middle"
            material-toneMapped={false}
          >
            KINGS DRIPPING SWAG • 2130
            <meshBasicMaterial color="#BFF549" transparent opacity={0.4} />
          </Text>
        </mesh>
      </group>
    </Float>
  );
}

// ════════════════════════════════════════════
// ATMOSPHERIC PARTICLES
// ════════════════════════════════════════════
function Particles({ count = 2000 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const data = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#BFF549'),
      new THREE.Color('#FACC15'),
      new THREE.Color('#60A5FA'),
      new THREE.Color('#ffffff'),
    ];
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = 8 + Math.random() * 25;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i3] = r * Math.sin(ph) * Math.cos(th);
      pos[i3 + 1] = r * Math.sin(ph) * Math.sin(th);
      pos[i3 + 2] = r * Math.cos(ph);
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i3] = c.r; col[i3 + 1] = c.g; col[i3 + 2] = c.b;
    }
    const bg = new THREE.BufferGeometry();
    bg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    bg.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return bg;
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.004 + mouseSmooth.x * delta * 0.1;
    ref.current.rotation.x += mouseSmooth.y * delta * 0.05;
    const p = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < p.length; i += 3) {
      p[i + 1] += Math.sin(state.clock.elapsedTime * 0.3 + i * 0.008) * 0.0005;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={data}>
      <pointsMaterial size={0.035} vertexColors transparent={true} opacity={0.5} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

// ════════════════════════════════════════════
// STUDIO LIGHTS — CFenter style
// ════════════════════════════════════════════
function StudioLights() {
  return (
    <>
      {/* Key light — main warm */}
      <pointLight position={[5, 5, 5]} intensity={2} color="#BFF549" />
      {/* Fill — cool blue */}
      <pointLight position={[-5, -2, 3]} intensity={0.8} color="#60A5FA" />
      {/* Rim */}
      <pointLight position={[0, 3, -5]} intensity={0.7} color="#FACC15" />
      {/* Bottom bounce */}
      <pointLight position={[0, -5, 2]} intensity={0.3} color="#a78bfa" />
      <ambientLight intensity={0.08} />
    </>
  );
}

// ════════════════════════════════════════════
// CAMERA RIG — mouse parallax
// ════════════════════════════════════════════
function CameraRig() {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.x = mouseSmooth.x * 0.5;
    camera.position.y = mouseSmooth.y * 0.3;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// ════════════════════════════════════════════
// MAIN HERO COMPONENT
// ════════════════════════════════════════════
export default function ThreeHero() {
  const [ready, setReady] = useState(false);
  const [heroOp, setHeroOp] = useState(1);
  const [contentOp, setContentOp] = useState(0);

  useEffect(() => {
    setReady(true);
    const onScroll = () => {
      setHeroOp(Math.max(0, 1 - window.scrollY / 800));
      setContentOp(Math.min(1, window.scrollY / 350));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseTarget.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, []);

  if (!ready) return null;

  return (
    <>
      {/* ─── 3D HERO ─── */}
      <div
        className="fixed inset-0 z-[1] overflow-hidden"
        onPointerMove={onMove}
        style={{
          background: '#050510',
          opacity: heroOp,
          transition: 'opacity 0.3s ease',
          pointerEvents: heroOp > 0.1 ? 'auto' : 'none',
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 80 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        >
          <CameraRig />
          <StudioLights />
          <fog attach="fog" args={['#050510', 12, 25]} />

          <KDS3DText />
          <Particles count={2000} />

          {/* Post-processing: bloom (CSS fallback) */}
        </Canvas>

        {/* Bottom fade for scroll */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-[2]" style={{
          height: '35vh',
          background: 'linear-gradient(to top, #050510 0%, transparent 100%)',
        }} />

        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none z-[3]" style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(5,5,16,0.6) 100%)',
        }} />
      </div>

      {/* ─── SCROLL CONTENT ─── */}
      <div style={{
        opacity: contentOp,
        transition: 'opacity 0.5s ease',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ height: '100vh' }} />
      </div>
    </>
  );
}
