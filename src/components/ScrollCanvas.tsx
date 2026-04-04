'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

/**
 * ScrollCanvas — Scroll-linked HTML5 Canvas animation
 * 
 * Renders a full-screen sticky canvas that plays frame-by-frame
 * based on scroll position 0→1.
 *
 * Props:
 * - frameCount: number of frames in the sequence
 * - framePath: function(frameIndex) => URL or public path to the frame image
 * - className: wrapper classes
 * - canvasHeight: total scroll height (default 400vh)
 * - stiffness/damping: spring physics for smooth interpolation
 */
export default function ScrollCanvas({
  frameCount,
  framePath,
  className = '',
  canvasHeight = '400vh',
  stiffness = 100,
  damping = 30,
  preload = true,
}: {
  frameCount: number;
  framePath: (i: number) => string;
  className?: string;
  canvasHeight?: string;
  stiffness?: number;
  damping?: number;
  preload?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);

  // Scroll tracking with spring smoothing
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness, damping });
  const [frame, setFrame] = useState(0);

  // Preload all frames
  useEffect(() => {
    if (!preload) { setLoaded(true); return; }
    let canceled = false;
    imagesRef.current = new Array(frameCount).fill(null);
    let loadedCount = 0;

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        setProgress(loadedCount / frameCount);
        if (loadedCount === frameCount && !canceled) setLoaded(true);
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === frameCount && !canceled) setLoaded(true);
      };
      img.src = framePath(i);
      imagesRef.current[i] = img;
    }

    return () => { canceled = true; };
  }, [frameCount, framePath, preload]);

  // Map spring progress to frame index and draw
  useEffect(() => {
    const unsub = smooth.on('change', v => {
      const idx = Math.min(Math.floor(v * frameCount), frameCount - 1);
      setFrame(idx);

      const canvas = canvasRef.current;
      if (!canvas || !imagesRef.current[idx]) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Scale canvas for retina
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);

      const img = imagesRef.current[idx]!;
      const aspect = img.width / img.height;
      const viewAspect = window.innerWidth / window.innerHeight;

      // Cover-fit: scale image to cover entire viewport
      let drawW, drawH;
      if (aspect > viewAspect) {
        drawH = window.innerHeight;
        drawW = drawH * aspect;
      } else {
        drawW = window.innerWidth;
        drawH = drawW / aspect;
      }

      const drawX = (window.innerWidth - drawW) / 2;
      const drawY = (window.innerHeight - drawH) / 2;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    });

    return unsub;
  }, [smooth, frameCount]);

  // Handle resize
  useEffect(() => {
    const onResize = () => {
      // Frame will be redrawn on next scroll update
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Preloader
  if (preload && !loaded) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#050505', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="100" height="100" viewBox="0 0 164 164">
          <circle r="80" cx="82" cy="82" fill="transparent" stroke="#111" strokeWidth="1.5" strokeDasharray="502.65" />
          <circle r="80" cx="82" cy="82" fill="transparent" stroke="#BFF549" strokeWidth="2" strokeDasharray="502.65" strokeDashoffset={`${502.65 * (1 - progress)}`} />
        </svg>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", color: '#BFF549', fontSize: 12, marginTop: 20 }}>{Math.round(progress * 100)}%</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", color: 'rgba(255,255,255,0.2)', fontSize: 9, marginTop: 6 }}>Loading experience...</div>
      </div>
    );
  }

  return (
    <div style={{ height: canvasHeight }} className={className}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'sticky',
          top: 0,
          width: '100vw',
          height: '100vh',
          display: 'block',
        }}
      />
    </div>
  );
}
