'use client';

import Link from 'next/link';
import GlitchText from '@/components/GlitchText';
import ScrollReveal from '@/components/ScrollReveal';
import TeleportNav from '@/components/TeleportNav';

export default function NotFound() {
  return (
    <main className="relative min-h-screen">
      {/* Navigation */}
      <TeleportNav />

      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="bg-grid absolute inset-0" />
        <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] bg-lime rounded-full blur-[280px] opacity-[0.06] animate-orb-float" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-yellow-accent rounded-full blur-[220px] opacity-[0.05] animate-orb-float" style={{ animationDirection: 'reverse', animationDuration: '25s' }} />
      </div>

      {/* 404 Content */}
      <section className="relative z-10 py-32 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <ScrollReveal>
            <GlitchText
              text="404"
              className="font-display font-black text-6xl sm:text-7xl md:text-8xl text-lime glow-text-lime mb-8"
              tag="h1"
            />
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl leading-tight tracking-tight mb-8">
              Dimension Not Found
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="text-text-secondary text-xl leading-relaxed max-w-xl mx-auto mb-12">
              The page you teleported to doesn't exist in this timeline.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <Link href="/">
              <button className="group relative px-10 py-5 rounded-full bg-lime text-void font-display font-bold text-xl hover:shadow-2xl hover:shadow-lime/30 transition-all duration-500 hover:scale-105">
                <span className="relative z-10">Return Home</span>
                <div className="absolute inset-0 rounded-full bg-lime opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
              </button>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}