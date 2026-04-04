'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const AmbientSound = dynamic(() => import('@/components/AmbientSound'), { ssr: false });

// Shared mouse state
const mouseVec = { x: 0, y: 0 };

// ═══════════════════════════════════════════════════════
// CHAPTERS — scroll anchors for camera path
// ═══════════════════════════════════════════════════════
const chapters = [
  {
    section: '// KDS',
    subtitle: 'Design meets intelligence in 3D space.',
    body: 'A modern framework built for AI brands — minimal, dynamic, and deeply interactive. Make your presence feel intelligent from the very first pixel.',
    cta: 'EXPLORE KDS',
    // Planet config
    name: 'THE SUN', color: '#FF6600', bloomColor: '#FF4500', bgDark: '#0a0200',
    particleColor: '#FF8833', particleCount: 1200, particleSize: 0.06, particleMode: 'fire',
    glowIntensity: 2.5, bloom: 1.8,
    features: null,
  },
  {
    section: '// ABOUT',
    subtitle: "KDS isn't a tool — it's an autonomous AI community.",
    body: 'It interprets data, form, and function to generate immersive web experiences through motion, geometry, and spatial intelligence. KDS doesn\'t just build — it thinks in design.',
    cta: null,
    name: 'MERCURY', color: '#909090', bloomColor: '#B0B0B0', bgDark: '#050508',
    particleColor: '#C0C0C0', particleCount: 300, particleSize: 0.012, particleMode: 'fastOrbit',
    glowIntensity: 0.4, bloom: 0.3,
    features: [
      { title: 'Modular\nAI Components', icon: '●' },
      { title: 'Adaptive\nWeb Architecture', icon: '│' },
      { title: 'Realtime\n3D Interactions', icon: '×' },
      { title: 'Minimum Effort\nMaximum Impact', icon: '↗' },
    ],
  },
  {
    section: '// FEATURES',
    subtitle: "KDS isn't just smart. It learns, evolves, and adapts visually.",
    body: null, cta: null,
    name: 'EARTH', color: '#3377CC', bloomColor: '#44CC77', bgDark: '#020508',
    particleColor: '#44CC77', particleCount: 600, particleSize: 0.025, particleMode: 'life',
    glowIntensity: 0.9, bloom: 0.6,
    features: null,
  },
  {
    section: '// USE CASES',
    subtitle: '12.8K+ developers. The hub where AI builders connect.',
    body: 'Sell automation, deploy websites, build apps, create videos — your skills, your price, your empire.',
    cta: 'LAUNCH WITH KDS',
    name: 'JUPITER', color: '#C8A060', bloomColor: '#D4B878', bgDark: '#080600',
    particleColor: '#D4B070', particleCount: 900, particleSize: 0.02, particleMode: 'bands',
    glowIntensity: 0.6, bloom: 0.4,
    features: null,
  },
  {
    section: '// GET STARTED',
    subtitle: 'Build, earn, and connect. Welcome to 2130.',
    body: null, cta: 'ENTER KDS →',
    name: 'BEYOND', color: '#BFF549', bloomColor: '#BFF549', bgDark: '#030510',
    particleColor: '#BFF549', particleCount: 1000, particleSize: 0.03, particleMode: 'constellation',
    glowIntensity: 1.5, bloom: 1.5,
    features: null, link: '/community',
  },
];

// ═══════════════════════════════════════════════════════
// STAR FIELD
// ═══════════════════════════════════════════════════════
function StarField() {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const pos = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i++) {
      pos[i*3]=(Math.random()-0.5)*200; pos[i*3+1]=(Math.random()-0.5)*200; pos[i*3+2]=(Math.random()-0.5)*200;
    }
    return new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pos, 3));
  }, []);
  useFrame((state) => { if(ref.current) ref.current.rotation.y=state.clock.elapsedTime*0.002; });
  return <points ref={ref} geometry={geo}><pointsMaterial size={0.06} color="#fff" transparent opacity={0.4} sizeAttenuation depthWrite={false} /></points>;
}

// ═══════════════════════════════════════════════════════
// PLANET + GLOW
// ═══════════════════════════════════════════════════════
function Planet({ color, bloomColor, cameraZ, hasRing }: { color: string, bloomColor: string, cameraZ: number, hasRing?: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const opacity = Math.min(1, Math.abs(cameraZ)/1.8);
  const scale = Math.max(0.2, 1-(1-opacity)*0.8);

  const { vs, fs } = useMemo(() => ({
    vs: `uniform float uTime,uOpacity,uScale;varying vec3 vN,vW;varying vec2 vU;void main(){vU=uv;vN=normalize((modelMatrix*vec4(normal,0)).xyz);vec3 p=position*uScale+normal*(sin(position.x*4.+uTime*.8)*.04+cos(position.y*3.+uTime*.6)*.03);vW=(modelMatrix*vec4(p,1)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1);}`,
    fs: `uniform vec3 uC,uB;uniform float uT,uO;varying vec3 vN,vW;varying vec2 vU;void main(){float f=pow(1.-max(dot(normalize(cameraPosition-vW),vN),0.),3.5);vec3 c=uC+uC*(sin(vU.x*20.+uT*.5)*sin(vU.y*15.+uT*.4)*.15);c+=uB*f*.6;c+=mix(uC,uB,.5)*pow(1.-max(dot(normalize(cameraPosition-vW),vN),0.),5.)*1.2;gl_FragColor=vec4(c,mix(.4*f+.8,1.,1.-f)*uO);}`,
  }), []);

  useFrame((state, delta) => {
    if(meshRef.current && meshRef.current.material) {
      meshRef.current.rotation.y+=delta*.08;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime*.15)*.03;
      meshRef.current.scale.setScalar(scale);
      const m=meshRef.current.material as THREE.ShaderMaterial;
      m.uniforms.uTime.value=state.clock.elapsedTime;
      m.uniforms.uOpacity.value=opacity;
      m.uniforms.uScale.value=1;
    }
    if(glowRef.current) {
      glowRef.current.rotation.y-=delta*.012;
      glowRef.current.scale.setScalar(1.5+Math.sin(state.clock.elapsedTime*.5)*.06+(1-opacity));
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity=.04*opacity+(1-opacity)*.12;
    }
  });

  return <>
    <mesh ref={glowRef}><sphereGeometry args={[1.8,32,32]} /><meshBasicMaterial color={color} transparent opacity={.04} side={THREE.BackSide} depthWrite={false} /></mesh>
    <mesh ref={meshRef}><sphereGeometry args={[1,96,96]} /><shaderMaterial vertexShader={vs} fragmentShader={fs} uniforms={{uC:{value:new THREE.Color(color)},uB:{value:new THREE.Color(bloomColor)},uTime:{value:0},uOpacity:{value:opacity},uScale:{value:1}}} transparent side={THREE.FrontSide} /></mesh>
    {hasRing && <mesh rotation={[Math.PI/2.4,0,0]}><ringGeometry args={[1.35,2.8,128]} /><meshStandardMaterial side={THREE.DoubleSide} transparent opacity={.5*opacity} metalness={.8} roughness={.25} color={new THREE.Color(color)} /></mesh>}
  </>;
}

// ═══════════════════════════════════════════════════════
// PARTICLES
// ═══════════════════════════════════════════════════════
function Particles({ mode, color, count, size, cameraZ }: { mode:string, color:string, count:number, size:number, cameraZ:number }) {
  const ref = useRef<THREE.Points>(null);
  const { positions, velocities, colors } = useMemo(() => {
    const pos = new Float32Array(count*3);
    const vel = new Float32Array(count*3);
    const c = new THREE.Color(color);
    const col = new Float32Array(count*3);
    for(let i=0;i<count;i++){
      const a=Math.random()*Math.PI*2, r=Math.random();
      const i3=i*3;
      switch(mode){
        case 'fire':{const ph=Math.acos(2*Math.random()-1),rd=1.5+r*4;pos[i3]=rd*Math.sin(ph)*Math.cos(a);pos[i3+1]=rd*Math.sin(ph)*Math.sin(a);pos[i3+2]=rd*Math.cos(ph);vel[i3]=pos[i3]*.003;vel[i3+1]=pos[i3+1]*.003;vel[i3+2]=pos[i3+2]*.003;break;}
        case 'fastOrbit':{const rd=1.3+r*1.5;pos[i3]=Math.cos(a)*rd;pos[i3+1]=(Math.random()-.5)*.3;pos[i3+2]=Math.sin(a)*rd;vel[i3]=-Math.sin(a)*.012;vel[i3+2]=Math.cos(a)*.012;break;}
        case 'cloud':{const rd=1.5+r*2;pos[i3]=Math.cos(a)*rd;pos[i3+1]=(Math.random()-.5)*1.5;pos[i3+2]=Math.sin(a)*rd;break;}
        case 'life':{const rd=1.5+r*2.5;pos[i3]=Math.cos(a)*rd;pos[i3+1]=Math.sin(a*2)*.3;pos[i3+2]=Math.sin(a)*rd;break;}
        case 'storm':{const rd=1.2+r*4;pos[i3]=Math.cos(a)*rd;pos[i3+1]=(Math.random()-.5)*rd*.8;pos[i3+2]=Math.sin(a)*rd;break;}
        case 'bands':{const b=Math.floor(Math.random()*8),rd=1.3+b*.3;pos[i3]=Math.cos(a)*rd;pos[i3+1]=(b-4)*.25;pos[i3+2]=Math.sin(a)*rd*.9;break;}
        case 'ringDisk':{const rd=1.5+r*3;pos[i3]=Math.cos(a)*rd;pos[i3+1]=(Math.random()-.5)*.06;pos[i3+2]=Math.sin(a)*rd;break;}
        case 'tilted':{const rd=1.4+r*2;pos[i3]=Math.cos(a)*rd;pos[i3+1]=Math.sin(a)*rd;pos[i3+2]=(Math.random()-.5)*.5;break;}
        case 'jets':{const rd=1.3+r*2;pos[i3]=Math.cos(a)*rd*.5;pos[i3+1]=(Math.random()-.5)*5;pos[i3+2]=Math.sin(a)*rd*.5;break;}
        default:pos[i3]=(Math.random()-.5)*5;pos[i3+1]=(Math.random()-.5)*5;pos[i3+2]=(Math.random()-.5)*5;
      }
      col[i3]=Math.max(0,Math.min(1,c.r+(Math.random()-.5)*.15));col[i3+1]=Math.max(0,Math.min(1,c.g+(Math.random()-.5)*.15));col[i3+2]=Math.max(0,Math.min(1,c.b+(Math.random()-.5)*.15));
    }
    return { positions: pos, velocities: vel, colors: col };
  }, [mode, color, count]);

  useFrame((state, delta) => {
    if(!ref.current) return;
    const p=ref.current.geometry.attributes.position.array as Float32Array;
    const v=velocities; const t=state.clock.elapsedTime;
    const scatter=Math.max(0,1-Math.abs(cameraZ)/.6)*18;
    for(let i=0;i<count;i++){
      const i3=i*3;
      if(scatter>.3){const dx=p[i3],dy=p[i3+1],dz=p[i3+2],d=Math.max(.01,Math.sqrt(dx*dx+dy*dy+dz*dz));v[i3]+=(dx/d)*scatter*delta;v[i3+1]+=(dy/d)*scatter*delta;v[i3+2]+=(dz/d)*scatter*delta;}
      switch(mode){
        case 'fire':p[i3]+=v[i3];p[i3+1]+=v[i3+1];p[i3+2]+=v[i3+2];if(p[i3]*p[i3]+p[i3+1]*p[i3+1]+p[i3+2]*p[i3+2]>25){const a=Math.random()*Math.PI*2,ph=Math.acos(2*Math.random()-1),r=1.5;p[i3]=r*Math.sin(ph)*Math.cos(a);p[i3+1]=r*Math.sin(ph)*Math.sin(a);p[i3+2]=r*Math.cos(ph);v[i3]=p[i3]*.003;v[i3+1]=p[i3+1]*.003;v[i3+2]=p[i3+2]*.003;}p[i3]+=Math.sin(t*2+i)*.002;p[i3+1]+=Math.cos(t*1.5+i)*.002;break;
        case 'fastOrbit':{const a=Math.atan2(p[i3+2],p[i3])+delta*(1.8+Math.sin(i*.4));const r=Math.sqrt(p[i3]*p[i3]+p[i3+2]*p[i3+2]);p[i3]=Math.cos(a)*r;p[i3+2]=Math.sin(a)*r;break;}
        case 'cloud':{const a=Math.atan2(p[i3+2],p[i3])+delta*.15;const r=Math.sqrt(p[i3]*p[i3]+p[i3+2]*p[i3+2]);p[i3]=Math.cos(a)*r;p[i3+2]=Math.sin(a)*r;p[i3+1]+=Math.sin(t*.4+i*.1)*.001;break;}
        case 'life':p[i3+1]=Math.sin(t*.6+i*.05)*(.25+Math.abs(p[i3])*.1);break;
        case 'storm':{const a=Math.atan2(p[i3+2],p[i3])+delta*(.25+Math.sin(i*.1+t)*.4);const r=Math.sqrt(p[i3]*p[i3]+p[i3+2]*p[i3+2]);p[i3]=Math.cos(a)*r;p[i3+2]=Math.sin(a)*r;break;}
        case 'bands':{const a=Math.atan2(p[i3+2],p[i3])+delta*.18*(Math.sin(p[i3+1]*3)*.5+1);const r=Math.sqrt(p[i3]*p[i3]+p[i3+2]*p[i3+2]);p[i3]=Math.cos(a)*r;p[i3+2]=Math.sin(a)*r;break;}
        case 'ringDisk':{const a=Math.atan2(p[i3+2],p[i3])+delta*(.35/(Math.sqrt(p[i3]*p[i3]+p[i3+2]*p[i3+2])+.5));const r=Math.sqrt(p[i3]*p[i3]+p[i3+2]*p[i3+2]);p[i3]=Math.cos(a)*r;p[i3+2]=Math.sin(a)*r;break;}
        case 'tilted':{const a=Math.atan2(p[i3+1],p[i3])+delta*.25;const r=Math.sqrt(p[i3]*p[i3]+p[i3+1]*p[i3+1]);p[i3]=Math.cos(a)*r;p[i3+1]=Math.sin(a)*r;break;}
        case 'jets':p[i3+1]+=Math.sin(t*.35+i)*.02;p[i3+1]=((p[i3+1]+2.5)%5)-2.5;break;
        case 'constellation':p[i3]+=Math.sin(t*.15+i*.08)*.003;p[i3+1]+=Math.cos(t*.12+i*.06)*.003;break;
      }
      if(scatter>.3){const d=1-Math.max(0,1-Math.abs(cameraZ)/.6)*.15;v[i3]*=d;v[i3+1]*=d;v[i3+2]*=d;}
    }
    ref.current.geometry.attributes.position.needsUpdate=true;
  });

  return <points ref={ref} geometry={new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(positions,3)).setAttribute('color',new THREE.BufferAttribute(colors,3))}><pointsMaterial size={size*1.8} vertexColors transparent opacity={.85} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} /></points>;
}

// ═══════════════════════════════════════════════════════
// CAMERA
// ═══════════════════════════════════════════════════════
function FlyCam({ cp }: { cp: number }) {
  const { camera } = useThree();
  const st = useRef({ z: 5, fov: 38 });
  useFrame(() => {
    const c = camera as THREE.PerspectiveCamera;
    const tz = 5 - cp * 10;
    st.current.z += (tz - st.current.z) * .06;
    const proximity = 1 - Math.abs(cp - .5) * 2;
    const tf = 36 + proximity * 30;
    st.current.fov += (tf - st.current.fov) * .06;
    c.position.z = st.current.z;
    c.position.x += (mouseVec.x * .25 * proximity - c.position.x) * .025;
    c.position.y += (-mouseVec.y * .15 * proximity - c.position.y) * .025;
    c.fov = st.current.fov;
    c.lookAt(0, 0, -5);
    c.updateMatrix(); c.updateProjectionMatrix();
  });
  return null;
}

// ═══════════════════════════════════════════════════════
// POST-PROCESSING
// ═══════════════════════════════════════════════════════
import { EffectComposer, Bloom, DepthOfField, ChromaticAberration, Vignette, Noise } from '@react-three/postprocessing';
function PP({ bloom, cp, cameraZ }: { bloom:number, cp:number, cameraZ:number }) {
  const p = 1 - Math.abs(cp - .5) * 2;
  const ca = p * .0025;
  return <EffectComposer enableNormalPass={false} multisampling={2}>
    <Bloom intensity={bloom*.7} luminanceThreshold={.85} luminanceSmoothing={.9} mipmapBlur radius={.5} />
    <DepthOfField focusDistance={Math.max(0,Math.abs(cameraZ)-.8)*.12} focalLength={.02+p*.025} bokehScale={p*2.5} />
    <ChromaticAberration offset={new THREE.Vector2(ca,ca)} />
    <Vignette eskil={false} offset={.1} darkness={.3} />
    <Noise opacity={.02+p*.01} />
  </EffectComposer>;
}

// ═══════════════════════════════════════════════════════
// SCENE
// ═══════════════════════════════════════════════════════
function Scene({ ch, cz, cp }: { ch: typeof chapters[0], cz:number, cp:number }) {
  return <>
    <FlyCam cp={cp} />
    <ambientLight intensity={ch.glowIntensity*.06} />
    <pointLight position={[0,0,0]} intensity={ch.glowIntensity*(.3+Math.abs(cz)*.1)} color={ch.color} distance={10} />
    <pointLight position={[cz>0?6:-6,5,5]} intensity={.5} color={ch.particleColor} distance={12} />
    <StarField />
    <Planet color={ch.color} bloomColor={ch.bloomColor} cameraZ={cz} hasRing={ch['hasRing' as keyof typeof ch] as boolean} />
    <Particles mode={ch.particleMode} color={ch.particleColor} count={ch.particleCount} size={ch.particleSize} cameraZ={cz} />
    <PP bloom={ch.bloom} cp={cp} cameraZ={cz} />
  </>;
}

// ═══════════════════════════════════════════════════════
// SECTION COMPONENT — scroll-anchored HTML overlay
// ═══════════════════════════════════════════════════════
function Section({ ch, active, progress, link }: { ch: typeof chapters[0], active: boolean, progress: number, link?: string }) {
  const contentOpacity = Math.min(1, progress < .15 ? progress/.15 : progress > .85 ? (1-progress)/.15 : 1);
  return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
    <div style={{ textAlign: 'center', padding: 60, maxWidth: active ? 600 : 500, position: 'relative', zIndex: 10, pointerEvents: contentOpacity > .3 ? 'auto' : 'none',
      opacity: contentOpacity, transform: `translateY(${(1-contentOpacity)*15}px)`, transition: 'opacity .3s, transform .3s' }}>
      {/* Section label */}
      <span style={{ fontFamily: "'Geist Mono', 'JetBrains Mono', monospace", color: `${ch.bloomColor}18`, fontSize: 9, fontWeight: 500, letterSpacing: '.15em' }}>{ch.section}</span>

      {/* Title */}
      <h1 style={{ fontFamily: "'Inter', sans-serif", color: active && (ch.section === '// KDS' || ch.section === '// GET STARTED') ? 'transparent' : 'rgba(255,255,255,.9)',
        fontSize: active && ch.section === '// KDS' ? 'clamp(3rem,8vw,6rem)' : 'clamp(1.6rem,4vw,2.8rem)', fontWeight: 300, marginTop: 4, marginBottom: 8, lineHeight: 1.05,
        ...(active && (ch.section === '// KDS' || ch.section === '// GET STARTED') ? {
          background: `linear-gradient(180deg,${ch.bloomColor},${ch.color})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: `drop-shadow(0 0 25px ${ch.bloomColor}30)`
        } : {})
      }}>{active ? ch.name : ch.subtitle}</h1>

      {/* Body text */}
      {ch.body && <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 11, lineHeight: 1.7, maxWidth: 400, margin: '0 auto 20px', fontFamily: "'Inter',sans-serif" }}>{ch.body}</p>}

      {/* Feature cards */}
      {ch.features && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, maxWidth: 550, margin: '0 auto 20px' }}>
        {ch.features.map((f, i) => <div key={i} style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.04)', borderRadius: 8, padding: 16, textAlign: 'left' }}>
          <div style={{ color: ch.bloomColor, fontSize: 20, marginBottom: 8, fontFamily: "'Geist Mono',monospace" }}>{f.icon}</div>
          <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 10, fontFamily: "'Geist Mono',monospace", whiteSpace: 'pre-line', lineHeight: 1.4 }}>{f.title}</div>
        </div>)}
      </div>}

      {/* CTA */}
      {ch.cta && (link ? <a href={link} style={{ display: 'inline-block', padding: '8px 22px', background: `${ch.bloomColor}06`, border: `1px solid ${ch.bloomColor}12`, color: ch.bloomColor, borderRadius: 4, fontSize: 10, fontWeight: 600, fontFamily: "'Geist Mono',monospace", letterSpacing: '.08em', textDecoration: 'none' }}>{ch.cta}</a>
        : <span style={{ display: 'inline-block', padding: '8px 22px', border: `1px solid rgba(255,255,255,.06)`, color: 'rgba(255,255,255,.25)', borderRadius: 4, fontSize: 10, fontFamily: "'Geist Mono',monospace", letterSpacing: '.08em' }}>{ch.cta}</span>)}

      {/* Scroll indicator */}
      {!ch.cta && active && <div style={{ marginTop: 10, animation: 'mcB 2.5s ease-in-out infinite', color: 'rgba(255,255,255,.06)', fontSize: 9, fontFamily: "'Geist Mono',monospace" }}>
        SCROLL ↓</div>}

      {/* Footer for last section */}
      {ch.section === '// GET STARTED' && <div style={{ marginTop: 60, color: 'rgba(255,255,255,.08)', fontSize: 8, fontFamily: "'Geist Mono',monospace", letterSpacing: '.1em' }}>
        © 2130 — KDS INC. All rights reserved</div>}
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════
// NAV DOTS
// ═══════════════════════════════════════════════════════
function NavDots({ active }: { active: number }) {
  const scrollTo = (i: number) => {
    const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    window.scrollTo({ top: (i / (chapters.length-1)) * max, behavior: 'smooth' });
  };
  return <nav style={{ position:'fixed',right:16,top:'50%',transform:'translateY(-50%)',zIndex:50,display:'flex',flexDirection:'column',gap:10 }}>
    {chapters.map((p,i) => <button key={i} onClick={()=>scrollTo(i)} style={{ display:'flex',alignItems:'center',background:'none',border:'none',cursor:'pointer',padding:'1px 0' }}>
      <span style={{ position:'relative',width:active===i?5:3,height:active===i?5:3,borderRadius:'50%',background:active===i?p.bloomColor:'rgba(255,255,255,.04)',transition:'all .3s',boxShadow:active===i?`0 0 8px ${p.bloomColor}30`:'none' }}>
        {active===i && <span style={{ position:'absolute',inset:-3,borderRadius:'50%',border:`1px solid ${p.bloomColor}10` }} />}
      </span>
    </button>)}
  </nav>;
}

// ═══════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════
export default function HomePage() {
  const [activeSection, setActiveSection] = useState(0);
  const [sectionProgress, setSectionProgress] = useState(0);
  const [cameraZ, setCameraZ] = useState(5);

  useEffect(() => {
    let raf: number;
    const update = () => {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const tp = Math.min(window.scrollY / max, .999);
      const s = Math.min(chapters.length-1, Math.floor(tp * chapters.length));
      const sp = (tp * chapters.length) - s;
      setActiveSection(s); setSectionProgress(sp); setCameraZ(5 - sp * 10);
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onMove = useCallback((e: React.PointerEvent) => {
    mouseVec.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseVec.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, []);

  const ch = chapters[activeSection];

  return <>
    <style>{`@keyframes mcB{0%,100%{transform:translateY(0);opacity:.06}50%{transform:translateY(6px);opacity:.12}}`}</style>

    {/* 3D CANVAS — full screen fixed background */}
    <div style={{ position:'fixed',inset:0,zIndex:1,background:ch.bgDark,transition:'background .6s' }} onPointerMove={onMove}>
      <Canvas key={activeSection} camera={{position:[0,0,5],fov:36,near:.1,far:100}} dpr={[1,1.5]} gl={{antialias:false,alpha:false,toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:1.3}}>
        <Scene ch={ch} cz={cameraZ} cp={sectionProgress} />
      </Canvas>
      {/* Cinematic bars */}
      <div style={{ position:'absolute',top:0,left:0,right:0,height:5,background:'#000',zIndex:5,pointerEvents:'none' }} />
      <div style={{ position:'absolute',bottom:0,left:0,right:0,height:5,background:'#000',zIndex:5,pointerEvents:'none' }} />
    </div>

    {/* TOP BAR */}
    <header style={{ position:'fixed',top:0,left:0,right:0,zIndex:50,background:'transparent',height:40,display:'flex',alignItems:'center',padding:'0 24px',justifyContent:'space-between' }}>
      <div style={{ display:'flex',alignItems:'center',gap:12 }}>
        <div style={{ width:14,height:14,borderRadius:3,background:`${ch.bloomColor}10`,display:'flex',alignItems:'center',justifyContent:'center',color:ch.bloomColor,fontFamily:"'Geist Mono',monospace",fontWeight:700,fontSize:8,transition:'all .5s' }}>K</div>
        <span style={{ fontFamily:"'Geist Mono',monospace",fontSize:9,color:ch.bloomColor,transition:'color .5s',letterSpacing:'.1em' }}>{ch.name}</span>
      </div>
      <div style={{ display:'flex',gap:5 }}>
        {['Community','Dashboard'].map(n=><a key={n} href={n==='Community'?'/community':'/dashboard'} style={{ fontFamily:"'Geist Mono',monospace",fontSize:8,color:'rgba(255,255,255,.25)',textDecoration:'none' }}>{n}</a>)}
      </div>
    </header>

    {/* NAV DOTS */}
    <NavDots active={activeSection} />

    {/* SCROLL SECTIONS — each section is 100vh, drives camera */}
    <div style={{ position:'relative',zIndex:10 }}>
      {chapters.map((c,i) => <Section key={i} ch={c} active={activeSection===i} progress={activeSection===i ? sectionProgress : (i<activeSection?1:0)} link={c['link' as keyof typeof c] as string} />)}
    </div>

    <AmbientSound />
  </>;
}
