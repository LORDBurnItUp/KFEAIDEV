'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Parallax3DProps {
  children: ReactNode;
  speed?: number;
  rotate?: number;
  className?: string;
  zIndex?: number;
}

export default function Parallax3D({
  children,
  speed = 0.5,
  rotate = 0,
  className = '',
  zIndex = 1,
}: Parallax3DProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;

    gsap.to(el, {
      yPercent: -50 * speed,
      rotationX: rotate * 2,
      rotationY: rotate,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [speed, rotate]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        zIndex,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      {children}
    </div>
  );
}
