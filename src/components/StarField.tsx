'use client';

import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  prevX: number;
  prevY: number;
}

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const starCount = 800;
    const speed = 0.5;
    const stars: Star[] = [];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width - width / 2,
        y: Math.random() * height - height / 2,
        z: Math.random() * 1000,
        prevX: 0,
        prevY: 0,
      });
    }

    const centerX = width / 2;
    const centerY = height / 2;

    let frame: number;
    let mouseX = centerX;
    let mouseY = centerY;

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }
    window.addEventListener('mousemove', onMouseMove);

    function animate() {
      ctx!.fillStyle = 'rgba(2, 4, 10, 0.2)';
      ctx!.fillRect(0, 0, width, height);

      const offsetX = (mouseX - centerX) * 0.0003;
      const offsetY = (mouseY - centerY) * 0.0003;

      for (const star of stars) {
        star.prevX = star.x / (star.z * 0.001);
        star.prevY = star.y / (star.z * 0.001);

        star.z -= speed;
        if (star.z <= 0) {
          star.x = Math.random() * width - width / 2;
          star.y = Math.random() * height - height / 2;
          star.z = 1000;
        }

        const sx = star.x / (star.z * 0.001) + centerX + offsetX * star.z;
        const sy = star.y / (star.z * 0.001) + centerY + offsetY * star.z;

        const size = Math.max(0.5, (1000 - star.z) / 200);
        const opacity = Math.min(1, (1000 - star.z) / 400);

        ctx!.beginPath();
        ctx!.arc(sx, sy, size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(191, 245, 73, ${opacity * 0.8})`;
        ctx!.fill();

        // Trail effect for fast stars
        if (star.z < 300) {
          ctx!.beginPath();
          ctx!.moveTo(sx, sy);
          ctx!.lineTo(sx - (sx - centerX) * 0.02, sy - (sy - centerY) * 0.02);
          ctx!.strokeStyle = `rgba(191, 245, 73, ${opacity * 0.3})`;
          ctx!.lineWidth = size * 0.5;
          ctx!.stroke();
        }
      }

      frame = requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: '#02040a' }}
    />
  );
}
