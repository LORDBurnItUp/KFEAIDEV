'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * KDS Ambient Sound — 15 unique soundscapes
 * Deep space, other dimensions, hypnotic, relaxing
 * All generated procedurally — no audio files needed
 */

interface SoundScape {
  id: string;
  name: string;
  emoji: string;
  description: string;
  build: (ctx: AudioContext, master: GainNode) => () => void;
}

// ── SoundScape Builders ────────────────────────────────────────────────

const soundscapes: SoundScape[] = [
  {
    id: 'deep-space',
    name: 'Deep Space',
    emoji: '🌌',
    description: 'The void between stars',
    build: (ctx, master) => {
      const nodes: AudioNode[] = [];
      const oscs: OscillatorNode[] = [];
      
      // Deep drone
      const drone = ctx.createOscillator();
      drone.type = 'sine';
      drone.frequency.value = 40;
      const droneGain = ctx.createGain();
      droneGain.gain.value = 0.2;
      const droneFilter = ctx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.value = 100;
      drone.connect(droneFilter);
      droneFilter.connect(droneGain);
      droneGain.connect(master);
      drone.start();
      oscs.push(drone);
      nodes.push(droneGain, droneFilter);

      // Sub bass
      const sub = ctx.createOscillator();
      sub.type = 'sine';
      sub.frequency.value = 30;
      const subGain = ctx.createGain();
      subGain.gain.value = 0.15;
      sub.connect(subGain);
      subGain.connect(master);
      sub.start();
      oscs.push(sub);
      nodes.push(subGain);

      // Wind
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.value = 200;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.03;
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(master);
      noise.start();

      return () => oscs.forEach(o => o.stop());
    },
  },
  {
    id: 'nebula',
    name: 'Nebula Dreams',
    emoji: '✨',
    description: 'Cosmic dust clouds swirling',
    build: (ctx, master) => {
      const oscs: OscillatorNode[] = [];
      
      // Ethereal pad
      [110, 146.83, 174.61, 220].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const gain = ctx.createGain();
        gain.gain.value = 0.05;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        
        // LFO for movement
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1 + i * 0.05;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 30;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(master);
        osc.start();
        oscs.push(osc);
      });

      return () => oscs.forEach(o => o.stop());
    },
  },
  {
    id: 'hypersleep',
    name: 'Hypersleep',
    emoji: '😴',
    description: 'Cryogenic chamber hum',
    build: (ctx, master) => {
      const oscs: OscillatorNode[] = [];
      
      // Rhythmic pulse
      const pulse = ctx.createOscillator();
      pulse.type = 'sine';
      pulse.frequency.value = 60;
      const pulseGain = ctx.createGain();
      pulseGain.gain.value = 0.1;
      
      const pulseLFO = ctx.createOscillator();
      pulseLFO.type = 'sine';
      pulseLFO.frequency.value = 0.25;
      const pulseLFOGain = ctx.createGain();
      pulseLFOGain.gain.value = 0.08;
      pulseLFO.connect(pulseLFOGain);
      pulseLFOGain.connect(pulseGain.gain);
      pulseLFO.start();
      
      pulse.connect(pulseGain);
      pulseGain.connect(master);
      pulse.start();
      oscs.push(pulse, pulseLFO);

      // White noise bed
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.value = 300;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.02;
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(master);
      noise.start();

      return () => oscs.forEach(o => o.stop());
    },
  },
  {
    id: 'void-whisper',
    name: 'Void Whisper',
    emoji: '🌀',
    description: 'Echoes from another dimension',
    build: (ctx, master) => {
      const oscs: OscillatorNode[] = [];
      
      // Dissonant chords
      [220, 233.08, 261.63].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        const gain = ctx.createGain();
        gain.gain.value = 0.03;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = freq;
        filter.Q.value = 10;
        
        // Slow wobble
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.05 + i * 0.02;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = freq * 0.05;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(master);
        osc.start();
        oscs.push(osc, lfo);
      });

      return () => oscs.forEach(o => o.stop());
    },
  },
  {
    id: 'quantum-field',
    name: 'Quantum Field',
    emoji: '⚛️',
    description: 'Subatomic particle vibrations',
    build: (ctx, master) => {
      const oscs: OscillatorNode[] = [];
      
      // Random blips
      const playBlip = () => {
        if (ctx.state === 'closed') return;
        const freq = 800 + Math.random() * 4000;
        const blip = ctx.createOscillator();
        blip.type = 'sine';
        blip.frequency.value = freq;
        const blipGain = ctx.createGain();
        blipGain.gain.value = 0;
        blipGain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.05);
        blipGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
        blip.connect(blipGain);
        blipGain.connect(master);
        blip.start();
        blip.stop(ctx.currentTime + 0.3);
        setTimeout(playBlip, 200 + Math.random() * 800);
      };
      setTimeout(playBlip, 500);

      // Low hum
      const hum = ctx.createOscillator();
      hum.type = 'sine';
      hum.frequency.value = 50;
      const humGain = ctx.createGain();
      humGain.gain.value = 0.08;
      hum.connect(humGain);
      humGain.connect(master);
      hum.start();
      oscs.push(hum);

      return () => oscs.forEach(o => o.stop());
    },
  },
  {
    id: 'aurora',
    name: 'Aurora Borealis',
    emoji: '🌈',
    description: 'Northern lights in sound',
    build: (ctx, master) => {
      const oscs: OscillatorNode[] = [];
      
      // Shimmering pad
      [261.63, 329.63, 392, 523.25].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const gain = ctx.createGain();
        gain.gain.value = 0.04;
        
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.15 + i * 0.1;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.03;
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        lfo.start();
        
        osc.connect(gain);
        gain.connect(master);
        osc.start();
        oscs.push(osc, lfo);
      });

      return () => oscs.forEach(o => o.stop());
    },
  },
  {
    id: 'abyss',
    name: 'The Abyss',
    emoji: '🕳️',
    description: 'Bottomless ocean depths',
    build: (ctx, master) => {
      const oscs: OscillatorNode[] = [];
      
      // Very low drone
      const drone = ctx.createOscillator();
      drone.type = 'sine';
      drone.frequency.value = 25;
      const droneGain = ctx.createGain();
      droneGain.gain.value = 0.25;
      drone.connect(droneGain);
      droneGain.connect(master);
      drone.start();
      oscs.push(drone);

      // Water bubbles
      const playBubble = () => {
        if (ctx.state === 'closed') return;
        const freq = 100 + Math.random() * 200;
        const bubble = ctx.createOscillator();
        bubble.type = 'sine';
        bubble.frequency.value = freq;
        const bubbleGain = ctx.createGain();
        bubbleGain.gain.value = 0;
        bubbleGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.1);
        bubbleGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        bubble.connect(bubbleGain);
        bubbleGain.connect(master);
        bubble.start();
        bubble.stop(ctx.currentTime + 0.5);
        setTimeout(playBubble, 1000 + Math.random() * 3000);
      };
      setTimeout(playBubble, 1000);

      return () => oscs.forEach(o => o.stop());
    },
  },
  {
    id: 'cyber-dream',
    name: 'Cyber Dream',
    emoji: '🤖',
    description: 'AI consciousness stream',
    build: (ctx, master) => {
      const oscs: OscillatorNode[] = [];
      
      // Digital pad
      [196, 246.94, 293.66].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = freq;
        const gain = ctx.createGain();
        gain.gain.value = 0.02;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(master);
        osc.start();
        oscs.push(osc);
      });

      // Data stream
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 2000;
      noiseFilter.Q.value = 20;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.01;
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(master);
      noise.start();

      return () => oscs.forEach(o => o.stop());
    },
  },
  {
    id: 'crystal-cave',
    name: 'Crystal Cave',
    emoji: '💎',
    description: 'Resonating mineral chambers',
    build: (ctx, master) => {
      const oscs: OscillatorNode[] = [];
      
      // Crystalline tones
      const playCrystal = () => {
        if (ctx.state === 'closed') return;
        const freq = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98][Math.floor(Math.random() * 6)];
        const crystal = ctx.createOscillator();
        crystal.type = 'sine';
        crystal.frequency.value = freq;
        const crystalGain = ctx.createGain();
        crystalGain.gain.value = 0;
        crystalGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.3);
        crystalGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 3);
        crystal.connect(crystalGain);
        crystalGain.connect(master);
        crystal.start();
        crystal.stop(ctx.currentTime + 3);
        setTimeout(playCrystal, 2000 + Math.random() * 5000);
      };
      setTimeout(playCrystal, 500);

      // Cave reverb
      const cave = ctx.createOscillator();
      cave.type = 'sine';
      cave.frequency.value = 80;
      const caveGain = ctx.createGain();
      caveGain.gain.value = 0.05;
      cave.connect(caveGain);
      caveGain.connect(master);
      cave.start();
      oscs.push(cave);

      return () => oscs.forEach(o => o.stop());
    },
  },
  {
    id: 'solar-wind',
    name: 'Solar Wind',
    emoji: '☀️',
    description: 'Stellar radiation waves',
    build: (ctx, master) => {
      const oscs: OscillatorNode[] = [];
      
      // Solar wind
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 600;
      noiseFilter.Q.value = 5;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.06;
      
      const windLFO = ctx.createOscillator();
      windLFO.type = 'sine';
      windLFO.frequency.value = 0.08;
      const windLFOGain = ctx.createGain();
      windLFOGain.gain.value = 400;
      windLFO.connect(windLFOGain);
      windLFOGain.connect(noiseFilter.frequency);
      windLFO.start();
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(master);
      noise.start();
      oscs.push(windLFO);

      return () => oscs.forEach(o => o.stop());
    },
  },
  {
    id: 'time-dilation',
    name: 'Time Dilation',
    emoji: '⏳',
    description: 'Relativistic time warp',
    build: (ctx, master) => {
      const oscs: OscillatorNode[] = [];
      
      // Warped drone
      const drone = ctx.createOscillator();
      drone.type = 'sawtooth';
      drone.frequency.value = 110;
      const droneGain = ctx.createGain();
      droneGain.gain.value = 0.04;
      const droneFilter = ctx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.value = 300;
      
      const warpLFO = ctx.createOscillator();
      warpLFO.type = 'sine';
      warpLFO.frequency.value = 0.03;
      const warpLFOGain = ctx.createGain();
      warpLFOGain.gain.value = 50;
      warpLFO.connect(warpLFOGain);
      warpLFOGain.connect(drone.frequency);
      warpLFO.start();
      
      drone.connect(droneFilter);
      droneFilter.connect(droneGain);
      droneGain.connect(master);
      drone.start();
      oscs.push(drone, warpLFO);

      return () => oscs.forEach(o => o.stop());
    },
  },
  {
    id: 'zero-gravity',
    name: 'Zero Gravity',
    emoji: '🪐',
    description: 'Weightless floating',
    build: (ctx, master) => {
      const oscs: OscillatorNode[] = [];
      
      // Floating tones
      [164.81, 220, 277.18].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const gain = ctx.createGain();
        gain.gain.value = 0.06;
        
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.07 + i * 0.03;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = freq * 0.1;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();
        
        osc.connect(gain);
        gain.connect(master);
        osc.start();
        oscs.push(osc, lfo);
      });

      return () => oscs.forEach(o => o.stop());
    },
  },
  {
    id: 'matrix',
    name: 'The Matrix',
    emoji: '💊',
    description: 'Digital rain sounds',
    build: (ctx, master) => {
      const oscs: OscillatorNode[] = [];
      
      // Matrix rain drops
      const playDrop = () => {
        if (ctx.state === 'closed') return;
        const freq = 200 + Math.random() * 600;
        const drop = ctx.createOscillator();
        drop.type = 'sine';
        drop.frequency.value = freq;
        const dropGain = ctx.createGain();
        dropGain.gain.value = 0;
        dropGain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.02);
        dropGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
        drop.frequency.linearRampToValueAtTime(freq * 0.5, ctx.currentTime + 0.15);
        drop.connect(dropGain);
        dropGain.connect(master);
        drop.start();
        drop.stop(ctx.currentTime + 0.15);
        setTimeout(playDrop, 50 + Math.random() * 150);
      };
      setTimeout(playDrop, 200);

      // Background hum
      const hum = ctx.createOscillator();
      hum.type = 'sine';
      hum.frequency.value = 60;
      const humGain = ctx.createGain();
      humGain.gain.value = 0.03;
      hum.connect(humGain);
      humGain.connect(master);
      hum.start();
      oscs.push(hum);

      return () => oscs.forEach(o => o.stop());
    },
  },
  {
    id: 'event-horizon',
    name: 'Event Horizon',
    emoji: '🕳️',
    description: 'Edge of a black hole',
    build: (ctx, master) => {
      const oscs: OscillatorNode[] = [];
      
      // Gravitational pull drone
      const drone = ctx.createOscillator();
      drone.type = 'sawtooth';
      drone.frequency.value = 35;
      const droneGain = ctx.createGain();
      droneGain.gain.value = 0.15;
      const droneFilter = ctx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.value = 80;
      
      // Frequency shift (red shift effect)
      const shiftLFO = ctx.createOscillator();
      shiftLFO.type = 'sine';
      shiftLFO.frequency.value = 0.02;
      const shiftLFOGain = ctx.createGain();
      shiftLFOGain.gain.value = 10;
      shiftLFO.connect(shiftLFOGain);
      shiftLFOGain.connect(drone.frequency);
      shiftLFO.start();
      
      drone.connect(droneFilter);
      droneFilter.connect(droneGain);
      droneGain.connect(master);
      drone.start();
      oscs.push(drone, shiftLFO);

      return () => oscs.forEach(o => o.stop());
    },
  },
  {
    id: 'genesis',
    name: 'Genesis',
    emoji: '🌱',
    description: 'The birth of a universe',
    build: (ctx, master) => {
      const oscs: OscillatorNode[] = [];
      
      // Building chord
      const chord = [130.81, 164.81, 196, 261.63];
      chord.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const gain = ctx.createGain();
        gain.gain.value = 0;
        gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 2 + i);
        osc.connect(gain);
        gain.connect(master);
        osc.start();
        oscs.push(osc);
      });

      // Sparkle
      const playSparkle = () => {
        if (ctx.state === 'closed') return;
        const freq = 1000 + Math.random() * 3000;
        const sparkle = ctx.createOscillator();
        sparkle.type = 'sine';
        sparkle.frequency.value = freq;
        const sparkleGain = ctx.createGain();
        sparkleGain.gain.value = 0;
        sparkleGain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.01);
        sparkleGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        sparkle.connect(sparkleGain);
        sparkleGain.connect(master);
        sparkle.start();
        sparkle.stop(ctx.currentTime + 0.2);
        setTimeout(playSparkle, 300 + Math.random() * 700);
      };
      setTimeout(playSparkle, 2000);

      return () => oscs.forEach(o => o.stop());
    },
  },
];

// ── Component ──────────────────────────────────────────────────────────

export default function AmbientSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [activeTrack, setActiveTrack] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const gainRef = useRef<GainNode | null>(null);

  const startSound = useCallback((trackIndex: number) => {
    // Stop previous
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
    }

    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(ctx.destination);
    gainRef.current = masterGain;

    const cleanup = soundscapes[trackIndex].build(ctx, masterGain);
    cleanupRef.current = cleanup;

    setIsPlaying(true);
    setActiveTrack(trackIndex);
  }, [volume]);

  const stopSound = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    gainRef.current = null;
    setIsPlaying(false);
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      stopSound();
    } else {
      startSound(activeTrack);
    }
  };

  const changeTrack = (index: number) => {
    if (isPlaying) {
      startSound(index);
    } else {
      setActiveTrack(index);
    }
  };

  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = volume;
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) cleanupRef.current();
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const current = soundscapes[activeTrack];

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex flex-col items-start gap-2">
      {/* Main controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={togglePlay}
          className="w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center text-lg hover:border-lime/30 transition-all duration-300"
          title={isPlaying ? 'Mute' : 'Play'}
        >
          {isPlaying ? '🔊' : '🔇'}
        </button>

        {isPlaying && (
          <div className="flex items-center gap-2 glass rounded-full px-3 py-2 border border-white/10">
            <span className="text-lg">{current.emoji}</span>
            <span className="text-xs font-mono text-white">{current.name}</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-1 appearance-none bg-white/20 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-lime"
            />
          </div>
        )}

        <button
          onClick={() => setShowPlaylist(!showPlaylist)}
          className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-sm hover:border-lime/30 transition-all"
          title="Sound library"
        >
          🎵
        </button>
      </div>

      {/* Playlist */}
      {showPlaylist && (
        <div className="glass rounded-2xl border border-white/10 p-4 w-72 max-h-80 overflow-y-auto">
          <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-3">
            Soundscapes — {soundscapes.length} tracks
          </div>
          <div className="space-y-1">
            {soundscapes.map((track, index) => (
              <button
                key={track.id}
                onClick={() => changeTrack(index)}
                className={`w-full text-left p-2 rounded-lg transition-all flex items-center gap-3 ${
                  index === activeTrack
                    ? 'bg-lime/10 border border-lime/20'
                    : 'hover:bg-white/5'
                }`}
              >
                <span className="text-lg">{track.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold truncate ${index === activeTrack ? 'text-lime' : 'text-white'}`}>
                    {track.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{track.description}</div>
                </div>
                {index === activeTrack && isPlaying && (
                  <span className="text-lime text-xs">▶</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
