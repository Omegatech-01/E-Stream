import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Channel } from '../types';
import VideoPlayer from './VideoPlayer';
import ErrorBoundary from './ErrorBoundary';
import { Maximize2, X, Volume2, VolumeX, Tv, GripHorizontal, Play, Pause } from 'lucide-react';
import { useVolume } from '../context/VolumeContext';

interface PipPlayerProps {
  channel: Channel;
  onExpand: () => void;
  onClose: () => void;
}

export default function PipPlayer({ channel, onExpand, onClose }: PipPlayerProps) {
  const { isMuted, toggleMute } = useVolume();
  const [dragBounds, setDragBounds] = useState({ left: -1000, right: 20, top: -800, bottom: 20 });
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    const calculateBounds = () => {
      if (typeof window !== 'undefined') {
        setDragBounds({
          left: -(window.innerWidth - 320),
          right: 20,
          top: -(window.innerHeight - 240),
          bottom: 20,
        });
      }
    };

    calculateBounds();
    window.addEventListener('resize', calculateBounds);
    return () => window.removeEventListener('resize', calculateBounds);
  }, []);

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.05}
      dragConstraints={dragBounds}
      initial={{ opacity: 0, scale: 0.8, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 40 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-72 sm:w-80 md:w-96 h-52 sm:h-56 md:h-64 bg-[#080d1a] border border-blue-500/40 rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden select-none touch-none"
    >
      <div 
        className="h-10 px-3 bg-[#0c1429] border-b border-white/10 flex items-center justify-between shrink-0 z-30 cursor-grab active:cursor-grabbing text-xs"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <GripHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="w-5 h-5 rounded-md bg-slate-900 border border-white/10 shrink-0 overflow-hidden flex items-center justify-center">
            {channel.logo && channel.logo.trim() ? (
              <img 
                src={channel.logo} 
                alt="" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <Tv className="w-3 h-3 text-blue-400" />
            )}
          </div>
          <span className="font-semibold text-white truncate max-w-[110px] sm:max-w-[150px]">
            {channel.name}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-slate-200" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-blue-600/30 transition-colors flex items-center gap-1"
            title="Expand to Fullscreen Watch View"
          >
            <Maximize2 className="w-4 h-4 text-blue-400" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-500/20 transition-colors"
            title="Close Picture in Picture"
          >
            <X className="w-4 h-4 text-slate-200 hover:text-red-400" />
          </button>
        </div>
      </div>

      {}
      <div 
        className="flex-1 w-full bg-black relative overflow-hidden cursor-pointer"
        onClick={() => setShowOverlay(!showOverlay)}
      >
        <ErrorBoundary fallbackTitle="PiP Stream Error">
          <VideoPlayer channel={channel} isPip={true} />
        </ErrorBoundary>

        {}
        {showOverlay && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200 flex items-center justify-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExpand();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xl transition-all active:scale-95"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Expand to Watch</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
