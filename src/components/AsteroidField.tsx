'use client';

import { useEffect, useRef } from 'react';

export default function AsteroidField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Asteroid {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
      trail: { x: number; y: number }[];
    }

    const asteroids: Asteroid[] = [];

    function spawnAsteroid() {
      const fromTop = Math.random() > 0.5;
      asteroids.push({
        x: fromTop ? Math.random() * canvas!.width : -50,
        y: fromTop ? -50 : Math.random() * canvas!.height * 0.5,
        vx: (Math.random() * 2 + 1) * (fromTop ? 0.5 : 1),
        vy: Math.random() * 3 + 2,
        size: Math.random() * 3 + 1,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: Math.random() * 0.5 + 0.3,
        trail: [],
      });
    }

    let frame: number;
    let time = 0;

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      time++;

      // Spawn new asteroids occasionally
      if (time % 120 === 0 && asteroids.length < 3) {
        spawnAsteroid();
      }

      for (let i = asteroids.length - 1; i >= 0; i--) {
        const a = asteroids[i];
        a.x += a.vx;
        a.y += a.vy;
        a.rotation += a.rotationSpeed;

        // Add to trail
        a.trail.push({ x: a.x, y: a.y });
        if (a.trail.length > 20) a.trail.shift();

        // Draw trail
        if (a.trail.length > 1) {
          ctx!.beginPath();
          ctx!.moveTo(a.trail[0].x, a.trail[0].y);
          for (let j = 1; j < a.trail.length; j++) {
            ctx!.lineTo(a.trail[j].x, a.trail[j].y);
          }
          ctx!.strokeStyle = `rgba(191, 245, 73, ${a.opacity * 0.2})`;
          ctx!.lineWidth = a.size * 0.5;
          ctx!.stroke();
        }

        // Draw asteroid
        ctx!.save();
        ctx!.translate(a.x, a.y);
        ctx!.rotate((a.rotation * Math.PI) / 180);
        ctx!.beginPath();
        
        // Irregular shape
        const points = 6;
        for (let j = 0; j < points; j++) {
          const angle = (j / points) * Math.PI * 2;
          const r = a.size * (1 + Math.sin(j * 2.5) * 0.3);
          const px = Math.cos(angle) * r;
          const py = Math.sin(angle) * r;
          if (j === 0) ctx!.moveTo(px, py);
          else ctx!.lineTo(px, py);
        }
        ctx!.closePath();
        ctx!.fillStyle = `rgba(191, 245, 73, ${a.opacity})`;
        ctx!.fill();
        ctx!.restore();

        // Remove if off screen
        if (a.y > canvas!.height + 50 || a.x > canvas!.width + 50) {
          asteroids.splice(i, 1);
        }
      }

      frame = requestAnimationFrame(animate);
    }

    // Spawn initial asteroid
    spawnAsteroid();

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[3] pointer-events-none"
    />
  );
}
