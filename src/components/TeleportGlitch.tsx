'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { gsap } from 'gsap';

interface TeleportGlitchProps {
  children: ReactNode;
  onTeleport?: (href: string) => void;
}

export default function TeleportGlitch({ children, onTeleport }: TeleportGlitchProps) {
  const [isGlitching, setIsGlitching] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const triggerGlitch = (href: string) => {
    setIsGlitching(true);

    const tl = gsap.timeline();

    // Phase 1: Screen tears
    tl.to(overlayRef.current, {
      opacity: 1,
      duration: 0.05,
    });

    // Phase 2: Glitch displacement
    tl.to(overlayRef.current, {
      x: () => (Math.random() - 0.5) * 40,
      y: () => (Math.random() - 0.5) * 20,
      skewX: () => (Math.random() - 0.5) * 20,
      duration: 0.05,
      repeat: 8,
      yoyo: true,
    });

    // Phase 3: Blackhole collapse
    tl.to(overlayRef.current, {
      clipPath: 'circle(0% at 50% 50%)',
      duration: 0.4,
      ease: 'power3.in',
    });

    // Phase 4: Navigate
    tl.call(() => {
      if (href.startsWith('/')) {
        window.location.href = href;
      } else {
        window.location.hash = href;
      }
    });
  };

  return (
    <>
      {typeof children === 'function'
        ? (children as any)(triggerGlitch)
        : children}

      {/* Glitch Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[200] pointer-events-none"
        style={{
          opacity: 0,
          background: `
            linear-gradient(transparent 0%, rgba(191, 245, 73, 0.05) 50%, transparent 100%),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(191, 245, 73, 0.03) 2px,
              rgba(191, 245, 73, 0.03) 4px
            )
          `,
          clipPath: 'circle(150% at 50% 50%)',
        }}
      >
        {/* Glitch lines */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-[2px] bg-lime/20"
              style={{
                top: `${Math.random() * 100}%`,
                transform: `translateX(${(Math.random() - 0.5) * 100}px)`,
                opacity: isGlitching ? 1 : 0,
              }}
            />
          ))}
        </div>

        {/* Central flash */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-lime/10 blur-[100px] animate-pulse" />
        </div>
      </div>
    </>
  );
}
