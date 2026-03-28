'use client';

import { useEffect, useRef } from 'react';

interface SpinningIconProps {
  icon: string;
  size?: number;
  color?: string;
  speed?: number;
  particleCount?: number;
}

export default function SpinningIcon({
  icon,
  size = 48,
  color = '#BFF549',
  speed = 0.5,
  particleCount = 8,
}: SpinningIconProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = size * 2;
    canvas.width = s;
    canvas.height = s;

    interface Particle {
      angle: number;
      distance: number;
      speed: number;
      size: number;
      opacity: number;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        angle: (i / particleCount) * Math.PI * 2,
        distance: size * 0.5 + Math.random() * size * 0.3,
        speed: (Math.random() * 0.5 + 0.3) * speed,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }

    let rotation = 0;
    let frame: number;

    function animate() {
      ctx!.clearRect(0, 0, s, s);
      rotation += 0.005 * speed;

      const cx = s / 2;
      const cy = s / 2;

      // Draw orbit ring
      ctx!.beginPath();
      ctx!.arc(cx, cy, size * 0.5, 0, Math.PI * 2);
      ctx!.strokeStyle = `${color}22`;
      ctx!.lineWidth = 1;
      ctx!.stroke();

      // Draw particles
      for (const p of particles) {
        p.angle += p.speed * 0.02;
        const x = cx + Math.cos(p.angle + rotation) * p.distance;
        const y = cy + Math.sin(p.angle + rotation) * p.distance;

        // Trail
        ctx!.beginPath();
        ctx!.arc(x, y, p.size * 2, 0, Math.PI * 2);
        ctx!.fillStyle = `${color}15`;
        ctx!.fill();

        // Particle
        ctx!.beginPath();
        ctx!.arc(x, y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = color;
        ctx!.globalAlpha = p.opacity;
        ctx!.fill();
        ctx!.globalAlpha = 1;
      }

      // Glow at center
      const gradient = ctx!.createRadialGradient(cx, cy, 0, cx, cy, size * 0.3);
      gradient.addColorStop(0, `${color}15`);
      gradient.addColorStop(1, 'transparent');
      ctx!.fillStyle = gradient;
      ctx!.fillRect(0, 0, s, s);

      frame = requestAnimationFrame(animate);
    }

    animate();

    return () => cancelAnimationFrame(frame);
  }, [icon, size, color, speed, particleCount]);

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: size, height: size }}
      />
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          animation: `spin3d ${8 / speed}s linear infinite`,
          transformStyle: 'preserve-3d',
        }}
      >
        <span
          className="text-2xl"
          style={{
            filter: `drop-shadow(0 0 8px ${color}60)`,
          }}
        >
          {icon}
        </span>
      </div>
      <style jsx>{`
        @keyframes spin3d {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}
