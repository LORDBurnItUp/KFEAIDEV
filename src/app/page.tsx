'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const AmbientSound = dynamic(() => import('@/components/AmbientSound'), { ssr: false });

// Shared mouse state
const mouseVec = { x: 0, y: 0 };

// ═══════════════════════════════════════════════════════
// KDS SECTIONS — adapted from Vexel structure
// ═══════════════════════════════════════════════════════
const sections = [
  {
    id: 'hero',
    label: '// KDS AI',
    title: <>Design meets <br/>intelligence in 3D space.</>,
    body: 'A modern framework built for AI brands — minimal, dynamic, and deeply interactive. Make your presence feel intelligent from the very first pixel.',
    cta: 'EXPLORE KDS',
    planet: 'THE SUN',
    color: '#FF6600', bloomColor: '#FF4500', bgDark: '#06040A',
    particleColor: '#FF8833', particleCount: 1000, particleSize: 0.06, particleMode: 'fire',
    glowIntensity: 2.5, bloom: 1.8,
  },
  {
    id: 'about',
    label: '// ABOUT',
    title: <>KDS isn't a tool<br/>it's an autonomous AI with a visual language.</>,
    body: 'It interprets data, form, and function to generate immersive web experiences through motion, geometry, and spatial intelligence. KDS doesn\'t just build — it thinks in design.',
    cta: null,
    planet: 'MERCURY',
    color: '#565656', bloomColor: '#707070', bgDark: '#050508',
    particleColor: '#808080', particleCount: 250, particleSize: 0.012, particleMode: 'fastOrbit',
    glowIntensity: 0.3, bloom: 0.2,
    features: [
      { title: <>Modular<br/>AI Components</>, icon: '●' },
      { title: <>Adaptive<br/>Web Architecture</>, icon: '│' },
      { title: <>Realtime<br/>3D Interactions</>, icon: '×' },
      { title: <>Minimum Effort<br/>Maximum Impact</>, icon: '↗' },
    ],
  },
  {
    id: 'features',
    label: '// FEATURES',
    title: <>KDS isn't just smart.<br/>It learns, evolves, and adapts visually.</>,
    body: null, cta: null,
    planet: 'EARTH',
    color: '#3377CC', bloomColor: '#44CC77', bgDark: '#020508',
    particleColor: '#44CC77', particleCount: 500, particleSize: 0.025, particleMode: 'life',
    glowIntensity: 0.9, bloom: 0.5,
  },
  {
    id: 'cta',
    label: '// GET STARTED',
    title: <>Launch with<br/>KDS</>,
    body: null,
    cta: 'ENTER KDS →',
    planet: 'BEYOND',
    color: '#BFF549', bloomColor: '#BFF549', bgDark: '#030510',
    particleColor: '#BFF549', particleCount: 800, particleSize: 0.03, particleMode: 'constellation',
    glowIntensity: 1.5, bloom: 1.5,
    link: '/community',
  },
];

// ═══════════════════════════════════════════════════════
// STAR FIELD
// ═══════════════════════════════════════════════════════
function StarField() {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const pos = new Float32Array(4000 * 3);
    for (let i = 0; i < 4000; i++) {
      pos[i*3]=(Math.random()-.5)*180; pos[i*3+1]=(Math.random()-.5)*180; pos[i*3+2]=(Math.random()-.5)*180;
    }
    return new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pos, 3));
  }, []);
  useFrame((state) => { if(ref.current) ref.current.rotation.y=state.clock.elapsedTime*.002; });
  return <points ref={ref} geometry={geo}><pointsMaterial size={0.05} color="#fff" transparent opacity={0.35} sizeAttenuation depthWrite={false}/></points>;
}

// ═══════════════════════════════════════════════════════
// PLANET
// ═══════════════════════════════════════════════════════
function Planet({ color, bloomColor, cameraZ }: { color:string, bloomColor:string, cameraZ:number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const opacity = Math.min(1, Math.abs(cameraZ)/1.8);
  const scale = Math.max(0.2, 1-(1-opacity)*0.8);
  const {vs,fs} = useMemo(() => ({
    vs:`uniform float uT,uO,uS;varying vec3 vN,vW;varying vec2 vU;void main(){vU=uv;vN=normalize((modelMatrix*vec4(normal,0)).xyz);vec3 p=position*uS+normal*(sin(position.x*4.+uT*.8)*.04+cos(position.y*3.+uT*.6)*.03);vW=(modelMatrix*vec4(p,1)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1);}`,
    fs:`uniform vec3 uC,uB;uniform float uT,uO;varying vec3 vN,vW;varying vec2 vU;void main(){float f=pow(1.-max(dot(normalize(cameraPosition-vW),vN),0.),3.5);vec3 c=uC+uC*(sin(vU.x*20.+uT*.5)*sin(vU.y*15.+uT*.4)*.12);c+=uB*f*.6;c+=mix(uC,uB,.5)*pow(1.-max(dot(normalize(cameraPosition-vW),vN),0.),5.)*1.2;gl_FragColor=vec4(c,mix(.3*f+.7,1.,1.-f)*uO);}`
  }), []);
  useFrame((state,delta)=>{
    if(meshRef.current?.material){
      meshRef.current.rotation.y+=delta*.08;meshRef.current.rotation.x=Math.sin(state.clock.elapsedTime*.15)*.03;
      meshRef.current.scale.setScalar(scale);
      const m=meshRef.current.material as THREE.ShaderMaterial;
      m.uniforms.uTime.value=state.clock.elapsedTime;m.uniforms.uOpacity.value=opacity;m.uniforms.uScale.value=1;
    }
    if(glowRef.current){
      glowRef.current.rotation.y-=delta*.012;
      glowRef.current.scale.setScalar(1.5+Math.sin(state.clock.elapsedTime*.5)*.06+(1-opacity));
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity=.04*opacity+(1-opacity)*.12;
    }
  });
  return <>
    <mesh ref={glowRef}><sphereGeometry args={[1.8,32,32]} /><meshBasicMaterial color={color} transparent opacity={.04} side={THREE.BackSide} depthWrite={false}/></mesh>
    <mesh ref={meshRef}><sphereGeometry args={[1,96,96]} /><shaderMaterial vertexShader={vs} fragmentShader={fs} uniforms={{uC:{value:new THREE.Color(color)},uB:{value:new THREE.Color(bloomColor)},uTime:{value:0},uOpacity:{value:opacity},uScale:{value:1}}} transparent side={THREE.FrontSide}/></mesh>
  </>;
}

// ═══════════════════════════════════════════════════════
// PARTICLES
// ═══════════════════════════════════════════════════════
function Particles({mode,color,count,size,cameraZ}:{mode:string,color:string,count:number,size:number,cameraZ:number}){
  const ref=useRef<THREE.Points>(null);
  const{positions,velocities,colors}=useMemo(()=>{
    const pos=new Float32Array(count*3),vel=new Float32Array(count*3),col=new Float32Array(count*3);
    const c=new THREE.Color(color);
    for(let i=0;i<count;i++){
      const a=Math.random()*Math.PI*2,r=Math.random(),i3=i*3;
      switch(mode){
        case'fire':{const ph=Math.acos(2*Math.random()-1),rd=1.5+r*4;pos[i3]=rd*Math.sin(ph)*Math.cos(a);pos[i3+1]=rd*Math.sin(ph)*Math.sin(a);pos[i3+2]=rd*Math.cos(ph);vel[i3]=pos[i3]*.003;vel[i3+1]=pos[i3+1]*.003;vel[i3+2]=pos[i3+2]*.003;break;}
        case'fastOrbit':{const rd=1.3+r*1.5;pos[i3]=Math.cos(a)*rd;pos[i3+1]=(Math.random()-.5)*.3;pos[i3+2]=Math.sin(a)*rd;vel[i3]=-Math.sin(a)*.012;vel[i3+2]=Math.cos(a)*.012;break;}
        case'cloud':{const rd=1.5+r*2;pos[i3]=Math.cos(a)*rd;pos[i3+1]=(Math.random()-.5)*1.5;pos[i3+2]=Math.sin(a)*rd;break;}
        case'life':{const rd=1.5+r*2.5;pos[i3]=Math.cos(a)*rd;pos[i3+1]=Math.sin(a*2)*.3;pos[i3+2]=Math.sin(a)*rd;break;}
        case'constellation':pos[i3]=(Math.random()-.5)*5;pos[i3+1]=(Math.random()-.5)*5;pos[i3+2]=(Math.random()-.5)*5;break;
        default:pos[i3]=(Math.random()-.5)*5;pos[i3+1]=(Math.random()-.5)*5;pos[i3+2]=(Math.random()-.5)*5;
      }
      col[i3]=Math.max(0,Math.min(1,c.r+(Math.random()-.5)*.15));col[i3+1]=Math.max(0,Math.min(1,c.g+(Math.random()-.5)*.15));col[i3+2]=Math.max(0,Math.min(1,c.b+(Math.random()-.5)*.15));
    }
    return{positions,velocities,colors:col};
  },[mode,color,count]);

  useFrame((state,delta)=>{
    if(!ref.current)return;
    const p=ref.current.geometry.attributes.position.array as Float32Array, v=velocities;
    const t=state.clock.elapsedTime, scatter=Math.max(0,1-Math.abs(cameraZ)/.6)*18;
    for(let i=0;i<count;i++){
      const i3=i*3;
      if(scatter>.3){const dx=p[i3],dy=p[i3+1],dz=p[i3+2],d=Math.max(.01,Math.sqrt(dx*dx+dy*dy+dz*dz));v[i3]+=(dx/d)*scatter*delta;v[i3+1]+=(dy/d)*scatter*delta;v[i3+2]+=(dz/d)*scatter*delta;}
      switch(mode){
        case'fire':p[i3]+=v[i3];p[i3+1]+=v[i3+1];p[i3+2]+=v[i3+2];if(p[i3]*p[i3]+p[i3+1]*p[i3+1]+p[i3+2]*p[i3+2]>25){const a=Math.random()*Math.PI*2,ph=Math.acos(2*Math.random()-1),r=1.5;p[i3]=r*Math.sin(ph)*Math.cos(a);p[i3+1]=r*Math.sin(ph)*Math.sin(a);p[i3+2]=r*Math.cos(ph);v[i3]=p[i3]*.003;v[i3+1]=p[i3+1]*.003;v[i3+2]=p[i3+2]*.003;}break;
        case'fastOrbit':{const a=Math.atan2(p[i3+2],p[i3])+delta*(1.8+Math.sin(i*.4));const r=Math.sqrt(p[i3]*p[i3]+p[i3+2]*p[i3+2]);p[i3]=Math.cos(a)*r;p[i3+2]=Math.sin(a)*r;break;}
        case'cloud':{const a=Math.atan2(p[i3+2],p[i3])+delta*.15;const r=Math.sqrt(p[i3]*p[i3]+p[i3+2]*p[i3+2]);p[i3]=Math.cos(a)*r;p[i3+2]=Math.sin(a)*r;break;}
        case'life':p[i3+1]=Math.sin(t*.6+i*.05)*(.25+Math.abs(p[i3])*.1);break;
        case'constellation':p[i3]+=Math.sin(t*.15+i*.08)*.003;p[i3+1]+=Math.cos(t*.12+i*.06)*.003;break;
      }
      if(scatter>.3){const d=1-Math.max(0,1-Math.abs(cameraZ)/.6)*.15;v[i3]*=d;v[i3+1]*=d;v[i3+2]*=d;}
    }
    ref.current.geometry.attributes.position.needsUpdate=true;
  });
  return <points ref={ref} geometry={new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(positions,3)).setAttribute('color',new THREE.BufferAttribute(colors,3))}><pointsMaterial size={size*1.8} vertexColors transparent opacity={.8} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false}/></points>;
}

// ═══════════════════════════════════════════════════════
// CAMERA
// ═══════════════════════════════════════════════════════
function FlyCam({cp}:{cp:number}){
  const{camera}=useThree();
  const st=useRef({z:5,fov:38});
  useFrame(()=>{
    const c=camera as THREE.PerspectiveCamera;
    const tz=5-cp*10;
    st.current.z+=(tz-st.current.z)*.06;
    const proximity=1-Math.abs(cp-.5)*2;
    const tf=36+proximity*30;
    st.current.fov+=(tf-st.current.fov)*.06;
    c.position.z=st.current.z;
    c.position.x+=(mouseVec.x*.25*proximity-c.position.x)*.025;
    c.position.y+=(-mouseVec.y*.15*proximity-c.position.y)*.025;
    c.fov=st.current.fov;
    c.lookAt(0,0,-5);
    c.updateMatrix();c.updateProjectionMatrix();
  });
  return null;
}

// ═══════════════════════════════════════════════════════
// POST-PROCESSING
// ═══════════════════════════════════════════════════════
import {EffectComposer,Bloom,DepthOfField,ChromaticAberration,Vignette,Noise} from '@react-three/postprocessing';
function PP({bloom,cp,cameraZ}:{bloom:number,cp:number,cameraZ:number}){
  const p=1-Math.abs(cp-.5)*2, ca=p*.0025;
  return <EffectComposer enableNormalPass={false} multisampling={2}>
    <Bloom intensity={bloom*.7} luminanceThreshold={.8} luminanceSmoothing={.9} mipmapBlur radius={.5}/>
    <DepthOfField focusDistance={Math.max(0,Math.abs(cameraZ)-.8)*.12} focalLength={.02+p*.025} bokehScale={p*2.5}/>
    <ChromaticAberration offset={new THREE.Vector2(ca,ca)}/>
    <Vignette eskil={false} offset={.1} darkness={.3}/>
    <Noise opacity={.015+p*.01}/>
  </EffectComposer>;
}

// ═══════════════════════════════════════════════════════
// SCENE
// ═══════════════════════════════════════════════════════
function Scene({ch,cz,cp}:{ch:typeof sections[0],cz:number,cp:number}){
  return<>
    <FlyCam cp={cp}/>
    <ambientLight intensity={ch.glowIntensity*.06}/>
    <pointLight position={[0,0,0]} intensity={ch.glowIntensity*(.3+Math.abs(cz)*.11)} color={ch.color} distance={10}/>
    <pointLight position={[cz>0?6:-6,5,5]} intensity={.5} color={ch.particleColor} distance={12}/>
    <StarField/>
    <Planet color={ch.color} bloomColor={ch.bloomColor} cameraZ={cz}/>
    <Particles mode={ch.particleMode} color={ch.particleColor} count={ch.particleCount} size={ch.particleSize} cameraZ={cz}/>
    <PP bloom={ch.bloom} cp={cp} cameraZ={cz}/>
  </>;
}

// ═══════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════
export default function HomePage() {
  const [activeSection, setActiveSection] = useState(0);
  const [sectionProgress, setSectionProgress] = useState(0);
  const [cameraZ, setCameraZ] = useState(5);
  const [loaded, setLoaded] = useState(false);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Simulated loading like Vexel
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let progress = 0;
    interval = setInterval(() => {
      progress += Math.round((loadingProgressEasing((progress + 50) / 6000) * 100) - loadingProgressEasing(progress / 6000) * 100);
      progress = Math.min(progress, 75); // Stop at 75% like Vexel, real load completes
      setLoadingPercent(progress);
      if (progress >= 75) clearInterval(interval);
    }, 50);

    setTimeout(() => {
      clearInterval(interval);
      setLoadingPercent(100);
      setTimeout(() => setLoaded(true), 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Scroll tracking
  useEffect(() => {
    let raf: number;
    const update = () => {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const tp = Math.min(window.scrollY / max, .999);
      const s = Math.min(sections.length - 1, Math.floor(tp * sections.length));
      const sp = (tp * sections.length) - s;
      setActiveSection(s); setSectionProgress(sp); setCameraZ(5 - sp * 10);
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  const scrollTo = useCallback((idx: number) => {
    const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    window.scrollTo({ top: (idx / (sections.length - 1)) * max, behavior: 'smooth' });
    setMenuOpen(false);
  }, []);

  const onMove = useCallback((e: React.PointerEvent) => {
    mouseVec.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseVec.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, []);

  const ch = sections[activeSection];
  const contentOpacity = Math.min(1, sectionProgress < .15 ? sectionProgress / .15 : sectionProgress > .85 ? (1 - sectionProgress) / .15 : 1);

  if (!loaded) {
    return <>
      <style>{`
        @keyframes loadingSpin 0%,100%{opacity:.3;transform:scale(1)}50%{opacity:1;transform:scale(1.1)}
      `}</style>
      <div style={{ background: '#06040A', width: '100vw', height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          {/* Loading circle */}
          <svg width="120" height="120" viewBox="0 0 164 164" style={{ marginBottom: 20 }}>
            <circle r="80" cx="82" cy="82" fill="transparent" stroke="#333" strokeWidth="1" strokeDasharray="502.65"/>
            <circle r="80" cx="82" cy="82" fill="transparent" stroke="#fff" strokeWidth="2" strokeDasharray="502.65" strokeDashoffset={`${502.65 * (1 - loadingPercent / 100)}`} style={{ transition: 'stroke-dashoffset .05s' }}/>
          </svg>
          {/* K logo */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 40, height: 40, borderRadius: 8, background: `${ch.bloomColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: ch.bloomColor, fontWeight: 700, fontSize: 16 }}>K</span>
          </div>
          {/* Percentage */}
          <div style={{ color: '#fff', fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 'bold' }}>{loadingPercent}%</div>
        </div>
      </div>
    </>;
  }

  return <>
    <style>{`
      @font-face{src:url('https://fonts.gstatic.com/s/inter/v18/UcCo3FwrK3iLTcviYwY.woff2');font-family:Inter;font-weight:100 900;font-display:swap}
      @font-face{src:url('https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.woff2');font-family:'JetBrains Mono';font-weight:400 700;font-display:swap}
      @keyframes mcB2{0%,100%{transform:translateY(0);opacity:.06}50%{transform:translateY(5px);opacity:.12}}
      *{scrollbar-width:none}::-webkit-scrollbar{display:none}
    `}</style>

    {/* Loading screen (fades out) */}
    {!loaded && <div style={{ position:'fixed',inset:0,zIndex:100,background:'#06040A',display:'flex',alignItems:'center',justifyContent:'center',transition:'opacity .4s',opacity:0,pointerEvents:'none' }}><div style={{color:'#fff',fontFamily:"'JetBrains Mono',monospace"}}>{loadingPercent}%</div></div>}

    {/* 3D CANVAS — full screen fixed background */}
    <div style={{ position:'fixed',inset:0,zIndex:1,background:ch.bgDark,transition:'background .5s' }} onPointerMove={onMove}>
      <Canvas key={activeSection} camera={{position:[0,0,5],fov:36,near:.1,far:100}} dpr={[1,1.5]} gl={{antialias:false,alpha:false,toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:1.3}}>
        <Scene ch={ch} cz={cameraZ} cp={sectionProgress}/></Canvas>
      {/* Letterbox bars */}
      <div style={{ position:'absolute',top:0,left:0,right:0,height:6,background:'#000',zIndex:5,pointerEvents:'none' }}/>
      <div style={{ position:'absolute',bottom:0,left:0,right:0,height:6,background:'#000',zIndex:5,pointerEvents:'none' }}/>
    </div>

    {/* TOP NAV */}
    <header style={{ position:'fixed',top:0,left:0,right:0,zIndex:50,height:50,display:'flex',alignItems:'center',padding:'0 24px',justifyContent:'space-between' }}>
      {/* Logo */}
      <div style={{ display:'flex',alignItems:'center',gap:12 }}>
        <div style={{ width:28,height:28,borderRadius:4,background:`${ch.bloomColor}12`,display:'flex',alignItems:'center',justifyContent:'center',color:ch.bloomColor,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:12,transition:'all .5s' }}>K</div>
      </div>
      {/* Desktop nav */}
      <div style={{ display:'flex',alignItems:'center',gap:28 }} className="desktop-nav">
        {sections.map((s,i)=><span key={s.id} onClick={()=>scrollTo(i)} style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:activeSection===i?ch.bloomColor:'rgba(255,255,255,.35)',cursor:'pointer',transition:'color .3s',letterSpacing:'.12em' }}>{s.label.replace('// ','').toUpperCase()}</span>)}
      </div>
      {/* Hamburger (mobile) */}
      <div onClick={()=>setMenuOpen(!menuOpen)} style={{ display:'none',cursor:'pointer' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          {menuOpen
            ? <><line x1="6" y1="6" x2="18" y2="18" stroke="#fff" strokeWidth="1.5"/><line x1="18" y1="6" x2="6" y2="18" stroke="#fff" strokeWidth="1.5"/></>
            : <><line x1="4" y1="7" x2="20" y2="7" stroke="#fff" strokeWidth="1"/><line x1="4" y1="12" x2="20" y2="12" stroke="#fff" strokeWidth="1"/><line x1="4" y1="17" x2="20" y2="17" stroke="#fff" strokeWidth="1"/></>
          }
        </svg>
      </div>
    </header>

    {/* NAV DOTS — right side */}
    <nav style={{ position:'fixed',right:16,top:'50%',transform:'translateY(-50%)',zIndex:50,display:'flex',flexDirection:'column',gap:10 }}>
      {sections.map((s,i)=><button key={i} onClick={()=>scrollTo(i)} style={{ display:'flex',alignItems:'center',background:'none',border:'none',cursor:'pointer',padding:0 }}>
        <span style={{ position:'relative',width:activeSection===i?5:3,height:activeSection===i?5:3,borderRadius:'50%',background:activeSection===i?s.bloomColor:'rgba(255,255,255,.04)',transition:'all .3s',boxShadow:activeSection===i?`0 0 8px ${s.bloomColor}30`:'none' }}>
          {activeSection===i && <span style={{ position:'absolute',inset:-3,borderRadius:'50%',border:`1px solid ${s.bloomColor}10` }}/>}
        </span>
      </button>)}
    </nav>

    {/* SCROLL SECTIONS */}
    <div style={{ position:'relative',zIndex:10 }}>
      {sections.map((s,i) => {
        const active = activeSection === i;
        const activeProgress = active ? sectionProgress : (i < activeSection ? 1 : 0);
        const opacity = Math.min(1, activeProgress < .15 ? activeProgress / .15 : activeProgress > .85 ? (1 - activeProgress) / .15 : 1);

        return <section key={i} style={{ height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',position:'relative' }}>
          <div style={{ textAlign:'center',padding:60,maxWidth:active ? 600 : 500,position:'relative',zIndex:10,pointerEvents:opacity>.3?'auto':'none',
            opacity:opacity,transform:`translateY(${(1-opacity)*15}px)`,transition:'opacity .3s, transform .3s' }}>
            {/* Section label */}
            <span style={{ fontFamily:"'JetBrains Mono',monospace",color:`${s.bloomColor}15`,fontSize:9,fontWeight:500,letterSpacing:'.15em',textTransform:'uppercase' }}>{s.label}</span>

            {/* Title */}
            <h1 style={{ fontFamily:"'Inter',sans-serif",fontFamily:active && (s.label==='// KDS AI'||s.label==='// GET STARTED')?'inherit':"'Inter',sans-serif",
              color:(active && (s.label==='// KDS AI'||s.label==='// GET STARTED'))?'transparent':'rgba(255,255,255,.85)',
              fontSize:active && s.label==='// KDS AI'?'clamp(2.8rem,7vw,5rem)':active && s.label==='// GET STARTED'?'clamp(2.5rem,6vw,4.5rem)':'clamp(1.5rem,3.5vw,2.5rem)',
              fontWeight:300,marginTop:4,marginBottom:8,lineHeight:1.1,
              ...((active && (s.label==='// KDS AI'||s.label==='// GET STARTED'))?{
                background:`linear-gradient(180deg,${s.bloomColor},${s.color})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
                filter:`drop-shadow(0 0 25px ${s.bloomColor}30)`} : {})
            }}>{active ? s.title : ''}
            </h1>

            {/* Body text */}
            {s.body && <p style={{ color:'rgba(255,255,255,.3)',fontSize:11,lineHeight:1.7,maxWidth:420,margin:'0 auto 24px' }}>{s.body}</p>}

            {/* Feature cards */}
            {s.features && <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,maxWidth:580,margin:'0 auto 24px' }}>
              {s.features.map((f,fi)=><div key={fi} style={{ background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.04)',borderRadius:8,padding:'20px 16px',textAlign:'left',position:'relative',overflow:'hidden' }}>
                <div style={{ color:s.bloomColor,fontSize:16,marginBottom:12,fontFamily:"'JetBrains Mono',monospace" }}>{f.icon}</div>
                {/* Decorative dots image placeholder */}
                <div style={{ position:'absolute',bottom:8,right:8,display:'flex',gap:2 }}>
                  {[0,1,2].map(d=><div key={d} style={{width:2,height:2,borderRadius:'50%',background:'rgba(255,255,255,.15)'}}/>)}
                </div>
                <div style={{ color:'rgba(255,255,255,.5)',fontSize:9,fontFamily:"'JetBrains Mono',monospace",whiteSpace:'pre-line',lineHeight:1.4 }}>{f.title}</div>
              </div>)}
            </div>}

            {/* CTA */}
            {s.cta && (s.link ? <a href={s.link} style={{ display:'inline-block',padding:'8px 22px',background:`${s.bloomColor}06`,border:`1px solid ${s.bloomColor}12`,color:s.bloomColor,borderRadius:4,fontSize:10,fontWeight:600,fontFamily:"'JetBrains Mono',monospace",letterSpacing:'.08em',textDecoration:'none' }}>{s.cta}</a>
              : <span style={{ display:'inline-block',padding:'8px 22px',border:'1px solid rgba(255,255,255,.06)',color:'rgba(255,255,255,.25)',borderRadius:4,fontSize:10,fontFamily:"'JetBrains Mono',monospace",letterSpacing:'.08em' }}>{s.cta}</span>)}

            {/* Scroll indicator */}
            {!s.cta && active && <div style={{ marginTop:10,animation:'mcB2 2.5s ease-in-out infinite',color:'rgba(255,255,255,.06)',fontSize:9,fontFamily:"'JetBrains Mono',monospace",display:'flex',alignItems:'center',justifyContent:'center',gap:4 }}>
              SCROLL <span style={{display:'inline-block',animation:'mcB2 2.5s ease-in-out infinite'}}>↓</span>
            </div>}

            {/* Footer for last section */}
            {s.label==='// GET STARTED' && <div style={{ marginTop:60,color:'rgba(255,255,255,.08)',fontSize:8,fontFamily:"'JetBrains Mono',monospace",letterSpacing:'.1em',display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
              © 2130 — KDS INC. All rights reserved
              <span style={{color:'rgba(255,255,255,.15)'}}>3D BY</span>
              <span style={{color:s.bloomColor,opacity:.5,fontWeight:600}}>LORD SAV</span>
            </div>}
          </div>
        </section>;
      })}
    </div>

    <AmbientSound />
  </>;
}

// Loading animation helper (Vexel-style easing)
function loadingProgressEasing(x: number) { return x < .5 ? 4*x*x*x : 1 - Math.pow(-2*x + 2, 3) / 2; }
