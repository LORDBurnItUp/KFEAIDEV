'use client';

import { useEffect, useRef } from 'react';

export default function BreathingText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-block ${className}`}
      style={{
        animation: 'breathe 4s ease-in-out infinite',
      }}
    >
      {children}
      <style jsx>{`
        @keyframes breathe {
          0%, 100% { 
            opacity: 1;
            text-shadow: 0 0 10px rgba(191, 245, 73, 0.3);
            transform: scale(1);
          }
          50% { 
            opacity: 0.85;
            text-shadow: 0 0 25px rgba(191, 245, 73, 0.6), 0 0 50px rgba(191, 245, 73, 0.2);
            transform: scale(1.01);
          }
        }
      `}</style>
    </span>
  );
}
