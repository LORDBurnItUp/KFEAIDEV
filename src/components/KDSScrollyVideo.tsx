'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * KDSScrollyVideo — Scroll-linked video intro for KDS websites
 * Videos play as you scroll, creating a cinematic intro effect
 */

interface VideoSection {
  video: string;
  title: string;
  subtitle: string;
  align?: 'left' | 'center' | 'right';
}

const sections: VideoSection[] = [
  {
    video: '/videos/kds-clip-1.mp4',
    title: 'KINGS DRIPPING SWAG',
    subtitle: 'Welcome to 2130',
    align: 'center',
  },
  {
    video: '/videos/kds-clip-3.mp4',
    title: 'AI DEVELOPMENT',
    subtitle: 'Building the future',
    align: 'left',
  },
  {
    video: '/videos/kds-clip-5.mp4',
    title: '3D EXPERIENCE',
    subtitle: 'Beyond reality',
    align: 'right',
  },
  {
    video: '/videos/kds-clip-8.mp4',
    title: 'VOICE AGENTS',
    subtitle: 'AI that speaks',
    align: 'center',
  },
  {
    video: '/videos/kds-clip-11.mp4',
    title: 'CODE & CREATE',
    subtitle: 'Build the future',
    align: 'left',
  },
  {
    video: '/videos/kds-clip-18.mp4',
    title: 'THE FUTURE',
    subtitle: 'What comes next',
    align: 'center',
  },
];

export default function KDSScrollyVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalHeight = containerRef.current.scrollHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / totalHeight));
      setScrollProgress(progress);

      // Determine active section
      const sectionIndex = Math.min(
        sections.length - 1,
        Math.floor(progress * sections.length)
      );
      setActiveSection(sectionIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-play active video
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === activeSection) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    });
  }, [activeSection]);

  return (
    <div ref={containerRef} style={{ height: `${sections.length * 100}vh` }}>
      {/* Sticky container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Background videos */}
        {sections.map((section, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              opacity: activeSection === index ? 1 : 0,
              zIndex: activeSection === index ? 1 : 0,
            }}
          >
            {/* Video */}
            <video
              ref={(el) => { videoRefs.current[index] = el; }}
              src={section.video}
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: 0.4 }}
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

            {/* Content */}
            <div
              className={`absolute inset-0 flex items-center justify-${section.align === 'left' ? 'start pl-12 md:pl-24' : section.align === 'right' ? 'end pr-12 md:pr-24' : 'center'} px-8`}
            >
              <div
                className="max-w-2xl"
                style={{
                  opacity: activeSection === index ? 1 : 0,
                  transform: activeSection === index ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                  transitionDelay: '0.3s',
                }}
              >
                {/* Section number */}
                <div className="text-lime/40 text-sm font-mono mb-4 tracking-widest">
                  0{index + 1} / 0{sections.length}
                </div>

                {/* Title */}
                <h2
                  className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[0.9] mb-4"
                  style={{ fontFamily: 'Space Grotesk' }}
                >
                  {section.title.split('').map((char, i) => (
                    <span
                      key={i}
                      className="inline-block"
                      style={{
                        opacity: activeSection === index ? 1 : 0,
                        transform: activeSection === index ? 'translateY(0)' : 'translateY(20px)',
                        transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1)`,
                        transitionDelay: `${0.5 + i * 0.03}s`,
                      }}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  ))}
                </h2>

                {/* Subtitle */}
                <p
                  className="text-gray-400 text-lg md:text-xl"
                  style={{
                    opacity: activeSection === index ? 1 : 0,
                    transition: 'opacity 0.8s ease',
                    transitionDelay: '1s',
                  }}
                >
                  {section.subtitle}
                </p>

                {/* Decorative line */}
                <div
                  className="w-24 h-0.5 bg-lime mt-6"
                  style={{
                    transform: activeSection === index ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)',
                    transitionDelay: '1.2s',
                  }}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Scroll indicator (first section only) */}
        {activeSection === 0 && (
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
            style={{
              opacity: scrollProgress < 0.1 ? 1 : 0,
              transition: 'opacity 0.5s ease',
            }}
          >
            <span className="text-gray-500 text-xs tracking-widest uppercase">
              Scroll to explore
            </span>
            <div
              className="w-6 h-10 rounded-full border-2 border-gray-600 flex items-start justify-center p-1"
            >
              <div
                className="w-1.5 h-3 rounded-full bg-lime"
                style={{
                  animation: 'scrollBounce 2s infinite',
                }}
              />
            </div>
          </div>
        )}

        {/* Progress dots */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-3">
          {sections.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                const scrollTo = (index / sections.length) * (containerRef.current?.scrollHeight || 0);
                window.scrollTo({ top: scrollTo, behavior: 'smooth' });
              }}
              className="group relative"
            >
              <div
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  background: activeSection === index ? '#BFF549' : 'rgba(255,255,255,0.2)',
                  transform: activeSection === index ? 'scale(1.5)' : 'scale(1)',
                }}
              />
              {/* Tooltip */}
              <span
                className="absolute right-6 top-1/2 -translate-y-1/2 text-xs text-gray-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-2 py-1 rounded"
              >
                {sections[index].title}
              </span>
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/5 z-20">
          <div
            className="h-full bg-lime transition-all duration-100"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>
      </div>

      {/* Scroll bounce animation */}
      <style jsx>{`
        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(8px); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
