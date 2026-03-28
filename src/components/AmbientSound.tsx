'use client';

import { useEffect, useRef, useState } from 'react';

export default function AmbientSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const gainRef = useRef<GainNode | null>(null);

  const startAmbient = () => {
    if (audioCtxRef.current) return;

    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(ctx.destination);
    gainRef.current = masterGain;

    // Deep space drone — low frequency pad
    const drone = ctx.createOscillator();
    drone.type = 'sine';
    drone.frequency.value = 55; // Low A
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.15;
    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 200;
    drone.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(masterGain);
    drone.start();

    // Second drone — subtle harmony
    const drone2 = ctx.createOscillator();
    drone2.type = 'sine';
    drone2.frequency.value = 82.41; // Low E
    const drone2Gain = ctx.createGain();
    drone2Gain.gain.value = 0.08;
    const drone2Filter = ctx.createBiquadFilter();
    drone2Filter.type = 'lowpass';
    drone2Filter.frequency.value = 150;
    drone2.connect(drone2Filter);
    drone2Filter.connect(drone2Gain);
    drone2Gain.connect(masterGain);
    drone2.start();

    // Ethereal shimmer — high frequency
    const shimmer = ctx.createOscillator();
    shimmer.type = 'sine';
    shimmer.frequency.value = 880;
    const shimmerGain = ctx.createGain();
    shimmerGain.gain.value = 0.02;
    const shimmerFilter = ctx.createBiquadFilter();
    shimmerFilter.type = 'bandpass';
    shimmerFilter.frequency.value = 880;
    shimmerFilter.Q.value = 5;

    // LFO for shimmer movement
    const shimmerLFO = ctx.createOscillator();
    shimmerLFO.type = 'sine';
    shimmerLFO.frequency.value = 0.1;
    const shimmerLFOGain = ctx.createGain();
    shimmerLFOGain.gain.value = 200;
    shimmerLFO.connect(shimmerLFOGain);
    shimmerLFOGain.connect(shimmer.frequency);
    shimmerLFO.start();

    shimmer.connect(shimmerFilter);
    shimmerFilter.connect(shimmerGain);
    shimmerGain.connect(masterGain);
    shimmer.start();

    // Subtle wind noise
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 400;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.04;

    // LFO for wind movement
    const windLFO = ctx.createOscillator();
    windLFO.type = 'sine';
    windLFO.frequency.value = 0.05;
    const windLFOGain = ctx.createGain();
    windLFOGain.gain.value = 200;
    windLFO.connect(windLFOGain);
    windLFOGain.connect(noiseFilter.frequency);
    windLFO.start();

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start();

    // Celestial chimes — occasional high notes
    const playChime = () => {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;

      const chimeFreq = [523.25, 659.25, 783.99, 1046.5, 1318.5][Math.floor(Math.random() * 5)];
      const chime = ctx.createOscillator();
      chime.type = 'sine';
      chime.frequency.value = chimeFreq;

      const chimeGain = ctx.createGain();
      chimeGain.gain.value = 0;
      chimeGain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.5);
      chimeGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 4);

      const chimeReverb = ctx.createBiquadFilter();
      chimeReverb.type = 'lowpass';
      chimeReverb.frequency.value = 2000;

      chime.connect(chimeReverb);
      chimeReverb.connect(chimeGain);
      chimeGain.connect(masterGain);
      chime.start();
      chime.stop(ctx.currentTime + 4);

      // Next chime in 5-15 seconds
      setTimeout(playChime, 5000 + Math.random() * 10000);
    };

    // Start chimes after 3 seconds
    setTimeout(playChime, 3000);

    setIsPlaying(true);
  };

  const stopAmbient = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
      gainRef.current = null;
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAmbient();
    } else {
      startAmbient();
    }
  };

  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = volume;
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex items-center gap-3">
      <button
        onClick={togglePlay}
        className="w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center text-lg hover:border-lime/30 transition-all duration-300"
        title={isPlaying ? 'Mute ambient sound' : 'Play ambient sound'}
      >
        {isPlaying ? '🔊' : '🔇'}
      </button>

      {isPlaying && (
        <div className="flex items-center gap-2 glass rounded-full px-3 py-2 border border-white/10">
          <span className="text-xs font-mono text-text-muted">Vol</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-1 appearance-none bg-white/20 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-lime"
          />
        </div>
      )}
    </div>
  );
}
