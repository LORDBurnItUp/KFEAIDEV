'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const AmbientSound = dynamic(() => import('@/components/AmbientSound'), { ssr: false });

// Shared mouse state
const mouseVec = { x: 0, y: 0 };

// ═══════════════════════════════════════════════════════
// 🌌 SOLAR SYSTEM CHAPTERS — 10 worlds, each unique
// ═══════════════════════════════════════════════════════
const chapters = [
  { name: 'THE SUN', subtitle: 'Where it all begins', planetColor: '#FF6600', bgDark: '#0a0200', particleColor: '#FF8833', particleCount: 800, particleSize: 0.06, particleMode: 'fire', glowIntensity: 2.5, content: 'Design meets intelligence in 3D space. Enter the system to begin your journey.', stats: null },
  { name: 'MERCURY', subtitle: 'Speed and precision', planetColor: '#8090A0', bgDark: '#060608', particleColor: '#A0B0C0', particleCount: 200, particleSize: 0.015, particleMode: 'fastOrbit', glowIntensity: 0.4, content: 'Built for speed. Every millisecond counts.', stats: null },
  { name: 'VENUS', subtitle: 'The clouded beauty', planetColor: '#E8C56D', bgDark: '#0a0800', particleColor: '#F0D080', particleCount: 350, particleSize: 0.035, particleMode: 'cloud', glowIntensity: 0.6, content: 'Shrouded in golden clouds. Brilliance awaits beneath the surface.', stats: null },
  { name: 'EARTH', subtitle: 'Home of KDS', planetColor: '#2266AA', bgDark: '#030608', particleColor: '#44CC77', particleCount: 500, particleSize: 0.025, particleMode: 'life', glowIntensity: 0.8, content: '12.8K+ developers from around the world. The hub where AI builders connect.', stats: [{ n: '12.8K', l: 'Members' }, { n: '847', l: 'Active Today' }, { n: '99.7%', l: 'Uptime' }] },
  { name: 'MARS', subtitle: 'The red frontier', planetColor: '#BB3322', bgDark: '#080200', particleColor: '#DD5533', particleCount: 600, particleSize: 0.03, particleMode: 'storm', glowIntensity: 0.8, content: 'The next frontier. KDS is colonizing the future.', stats: null },
  { name: 'JUPITER', subtitle: 'King of planets', planetColor: '#C8A060', bgDark: '#080600', particleColor: '#D4B070', particleCount: 700, particleSize: 0.02, particleMode: 'bands', glowIntensity: 0.5, content: 'The largest community hub this side of the asteroid belt.', stats: [{ n: '6', l: 'Features' }, { n: '99', l: 'Pages' }, { n: '∞', l: 'Scale' }] },
  { name: 'SATURN', subtitle: 'The ringed giant', planetColor: '#D4B878', bgDark: '#060600', particleColor: '#E8D088', particleCount: 500, particleSize: 0.015, particleMode: 'ringDisk', glowIntensity: 0.6, hasRing: true, content: 'Rings of opportunity in an endless orbit.', stats: null },
  { name: 'URANUS', subtitle: 'The tilted one', planetColor: '#77BBCC', bgDark: '#00060a', particleColor: '#99E0E8', particleCount: 250, particleSize: 0.02, particleMode: 'tilted', glowIntensity: 0.4, content: 'Think different. A completely new angle.', stats: null },
  { name: 'NEPTUNE', subtitle: 'The deep blue', planetColor: '#2244BB', bgDark: '#000006', particleColor: '#3366DD', particleCount: 400, particleSize: 0.03, particleMode: 'jets', glowIntensity: 0.7, content: 'The final frontier. KDS pushes all boundaries.', stats: null },
  { name: 'BEYOND', subtitle: 'Welcome home', planetColor: '#BFF549', bgDark: '#030308', particleColor: '#BFF549', particleCount: 800, particleSize: 0.025, particleMode: 'constellation', glowIntensity: 1.2, content: 'Build, earn, and connect. Welcome to 2130.', stats: null, link: '/community' },
];

// ═══════════════════════════════════════════════════════
// 🌟 STAR FIELD
// ═══════════════════════════════════════════════════════
function StarField() {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const pos = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 200;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 200;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    return new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pos, 3));
  }, []);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.003;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.002) * 0.02;
    }
  });
  return <points ref={ref} geometry={geo}><pointsMaterial size={0.08} color="#FFFFFF" transparent={true} opacity={0.45} sizeAttenuation={true} depthWrite={false} /></points>;
}

// ═══════════════════════════════════════════════════════
// 🌍 PLANET — custom shader, transparent on flythrough
// ═══════════════════════════════════════════════════════
function Planet({ color, glow, cameraZ, hasRing }: { color: string, glow: number, cameraZ: number, hasRing?: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const planetOpacity = Math.min(1, Math.abs(cameraZ) / 1.5);
  const planetScale = Math.max(0.3, 1 - (1 - planetOpacity) * 0.7);

  const { vertexShader, fragmentShader } = useMemo(() => ({
    vertexShader: `
      uniform float uTime;
      varying vec3 vNormal; varying vec2 vUv;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec3 pos = position + normal * sin(pos.x * 3.0 + uTime) * 0.02 + normal * cos(pos.y * 2.0 + uTime * 0.7) * 0.015;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor; uniform float uTime; uniform float uOpacity;
      varying vec3 vNormal; varying vec2 vUv;
      void main() {
        float pattern = sin(vUv.x * 12.0 + uTime * 0.5) * sin(vUv.y * 8.0 + uTime * 0.3) * 0.1;
        vec3 col = uColor + pattern;
        col += uColor * pow(1.0 - max(dot(normalize(cameraPosition - vec3(0,0,5)), vNormal), 0.0), 2.5) * 0.8;
        col += vec3(1.0) * pow(1.0 - max(dot(normalize(cameraPosition - vec3(0,0,5)), vNormal), 0.0), 4.0) * 0.15;
        gl_FragColor = vec4(col, uOpacity);
      }
    `,
  }), []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.08;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.03;
      meshRef.current.scale.setScalar(planetScale);
      if (meshRef.current.material) {
        (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.elapsedTime;
        (meshRef.current.material as THREE.ShaderMaterial).uniforms.uOpacity.value = planetOpacity;
      }
    }
    if (glowRef.current) {
      glowRef.current.rotation.y -= delta * 0.015;
      glowRef.current.scale.setScalar(1.4 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05 + (1 - planetOpacity) * 0.8);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.06 * planetOpacity + (1 - planetOpacity) * 0.12;
    }
  });

  return (
    <group>
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.6, 32, 32]} />
        <meshBasicMaterial color={color} transparent={true} opacity={0.06} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={{
          uColor: { value: new THREE.Color(color) },
          uTime: { value: 0 },
          uOpacity: { value: planetOpacity },
        }} transparent={true} />
      </mesh>
      {hasRing && <mesh rotation={[Math.PI / 2.4, 0, 0]}>
        <ringGeometry args={[1.3, 2.6, 128]} />
        <meshStandardMaterial side={THREE.DoubleSide} transparent={true} opacity={0.5 * planetOpacity} metalness={0.7} roughness={0.3} color={color} />
      </mesh>}
    </group>
  );
}

// ═══════════════════════════════════════════════════════
// ✨ PLANET PARTICLES — scatter on flythrough
// ═══════════════════════════════════════════════════════
function PlanetParticles({ mode, color, count, size, cameraZ }: { mode: string, color: string, count: number, size: number, cameraZ: number }) {
  const ref = useRef<THREE.Points>(null);
  const { positions, velocities, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const c = new THREE.Color(color);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = Math.random();
      switch (mode) {
        case 'fire': {
          const theta = Math.random() * Math.PI * 2, phi = Math.acos(2 * Math.random() - 1), rad = 1.2 + r * 4;
          pos[i3] = rad * Math.sin(phi) * Math.cos(theta); pos[i3+1] = rad * Math.sin(phi) * Math.sin(theta); pos[i3+2] = rad * Math.cos(phi);
          vel[i3] = pos[i3] * 0.003; vel[i3+1] = pos[i3+1] * 0.003; vel[i3+2] = pos[i3+2] * 0.003; break;
        }
        case 'fastOrbit': {
          const angle = Math.random() * Math.PI * 2, rad = 1.3 + r * 1.5;
          pos[i3] = Math.cos(angle) * rad; pos[i3+1] = (Math.random()-0.5)*0.3; pos[i3+2] = Math.sin(angle) * rad;
          vel[i3] = -Math.sin(angle)*0.012; vel[i3+2] = Math.cos(angle)*0.012; break;
        }
        case 'cloud': {
          const angle = Math.random() * Math.PI * 2, rad = 1.5 + r * 2;
          pos[i3] = Math.cos(angle)*rad; pos[i3+1] = (Math.random()-0.5)*1.5; pos[i3+2] = Math.sin(angle)*rad; break;
        }
        case 'life': {
          const angle = Math.random() * Math.PI * 2, rad = 1.5 + r * 2.5;
          pos[i3] = Math.cos(angle)*rad; pos[i3+1] = Math.sin(angle*2)*0.3; pos[i3+2] = Math.sin(angle)*rad; break;
        }
        case 'storm': {
          const angle = Math.random() * Math.PI * 2, rad = 1.2 + r * 4;
          pos[i3] = Math.cos(angle)*rad; pos[i3+1] = (Math.random()-0.5)*rad*0.8; pos[i3+2] = Math.sin(angle)*rad; break;
        }
        case 'bands': {
          const angle = Math.random() * Math.PI * 2, band = Math.floor(Math.random()*8), rad = 1.3 + band*0.3;
          pos[i3] = Math.cos(angle)*rad; pos[i3+1] = (band-4)*0.25; pos[i3+2] = Math.sin(angle)*rad*0.9; break;
        }
        case 'ringDisk': {
          const angle = Math.random() * Math.PI * 2, rad = 1.5 + r * 3;
          pos[i3] = Math.cos(angle)*rad; pos[i3+1] = (Math.random()-0.5)*0.06; pos[i3+2] = Math.sin(angle)*rad; break;
        }
        case 'tilted': {
          const angle = Math.random() * Math.PI * 2, rad = 1.4 + r * 2;
          pos[i3] = Math.cos(angle)*rad; pos[i3+1] = Math.sin(angle)*rad; pos[i3+2] = (Math.random()-0.5)*0.5; break;
        }
        case 'jets': {
          const angle = Math.random() * Math.PI * 2, rad = 1.3 + r * 2;
          pos[i3] = Math.cos(angle)*rad*0.5; pos[i3+1] = (Math.random()-0.5)*5; pos[i3+2] = Math.sin(angle)*rad*0.5; break;
        }
        default:
          pos[i3] = (Math.random()-0.5)*5; pos[i3+1] = (Math.random()-0.5)*5; pos[i3+2] = (Math.random()-0.5)*5;
      }
      col[i3] = Math.max(0, Math.min(1, c.r + (Math.random()-0.5)*0.15));
      col[i3+1] = Math.max(0, Math.min(1, c.g + (Math.random()-0.5)*0.15));
      col[i3+2] = Math.max(0, Math.min(1, c.b + (Math.random()-0.5)*0.15));
    }
    return { positions: pos, velocities: vel, colors: col };
  }, [mode, color, count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const p = ref.current.geometry.attributes.position.array as Float32Array;
    const v = velocities;
    const t = state.clock.elapsedTime;
    const scatterIntensity = Math.max(0, 1 - Math.abs(cameraZ) / 0.5);
    const scatterForce = scatterIntensity * 15;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      if (scatterForce > 0.3) {
        const dx = p[i3], dy = p[i3+1], dz = p[i3+2];
        const dist = Math.max(0.01, Math.sqrt(dx*dx + dy*dy + dz*dz));
        v[i3] += (dx/dist) * scatterForce * delta; v[i3+1] += (dy/dist) * scatterForce * delta; v[i3+2] += (dz/dist) * scatterForce * delta;
      }
      switch (mode) {
        case 'fire':
          p[i3] += v[i3]; p[i3+1] += v[i3+1]; p[i3+2] += v[i3+2];
          if (p[i3]*p[i3]+p[i3+1]*p[i3+1]+p[i3+2]*p[i3+2] > 25) {
            const a = Math.random()*Math.PI*2, ph=Math.acos(2*Math.random()-1), r=1.5;
            p[i3]=r*Math.sin(ph)*Math.cos(a); p[i3+1]=r*Math.sin(ph)*Math.sin(a); p[i3+2]=r*Math.cos(ph);
            v[i3]=p[i3]*0.003; v[i3+1]=p[i3+1]*0.003; v[i3+2]=p[i3+2]*0.003;
          }
          p[i3] += Math.sin(t*2+i)*0.002; p[i3+1] += Math.cos(t*1.5+i)*0.002; break;
        case 'fastOrbit': {
          const a = Math.atan2(p[i3+2], p[i3]) + delta*(1.8+Math.sin(i*0.5)*0.3);
          const r = Math.sqrt(p[i3]*p[i3]+p[i3+2]*p[i3+2]); p[i3]=Math.cos(a)*r; p[i3+2]=Math.sin(a)*r; break; }
        case 'cloud': {
          const a = Math.atan2(p[i3+2], p[i3]) + delta*0.15;
          const r = Math.sqrt(p[i3]*p[i3]+p[i3+2]*p[i3+2]); p[i3]=Math.cos(a)*r; p[i3+2]=Math.sin(a)*r;
          p[i3+1] += Math.sin(t*0.4+i*0.1)*0.001; break; }
        case 'life': p[i3+1] = Math.sin(t*0.6+i*0.05)*(0.25+Math.abs(p[i3])*0.1); break;
        case 'storm': {
          const a = Math.atan2(p[i3+2], p[i3]) + delta*(0.25+Math.sin(i*0.1+t)*0.4);
          const r = Math.sqrt(p[i3]*p[i3]+p[i3+2]*p[i3+2]); p[i3]=Math.cos(a)*r; p[i3+2]=Math.sin(a)*r;
          p[i3+1] += Math.sin(t*2.5+i*0.3)*0.003; break; }
        case 'bands': {
          const a = Math.atan2(p[i3+2], p[i3]) + delta*0.18*(Math.sin(p[i3+1]*3)*0.5+1);
          const r = Math.sqrt(p[i3]*p[i3]+p[i3+2]*p[i3+2]); p[i3]=Math.cos(a)*r; p[i3+2]=Math.sin(a)*r; break; }
        case 'ringDisk': {
          const a = Math.atan2(p[i3+2], p[i3]) + delta*(0.35/(Math.sqrt(p[i3]*p[i3]+p[i3+2]*p[i3+2])+0.5));
          const r = Math.sqrt(p[i3]*p[i3]+p[i3+2]*p[i3+2]); p[i3]=Math.cos(a)*r; p[i3+2]=Math.sin(a)*r; break; }
        case 'tilted': {
          const a = Math.atan2(p[i3+1], p[i3]) + delta*0.25;
          const r = Math.sqrt(p[i3]*p[i3]+p[i3+1]*p[i3+1]); p[i3]=Math.cos(a)*r; p[i3+1]=Math.sin(a)*r; break; }
        case 'jets': p[i3+1] += Math.sin(t*0.4+i)*0.025; p[i3+1] = ((p[i3+1]+2.5)%5)-2.5; break;
        case 'constellation': p[i3]+=Math.sin(t*0.15+i*0.08)*0.003; p[i3+1]+=Math.cos(t*0.12+i*0.06)*0.003; break;
        default: p[i3]+=Math.sin(t*0.1+i*0.1)*0.002;
      }
      if (scatterIntensity > 0.1) { v[i3]*=0.92; v[i3+1]*=0.92; v[i3+2]*=0.92; }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(positions, 3)).setAttribute('color', new THREE.BufferAttribute(colors, 3))}>
      <pointsMaterial size={size * 1.8} vertexColors={true} transparent={true} opacity={0.85} sizeAttenuation={true} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

// ═══════════════════════════════════════════════════════
// 🎥 FLYTHROUGH CAMERA
// ═══════════════════════════════════════════════════════
function FlythroughCamera({ chapterProgress }: { chapterProgress: number }) {
  const { camera } = useThree();
  const state = useRef({ z: 5, fov: 50 });
  useFrame(() => {
    const c = camera as THREE.PerspectiveCamera;
    const targetZ = 5 - chapterProgress * 10;
    state.current.z += (targetZ - state.current.z) * 0.06;
    const proximity = 1 - Math.abs(chapterProgress - 0.5) * 2;
    const targetFov = 40 + proximity * 25;
    state.current.fov += (targetFov - state.current.fov) * 0.05;
    c.position.z = state.current.z;
    c.position.x += (mouseVec.x * 0.2 * proximity - c.position.x) * 0.03;
    c.position.y += (-mouseVec.y * 0.15 * proximity - c.position.y) * 0.03;
    c.fov = state.current.fov;
    c.lookAt(0, 0, -5);
    c.updateMatrix();
    c.updateProjectionMatrix();
  });
  return null;
}

// ═══════════════════════════════════════════════════════
// SCENE
// ═══════════════════════════════════════════════════════
function Scene({ chapter, cameraZ, chapterProgress }: { chapter: typeof chapters[0], cameraZ: number, chapterProgress: number }) {
  return (
    <>
      <FlythroughCamera chapterProgress={chapterProgress} />
      <ambientLight intensity={chapter.glowIntensity * 0.08} />
      <pointLight position={[0, 0, 0]} intensity={chapter.glowIntensity * (0.4 + Math.abs(cameraZ) * 0.12)} color={chapter.planetColor} distance={10} />
      <pointLight position={[cameraZ > 0 ? 5 : -5, 4, 4]} intensity={0.5} color={chapter.particleColor} distance={12} />
      <StarField />
      <Planet color={chapter.planetColor} glow={chapter.glowIntensity} cameraZ={cameraZ} hasRing={chapter.hasRing} />
      <PlanetParticles mode={chapter.particleMode} color={chapter.particleColor} count={chapter.particleCount} size={chapter.particleSize} cameraZ={cameraZ} />
    </>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════
export default function HomePage() {
  const [activeChapter, setActiveChapter] = useState(0);
  const [chapterProgress, setChapterProgress] = useState(0);
  const [cameraZ, setCameraZ] = useState(5);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const tickT = setInterval(() => setTime(new Date()), 1000);
    let raf: number;
    const update = () => {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const totalProgress = Math.min(window.scrollY / max, 0.999);
      const ch = Math.min(chapters.length - 1, Math.floor(totalProgress * chapters.length));
      const progress = (totalProgress * chapters.length) - ch;
      setActiveChapter(ch);
      setChapterProgress(progress);
      setCameraZ(5 - progress * 10);
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => { clearInterval(tickT); cancelAnimationFrame(raf); };
  }, []);

  const scrollTo = (i: number) => {
    const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    window.scrollTo({ top: (i / (chapters.length - 1)) * max, behavior: 'smooth' });
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    mouseVec.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseVec.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, []);

  const chapter = chapters[activeChapter];
  const contentOpacity = Math.min(1, chapterProgress < 0.15 ? chapterProgress / 0.15 : chapterProgress > 0.85 ? (1 - chapterProgress) / 0.15 : 1);

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: chapter.bgDark, transition: 'background 0.6s ease' }} onPointerMove={handlePointerMove}>
        <Canvas key={activeChapter} camera={{ position: [0, 0, 5], fov: 40, near: 0.1, far: 100 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}>
          <Scene chapter={chapter} cameraZ={cameraZ} chapterProgress={chapterProgress} />
        </Canvas>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse at 50% 50%, transparent ${35 + (1 - contentOpacity) * 25}%, rgba(0,0,0,${0.25 + (1 - contentOpacity) * 0.35}) 100%)` }} />
      </div>

      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(5,5,10,0.12)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.02)', height: 36, display: 'flex', alignItems: 'center', padding: '0 12px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: `${chapter.planetColor}08`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: chapter.planetColor, fontWeight: 900, fontSize: 7, transition: 'all 0.4s' }}>K</div>
          <span style={{ fontWeight: 800, fontSize: 10 }}><span style={{ color: chapter.planetColor, transition: 'color 0.4s' }}>{chapter.name}</span><span style={{ color: 'rgba(255,255,255,0.15)', fontWeight: 400, fontSize: 7, marginLeft: 4 }}>KDS</span></span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[{ l: 'Community', h: '/community' }, { l: 'Dashboard', h: '/dashboard' }].map(n => (
            <a key={n.l} href={n.h} style={{ padding: '2px 6px', borderRadius: 3, fontSize: 7, fontWeight: 500, color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>{n.l}</a>
          ))}
        </div>
      </header>

      <nav style={{ position: 'fixed', right: 10, top: '50%', transform: 'translateY(-50%)', zIndex: 50, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {chapters.map((p, i) => (
          <button key={i} onClick={() => scrollTo(i)} style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '1px 0' }}>
            <span style={{ position: 'relative', width: activeChapter === i ? 5 : 4, height: activeChapter === i ? 5 : 4, borderRadius: '50%', background: activeChapter === i ? p.planetColor : 'rgba(255,255,255,0.05)', transition: 'all 0.3s', boxShadow: activeChapter === i ? `0 0 6px ${p.planetColor}20` : 'none' }}>
              {activeChapter === i && <span style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: `1px solid ${p.planetColor}10` }} />}
            </span>
          </button>
        ))}
      </nav>

      <div style={{ position: 'fixed', inset: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{ textAlign: 'center', padding: 40, maxWidth: 480, opacity: contentOpacity, transform: `translateY(${(1 - contentOpacity) * 20}px)`, transition: 'opacity 0.3s ease, transform 0.3s ease', pointerEvents: contentOpacity > 0.3 ? 'auto' : 'none' }}>
          {contentOpacity > 0.5 && (
            <>
              <span style={{ color: `${chapter.planetColor}20`, fontSize: 7, fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase' }}>{chapter.subtitle}</span>
              <h2 style={{ color: activeChapter === 0 || activeChapter === 9 ? 'transparent' : 'rgba(255,255,255,0.8)', fontSize: activeChapter === 0 ? 'clamp(2.5rem, 8vw, 5rem)' : 'clamp(1.5rem, 4vw, 2.8rem)', fontWeight: 900, marginTop: activeChapter === 0 ? 4 : 4, marginBottom: activeChapter === 0 ? 8 : 6, lineHeight: 0.85,
                ...(activeChapter === 0 || activeChapter === 9 ? { background: `linear-gradient(180deg, ${chapter.planetColor} 0%, ${chapter.particleColor} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: `drop-shadow(0 0 30px ${chapter.planetColor}30)` } : {}) }}>
                {chapter.name}
              </h2>
              {activeChapter !== 0 && <div style={{ width: 50, height: 1, background: `linear-gradient(90deg, transparent, ${chapter.planetColor}50, transparent)`, margin: '0 auto 10px' }} />}
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, lineHeight: 1.7, maxWidth: 380, margin: '0 auto 12px' }}>{chapter.content}</p>
              {chapter.stats && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 30, marginBottom: 12 }}>
                  {chapter.stats.map((s: { n: string, l: string }, si: number) => (
                    <div key={si} style={{ textAlign: 'center' }}>
                      <div style={{ color: chapter.planetColor, fontSize: 18, fontWeight: 800 }}>{s.n}</div>
                      <div style={{ color: 'rgba(255,255,255,0.12)', fontSize: 6, letterSpacing: '0.15em', marginTop: 2, textTransform: 'uppercase' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              )}
              {chapter.link && <a href={chapter.link} style={{ display: 'inline-block', padding: '8px 20px', background: `${chapter.planetColor}06`, border: `1px solid ${chapter.planetColor}15`, color: chapter.planetColor, borderRadius: 5, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textDecoration: 'none' }}>
                {activeChapter === 9 ? 'JOIN KDS →' : 'Explore →'}</a>}
              {activeChapter < 9 && !chapter.link && <div style={{ marginTop: 10, animation: 'mcB 2s ease-in-out infinite', color: 'rgba(255,255,255,0.06)', fontSize: 9 }}>↓ Keep scrolling to fly through</div>}
            </>
          )}
        </div>
      </div>

      <AmbientSound />
      <style>{`@keyframes mcB{0%,100%{transform:translateY(0);opacity:.06}50%{transform:translateY(6px);opacity:.12}}`}</style>
    </>
  );
}
