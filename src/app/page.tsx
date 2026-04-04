'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const AmbientSound = dynamic(() => import('@/components/AmbientSound'), { ssr: false });
const CoreIntelligenceSphere = dynamic(() => import('@/components/CoreIntelligenceSphere'), { ssr: false });

const mouseVec = { x: 0, y: 0 };

// ═══════════════════════════════════════════════════════
// SECTIONS
// ═══════════════════════════════════════════════════════
const sections = [
  { label: '// KDS AI', title: 'Design meets\nintelligence in 3D space.', body: 'A modern framework built for AI brands — minimal, dynamic, and deeply interactive. Make your presence feel intelligent from the very first pixel.', cta: 'EXPLORE KDS', planet: 'THE SUN', color: '#FF6600', bloom: '#FF4500', bg: '#06040A', pColor: '#FF8833', pCount: 1000, pSize: 0.06, pMode: 'fire', glow: 2.5, bl: 1.8 },
  { label: '// ABOUT', title: "KDS isn't a tool\nit's an autonomous AI.", body: 'It interprets data, form, and function to generate immersive web experiences through motion, geometry, and spatial intelligence. KDS doesn\'t just build — it thinks in design.', cta: null, planet: 'MERCURY', color: '#565656', bloom: '#707070', bg: '#050508', pColor: '#808080', pCount: 250, pSize: 0.012, pMode: 'fastOrbit', glow: 0.3, bl: 0.2, features: [{ icon: '●', text: 'Modular\nAI Components' }, { icon: '│', text: 'Adaptive\nWeb Architecture' }, { icon: '×', text: 'Realtime\n3D Interactions' }, { icon: '↗', text: 'Minimum Effort\nMaximum Impact' }] },
  { label: '// FEATURES', title: "KDS isn't just smart.\nIt learns, evolves, adapts.", body: 'Scroll to explore — each planet is a unique universe with custom shaders, particle physics, and post-processing effects. 10 worlds. Infinite depth.', cta: null, planet: 'EARTH', color: '#3377CC', bloom: '#44CC77', bg: '#020508', pColor: '#44CC77', pCount: 500, pSize: 0.025, pMode: 'life', glow: 0.9, bl: 0.5 },
  { label: '// GET STARTED', title: 'Launch with\nKDS', body: null, cta: 'ENTER KDS →', planet: 'BEYOND', color: '#BFF549', bloom: '#BFF549', bg: '#030510', pColor: '#BFF549', pCount: 800, pSize: 0.03, pMode: 'constellation', glow: 1.5, bl: 1.5, link: '/community' },
];

// ═══════════════════════════════════════════════════════
// STAR FIELD
// ═══════════════════════════════════════════════════════
function StarField() { const r = useRef<THREE.Points>(null); const g = useMemo(() => { const p = new Float32Array(4000 * 3); for (let i = 0; i < 4000; i++) p[i * 3] = (Math.random() - 0.5) * 180, p[i * 3 + 1] = (Math.random() - 0.5) * 180, p[i * 3 + 2] = (Math.random() - 0.5) * 180; return new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(p, 3)); }, []); useFrame(s => { if (r.current) r.current.rotation.y = s.clock.elapsedTime * 0.002; }); return <points ref={r} geometry={g}><pointsMaterial size={0.05} color="#fff" transparent opacity={0.35} sizeAttenuation depthWrite={false} /></points>; }

// ═══════════════════════════════════════════════════════
// PLANET
// ═══════════════════════════════════════════════════════
function Planet({ color, bloom, cz }: { color: string, bloom: string, cz: number }) { const m = useRef<THREE.Mesh>(null), g = useRef<THREE.Mesh>(null), o = Math.min(1, Math.abs(cz) / 1.8), s = Math.max(0.2, 1 - (1 - o) * 0.8); const { vs, fs } = useMemo(() => ({ vs: `uniform float uT,uO,uS;varying vec3 vN,vW;varying vec2 vU;void main(){vU=uv;vN=normalize((modelMatrix*vec4(normal,0)).xyz);vec3 p=position*uS+normal*(sin(position.x*4.+uT*.8)*.04+cos(position.y*3.+uT*.6)*.03);vW=(modelMatrix*vec4(p,1)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1);}`, fs: `uniform vec3 uC,uB;uniform float uT,uO;varying vec3 vN,vW;varying vec2 vU;void main(){float f=pow(1.-max(dot(normalize(cameraPosition-vW),vN),0.),3.5);vec3 c=uC+uC*(sin(vU.x*20.+uT*.5)*sin(vU.y*15.+uT*.4)*.12);c+=uB*f*.6;c+=mix(uC,uB,.5)*pow(1.-max(dot(normalize(cameraPosition-vW),vN),0.),5.)*1.2;gl_FragColor=vec4(c,mix(.3*f+.7,1.,1.-f)*uO);}` }), []); useFrame((t, d) => { if (m.current?.material) { m.current.rotation.y += d * 0.08; m.current.rotation.x = Math.sin(t.clock.elapsedTime * 0.15) * 0.03; m.current.scale.setScalar(s); const mt = m.current.material as THREE.ShaderMaterial; mt.uniforms.uTime.value = t.clock.elapsedTime; mt.uniforms.uOpacity.value = o; mt.uniforms.uScale.value = 1; } if (g.current) { g.current.rotation.y -= d * 0.012; g.current.scale.setScalar(1.5 + Math.sin(t.clock.elapsedTime * 0.5) * 0.06 + (1 - o)); (g.current.material as THREE.MeshBasicMaterial).opacity = 0.04 * o + (1 - o) * 0.12; } }); return <><mesh ref={g}><sphereGeometry args={[1.8, 32, 32]} /><meshBasicMaterial color={color} transparent opacity={0.04} side={THREE.BackSide} depthWrite={false} /></mesh><mesh ref={m}><sphereGeometry args={[1, 96, 96]} /><shaderMaterial vertexShader={vs} fragmentShader={fs} uniforms={{ uC: { value: new THREE.Color(color) }, uB: { value: new THREE.Color(bloom) }, uTime: { value: 0 }, uOpacity: { value: o }, uScale: { value: 1 } }} transparent side={THREE.FrontSide} /></mesh></>; }

// ═══════════════════════════════════════════════════════
// PARTICLES
// ═══════════════════════════════════════════════════════
function Particles({ mode, color, count, size, cz }: { mode: string, color: string, count: number, size: number, cz: number }) { const r = useRef<THREE.Points>(null); const { pos, vel, col } = useMemo(() => { const p = new Float32Array(count * 3), v = new Float32Array(count * 3), c = new Float32Array(count * 3), cr = new THREE.Color(color); for (let i = 0; i < count; i++) { const a = Math.random() * Math.PI * 2, d = Math.random(), i3 = i * 3; if (mode === 'fire') { const ph = Math.acos(2 * Math.random() - 1), rd = 1.5 + d * 4; p[i3] = rd * Math.sin(ph) * Math.cos(a); p[i3 + 1] = rd * Math.sin(ph) * Math.sin(a); p[i3 + 2] = rd * Math.cos(ph); v[i3] = p[i3] * 0.003; v[i3 + 1] = p[i3 + 1] * 0.003; v[i3 + 2] = p[i3 + 2] * 0.003; } else if (mode === 'fastOrbit') { const rd = 1.3 + d * 1.5; p[i3] = Math.cos(a) * rd; p[i3 + 1] = (Math.random() - 0.5) * 0.3; p[i3 + 2] = Math.sin(a) * rd; v[i3] = -Math.sin(a) * 0.012; v[i3 + 2] = Math.cos(a) * 0.012; } else if (mode === 'cloud') { const rd = 1.5 + d * 2; p[i3] = Math.cos(a) * rd; p[i3 + 1] = (Math.random() - 0.5) * 1.5; p[i3 + 2] = Math.sin(a) * rd; } else if (mode === 'life') { const rd = 1.5 + d * 2.5; p[i3] = Math.cos(a) * rd; p[i3 + 1] = Math.sin(a * 2) * 0.3; p[i3 + 2] = Math.sin(a) * rd; } else if (mode === 'constellation') { p[i3] = (Math.random() - 0.5) * 5; p[i3 + 1] = (Math.random() - 0.5) * 5; p[i3 + 2] = (Math.random() - 0.5) * 5; } else { p[i3] = (Math.random() - 0.5) * 5; p[i3 + 1] = (Math.random() - 0.5) * 5; p[i3 + 2] = (Math.random() - 0.5) * 5; } c[i3] = Math.max(0, Math.min(1, cr.r + (Math.random() - 0.5) * 0.15)); c[i3 + 1] = Math.max(0, Math.min(1, cr.g + (Math.random() - 0.5) * 0.15)); c[i3 + 2] = Math.max(0, Math.min(1, cr.b + (Math.random() - 0.5) * 0.15)); } return { pos: p, vel: v, col: c }; }, [mode, color, count]); useFrame((st, dt) => { if (!r.current) return; const p = r.current.geometry.attributes.position.array as Float32Array, tv = vel, t = st.clock.elapsedTime, sc = Math.max(0, 1 - Math.abs(cz) / 0.6) * 18; for (let i = 0; i < count; i++) { const i3 = i * 3; if (sc > 0.3) { const dx = p[i3], dy = p[i3 + 1], dz = p[i3 + 2], dd = Math.max(0.01, Math.sqrt(dx * dx + dy * dy + dz * dz)); tv[i3] += (dx / dd) * sc * dt; tv[i3 + 1] += (dy / dd) * sc * dt; tv[i3 + 2] += (dz / dd) * sc * dt; } if (mode === 'fire') { p[i3] += tv[i3]; p[i3 + 1] += tv[i3 + 1]; p[i3 + 2] += tv[i3 + 2]; if (p[i3] * p[i3] + p[i3 + 1] * p[i3 + 1] + p[i3 + 2] * p[i3 + 2] > 25) { const a2 = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1), rd = 1.5; p[i3] = rd * Math.sin(ph) * Math.cos(a2); p[i3 + 1] = rd * Math.sin(ph) * Math.sin(a2); p[i3 + 2] = rd * Math.cos(ph); tv[i3] = p[i3] * 0.003; tv[i3 + 1] = p[i3 + 1] * 0.003; tv[i3 + 2] = p[i3 + 2] * 0.003; } p[i3] += Math.sin(t * 2 + i) * 0.002; p[i3 + 1] += Math.cos(t * 1.5 + i) * 0.002; } else if (mode === 'fastOrbit') { const a2 = Math.atan2(p[i3 + 2], p[i3]) + dt * (1.8 + Math.sin(i * 0.4)); const rd = Math.sqrt(p[i3] * p[i3] + p[i3 + 2] * p[i3 + 2]); p[i3] = Math.cos(a2) * rd; p[i3 + 2] = Math.sin(a2) * rd; } else if (mode === 'cloud') { const a2 = Math.atan2(p[i3 + 2], p[i3]) + dt * 0.15; const rd = Math.sqrt(p[i3] * p[i3] + p[i3 + 2] * p[i3 + 2]); p[i3] = Math.cos(a2) * rd; p[i3 + 2] = Math.sin(a2) * rd; } else if (mode === 'life') { p[i3 + 1] = Math.sin(t * 0.6 + i * 0.05) * (0.25 + Math.abs(p[i3]) * 0.1); } else if (mode === 'constellation') { p[i3] += Math.sin(t * 0.15 + i * 0.08) * 0.003; p[i3 + 1] += Math.cos(t * 0.12 + i * 0.06) * 0.003; } if (sc > 0.3) { const d = 1 - Math.max(0, 1 - Math.abs(cz) / 0.6) * 0.15; tv[i3] *= d; tv[i3 + 1] *= d; tv[i3 + 2] *= d; } } r.current.geometry.attributes.position.needsUpdate = true; }); return <points ref={r} geometry={new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pos, 3)).setAttribute('color', new THREE.BufferAttribute(col, 3))}><pointsMaterial size={size * 1.8} vertexColors transparent opacity={0.85} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} /></points>; }

// ═══════════════════════════════════════════════════════
// CAMERA
// ═══════════════════════════════════════════════════════
function FlyCam({ cp }: { cp: number }) { const { camera } = useThree(); const st = useRef({ z: 5, fov: 36 }); useFrame(() => { const c = camera as THREE.PerspectiveCamera, tz = 5 - cp * 10; st.current.z += (tz - st.current.z) * 0.06; const px = 1 - Math.abs(cp - 0.5) * 2, tf = 36 + px * 30; st.current.fov += (tf - st.current.fov) * 0.06; c.position.z = st.current.z; c.position.x += (mouseVec.x * 0.25 * px - c.position.x) * 0.025; c.position.y += (-mouseVec.y * 0.15 * px - c.position.y) * 0.025; c.fov = st.current.fov; c.lookAt(0, 0, -5); c.updateMatrix(); c.updateProjectionMatrix(); }); return null; }

// ═══════════════════════════════════════════════════════
// POST-PROCESSING
// ═══════════════════════════════════════════════════════
import { EffectComposer, Bloom, DepthOfField, ChromaticAberration, Vignette, Noise } from '@react-three/postprocessing';
function PP({ bloom, cp, cz }: { bloom: number, cp: number, cz: number }) { const px = 1 - Math.abs(cp - 0.5) * 2, ca = px * 0.0025; return <EffectComposer enableNormalPass={false}>{/* <Bloom intensity={bloom * 0.7} luminanceThreshold={0.8} luminanceSmoothing={0.9} mipmapBlur radius={0.5} /> <DepthOfField focusDistance={Math.max(0, Math.abs(cz) - 0.8) * 0.12} focalLength={0.02 + px * 0.025} bokehScale={px * 2.5} /> <ChromaticAberration offset={new THREE.Vector2(ca, ca)} /> */}<Vignette eskil={false} offset={0.1} darkness={0.3} /><Noise opacity={0.015 + px * 0.01} /></EffectComposer>; }

// ═══════════════════════════════════════════════════════
// SCENE
// ═══════════════════════════════════════════════════════
function Scene({ ch, cz, cp }: { ch: typeof sections[0], cz: number, cp: number }) { return <><FlyCam cp={cp} /><ambientLight intensity={ch.glow * 0.06} /><pointLight position={[0, 0, 0]} intensity={ch.glow * (0.3 + Math.abs(cz) * 0.11)} color={ch.color} distance={10} /><pointLight position={[cz > 0 ? 6 : -6, 5, 5]} intensity={0.5} color={ch.pColor} distance={12} /><StarField /><Planet color={ch.color} bloom={ch.bloom} cz={cz} /><Particles mode={ch.pMode} color={ch.pColor} count={ch.pCount} size={ch.pSize} cz={cz} /></>; }

// ═══════════════════════════════════════════════════════
// LOADING SCREEN
// ═══════════════════════════════════════════════════════
function LoadingScreen({ progress }: { progress: number }) { return <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#06040A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.5s', opacity: progress < 100 ? 1 : 0, pointerEvents: progress < 100 ? 'auto' : 'none' }}>
    <svg width="120" height="120" viewBox="0 0 164 164" style={{ marginBottom: 24 }}>
      <circle r="80" cx="82" cy="82" fill="transparent" stroke="#222" strokeWidth="1" strokeDasharray="502.65" />
      <circle r="80" cx="82" cy="82" fill="transparent" stroke="#fff" strokeWidth="2" strokeDasharray="502.65" strokeDashoffset={`${502.65 * (1 - progress / 100)}`} style={{ transition: 'stroke-dashoffset 0.05s' }} />
    </svg>
    <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(191,245,73,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", color: '#BFF549', fontWeight: 700, fontSize: 14 }}>K</div>
    </div>
    <div style={{ fontFamily: "'JetBrains Mono', monospace", color: '#fff', fontSize: 13, fontWeight: 500, marginTop: 16 }}>{Math.round(progress)}%</div>
  </div>; }

// ═══════════════════════════════════════════════════════
// TEXT OVERLAY — fades in/out with scroll
// ═══════════════════════════════════════════════════════
function TextOverlay({ section, active, progress, link }: { section: typeof sections[0], active: boolean, progress: number, link?: string }) {
  // Fade in at 10%, hold, fade out last 10%
  const opacity = Math.min(1, progress < 0.1 ? progress / 0.1 : progress > 0.9 ? (1 - progress) / 0.1 : 1);
  const yOffset = opacity < 0.05 ? (progress < 0.1 ? 20 : -20) : 0;

  return <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: opacity > 0.3 ? 'auto' : 'none', zIndex: 10 }}>
    <div style={{ textAlign: 'center', padding: 60, maxWidth: 550, opacity, transform: `translateY(${yOffset}px)`, transition: 'opacity 0.3s ease, transform 0.3s ease' }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: `${section.bloom}15`, fontSize: 9, fontWeight: 500, letterSpacing: 0.15 }}>{section.label}</span>
      <h1 style={{ fontFamily: "'Inter', sans-serif", color: (section.label === '// KDS AI' || section.label === '// GET STARTED') ? 'transparent' : 'rgba(255,255,255,0.9)', fontSize: section.label === '// KDS AI' ? 'clamp(2.5rem,7vw,5rem)' : section.label === '// GET STARTED' ? 'clamp(2.2rem,6vw,4.5rem)' : 'clamp(1.5rem,3.5vw,2.5rem)', fontWeight: 300, marginTop: 4, marginBottom: 8, lineHeight: 1.1, whiteSpace: 'pre-line', ...(section.label === '// KDS AI' || section.label === '// GET STARTED') ? { background: `linear-gradient(180deg,${section.bloom},${section.color})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: `drop-shadow(0 0 25px ${section.bloom}30)` } : {} }}>{(section.label === '// KDS AI' || section.label === '// GET STARTED') ? section.title : ''}</h1>
      {section.body && <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, lineHeight: 1.7, maxWidth: 420, margin: '0 auto 24px' }}>{section.body}</p>}
      {section.features && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, maxWidth: 560, margin: '0 auto 24px' }}>{section.features.map((f, i) => <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 8, padding: '16px 12px' }}><span style={{ color: section.bloom, fontSize: 16, fontFamily: "'JetBrains Mono', monospace", display: 'block', marginBottom: 10 }}>{f.icon}</span><span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'pre-line', lineHeight: 1.4 }}>{f.text}</span></div>)}</div>}
      {section.cta && (link ? <a href={link} style={{ display: 'inline-block', padding: '8px 22px', background: `${section.bloom}06`, border: `1px solid ${section.bloom}12`, color: section.bloom, borderRadius: 4, fontSize: 10, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '.08em', textDecoration: 'none' }}>{section.cta}</a> : <span style={{ display: 'inline-block', padding: '8px 22px', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)', borderRadius: 4, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '.08em' }}>{section.cta}</span>)}
      {!section.cta && active && <span style={{ display: 'block', marginTop: 8, color: 'rgba(255,255,255,0.06)', fontSize: 9, fontFamily: "'JetBrains Mono', monospace", animation: 'mc-b 2.5s ease-in-out infinite' }}>SCROLL ↓</span>}
      {section.label === '// GET STARTED' && <div style={{ marginTop: 50, color: 'rgba(255,255,255,0.08)', fontSize: 8, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.1 }}>© 2130 — KDS INC. All rights reserved</div>}
    </div>
  </div>; }

// ═══════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════
export default function HomePage() {
  const [section, setSection] = useState(0);
  const [progress, setProgress] = useState(0);
  const [cz, setCz] = useState(5);
  const [loaded, setLoaded] = useState(false);
  const [loadPct, setLoadPct] = useState(0);
  const [menu, setMenu] = useState(false);

  // Loading
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let p = 0;
    const ease = (x: number) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    interval = setInterval(() => { p += Math.round((ease((p + 50) / 6000) - ease(p / 6000)) * 100); p = Math.min(p, 75); setLoadPct(p); if (p >= 75) clearInterval(interval); }, 50);
    setTimeout(() => { clearInterval(interval); setLoadPct(100); setTimeout(() => setLoaded(true), 400); }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Scroll
  useEffect(() => { let raf: number; const u = () => { const m = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1); const t = Math.min(window.scrollY / m, 0.999); const s = Math.min(sections.length - 1, Math.floor(t * sections.length)); setSection(s); setProgress((t * sections.length) - s); setCz(5 - ((t * sections.length) - s) * 10); raf = requestAnimationFrame(u); }; raf = requestAnimationFrame(u); return () => cancelAnimationFrame(raf); }, []);

  // Mouse
  const onMove = useCallback((e: React.PointerEvent) => { mouseVec.x = (e.clientX / window.innerWidth) * 2 - 1; mouseVec.y = -(e.clientY / window.innerHeight) * 2 + 1; }, []);

  const ch = sections[section];

  return <>
    <style>{`@keyframes mc-b{0%,100%{transform:translateY(0);opacity:.06}50%{transform:translateY(5px);opacity:.12}}*{scrollbar-width:none}::-webkit-scrollbar{display:none}`}</style>
    <LoadingScreen progress={loadPct} />
    {loaded && <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: ch.bg, transition: 'background .5s' }} onPointerMove={onMove}>
        <Canvas key={section} camera={{ position: [0, 0, 5], fov: 36, near: 0.1, far: 100 }} dpr={[1, 1.5]} gl={{ antialias: false, alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.3 }}>
          <Scene ch={ch} cz={cz} cp={progress} />
        </Canvas>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: '#000', zIndex: 5, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 6, background: '#000', zIndex: 5, pointerEvents: 'none' }} />
      </div>
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, height: 44, display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 24, height: 24, borderRadius: 4, background: `${ch.bloom}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ch.bloom, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 10, transition: 'all .4s' }}>K</div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: ch.bloom, letterSpacing: '.1em', transition: 'color .4s' }}>{ch.planet}</span>
        </div>
        <div style={{ display: 'flex', gap: 20 }} className="desktop-nav">
          {sections.map(s => <span key={s.label} onClick={() => { const m = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1); window.scrollTo({ top: (sections.indexOf(s) / (sections.length - 1)) * m, behavior: 'smooth' }); }} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: section === sections.indexOf(s) ? ch.bloom : 'rgba(255,255,255,0.35)', cursor: 'pointer', transition: 'color .3s' }}>{s.label.replace('// ', '')}</span>)}
        </div>
        <div onClick={() => setMenu(!menu)} style={{ cursor: 'pointer' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><line x1="4" y1="7" x2="20" y2="7" stroke="#fff" strokeWidth="1" /><line x1="4" y1="12" x2="20" y2="12" stroke="#fff" strokeWidth="1" /><line x1="4" y1="17" x2="20" y2="17" stroke="#fff" strokeWidth="1" /></svg></div>
      </header>
      <nav style={{ position: 'fixed', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 50, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sections.map((s, i) => <button key={i} onClick={() => { const m = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1); window.scrollTo({ top: (i / (sections.length - 1)) * m, behavior: 'smooth' }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><span style={{ width: section === i ? 5 : 3, height: section === i ? 5 : 3, borderRadius: '50%', background: section === i ? s.bloom : 'rgba(255,255,255,0.04)', transition: 'all .3s', boxShadow: section === i ? `0 0 6px ${s.bloom}20` : 'none' }} /></button>)}
      </nav>
      <div style={{ position: 'relative', zIndex: 10 }}>{sections.map((s, i) => <div key={i} style={{ height: '100vh' }}><TextOverlay section={s} active={section === i} progress={section === i ? progress : (i < section ? 1 : 0)} link={s['link' as keyof typeof s] as string} /></div>)}</div>
    </>}
    <AmbientSound />
  </>;
}

// Fix: prevent duplicate fontFamily property issues
