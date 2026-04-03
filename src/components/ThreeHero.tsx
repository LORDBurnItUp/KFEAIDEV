'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ════════════════════════════════════════════
// SHARED MOUSE STATE — smooth tracking
// ════════════════════════════════════════════
const mouseTarget = new THREE.Vector2(0, 0);
const mouseSmooth = new THREE.Vector2(0, 0);

// ════════════════════════════════════════════
// 💎 KDS 3D LOGO — CFENTER STYLE
// 
// Dark void, floating metallic KDS text,
// chrome/glass shader, studio rim lights,
// slow cinematic rotation, mouse parallax.
// ════════════════════════════════════════════
function KDSLogo() {
  const group = useRef<THREE.Group>(null);

  // Custom chrome/gold shader material
  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      varying vec2 vUv;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uMouse;
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      varying vec2 vUv;

      void main() {
        vec3 N = normalize(vNormal);
        vec3 V = normalize(-vWorldPos + vec3(0.0, 0.0, 5.0));
        float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.5);

        // Fake studio environment reflections
        float y = N.y * 0.5 + 0.5;
        float x = N.x * 0.5 + 0.5;
        
        // Dark background
        vec3 col = vec3(0.01, 0.01, 0.02);
        
        // Top softbox — lime accent
        col += vec3(0.75, 0.96, 0.29) * smoothstep(0.75, 1.0, y) * 0.25;
        
        // Right rim — gold
        col += vec3(1.0, 0.82, 0.08) * smoothstep(0.3, 0.8, x) * 0.2;
        
        // Left fill — cool blue
        col += vec3(0.38, 0.61, 0.96) * smoothstep(0.0, 0.5, 1.0 - x) * 0.12;
        
        // Bottom bounce
        col += vec3(0.1, 0.0, 0.15) * smoothstep(0.0, 0.5, 1.0 - y) * 0.03;
        
        // Mouse-follow spotlight
        float mouseSpot = smoothstep(0.6, 0.0, length(N.xz - uMouse * 0.3));
        col += vec3(1.0, 0.9, 0.3) * mouseSpot * 0.5;
        
        // Animated sheen streak
        float sheen = sin(vUv.x * 12.0 + uTime * 0.8) * 0.5 + 0.5;
        col += vec3(1.0, 0.85, 0.13) * sheen * smoothstep(0.6, 1.0, N.y) * 0.06;
        
        // Edge glow
        col += vec3(0.75, 0.96, 0.29) * pow(1.0 - abs(dot(N, V)), 4.0) * 0.25;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  }), []);

  // Build KDS text geometry procedurally using custom shapes
  const kdsGeo = useMemo(() => {
    const shape = new THREE.Shape();

    // K
    shape.moveTo(-1.8, -0.5); shape.lineTo(-1.5, -0.5); shape.lineTo(-1.5, 0.0);
    shape.lineTo(-1.1, -0.5); shape.lineTo(-0.75, -0.5); shape.lineTo(-1.3, 0.0);
    shape.lineTo(-0.75, 0.5); shape.lineTo(-1.1, 0.5); shape.lineTo(-1.5, 0.0);
    shape.lineTo(-1.5, 0.5); shape.lineTo(-1.8, 0.5);
    shape.moveTo(-1.8, -0.5);

    // D
    shape.moveTo(-0.45, -0.5); shape.lineTo(-0.15, -0.5); shape.lineTo(-0.15, 0.2);
    shape.quadraticCurveTo(-0.15, 0.5, -0.35, 0.5); shape.lineTo(-0.45, 0.45);
    shape.quadraticCurveTo(-0.3, 0.35, -0.3, 0.0);
    shape.quadraticCurveTo(-0.3, -0.35, -0.45, -0.35);
    shape.moveTo(-0.45, -0.5);

    // S
    shape.moveTo(0.75, 0.2); shape.lineTo(0.45, 0.2); shape.lineTo(0.25, 0.5);
    shape.lineTo(0.55, 0.5); shape.lineTo(0.75, 0.2);
    shape.moveTo(0.45, 0.5); shape.lineTo(0.75, 0.2); shape.lineTo(0.75, -0.5);
    shape.lineTo(0.45, -0.5); shape.lineTo(0.25, -0.2); shape.lineTo(0.55, -0.2);
    shape.lineTo(0.75, -0.5); shape.lineTo(0.75, 0.2); shape.lineTo(0.45, 0.2);
    shape.moveTo(0.25, -0.2);

    return shape;
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;

    // Smooth mouse
    mouseSmooth.lerp(mouseTarget, 0.04);

    // Cinematic rotation — CFenter style
    group.current.rotation.x = Math.sin(t * 0.05) * 0.06 + mouseSmooth.y * 0.15;
    group.current.rotation.y = t * 0.08 + mouseSmooth.x * 0.3;
    group.current.rotation.z = Math.sin(t * 0.04) * 0.03;
    group.current.position.y = Math.sin(t * 0.25) * 0.08;

    (mat as THREE.ShaderMaterial).uniforms.uTime.value = t;
    (mat as THREE.ShaderMaterial).uniforms.uMouse.value.copy(mouseSmooth);
  });

  return (
    <group ref={group}>
      {/* Main KDS shape */}
      <mesh geometry={kdsGeo} material={mat} />
      
      {/* Outer glow ring */}
      <mesh>
        <torusGeometry args={[2.5, 0.005, 8, 120]} />
        <meshBasicMaterial color="#BFF549" transparent opacity={0.08} />
      </mesh>

      {/* Floating shards */}
      {[...Array(12)].map((_, i) => (
        <mesh key={i} position={[
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 2 - 0.5
        ]}>
          <octahedronGeometry args={[0.03 + Math.random() * 0.05, 0]} />
          <meshBasicMaterial color="#BFF549" transparent opacity={0.15 + Math.random() * 0.1} />
        </mesh>
      ))}
    </group>
  );
}

// ════════════════════════════════════════════
// ✨ ATMOSPHERIC PARTICLES
// ════════════════════════════════════════════
function Particles({ count = 2000 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const data = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#BFF549'), new THREE.Color('#FACC15'),
      new THREE.Color('#60A5FA'), new THREE.Color('#ffffff')
    ];
    for (let i = 0; i < count; i++) {
      const r = 8 + Math.random() * 20;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      positions[i*3] = r * Math.sin(ph) * Math.cos(th);
      positions[i*3+1] = r * Math.sin(ph) * Math.sin(th);
      positions[i*3+2] = r * Math.cos(ph);
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i*3] = c.r; colors[i*3+1] = c.g; colors[i*3+2] = c.b;
    }
    const bg = new THREE.BufferGeometry();
    bg.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    bg.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return bg;
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.004 + mouseSmooth.x * delta * 0.08;
    ref.current.rotation.x += mouseSmooth.y * delta * 0.04;
    const p = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < p.length; i += 3) {
      p[i+1] += Math.sin(state.clock.elapsedTime * 0.3 + i * 0.005) * 0.0005;
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
// 💡 STUDIO LIGHTING — CFenter style
// ════════════════════════════════════════════
function StudioLights() {
  return (
    <>
      <pointLight position={[5, 5, 5]} intensity={2} color="#BFF549" />
      <pointLight position={[-5, -2, 3]} intensity={0.8} color="#60A5FA" />
      <pointLight position={[0, 3, -5]} intensity={0.7} color="#FACC15" />
      <pointLight position={[0, -5, 2]} intensity={0.3} color="#a78bfa" />
      <ambientLight intensity={0.08} />
    </>
  );
}

// ════════════════════════════════════════════
// 🎥 CAMERA — mouse parallax
// ════════════════════════════════════════════
function CameraRig() {
  const { camera } = useThree();
  useFrame(() => {
    mouseSmooth.lerp(mouseTarget, 0.04);
    camera.position.x = mouseSmooth.x * 0.5;
    camera.position.y = mouseSmooth.y * 0.3;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// ════════════════════════════════════════════
// 🖼️ MAIN COMPONENT
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

  if (!ready) return (
    <div style={{ position: 'fixed', inset: 0, background: '#050510', zIndex: 1 }} />
  );

  return (
    <>
      {/* ─── 3D HERO ─── */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 1,
          opacity: heroOp, transition: 'opacity 0.3s ease',
          pointerEvents: heroOp > 0.1 ? 'auto' : 'none',
          background: '#050510',
        }}
        onPointerMove={onMove}
      >
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 80 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        >
          <CameraRig />
          <StudioLights />
          <fog attach="fog" args={['#050510', 12, 25]} />
          <KDSLogo />
          <Particles count={2000} />
        </Canvas>

        {/* Bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, pointerEvents: 'none', zIndex: 2,
          height: '35vh',
          background: 'linear-gradient(to top, #050510 0%, transparent 100%)',
        }} />
        {/* Vignette */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(5,5,16,0.6) 100%)',
        }} />
      </div>

      {/* ─── SCROLL CONTENT ─── */}
      <div style={{ opacity: contentOp, transition: 'opacity 0.5s ease', position: 'relative', zIndex: 10 }}>
        <div style={{ height: '100vh' }} />
      </div>
    </>
  );
}
