'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ═══════════════════════════════════════════
// SHARED STATE
// ═══════════════════════════════════════════
const mouseTarget = new THREE.Vector2(0, 0);
const mouseSmooth = new THREE.Vector2(0, 0);
let globalScroll = 0;
let globalMaxScroll = 1;

// ═══════════════════════════════════════════
// 🎥 PARALLAX CAMERA — responds to scroll + mouse
//
// Scroll = camera flies through the KDS universe
// Mouse = subtle camera tilt on top
// The scene is a 3D tunnel — you're descending through it
// ═══════════════════════════════════════════
function ParallaxCamera() {
  const { camera } = useThree();
  const smoothPos = useRef(new THREE.Vector3(0, 0, 6));
  const smoothLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    // Smooth mouse
    mouseSmooth.lerp(mouseTarget, 0.06);
    const m = mouseSmooth;

    // Normalized scroll progress (0 at top, 1 at bottom)
    const t = globalScroll / Math.max(globalMaxScroll, 1);

    // ─── Camera path through the KDS universe ───
    // Phase 1 (0-15%): Hovering above, looking at logo straight-on
    // Phase 2 (15-40%): Diving in — camera descends + rotates
    // Phase 3 (40-65%): Flying past the logo, seeing it from the side
    // Phase 4 (65-85%): Behind the logo, looking back
    // Phase 5 (85-100%): Rising up, logo recedes into distance

    let cx: number, cy: number, cz: number;

    if (t < 0.15) {
      // Hovering — straight on, slight mouse influence
      const lt = t / 0.15;
      cx = m.x * 0.3;
      cy = 0.3 + lt * 0.2 + m.y * 0.2;
      cz = 6 - lt * 0.5;
    } else if (t < 0.40) {
      // Diving in — slow descent, slight rotation
      const lt = (t - 0.15) / 0.25;
      cx = m.x * 0.3 + lt * 1.5;
      cy = 0.5 - lt * 0.8 + m.y * 0.3;
      cz = 5.5 - lt * 2.0;
    } else if (t < 0.65) {
      // Side fly-by — camera pans right, looks back at logo
      const lt = (t - 0.40) / 0.25;
      cx = 1.5 + lt * 2.5 + m.x * 0.2;
      cy = -0.3 + lt * 0.5 + m.y * 0.2;
      cz = 3.5 - lt * 1.5;
    } else if (t < 0.85) {
      // Behind the logo — looking from afar
      const lt = (t - 0.65) / 0.20;
      cx = 4.0 - lt * 1.5 + m.x * 0.15;
      cy = 0.2 + lt * 1.5 + m.y * 0.15;
      cz = 2.0 - lt * 1.0;
    } else {
      // Rising out — looking back at fading logo
      const lt = (t - 0.85) / 0.15;
      cx = 2.5 - lt * 2.5 + m.x * 0.1;
      cy = 1.7 + lt * 2.0 + m.y * 0.1;
      cz = 1.0 + lt * 2.0;
    }

    // Smooth interpolation
    smoothPos.current.x += (cx - smoothPos.current.x) * Math.min(delta * 3, 1);
    smoothPos.current.y += (cy - smoothPos.current.y) * Math.min(delta * 3, 1);
    smoothPos.current.z += (cz - smoothPos.current.z) * Math.min(delta * 3, 1);

    camera.position.copy(smoothPos.current);

    // Look-at target shifts with scroll
    const lookX = m.x * 0.5 + Math.sin(t * Math.PI) * 0.3;
    const lookY = 0 - t * 0.5 + m.y * 0.3;
    const lookZ = 0;
    targetLookAt.current.set(lookX, lookY, lookZ);
    smoothLookAt.current.lerp(targetLookAt.current, Math.min(delta * 4, 1));
    camera.lookAt(smoothLookAt.current);

    // Subtle FOV zoom based on scroll
    const pc = camera as THREE.PerspectiveCamera;
    pc.fov = 45 + t * 10;
    pc.updateProjectionMatrix();
  });

  return null;
}

// ═══════════════════════════════════════════
// 💎 KDS 3D LETTERS — responds to scroll
//
// Letters shift, rotate, and transform as
// the camera moves past them.
// ═══════════════════════════════════════════
function KDSLetters({ mat }: { mat: THREE.Material }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = globalScroll / Math.max(globalMaxScroll, 1);

    // Slow cinematic rotation independent of scroll
    group.current.rotation.y += state.delta * 0.02;

    // Scroll-based letter spread — they "open up" as you scroll
    const spread = 1 + t * 1.5;
    group.current.scale.setScalar(1 - t * 0.3);

    // Slight wobble during fly-by
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.03 + t * 0.15;
    group.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.08) * 0.02 + t * 0.08;

    // Opacity fade near end
    const parent = group.current.parent;
  });

  return (
    <group ref={group}>
      {/* K */}
      <group position={[-1.4, 0, 0]}>
        <mesh material={mat}><boxGeometry args={[0.12, 0.8, 0.12]} /></mesh>
        <mesh material={mat} rotation={[0, 0, -0.6]} position={[0.2, 0.25, 0]}><boxGeometry args={[0.4, 0.1, 0.1]} /></mesh>
        <mesh material={mat} rotation={[0, 0, 0.6]} position={[0.2, -0.25, 0]}><boxGeometry args={[0.4, 0.1, 0.1]} /></mesh>
      </group>
      {/* D */}
      <group position={[-0.3, 0, 0]}>
        <mesh material={mat}><boxGeometry args={[0.12, 0.8, 0.12]} /></mesh>
        <mesh material={mat} position={[0.18, 0.35, 0]}><boxGeometry args={[0.45, 0.1, 0.1]} /></mesh>
        <mesh material={mat} position={[0.18, -0.35, 0]}><boxGeometry args={[0.45, 0.1, 0.1]} /></mesh>
        {/* D curve approximation */}
        <mesh material={mat} rotation={[0, 0, Math.PI / 2]} position={[0.4, 0, 0]}><torusGeometry args={[0.25, 0.05, 6, 12, Math.PI]} /></mesh>
      </group>
      {/* S */}
      <group position={[0.85, 0, 0]}>
        <mesh material={mat} position={[-0.2, 0.3, 0]}><boxGeometry args={[0.45, 0.1, 0.1]} /></mesh>
        <mesh material={mat} position={[0.15, -0.3, 0]}><boxGeometry args={[0.45, 0.1, 0.1]} /></mesh>
        <mesh material={mat} position={[-0.32, 0, 0]}><boxGeometry args={[0.1, 0.5, 0.1]} /></mesh>
        <mesh material={mat} position={[0.25, 0, 0]}><boxGeometry args={[0.1, 0.5, 0.1]} /></mesh>
        <mesh material={mat} rotation={[0, 0, -0.3]} position={[-0.07, 0.02, 0]}><boxGeometry args={[0.15, 0.1, 0.1]} /></mesh>
      </group>

      {/* Subtitle line */}
      <mesh position={[0, -0.85, 0]}>
        <planeGeometry args={[3.5, 0.004]} />
        <meshPhysicalMaterial color="#BFF549" emissive="#BFF549" emissiveIntensity={0.4} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════
// ✨ PARALLAX PARTICLES — depth layers
//
// Three particle layers at different depths
// that move at different speeds = true parallax
// ═══════════════════════════════════════════
function ParallaxParticles() {
  const layers = [
    { count: 800, zMin: -5, zMax: 15, size: 0.015, speed: 0.3, opacity: 0.4 },
    { count: 600, zMin: 2, zMax: 10, size: 0.025, speed: 0.6, opacity: 0.5 },
    { count: 300, zMin: 5, zMax: 20, size: 0.04, speed: 1.0, opacity: 0.6 },
  ];

  return (
    <>
      {layers.map((layer, li) => (
        <ParticleLayer key={li} {...layer} />
      ))}
    </>
  );
}

function ParticleLayer({ count, zMin, zMax, size, speed, opacity }: any) {
  const ref = useRef<THREE.Points>(null);
  const data = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#BFF549'),
      new THREE.Color('#FACC15'),
      new THREE.Color('#60A5FA'),
      new THREE.Color('#a78bfa'),
      new THREE.Color('#ffffff'),
    ];
    for (let i = 0; i < count; i++) {
      pos[i*3] = (Math.random() - 0.5) * 25;
      pos[i*3+1] = (Math.random() - 0.5) * 20;
      pos[i*3+2] = zMin + Math.random() * (zMax - zMin);
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
    }
    const bg = new THREE.BufferGeometry();
    bg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    bg.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return bg;
  }, [count, zMin, zMax]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const t = globalScroll / Math.max(globalMaxScroll, 1);
    ref.current.rotation.y = t * 0.15 * speed + state.clock.elapsedTime * 0.01;
    // Atmospheric drift
    const p = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < p.length; i += 3) {
      p[i+1] += Math.sin(t * Math.PI * 2 + i * 0.01) * 0.001 * speed;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={data}>
      <pointsMaterial size={size} vertexColors transparent={true} opacity={opacity} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

// ═══════════════════════════════════════════
// 💫 FLOATING SHARDS — scroll-reactive
// ═══════════════════════════════════════════
function ParallaxShards() {
  const shards = useRef<Array<{ mesh: THREE.Mesh; baseY: number; speed: number; rotSpeed: THREE.Vector3 }>>([]);

  const shardData = useMemo(() =>
    Array.from({ length: 14 }, (_, i) => ({
      pos: [(Math.random() - 0.5) * 10 + 2, (Math.random() - 0.5) * 8, Math.random() * 12 - 2] as [number, number, number],
      scale: 0.015 + Math.random() * 0.06,
    })), []);

  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#BFF549', metalness: 0.8, roughness: 0.2,
    emissive: '#BFF549', emissiveIntensity: 0.04,
    transparent: true, opacity: 0.2,
  }), []);

  useFrame((state) => {
    const t = globalScroll / Math.max(globalMaxScroll, 1);
    shards.current.forEach((s, i) => {
      if (!s) return;
      s.mesh.position.y = s.baseY + Math.sin(state.clock.elapsedTime * s.speed) * 0.3;
      // Scroll pushes shards
      s.mesh.position.x += s.rotSpeed.x * 0.0003 * (1 + t * 2);
      s.mesh.rotation.x += s.rotSpeed.x * state.delta;
      s.mesh.rotation.y += s.rotSpeed.y * state.delta;
    });
  });

  return (
    <>
      {shardData.map((d, i) => (
        <mesh key={i} ref={(el) => {
          if (el) {
            el.scale.setScalar(d.scale);
            if (!shards.current[i]) {
              shards.current[i] = {
                mesh: el,
                baseY: d.pos[1],
                speed: 0.3 + Math.random() * 0.5,
                rotSpeed: new THREE.Vector3(
                  (Math.random() - 0.5) * 0.02,
                  (Math.random() - 0.5) * 0.02,
                  0
                ),
              };
            }
          }
        }} position={d.pos} material={mat}>
          {i % 3 === 0 ? <octahedronGeometry /> : i % 3 === 1 ? <tetrahedronGeometry /> : <boxGeometry args={[1, 1, 0.15]} />}
        </mesh>
      ))}
    </>
  );
}

// ═══════════════════════════════════════════
// 🌈 ORBITAL RINGS — parallax layers
// ═══════════════════════════════════════════
function OrbitalRings() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const t = globalScroll / Math.max(globalMaxScroll, 1);
    group.current.rotation.x = Math.sin(t * Math.PI * 0.5 + state.clock.elapsedTime * 0.06) * 0.2 + mouseSmooth.y * 0.15;
    group.current.rotation.z = Math.cos(t * Math.PI * 0.3 + state.clock.elapsedTime * 0.04) * 0.15 + mouseSmooth.x * 0.12;
  });
  return (
    <group ref={group}>
      {[0, 1, 2].map(i => (
        <mesh key={i} rotation={[Math.PI / 2 + i * 0.2, i * 0.5, i * 0.1]}>
          <torusGeometry args={[2.5 + i * 0.5, 0.004, 6, 100]} />
          <meshBasicMaterial color="#BFF549" transparent opacity={0.07 - i * 0.015} />
        </mesh>
      ))}
    </group>
  );
}

// ═══════════════════════════════════════════
// 💡 STUDY LIGHTS — shift with scroll
// ═══════════════════════════════════════════
function ScrollLights() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const t = globalScroll / Math.max(globalMaxScroll, 1);
    group.current.rotation.y = t * Math.PI * 0.5;
  });
  return (
    <group ref={group}>
      <pointLight position={[5, 5, 5]} intensity={2} color="#BFF549" />
      <pointLight position={[-5, -2, 3]} intensity={0.8} color="#60A5FA" />
      <pointLight position={[0, 3, -5]} intensity={0.7} color="#FACC15" />
      <pointLight position={[0, -5, 2]} intensity={0.3} color="#a78bfa" />
    </group>
  );
}

// ═══════════════════════════════════════════
// 🖼️ MAIN — PARALLAX SCROLL HERO
// ═══════════════════════════════════════════
export default function ParallaxHero() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    const update = () => {
      globalScroll = window.scrollY;
      globalMaxScroll = document.documentElement.scrollHeight - window.innerHeight;
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  const onMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseTarget.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, []);

  if (!ready) return <div style={{ position: 'fixed', inset: 0, background: '#050510', zIndex: 1 }} />;

  return (
    <>
      {/* ─── 3D PARALLAX CANVAS ─── */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 1,
          background: '#050510',
          pointerEvents: 'auto',
        }}
        onPointerMove={onMove}
      >
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 100 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        >
          <ParallaxCamera />
          <ScrollLights />
          <ambientLight intensity={0.06} />
          <fog attach="fog" args={['#050510', 10, 40]} />

          <KDSLetters mat={new THREE.MeshPhysicalMaterial({
            color: '#d4af37', metalness: 1, roughness: 0.05,
            clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 2,
            reflectivity: 1, ior: 2.33,
          })} />
          <OrbitalRings />
          <ParallaxParticles />
          <ParallaxShards />
        </Canvas>

        {/* Vignette */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
          background: 'radial-gradient(ellipse at 50% 30%, transparent 40%, rgba(5,5,16,0.65) 100%)',
        }} />
      </div>

      {/* ─── SCROLL CONTENT (transparent bg so 3D shows through) ─── */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <div style={{ height: '20vh' }} />
        <div style={{ width: '100%', maxWidth: 700, margin: '0 auto', padding: '80px 20px' }}>
          {/* Spacer sections for scroll-driven camera movement */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                background: 'rgba(10,10,20,0.4)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12,
                padding: 40,
                maxWidth: 500,
                textAlign: 'center',
              }}>
                <span style={{ color: 'rgba(191,245,73,0.6)', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Section 0{i + 1}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ height: '40vh' }} />
      </div>
    </>
  );
}
