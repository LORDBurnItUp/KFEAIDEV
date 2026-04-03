'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ════════════════════════════════════════════
// SHARED MOUSE — smooth tracking
// ════════════════════════════════════════════
const mouseTarget = new THREE.Vector2(0, 0);
const mouseSmooth = new THREE.Vector2(0, 0);

// ════════════════════════════════════════════
// 💎 CFENTER-STYLE 3D LOGO — KDS EDITION
// 
// Dark void, dramatic studio lighting,
// metallic/glass floating logo, ambient
// particles, slow cinematic rotation,
// mouse-reactive camera parallax
// ════════════════════════════════════════════

// ─── KDS 3D Text using custom geometry ───
function KDSLogo() {
  const group = useRef<THREE.Group>(null);

  // Custom shader for metallic chrome/gold effect
  const logoMat = useMemo(() => 
    new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uEnvIntensity: { value: 1.2 },
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
        uniform float uEnvIntensity;
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        varying vec2 vUv;
        
        // Fake environment reflections
        vec3 envReflection(vec3 N, vec3 V, float roughness) {
          vec3 R = reflect(-V, N);
          float y = R.y * 0.5 + 0.5;
          
          // Simulated studio lighting
          vec3 col = vec3(0.02); // dark void
          
          // Top softbox (lime accent)
          col += vec3(0.75, 0.96, 0.29) * smoothstep(0.7, 1.0, R.y * 0.5 + 0.5) * 0.3;
          
          // Right rim light (gold)
          col += vec3(1.0, 0.85, 0.13) * smoothstep(0.3, 0.8, R.x * 0.5 + 0.5) * 0.25;
          
          // Left cool fill (blue)
          col += vec3(0.38, 0.61, 0.96) * smoothstep(0.0, 0.5, -R.x * 0.5 + 0.5) * 0.15;
          
          // Bottom bounce
          col += vec3(0.1) * smoothstep(0.0, 0.5, -R.y * 0.5 + 0.5) * 0.05;
          
          // Mouse-follow spotlight
          float mouseSpot = smoothstep(0.6, 0.0, 
            length(N.xz - vec2(uMouse.x * 0.3, uMouse.y * 0.3)));
          col += vec3(1.0, 0.9, 0.3) * mouseSpot * 0.5;
          
          // Fresnel edge glow
          float fresnel = pow(1.0 - abs(dot(N, normalize(-vWorldPos + vec3(0.0, 0.0, 5.0)))), 3.0);
          col += vec3(0.75, 0.96, 0.29) * fresnel * 0.35;
          
          return col;
        }
        
        void main() {
          vec3 N = normalize(vNormal);
          vec3 V = normalize(-vWorldPos + vec3(0.0, 0.0, 5.0));
          
          // Multi-layer material
          vec3 diffuse = vec3(0.02, 0.02, 0.03);
          vec3 specular = envReflection(N, V, 0.05);
          
          // Clearcoat layer
          vec3 clearcoat = envReflection(N, V, 0.02) * 0.4;
          
          // Combine
          vec3 col = diffuse;
          col += specular * 0.7;
          col += clearcoat;
          
          // Subtle animated sheen
          float sheen = sin(vUv.x * 6.28 + uTime * 0.5) * 0.5 + 0.5;
          col += vec3(1.0, 0.85, 0.13) * sheen * smoothstep(0.5, 1.0, N.y) * 0.08;
          
          // Edge glow
          float edge = pow(1.0 - abs(dot(N, V)), 4.0);
          col += vec3(0.75, 0.96, 0.29) * edge * 0.2;
          
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    }), []
  );

  const wireMat = useMemo(() =>
    new THREE.MeshBasicMaterial({
      color: '#BFF549',
      wireframe: true,
      transparent: true,
      opacity: 0.03,
    }), []
  );

  // ─── Build KDS text geometry from 3D boxes and shapes ───
  const kdsGroup = useMemo(() => {
    const g = new THREE.Group();

    // Helper: create a 3D letter from custom geometry
    function addLetter(shapes: THREE.Shape[], depth: number, pos: [number, number, number]) {
      const group = new THREE.Group();
      shapes.forEach(shape => {
        const geom = new THREE.ExtrudeGeometry(shape, {
          depth,
          bevelEnabled: true,
          bevelThickness: 0.04,
          bevelSize: 0.04,
          bevelOffset: 0,
          bevelSegments: 3,
        });
        const mesh = new THREE.Mesh(geom, logoMat);
        group.add(mesh);
        
        // Wireframe overlay
        const wire = new THREE.Mesh(
          new THREE.WireframeGeometry(geom, 4),
          new THREE.LineBasicMaterial({ color: '#BFF549', transparent: true, opacity: 0.06 })
        );
        group.add(wire);
      });
      group.position.set(...pos);
      return group;
    }

    // ─── K ───
    const kShape = new THREE.Shape();
    // Left stem
    kShape.moveTo(-0.15, -0.6);
    kShape.lineTo(0.15, -0.6);
    kShape.lineTo(0.15, 0.6);
    kShape.lineTo(-0.15, 0.6);
    kShape.lineTo(-0.15, -0.6);
    
    // Top right arm
    kShape.moveTo(0.15, 0.6);
    kShape.lineTo(0.15, 0.3);
    kShape.lineTo(-0.15, 0.0);
    kShape.lineTo(-0.45, 0.0);
    kShape.lineTo(-0.45, -0.15);
    kShape.lineTo(-0.15, -0.15);
    kShape.lineTo(0.15, 0.15);
    kShape.lineTo(0.15, 0.3);
    
    // Bottom right leg
    kShape.moveTo(0.15, 0.15);
    kShape.lineTo(0.45, -0.6);
    kShape.lineTo(0.15, -0.6);
    kShape.lineTo(-0.15, 0.15);
    kShape.lineTo(0.15, 0.15);
    
    // Holes (cut out shapes)
    const kHole1 = new THREE.Path();
    kHole1.moveTo(0.0, -0.45);
    kHole1.lineTo(-0.30, 0.0);
    kHole1.lineTo(-0.0, 0.0);
    kHole1.lineTo(0.0, -0.45);

    g.add(addLetter([kShape], 0.3, [-1.2, 0, 0]));

    // ─── D ───
    const dShape = new THREE.Shape();
    dShape.moveTo(-0.15, -0.6);
    dShape.lineTo(0.15, -0.6);
    dShape.lineTo(0.15, 0.6);
    dShape.lineTo(-0.15, 0.6);
    dShape.lineTo(-0.15, -0.6);
    
    // D belly
    dShape.moveTo(0.15, -0.5);
    dShape.quadraticCurveTo(0.7, -0.5, 0.7, 0.0);
    dShape.quadraticCurveTo(0.7, 0.5, 0.15, 0.5);
    dShape.lineTo(0.15, 0.35);
    dShape.quadraticCurveTo(0.55, 0.35, 0.55, 0.0);
    dShape.quadraticCurveTo(0.55, -0.35, 0.15, -0.35);
    dShape.lineTo(0.15, -0.5);

    // D hole
    const dHole = new THREE.Path();
    dHole.moveTo(0.25, -0.35);
    dHole.quadraticCurveTo(0.45, -0.35, 0.45, 0.0);
    dHole.quadraticCurveTo(0.45, 0.35, 0.25, 0.35);
    dHole.lineTo(0.25, -0.35);

    g.add(addLetter([dShape], 0.3, [0.0, 0, 0]));

    // ─── S ───
    const sShape = new THREE.Shape();
    sShape.moveTo(-0.5, 0.3);
    sShape.quadraticCurveTo(-0.5, 0.6, 0.0, 0.6);
    sShape.quadraticCurveTo(0.5, 0.6, 0.5, 0.3);
    sShape.lineTo(0.35, 0.3);
    sShape.quadraticCurveTo(0.35, 0.45, 0.0, 0.45);
    sShape.quadraticCurveTo(-0.35, 0.45, -0.35, 0.3);
    sShape.lineTo(0.35, 0.3);
    sShape.lineTo(0.35, -0.05);
    sShape.lineTo(-0.35, -0.05);
    sShape.quadraticCurveTo(-0.5, -0.05, -0.5, -0.3);
    sShape.quadraticCurveTo(-0.5, -0.6, 0.0, -0.6);
    sShape.quadraticCurveTo(0.5, -0.6, 0.5, -0.3);
    sShape.lineTo(0.35, -0.3);
    sShape.quadraticCurveTo(0.35, -0.45, 0.0, -0.45);
    sShape.quadraticCurveTo(-0.35, -0.45, -0.35, -0.3);
    sShape.lineTo(-0.35, -0.05);
    sShape.lineTo(0.35, -0.05);
    sShape.quadraticCurveTo(0.5, -0.05, 0.5, -0.3);

    g.add(addLetter([sShape], 0.3, [1.2, 0, 0]));

    return g;
  }, [logoMat]);

  useFrame((state, delta) => {
    if (!group.current) return;
    
    // Smooth mouse tracking
    mouseSmooth.lerp(mouseTarget, 0.04);

    // Cinematic slow rotation — CFenter style
    const t = state.clock.elapsedTime;
    group.current.rotation.y = t * 0.08 + mouseSmooth.x * 0.4;
    group.current.rotation.x = Math.sin(t * 0.05) * 0.08 + mouseSmooth.y * 0.2;
    group.current.rotation.z = Math.sin(t * 0.03) * 0.03;
    
    // Subtle floating
    group.current.position.y = Math.sin(t * 0.25) * 0.1;
    
    // Update shader
    const mat = logoMat as THREE.ShaderMaterial;
    mat.uniforms.uTime.value = t;
    mat.uniforms.uMouse.value.copy(mouseSmooth);
  });

  return (
    <group ref={group}>
      {/* Main KDS logo */}
      <primitive object={kdsGroup} />
      
      {/* Outer glow ring */}
      <mesh>
        <torusGeometry args={[2.2, 0.008, 8, 128]} />
        <meshBasicMaterial color="#BFF549" transparent opacity={0.12} />
      </mesh>
      
      {/* Secondary ring */}
      <mesh rotation={[Math.PI / 2, 0, 0.3]}>
        <torusGeometry args={[2.5, 0.006, 8, 128]} />
        <meshBasicMaterial color="#FACC15" transparent opacity={0.06} />
      </mesh>
      
      {/* Subtitle text plane */}
      <mesh position={[0, -1.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.5, 0.4]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

// ════════════════════════════════════════════
// ✨ AMBIENT PARTICLES — atmospheric depth
// ════════════════════════════════════════════
function Particles({ count = 3000 }: { count?: number }) {
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
      const r = 12 + Math.random() * 30;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = r * Math.sin(ph) * Math.cos(th);
      positions[i3 + 1] = r * Math.sin(ph) * Math.sin(th);
      positions[i3 + 2] = r * Math.cos(ph);
      
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
      sizes[i] = Math.random() * 4 + 0.5;
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
    
    // Atmospheric drift
    const p = ref.current.geometry.attributes.position.array as Float32Array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < p.length; i += 3) {
      p[i + 1] += Math.sin(t * 0.3 + i * 0.005) * 0.0008;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={data}>
      <pointsMaterial 
        size={0.05} 
        vertexColors 
        transparent 
        opacity={0.5} 
        sizeAttenuation 
        blending={THREE.AdditiveBlending} 
        depthWrite={false} 
      />
    </points>
  );
}

// ════════════════════════════════════════════
// 🌑 ORBITAL RINGS — subtle depth cues
// ════════════════════════════════════════════
function OrbitalRings() {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.06) * 0.12 + mouseSmooth.y * 0.15;
    ref.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.04) * 0.08 + mouseSmooth.x * 0.12;
  });

  return (
    <group ref={ref}>
      {[0, 1, 2].map(i => (
        <mesh key={i} rotation={[Math.PI / 2 + i * 0.25, i * 0.6, i * 0.15]}>
          <torusGeometry args={[2.4 + i * 0.5, 0.005, 6, 160]} />
          <meshBasicMaterial color="#BFF549" transparent opacity={0.08 - i * 0.02} />
        </mesh>
      ))}
    </group>
  );
}

// ════════════════════════════════════════════
// 💫 FLOATING SHARDS — atmospheric debris
// ════════════════════════════════════════════
function Shards() {
  const shards = useMemo(
    () => Array.from({ length: 16 }, (_, i) => ({
      pos: [(Math.random() - 0.5) * 10 + 3, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4 - 1] as [number, number, number],
      speed: 0.3 + Math.random() * 0.5,
      scale: 0.04 + Math.random() * 0.15,
    })),
    []
  );

  return (
    <>
      {shards.map((s, i) => (
        <Shard key={i} pos={s.pos} speed={s.speed} scale={s.scale} />
      ))}
    </>
  );
}

function Shard({ pos, speed, scale }: { pos: [number, number, number]; speed: number; scale: number }) {
  const ref = useRef<THREE.Mesh>(null);
  
  const mat = useMemo(() =>
    new THREE.MeshPhysicalMaterial({
      color: '#BFF549',
      metalness: 0.8,
      roughness: 0.2,
      emissive: '#BFF549',
      emissiveIntensity: 0.04,
      transparent: true,
      opacity: 0.25,
    }), []
  );

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y = pos[1] + Math.sin(state.clock.elapsedTime * speed) * 0.3;
    ref.current.rotation.x += 0.006;
    ref.current.rotation.y += 0.01;
  });

  return (
    <mesh ref={ref} position={pos} scale={scale} material={mat}>
      <octahedronGeometry />
    </mesh>
  );
}

// ════════════════════════════════════════════
// 🎥 CAMERA — mouse-reactive parallax
// ════════════════════════════════════════════
function CameraRig() {
  const { camera } = useThree();
  
  useFrame(() => {
    mouseSmooth.lerp(mouseTarget, 0.04);
    camera.position.x = mouseSmooth.x * 0.6;
    camera.position.y = mouseSmooth.y * 0.35;
    camera.lookAt(0, 0, 0);
  });
  
  return null;
}

// ════════════════════════════════════════════
// 💡 STUDIO LIGHTING — CFenter style
// ════════════════════════════════════════════
function StudioLights() {
  return (
    <>
      {/* Main key light (warm) */}
      <pointLight position={[6, 6, 6]} intensity={1.5} color="#BFF549" />
      
      {/* Fill light (cool blue) */}
      <pointLight position={[-6, -2, 4]} intensity={0.7} color="#60A5FA" />
      
      {/* Rim/back light (gold) */}
      <pointLight position={[0, 4, -6]} intensity={0.6} color="#FACC15" />
      
      {/* Bottom bounce */}
      <pointLight position={[0, -6, 2]} intensity={0.2} color="#a78bfa" />
      
      {/* Ambient */}
      <ambientLight intensity={0.08} />
    </>
  );
}

// ════════════════════════════════════════════
// 🖼️ MAIN COMPONENT
// ════════════════════════════════════════════
export default function CFenterHero() {
  const [mounted, setMounted] = useState(false);
  const [scrollOp, setScrollOp] = useState(1);
  const [contentOp, setContentOp] = useState(0);

  useEffect(() => { 
    setMounted(true); 
    const onScroll = () => {
      setScrollOp(Math.max(0, 1 - window.scrollY / 800));
      setContentOp(Math.min(1, window.scrollY / 350));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseTarget.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, []);

  if (!mounted) return (
    <div style={{ position: 'fixed', inset: 0, background: '#050510', zIndex: 1 }} />
  );

  return (
    <>
      {/* ═══════════ 3D HERO CANVAS ═══════════ */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 1,
          opacity: scrollOp, transition: 'opacity 0.4s ease',
          pointerEvents: scrollOp > 0.1 ? 'auto' : 'none',
          background: '#050510',
        }}
        onPointerMove={onPointerMove}
      >
        <Canvas
          camera={{ position: [0, 0, 7], fov: 45, near: 0.1, far: 100 }}
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: false,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.1,
          }}
        >
          <CameraRig />
          <StudioLights />
          <fog attach="fog" args={['#050510', 15, 30]} />

          <KDSLogo />
          <OrbitalRings />
          <Particles count={3000} />
          <Shards />
        </Canvas>

        {/* Vignette overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
          background: 'radial-gradient(ellipse at center, transparent 35%, rgba(5,5,16,0.6) 100%)',
        }} />

        {/* Bottom gradient for scroll transition */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2, pointerEvents: 'none',
          height: '35vh',
          background: 'linear-gradient(to top, #050510 0%, transparent 100%)',
        }} />

        {/* Subtitle overlay — CSS only, no WebGL */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Thin line under logo area */}
          <div style={{
            width: `${80 + Math.abs(mouseSmooth.x) * 30}px`,
            height: '1px',
            marginTop: 140,
            background: 'linear-gradient(90deg, transparent, rgba(191,245,73,0.6), rgba(250,204,21,0.6), rgba(191,245,73,0.6), transparent)',
            boxShadow: '0 0 15px rgba(191,245,73,0.3)',
            borderRadius: 1,
          }} />
          <p style={{
            fontFamily: "'Space Grotesk', monospace",
            fontSize: 'clamp(0.55rem, 1.1vw, 0.85rem)',
            color: 'rgba(191,245,73,0.35)',
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            marginTop: 14,
            textShadow: '0 0 20px rgba(191,245,73,0.15)',
          }}>
            Kings Dripping Swag • 2130
          </p>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.5rem',
            color: 'rgba(255,255,255,0.08)',
            letterSpacing: '0.15em',
            marginTop: 8,
          }}>
            MOVE YOUR MOUSE — SPIN THE WORLD
          </p>
        </div>
      </div>

      {/* ═══════════ CONTENT BELOW (fades in) ═══════════ */}
      <div style={{
        opacity: contentOp, transition: 'opacity 0.6s ease', position: 'relative', zIndex: 10,
      }}>
        <div style={{ height: '100vh' }} />
      </div>
    </>
  );
}
