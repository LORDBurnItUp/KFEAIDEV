'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ParallaxScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Layer 1: Background orbs (slowest)
    const orbs = container.querySelectorAll('.parallax-orb');
    orbs.forEach((orb, i) => {
      gsap.to(orb, {
        y: () => (i % 2 === 0 ? -200 : 200),
        x: () => (i % 2 === 0 ? 100 : -100),
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      });
    });

    // Layer 2: Grid lines (medium)
    const grid = container.querySelector('.parallax-grid');
    if (grid) {
      gsap.to(grid, {
        y: -300,
        scale: 1.2,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
        },
      });
    }

    // Layer 3: Floating elements (fast)
    const floaters = container.querySelectorAll('.parallax-floater');
    floaters.forEach((el, i) => {
      gsap.to(el, {
        y: () => (i % 2 === 0 ? -500 : -300),
        rotation: () => (i % 2 === 0 ? 360 : -360),
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 2,
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[2] overflow-hidden">
      {/* Layer 1: Orbs */}
      <div className="parallax-orb absolute top-[10%] left-[10%] w-[300px] h-[300px] rounded-full bg-lime/5 blur-[150px]" />
      <div className="parallax-orb absolute top-[40%] right-[15%] w-[400px] h-[400px] rounded-full bg-blue-accent/5 blur-[200px]" />
      <div className="parallax-orb absolute top-[70%] left-[30%] w-[250px] h-[250px] rounded-full bg-yellow-accent/5 blur-[120px]" />

      {/* Layer 2: Grid */}
      <div
        className="parallax-grid absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(191,245,73,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(191,245,73,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
        }}
      />

      {/* Layer 3: Floating geometric shapes */}
      <div className="parallax-floater absolute top-[20%] right-[20%] w-4 h-4 border border-lime/20 rotate-45" />
      <div className="parallax-floater absolute top-[50%] left-[15%] w-6 h-6 border border-blue-accent/20 rounded-full" />
      <div className="parallax-floater absolute top-[80%] right-[25%] w-3 h-3 bg-yellow-accent/10 rotate-12" />
      <div className="parallax-floater absolute top-[35%] left-[60%] w-5 h-5 border border-lime/15 rotate-[30deg]" />
      <div className="parallax-floater absolute top-[65%] left-[40%] w-4 h-4 border border-blue-accent/15 rounded-full" />
    </div>
  );
}
