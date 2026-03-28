'use client';

import { useEffect, useRef } from 'react';

export default function LightningText({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    const flash = () => {
      el.style.textShadow = `
        0 0 7px rgba(191, 245, 73, 1),
        0 0 20px rgba(191, 245, 73, 0.8),
        0 0 42px rgba(191, 245, 73, 0.6),
        0 0 80px rgba(96, 165, 250, 0.4),
        0 0 120px rgba(96, 165, 250, 0.2)
      `;
      el.style.color = '#fff';

      setTimeout(() => {
        el.style.textShadow = '0 0 10px rgba(191, 245, 73, 0.3)';
        el.style.color = '';
      }, 80);

      // Double flash
      setTimeout(() => {
        el.style.textShadow = `
          0 0 5px rgba(191, 245, 73, 0.8),
          0 0 15px rgba(191, 245, 73, 0.5)
        `;
        setTimeout(() => {
          el.style.textShadow = '';
        }, 50);
      }, 150);
    };

    // Random lightning strikes
    const interval = setInterval(() => {
      if (Math.random() > 0.7) flash();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <span
      ref={ref}
      className={`inline-block transition-all duration-75 ${className}`}
      style={{
        textShadow: '0 0 10px rgba(191, 245, 73, 0.3)',
      }}
    >
      {text}
    </span>
  );
}
