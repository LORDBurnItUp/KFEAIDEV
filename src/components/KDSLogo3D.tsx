'use client';

import { useEffect, useRef } from 'react';

/**
 * KDSLogo3D — Spinning 3D/4D/5D logo
 * Rotates in 360° with metallic chrome effect and glow
 */

export default function KDSLogo3D({ size = 200 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = size;
    const h = size;
    canvas.width = w * 2; // Retina
    canvas.height = h * 2;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(2, 2);

    let angle = 0;
    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(w / 2, h / 2);

      // Rotation
      angle += 0.5;
      const rad = (angle * Math.PI) / 180;
      const scaleX = Math.cos(rad); // 3D rotation effect
      const skewY = Math.sin(rad) * 0.1;

      // Outer glow ring
      ctx.save();
      ctx.scale(Math.abs(scaleX) * 0.95 + 0.05, 1);
      const glowIntensity = 0.3 + Math.sin(frame * 0.02) * 0.15;
      ctx.shadowColor = `rgba(191, 245, 73, ${glowIntensity})`;
      ctx.shadowBlur = 40 + Math.sin(frame * 0.03) * 10;
      ctx.beginPath();
      ctx.arc(0, 0, w * 0.38, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(191, 245, 73, ${0.15 + Math.sin(frame * 0.02) * 0.1})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Inner glow ring
      ctx.save();
      ctx.scale(Math.abs(scaleX) * 0.97 + 0.03, 1);
      ctx.beginPath();
      ctx.arc(0, 0, w * 0.33, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(191, 245, 73, ${0.08 + Math.sin(frame * 0.015) * 0.05})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Main K letter — 3D rotation
      ctx.save();
      ctx.scale(scaleX, 1);
      ctx.transform(1, skewY, 0, 1, 0, 0);

      // Metallic gradient
      const gradient = ctx.createLinearGradient(-w * 0.15, -h * 0.25, w * 0.15, h * 0.25);
      gradient.addColorStop(0, '#f5e6a3');
      gradient.addColorStop(0.3, '#d4af37');
      gradient.addColorStop(0.5, '#ffd700');
      gradient.addColorStop(0.7, '#b8860b');
      gradient.addColorStop(1, '#f5e6a3');

      // Shadow for depth
      ctx.shadowColor = 'rgba(191, 245, 73, 0.4)';
      ctx.shadowBlur = 20 + Math.sin(frame * 0.02) * 10;
      ctx.shadowOffsetX = scaleX > 0 ? 3 : -3;
      ctx.shadowOffsetY = 5;

      // Draw K
      ctx.font = `900 ${w * 0.45}px "Space Grotesk", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = gradient;
      ctx.fillText('K', 0, 0);

      ctx.restore();

      // Sparkle particles
      for (let i = 0; i < 5; i++) {
        const sparkleAngle = (frame * 0.5 + i * 72) * Math.PI / 180;
        const sparkleR = w * 0.35 + Math.sin(frame * 0.03 + i) * 20;
        const sx = Math.cos(sparkleAngle) * sparkleR;
        const sy = Math.sin(sparkleAngle) * sparkleR;
        const sparkleAlpha = 0.3 + Math.sin(frame * 0.05 + i * 2) * 0.3;

        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(191, 245, 73, ${sparkleAlpha})`;
        ctx.fill();

        // Sparkle glow
        ctx.beginPath();
        ctx.arc(sx, sy, 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(191, 245, 73, ${sparkleAlpha * 0.3})`;
        ctx.fill();
      }

      // Rotating orbit line
      ctx.save();
      ctx.scale(Math.abs(scaleX) * 0.8 + 0.2, 1);
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.42, h * 0.15, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(96, 165, 250, ${0.1 + Math.sin(frame * 0.01) * 0.05})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 10]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Second orbit (perpendicular)
      ctx.save();
      ctx.scale(1, Math.abs(Math.cos(rad + Math.PI/2)) * 0.3 + 0.7);
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.15, h * 0.4, Math.PI / 4, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(250, 204, 21, ${0.08 + Math.sin(frame * 0.015 + 1) * 0.04})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 8]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      ctx.restore();
      frame++;
    };

    const interval = setInterval(draw, 33); // ~30fps
    draw();

    return () => clearInterval(interval);
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: size,
        height: size,
        display: 'block',
      }}
    />
  );
}
