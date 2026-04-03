'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ════════════════════════════════════════════════
// SHARED MOUSE STATE
// ════════════════════════════════════════════════
const mouseTarget = new THREE.Vector2(0, 0);
const mouseCurrent = new THREE.Vector2(0, 0);

// ════════════════════════════════════════════════
// RARE TORUS KNOT — Custom shader with mouse-reactive bloom
// ════════════════════════════════════════════════
function RareTorusKnot() {
  const mesh = useRef<THREE.Mesh>(null);
  const wire = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.Mesh>(null);

  // Custom GLSL material
  const shaderMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uColorLime: { value: new THREE.Color('#BFF549') },
        uColorGold: { value: new THREE.Color('#FACC15') },
        uColorBlue: { value: new THREE.Color('#60A5FA') },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec3 vPos;
        uniform float uTime;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vUv = uv;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vPos = mvPos.xyz;
          // Subtle vertex displacement
          vec3 displaced = position + normal * sin(position.x * 2.0 + uTime) * 0.03;
          gl_Position = projectionMatrix * mvPos;
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
        varying vec3 vPos;
        
        void main() {
          vec3 viewDir = normalize(-vPos);
          float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.5);
          
          // Animated color gradient
          float t = sin(uTime * 0.3) * 0.5 + 0.5;
          vec3 core = mix(uColorLime, uColorGold, t);
          core = mix(core, uColorBlue, sin(uTime * 0.15) * 0.3 + 0.3);
          
          // Mouse-reactive glow
          float mouseDist = length(vUv - (uMouse * 0.5 + 0.5));
          float mouseGlow = smoothstep(0.4, 0.0, mouseDist);
          
          // Final color
          vec3 color = core * (fresnel + mouseGlow * 0.5);
          float alpha = fresnel * 0.5 + mouseGlow * 0.3;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  }, []);

  useFrame((state, delta) => {
    if (!mesh.current || !wire.current || !glow.current) return;
    
    // Smooth mouse
    mouseCurrent.lerp(mouseTarget, 0.06);
    
    // Rotation influenced by mouse
    mesh.current.rotation.x += delta * 0.08 + mouseCurrent.y * delta * 0.3;
    mesh.current.rotation.y += delta * 0.12 + mouseCurrent.x * delta * 0.3;
    
    wire.current.rotation.x = -mesh.current.rotation.x * 1.2;
    wire.current.rotation.y = -mesh.current.rotation.y * 1.2;
    
    glow.current.rotation.x = mesh.current.rotation.x * 1.1;
    glow.current.rotation.y = mesh.current.rotation.y * 1.1;
    
    // Update shader
    const mat = shaderMat as THREE.ShaderMaterial;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    mat.uniforms.uMouse.value.copy(mouseCurrent);
  });

  return (
    <group>
      {/* Main knot with shader */}
      <mesh ref={mesh}>
        <torusKnotGeometry args={[2, 0.5, 200, 40, 2, 3]} />
        <meshPhysicalMaterial
          color="#0a0a14"
          metalness={0.9}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </mesh>

      {/* Wireframe overlay */}
      <mesh ref={wire}>
        <torusKnotGeometry args={[2.1, 0.55, 100, 20, 2, 3]} />
        <meshBasicMaterial color="#BFF549" wireframe transparent opacity={0.06} />
      </mesh>

      {/* Outer glow shell with custom shader */}
      <mesh ref={glow} material={shaderMat}>
        <torusKnotGeometry args={[2.3, 0.7, 50, 10, 2, 3]} />
      </mesh>
    </group>
  );
}

// ════════════════════════════════════════════════
// PARTICLE FIELD
// ════════════════════════════════════════════════
function Particles({ count = 1500 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const data = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    const palette = [
      new THREE.Color('#BFF549'),
      new THREE.Color('#FACC15'),
      new THREE.Color('#60A5FA'),
      new THREE.Color('#a78bfa'),
      new THREE.Color('#ffffff'),
    ];
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = 8 + Math.random() * 25;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
      sizes[i] = Math.random() * 0.15 + 0.02;
    }
    return { positions, colors, sizes };
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.02 + mouseCurrent.x * delta * 0.1;
    ref.current.rotation.x += mouseCurrent.y * delta * 0.05;
    // Gentle wave
    const p = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < p.length; i += 3) {
      p[i + 1] += Math.sin(state.clock.elapsedTime * 0.5 + i * 0.01) * 0.002;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} itemSize={3} array={data.positions} />
        <bufferAttribute attach="attributes-color" count={count} itemSize={3} array={data.colors} />
      </bufferGeometry>
      <pointsMaterial vertexColors size={0.08} transparent opacity={0.6} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

// ════════════════════════════════════════════════
// ORBITING RINGS
// ════════════════════════════════════════════════
function OrbitRings() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.15 + mouseCurrent.y * 0.2;
    ref.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.08) * 0.1 + mouseCurrent.x * 0.15;
  });
  return (
    <group ref={ref}>
      {[1, 2, 3].map((i) => (
        <mesh key={i} rotation={[Math.PI / 2 + i * 0.3, i * 0.5, 0]}>
          <torusGeometry args={[2.8 + i * 0.5, 0.008, 8, 200]} />
          <meshBasicMaterial color="#BFF549" transparent opacity={0.12} />
        </mesh>
      ))}
    </group>
  );
}

// ════════════════════════════════════════════════
// FLOATING SHARDS
// ════════════════════════════════════════════════
function Shards() {
  const shards = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        position: [(Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 6 - 2] as [number, number, number],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [number, number, number],
        scale: 0.1 + Math.random() * 0.3,
        speed: 0.5 + Math.random(),
      })),
    []
  );
  return (
    <>
      {shards.map((s) => (
        <Shard key={s.id} {...s} />
      ))}
    </>
  );
}

function Shard({ position, rotation, scale, speed }: any) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.4;
    ref.current.rotation.x += 0.01;
    ref.current.rotation.y += 0.015;
  });
  return (
    <mesh ref={ref} position={position} rotation={rotation} scale={scale}>
      <octahedronGeometry />
      <meshPhysicalMaterial color="#BFF549" metalness={0.8} roughness={0.2} transparent opacity={0.3} emissive="#BFF549" emissiveIntensity={0.05} />
    </mesh>
  );
}

// ════════════════════════════════════════════════
// MOUSE CAMERA
// ════════════════════════════════════════════════
function CameraRig() {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.x = mouseCurrent.x * 0.5;
    camera.position.y = mouseCurrent.y * 0.3;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// ════════════════════════════════════════════════
// MAIN HERO
// ════════════════════════════════════════════════
export default function ThreeHero() {
  const [ready, setReady] = useState(false);

  useEffect(() => { setReady(true); }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseTarget.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, []);

  // Scroll-based fade
  const [scrollOpacity, setScrollOpacity] = useState(1);
  useEffect(() => {
    const onScroll = () => {
      const progress = Math.min(window.scrollY / 800, 1);
      setScrollOpacity(1 - progress);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!ready) return (
    <div className="fixed inset-0 z-[1] bg-[#06060F]" style={{
      backgroundImage: 'radial-gradient(circle at 50% 50%, #0d0d2b 0%, #06060F 100%)',
    }} />
  );

  return (
    <div className="fixed inset-0 z-[1] overflow-hidden" onPointerMove={handlePointerMove} style={{ background: '#06060F' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      >
        <CameraRig />

        {/* Lighting — multi-source cinematic */}
        <ambientLight intensity={0.15} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#BFF549" />
        <pointLight position={[-10, -5, 5]} intensity={0.5} color="#FACC15" />
        <pointLight position={[0, 10, -5]} intensity={0.3} color="#60A5FA" />
        <pointLight position={[5, -8, 3]} intensity={0.2} color="#a78bfa" />
        {/* Mouse-follow light */}
        <pointLight position={[mouseCurrent.x * 5, mouseCurrent.y * 5, 5]} intensity={0.8} color="#BFF549" />

        <fog attach="fog" args={['#06060F', 12, 25]} />

        {/* Scene objects */}
        <RareTorusKnot />
        <OrbitRings />
        <Particles count={1500} />
        <Shards />
      </Canvas>

      {/* CSS overlay elements (non-WebGL) */}      
      {/* Bottom gradient for scroll transition */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '40vh', background: 'linear-gradient(to top, #06060F 0%, transparent 100%)', zIndex: 2 }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(6,6,15,0.6) 100%)',
        zIndex: 3,
      }} />

      {/* Title overlay */}
      <div
        className="absolute inset-0 z-[4] flex flex-col items-center justify-center pointer-events-none select-none"
        style={{
          perspective: '1000px',
          opacity: scrollOpacity,
          transition: 'opacity 0.3s ease-out',
        }}
      >
        <h1
          style={{
            fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
            fontWeight: 900,
            fontSize: 'clamp(3rem, 10vw, 8rem)',
            lineHeight: 0.85,
            letterSpacing: '0.1em',
            background: 'linear-gradient(180deg, #FFD700 0%, #D4AF37 30%, #B8860B 60%, #8B6914 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 40px rgba(212,175,55,0.5)) drop-shadow(0 0 80px rgba(255,215,0,0.2))',
            transform: `rotateX(${mouseCurrent.y * -6}deg) rotateY(${mouseCurrent.x * 6}deg)`,
            transition: 'transform 0.15s ease-out',
          }}
        >
          LRYS
        </h1>
        
        <p style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 'clamp(0.6rem, 1.2vw, 0.9rem)',
          color: 'rgba(191,245,73,0.5)',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          marginTop: 16,
          textShadow: '0 0 20px rgba(191,245,73,0.3)',
        }}>
          Kings Dripping Swag • 2130 • The Future Is Now
        </p>

        {/* Animated line */}
        <div style={{
          width: '120px',
          height: '1px',
          marginTop: 20,
          background: 'linear-gradient(90deg, transparent, #BFF549, #FFD700, #BFF549, transparent)',
          boxShadow: '0 0 10px rgba(191,245,73,0.5)',
          animation: 'heroLinePulse 3s ease-in-out infinite',
        }} />

        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.55rem',
          color: 'rgba(255,255,255,0.15)',
          letterSpacing: '0.15em',
          marginTop: 12,
        }}>
          MOVE YOUR MOUSE — THE WORLD RESPONDS
        </p>
      </div>
    </div>
  );
}
