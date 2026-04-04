'use client';
import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
const KDS3DScene = dynamic(() => import('@/components/KDS3DScene'), { ssr: false });
const AmbientSound = dynamic(() => import('@/components/AmbientSound'), { ssr: false });

const mouseVec = { x: 0, y: 0 };
const PAL = [[5,5],[5,5],[5,5],[5,5]];

const sections = [
  { label: '// KDS AI', title: 'Design meets\nintelligence in 3D space.', body: 'A modern framework built for AI brands \u2014 minimal, dynamic, and deeply interactive.', cta: 'EXPLORE KDS', gradient: ['#FF6600', '#FF4500'], align: 'center' },
  { label: '// ABOUT', title: "KDS isn\u2019t a tool\u2014\nit\u2019s an autonomous AI.", body: 'It interprets data, form, and function to generate immersive web experiences through motion, geometry, and spatial intelligence.', cta: null, gradient: ['#565656', '#909090'], align: 'left', features: [{ icon: '\u25cf', text: 'Modular\nAI Components' }, { icon: '\u2502', text: 'Adaptive\nWeb Architecture' }, { icon: '\u00d7', text: 'Realtime\n3D Interactions' }, { icon: '\u2197', text: 'Minimum Effort\nMaximum Impact' }] },
  { label: '// FEATURES', title: "KDS isn\u2019t just smart.\nIt learns, evolves, adapts.", body: 'Scroll through the KDS universe \u2014 each section reveals a new chapter of our AI-powered platform.', cta: null, gradient: ['#3377CC', '#44CC77'], align: 'right' },
  { label: '// GET STARTED', title: 'Launch with\nKDS', body: null, cta: 'ENTER KDS \u2192', gradient: ['#BFF549', '#BFF549'], align: 'center', link: '/community' },
];
const N = sections.length;
const SEC = 1 / N;

function Loading({ progress }: { progress: number }) {
  return <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#050505', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'opacity .5s', opacity: progress < 100 ? 1 : 0, pointerEvents: progress < 100 ? 'auto' : 'none' }}>
    <svg width="140" height="140" viewBox="0 0 164 164" style={{ marginBottom: 24 }}>
      <circle r="80" cx="82" cy="82" fill="transparent" stroke="#111" strokeWidth="1.5" strokeDasharray="502.65" />
      <circle r="80" cx="82" cy="82" fill="transparent" stroke="#fff" strokeWidth="2" strokeDasharray="502.65" strokeDashoffset={`${502.65 * (1 - progress / 100)}`} style={{ transition: 'stroke-dashoffset .05s' }} />
    </svg>
    <div style={{ position: 'absolute', width: 40, height: 40, borderRadius: 10, background: 'rgba(191,245,73,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono',monospace", color: '#BFF549', fontWeight: 700, fontSize: 16 }}>K</div>
    <div style={{ fontFamily: "'JetBrains Mono',monospace", color: '#BFF549', fontSize: 12, marginTop: 24 }}>{Math.round(progress)}%</div>
  </div>;
}

function Beat({ s, opacity, yOff }: { s: typeof sections[0]; opacity: number; yOff: number }) {
  if (opacity < 0.001) return null;
  const isSpecial = s.label === '// KDS AI' || s.label === '// GET STARTED';
  const al = s.align === 'left' ? 'left' : s.align === 'right' ? 'right' : 'center';
  return <div draggable={false} style={{ position: 'fixed', inset: 0, zIndex: 10, opacity, transform: `translateY(${yOff}px)`, transition: 'opacity .25s ease, transform .25s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: opacity > 0.1 ? 'auto' : 'none' }}>
    <div style={{ textAlign: al === 'center' ? 'center' : al, padding: 60, maxWidth: 550 }}>
      <span style={{ fontFamily: "'JetBrains Mono',monospace", color: `${s.gradient[1]}12`, fontSize: 9, fontWeight: 500, letterSpacing: .15 }}>{s.label}</span>
      <h1 style={{ fontFamily: "'Inter',sans-serif", ...(isSpecial ? { color: 'transparent', background: `linear-gradient(180deg,${s.gradient[0]},${s.gradient[1]})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : { color: 'rgba(255,255,255,.85)' }), fontSize: isSpecial && s.label === '// KDS AI' ? 'clamp(3rem,9vw,6.5rem)' : isSpecial ? 'clamp(2.8rem,8vw,5.5rem)' : 'clamp(2rem,5vw,4rem)', fontWeight: 300, marginTop: 4, marginBottom: 8, lineHeight: 1.05, whiteSpace: 'pre-line', ...(isSpecial ? { filter: `drop-shadow(0 0 30px ${s.gradient[0]}30)` } : {}) }}>{s.title}</h1>
      {s.body && <p style={{ color: 'rgba(255,255,255,.25)', fontSize: 11, lineHeight: 1.7, maxWidth: 420, margin: '0 auto 24px', textAlign: al }}>{s.body}</p>}
      {s.features && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, maxWidth: 560, margin: '0 auto 24px' }}>{s.features.map((f,i) => <div key={i} style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.04)', borderRadius: 8, padding: '16px 12px' }}><span style={{ color: s.gradient[1], fontSize: 18, fontFamily: "'JetBrains Mono',monospace", display: 'block', marginBottom: 10 }}>{f.icon}</span><span style={{ color: 'rgba(255,255,255,.45)', fontSize: 9, fontFamily: "'JetBrains Mono',monospace", whiteSpace: 'pre-line', lineHeight: 1.4 }}>{f.text}</span></div>)}</div>}
      {s.cta && (s.link ? <a href={s.link} style={{ display: 'inline-block', padding: '10px 24px', background: `${s.gradient[1]}08`, border: `1px solid ${s.gradient[1]}15`, color: s.gradient[1], borderRadius: 4, fontSize: 10, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", letterSpacing: '.08em', textDecoration: 'none' }}>{s.cta}</a> : <span style={{ display: 'inline-block', padding: '8px 22px', border: '1px solid rgba(255,255,255,.06)', color: 'rgba(255,255,255,.25)', borderRadius: 4, fontSize: 10, fontFamily: "'JetBrains Mono',monospace" }}>{s.cta}</span>)}
      <div style={{ marginTop: 10, color: 'rgba(255,255,255,.05)', fontSize: 9, fontFamily: "'JetBrains Mono',monospace", animation: 'mc-b 2.5s ease-in-out infinite', textAlign: 'center' }}>\u2193 SCROLL</div>
      {s.label === '// GET STARTED' && <div style={{ marginTop: 50, color: 'rgba(255,255,255,.05)', fontSize: 8, fontFamily: "'JetBrains Mono',monospace", letterSpacing: .1 }}>\u00a9 2130 \u2014 KDS INC.</div>}
    </div>
  </div>;
}

export default function Home() {
  const [ai, setAi] = useState(0);
  const [sp, setSp] = useState(0);
  const [tp, setTp] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [lp, setLp] = useState(0);

  useEffect(() => { let iv: ReturnType<typeof setInterval>; let p = 0; const e = (x: number) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; iv = setInterval(() => { p += Math.round((e((p + 50) / 6e3) - e(p / 6e3)) * 100); p = Math.min(p, 75); setLp(p); if (p >= 75) clearInterval(iv); }, 50); setTimeout(() => { clearInterval(iv); setLp(100); setTimeout(() => setLoaded(true), 500); }, 3e3); return () => clearInterval(iv); }, []);

  useEffect(() => { let raf: number; const FADE = .08; const up = () => { const m = Math.max(document.documentElement.scrollHeight - innerHeight, 1); const t = Math.min(scrollY / m, .999); const idx = Math.min(N - 1, Math.floor(t / SEC)); const ss = idx * SEC; const p = (t - ss) / SEC; let op = 0; if (p < FADE) op = p / FADE; else if (p > 1 - FADE) op = (1 - p) / FADE; else op = 1; setAi(idx); setSp(p); setTp(t); raf = requestAnimationFrame(up); }; raf = requestAnimationFrame(up); return () => cancelAnimationFrame(raf); }, []);

  const onMove = useCallback((e: React.PointerEvent) => { mouseVec.x = (e.clientX / innerWidth) * 2 - 1; mouseVec.y = -(e.clientY / innerHeight) * 2 + 1; }, []);
  const goTo = useCallback((idx: number) => { const m = Math.max(document.documentElement.scrollHeight - innerHeight, 1); scrollTo({ top: (idx / (N - 1)) * m, behavior: 'smooth' }); }, []);

  const ch = sections[ai];
  const FADE = .08;
  let op0 = 0, op1 = 0, op2 = 0, op3 = 0, yPos0 = 0, yPos1 = 0, yPos2 = 0, yPos3 = 0;
  if (ai === 0) { op0 = sp < FADE ? sp / FADE : sp > 1 - FADE ? (1 - sp) / FADE : 1; yPos0 = sp < FADE ? 20 * (1 - op0) : sp > 1 - FADE ? -20 * (1 - op0) : 0; }
  else if (ai === 1) { op1 = sp < FADE ? sp / FADE : sp > 1 - FADE ? (1 - sp) / FADE : 1; yPos1 = sp < FADE ? 20 * (1 - op1) : sp > 1 - FADE ? -20 * (1 - op1) : 0; }
  else if (ai === 2) { op2 = sp < FADE ? sp / FADE : sp > 1 - FADE ? (1 - sp) / FADE : 1; yPos2 = sp < FADE ? 20 * (1 - op2) : sp > 1 - FADE ? -20 * (1 - op2) : 0; }
  else { op3 = sp < FADE ? sp / FADE : sp > 1 - FADE ? (1 - sp) / FADE : 1; yPos3 = sp < FADE ? 20 * (1 - op3) : sp > 1 - FADE ? -20 * (1 - op3) : 0; }

  return <>
    <style>{`@keyframes mc-b{0%,100%{transform:translateY(0);opacity:.06}50%{transform:translateY(5px);opacity:.15}}*{scrollbar-width:none}::-webkit-scrollbar{display:none}`}</style>
    <Loading progress={loaded ? 100 : lp} />
    {loaded && <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: '#050505' }} onPointerMove={onMove}>
        <KDS3DScene palette={ai} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: '#000', zIndex: 20 }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 6, background: '#000', zIndex: 20 }} />
      </div>
      <div style={{ height: `${N * 100}vh`, position: 'relative', zIndex: 20 }} />
      <Beat s={sections[0]} opacity={op0} yOff={yPos0} />
      <Beat s={sections[1]} opacity={op1} yOff={yPos1} />
      <Beat s={sections[2]} opacity={op2} yOff={yPos2} />
      <Beat s={sections[3]} opacity={op3} yOff={yPos3} />
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, height: 44, display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 24, height: 24, borderRadius: 4, background: `${ch.gradient[1]}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ch.gradient[1], fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 10, transition: 'all .4s' }}>K</div>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: ch.gradient[1], letterSpacing: '.1em', transition: 'color .4s' }}>{ch.label.replace('// ', '')}</span>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>{['Community', 'Dashboard'].map(n => <a key={n} href={n === 'Community' ? '/community' : '/dashboard'} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,.35)', textDecoration: 'none' }}>{n}</a>)}</div>
      </header>
      <nav style={{ position: 'fixed', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 50, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sections.map((s, i) => <button key={i} onClick={() => goTo(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <span style={{ position: 'relative', width: ai === i ? 5 : 3, height: ai === i ? 5 : 3, borderRadius: '50%', background: ai === i ? s.gradient[1] : 'rgba(255,255,255,.04)', transition: 'all .3s', boxShadow: ai === i ? `0 0 6px ${s.gradient[1]}30` : 'none' }}>
            {ai === i && <span style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: `1px solid ${s.gradient[1]}10` }} />}
          </span>
        </button>)}
      </nav>
      <div style={{ position: 'fixed', top: 0, left: 0, height: 1, background: `linear-gradient(90deg,${ch.gradient[0]},${ch.gradient[1]})`, width: `${tp * 100}%`, zIndex: 55, transition: 'background .5s' }} />
    </>}
    <AmbientSound />
  </>;
}
