/**
 * KDS Video Player — Embedded video component with futuristic styling
 * Supports playlist, autoplay, and 3D-style UI
 */

import React, { useState, useRef } from 'react';

interface VideoPlayerProps {
  videos: { src: string; title: string; description?: string }[];
  autoplay?: boolean;
  showPlaylist?: boolean;
}

const defaultVideos = [
  { src: '/videos/kds-clip-1.mp4', title: 'KDS Introduction', description: 'Welcome to the future' },
  { src: '/videos/kds-clip-2.mp4', title: 'The Vision', description: 'Building from 2130' },
  { src: '/videos/kds-clip-3.mp4', title: 'AI Development', description: 'Creating intelligence' },
  { src: '/videos/kds-clip-4.mp4', title: 'Community Hub', description: 'Where minds connect' },
  { src: '/videos/kds-clip-5.mp4', title: '3D Experience', description: 'Beyond reality' },
  { src: '/videos/kds-clip-6.mp4', title: 'The Marketplace', description: 'Digital commerce' },
  { src: '/videos/kds-clip-7.mp4', title: 'Command Center', description: 'Total control' },
  { src: '/videos/kds-clip-8.mp4', title: 'Voice Agents', description: 'AI that speaks' },
  { src: '/videos/kds-clip-9.mp4', title: 'Call Center Army', description: 'Automated sales' },
  { src: '/videos/kds-clip-10.mp4', title: 'The Network', description: 'Global connections' },
  { src: '/videos/kds-clip-11.mp4', title: 'Code & Create', description: 'Build the future' },
  { src: '/videos/kds-clip-12.mp4', title: 'Data Flow', description: 'Information streams' },
  { src: '/videos/kds-clip-13.mp4', title: 'The Platform', description: 'Everything unified' },
  { src: '/videos/kds-clip-14.mp4', title: 'Beyond 2130', description: 'The next chapter' },
];

export default function KDSVideoPlayer({ videos = defaultVideos, autoplay = false, showPlaylist = true }: VideoPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentVideo = videos[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const handleVideoEnd = () => {
    handleNext();
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Video Container */}
      <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/50">
        <video
          ref={videoRef}
          src={currentVideo.src}
          autoPlay={autoplay}
          controls
          onEnded={handleVideoEnd}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay Title */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <h3 className="text-white font-bold text-xl">{currentVideo.title}</h3>
          {currentVideo.description && (
            <p className="text-gray-400 text-sm mt-1">{currentVideo.description}</p>
          )}
        </div>

        {/* Navigation */}
        <button 
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          ◀
        </button>
        <button 
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          ▶
        </button>
      </div>

      {/* Playlist */}
      {showPlaylist && (
        <div className="mt-4 grid grid-cols-7 gap-2">
          {videos.map((video, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`p-2 rounded-lg text-xs text-center transition-all ${
                index === currentIndex 
                  ? 'bg-lime/20 border border-lime/30 text-lime' 
                  : 'bg-white/5 border border-white/5 text-gray-500 hover:bg-white/10'
              }`}
            >
              <div className="font-semibold truncate">{video.title}</div>
              <div className="text-[10px] text-gray-600 mt-0.5">{index + 1}/{videos.length}</div>
            </button>
          ))}
        </div>
      )}

      {/* Video Counter */}
      <div className="mt-4 text-center text-gray-500 text-sm">
        Video {currentIndex + 1} of {videos.length}
      </div>
    </div>
  );
}
