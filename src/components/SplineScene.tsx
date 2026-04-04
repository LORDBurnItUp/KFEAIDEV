'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// Dynamic import — Spline runtime must load client-side
type Application = any;

/**
 * SplineScene — Embeds a Spline 3D scene via runtime
 * 
 * Usage:
 * <SplineScene 
 *   url="https://prod.spline.design/SCENE_ID/scene.splinecode"
 *   className="absolute inset-0 z-0"
 *   onLoad={() => console.log('Scene loaded')}
 * />
 * 
 * Props:
 * @param url - Spline scene .splinecode URL
 * @param className - CSS classes for positioning
 * @param style - Inline styles
 * @param onLoad - Callback when scene loads
 * @param onError - Callback on error
 * @param interactive - Enable mouse/touch interaction (default: true)
 * @param autoResize - Resize on window resize (default: true)
 */
export default function SplineScene({
  url,
  className = '',
  style = {},
  onLoad,
  onError,
  interactive = true,
  autoResize = true,
}: {
  url: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: (err: Error) => void;
  interactive?: boolean;
  autoResize?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const appRef = useRef<{ app: Application | null; canvas: HTMLCanvasElement | null }>({
    app: null,
    canvas: null,
  });

  useEffect(() => {
    if (!canvasRef.current || !url) return;
    let mounted = true;

    const loadScene = async () => {
      try {
        const module = await import('@splinetool/runtime');
        const Application = module.Application;

        const canvas = canvasRef.current!;
        const app = new Application(canvas);

        // Handle interaction
        if (!interactive) {
          canvas.style.pointerEvents = 'none';
        }

        await app.load(url);

        if (mounted) {
          appRef.current = { app, canvas };
          setLoaded(true);
          setError(null);
          onLoad?.();
        }
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        if (mounted) {
          setError(e.message);
          onError?.(e);
        }
      }
    };

    loadScene();

    return () => {
      mounted = false;
      // Cleanup
      if (appRef.current.app) {
        try {
          appRef.current.app.dispose?.();
        } catch {}
        appRef.current.app = null;
      }
    };
  }, [url]);

  // Handle resize
  useEffect(() => {
    if (!autoResize || !appRef.current.canvas) return;

    const handleResize = () => {
      const canvas = appRef.current.canvas;
      if (canvas) {
        // Spline handles resize internally, but we can trigger if needed
        const event = new Event('resize');
        window.dispatchEvent(event);
      }
    };

    let timeout: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(timeout);
    };
  }, [autoResize]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          ...style,
        }}
      />
      {!loaded && !error && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: '2px solid rgba(191,245,73,0.2)',
              borderTopColor: 'rgba(191,245,73,0.6)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}
      {error && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
            Failed to load 3D scene
          </span>
        </div>
      )}
    </>
  );
}
