'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Shared mouse state ───
const mouse = new THREE.Vector2(0, 0);
const mouseSmooth = new THREE.Vector2(0, 0);

// ─── Main Torus Knot (the hero geometry) ───
function HeroKnot() {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const glowMaterial = useRef(
    new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uColorLime: { value: new THREE.Color('#BFF549') },
        uColorGold: { value: new THREE.Color('#FACC15') },
        uColorBlue: { value: new THREE.Color('#60a5fa') },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec3 vViewPos;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vUv = uv;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vViewPos = mv.xyz;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform vec3 uColorLime;
        uniform vec3 uColorGold;
        uniform vec3 uColorBlue;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec3 vViewPos;
        void main() {
          vec3 viewDir = normalize(-vViewPos);
          float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.5);
          
          // Mouse proximity glow
          float mouseDist = length(vUv - (uMouse * 0.5 + 0.5));
          float mouseGlow = smoothstep(0.5, 0.0, mouseDist) * 0.4;
          
          // Animated color blend
          float t = sin(uTime * 0.3) * 0.5 + 0.5;
          vec3 col = mix(uColorLime, uColorGold, t);
          col = mix(col, uColorBlue, sin(uTime * 0.2) * 0.5 + 0.5 * 0.15);
          
          float alpha = (fresnel * 0.5 + mouseGlow);
          gl_FragColor = vec4(col * (fresnel * 2.0 + mouseGlow * 3.0), alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.FrontSide,
    })
  );

  useFrame((state, delta) => {
    if (!meshRef.current || !wireRef.current || !glowRef.current || !groupRef.current) return;

    // Smooth mouse influence on rotation
    meshRef.current.rotation.x += delta * 0.08 + mouseSmooth.y * delta * 0.3;
    meshRef.current.rotation.y += delta * 0.12 + mouseSmooth.x * delta * 0.3;
    meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;

    wireRef.current.rotation.x = -meshRef.current.rotation.x * 1.5;
    wireRef.current.rotation.y = -meshRef.current.rotation.y * 1.5;
    wireRef.current.rotation.z = meshRef.current.rotation.z * 2;

    glowRef.current.rotation.x = meshRef.current.rotation.x * 1.2;
    glowRef.current.rotation.y = meshRef.current.rotation.y * 1.2;

    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.15;

    // Update shader
    const gm = glowMaterial.current as THREE.ShaderMaterial;
    gm.uniforms.uTime.value = state.clock.elapsedTime;
    gm.uniforms.uMouse.value.lerp(mouseSmooth, 0.05);
  });

  return (
    <group ref={groupRef}>
      {/* Solid dark metallic core */}
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[1.8, 0.5, 200, 60, 2, 3]} />
        <meshPhysicalMaterial
          color="#0a0a14"
          metalness={1}
          roughness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={1}
        />
      </mesh>

      {/* Wireframe overlay */}
      <mesh ref={wireRef}>
        <torusKnotGeometry args={[1.9, 0.55, 100, 30, 2, 3]} />
        <meshBasicMaterial
          color="#BFF549"
          wireframe
          transparent
          opacity={0.06}
        />
      </mesh>

      {/* Additive glow shell */}
      <mesh ref={glowRef} material={glowMaterial.current}>
        <torusKnotGeometry args={[2.2, 0.7, 80, 20, 2, 3]} />
      </mesh>
    </group>
  );
}

// ─── 2500 Particle Starfield ───
function ParticleField({ count = 2500 }: { count?: number }) {
  const meshRef = useRef<THREE.Points>(null);
  const data = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    const palette = [
      new THREE.Color('#BFF549'),
      new THREE.Color('#FACC15'),
      new THREE.Color('#60a5fa'),
      new THREE.Color('#a78bfa'),
      new THREE.Color('#ffffff'),
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = 8 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = r * Math.cos(phi);
      sizes[i] = Math.random() * 4 + 0.5;
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }
    return { pos, sizes, colors };
  }, [count]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.008 + mouseSmooth.x * delta * 0.15;
    meshRef.current.rotation.x += mouseSmooth.y * delta * 0.08;
    const t = state.clock.elapsedTime;
    const p = meshRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < p.length; i += 3) {
      p[i + 1] += Math.sin(t * 0.3 + i * 0.005) * 0.001;
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={data.pos} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={data.colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        vertexColors
        transparent
        opacity={0.75}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ─── Orbiting Rings ───
function OrbitRings() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.15 + mouseSmooth.y * 0.25;
    ref.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.06) * 0.1 + mouseSmooth.x * 0.2;
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.04) * 0.05;
  });

  return (
    <group ref={ref}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[Math.PI / 2 + i * 0.3, i * 0.7, i * 0.2]}>
          <torusGeometry args={[3 + i * 0.6, 0.008, 8, 180]} />
          <meshBasicMaterial color="#BFF549" transparent opacity={0.15 - i * 0.025} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Floating Octahedron Shards ───
function Shards() {
  const shards = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        key: i,
        pos: [(Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 6 - 2] as [number, number, number],
        rot: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [number, number, number],
        scale: 0.08 + Math.random() * 0.25,
        speed: 0.4 + Math.random() * 0.6,
      })),
    []
  );

  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#BFF549',
        metalness: 0.7,
        roughness: 0.3,
        emissive: '#BFF549',
        emissiveIntensity: 0.08,
        transparent: true,
        opacity: 0.45,
      }),
    []
  );

  return (
    <>
      {shards.map((s) => (
        <Shard key={s.key} data={s} mat={mat} />
      ))}
    </>
  );
}

function Shard({ data, mat }: { data: { pos: [number, number, number]; rot: [number, number, number]; scale: number; speed: number; key: number }; mat: THREE.Material }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y = data.pos[1] + Math.sin(state.clock.elapsedTime * data.speed) * 0.4;
    ref.current.rotation.x += 0.008;
    ref.current.rotation.y += 0.012;
  });
  return (
    <mesh ref={ref} position={data.pos} rotation={data.rot} scale={data.scale} material={mat}>
      <octahedronGeometry />
    </mesh>
  );
}

// ─── Mouse camera handler ───
function CameraCtrl() {
  const { camera } = useThree();
  useFrame(() => {
    mouseSmooth.x += (mouse.x - mouseSmooth.x) * 0.04;
    mouseSmooth.y += (mouse.y - mouseSmooth.y) * 0.04;
    camera.position.x = mouseSmooth.x * 0.4;
    camera.position.y = mouseSmooth.y * 0.25;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// ─── Lights ───
function Lights() {
  const ref = useRef<THREE.PointLight>(null);
  useEffect(() => {
    const interval = setInterval(() => {
      if (ref.current) {
        ref.current.position.set(mouseSmooth.x * 5, mouseSmooth.y * 5, 5);
      }
    }, 16);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <ambientLight intensity={0.12} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#BFF549" />
      <pointLight position={[-10, -5, 5]} intensity={0.5} color="#FACC15" />
      <pointLight position={[0, 8, -5]} intensity={0.3} color="#60a5fa" />
      <pointLight ref={ref} position={[0, 0, 5]} intensity={0.7} color="#BFF549" />
    </>
  );
}

// ─── Export: the full Three.js Hero ───
export default function ThreeHero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[1] overflow-hidden"
      onPointerMove={onPointerMove}
      style={{ background: '#06060e' }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
        }}
      >
        <CameraCtrl />
        <Lights />
        <fog attach="fog" args={['#06060e', 12, 25]} />

        <HeroKnot />
        <OrbitRings />
        <ParticleField count={2500} />
        <Shards />
      </Canvas>

      {/* Bottom gradient for scroll transition */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none z-[2]"
        style={{
          height: '30vh',
          background: 'linear-gradient(to top, #06060e 0%, transparent 100%)',
        }}
      />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[3]"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 35%, rgba(6,6,14,0.7) 100%)',
        }}
      />

      {/* KDS Title overlay */}
      <div
        className="absolute inset-0 z-[4] flex flex-col items-center justify-center pointer-events-none select-none"
        style={{ perspective: '800px' }}
      >
        <h1
          style={{
            fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
            fontWeight: 900,
            fontSize: 'clamp(4rem, 12vw, 10rem)',
            lineHeight: 0.85,
            letterSpacing: '0.1em',
            background: 'linear-gradient(180deg, #FFD700 0%, #D4AF37 40%, #8B6914 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: `drop-shadow(0 0 40px rgba(212,175,55,0.5)) drop-shadow(0 0 80px rgba(255,215,0,0.3))`,
            transform: `rotateX(${mouseSmooth.y * -8}deg) rotateY(${mouseSmooth.x * 8}deg)`,
            transition: 'transform 0.1s ease-out',
          }}
        >
          LRYS
        </h1>
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 'clamp(0.5rem, 1.2vw, 0.9rem)',
            color: 'rgba(191,245,73,0.5)',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            marginTop: 16,
            textShadow: '0 0 20px rgba(191,245,73,0.3)',
          }}
        >
          Kings Dripping Swag • 2130
        </p>
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.6rem',
            color: 'rgba(255,255,255,0.15)',
            letterSpacing: '0.15em',
            marginTop: 12,
          }}
        >
          MOVE YOUR MOUSE — SPIN THE WORLD
        </p>
      </div>
    </div>
  );
}
