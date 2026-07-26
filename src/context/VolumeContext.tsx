import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface VolumeContextType {
  volume: number;
  isMuted: boolean;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  attachMediaElement: (element: HTMLMediaElement | null) => void;
  triggerVibe: (pattern?: number | number[]) => void;
}

const VolumeContext = createContext<VolumeContextType | undefined>(undefined);

const STORAGE_KEY_VOLUME = 'streamx_global_volume';
const STORAGE_KEY_MUTED = 'streamx_global_muted';

export const VolumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [volume, setVolumeState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VOLUME);
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 300) {
          return parsed;
        }
      }
    } catch {
      
    }
    return 100;
  });

  const [isMuted, setIsMutedState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MUTED);
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {
      
    }
    return false;
  });

  const currentElementRef = useRef<HTMLMediaElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const triggerVibe = (pattern: number | number[] = 15) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        
      }
    }
  };

  const initAudioBoost = (element: HTMLMediaElement) => {
    if (audioSourceRef.current && currentElementRef.current === element) {
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (audioSourceRef.current) {
        try {
          audioSourceRef.current.disconnect();
        } catch {
          
        }
        audioSourceRef.current = null;
      }

      const gainNode = gainNodeRef.current || ctx.createGain();
      gainNodeRef.current = gainNode;

      const source = ctx.createMediaElementSource(element);
      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      audioSourceRef.current = source;
      currentElementRef.current = element;
    } catch (e) {
      
      console.warn('VolumeContext Web Audio API notice:', e);
    }
  };

  const applyVolumeToCurrentElement = (targetVolume: number, muted: boolean) => {
    const el = currentElementRef.current;

    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    if (el) {
      el.muted = muted || targetVolume === 0;

      if (targetVolume <= 100) {
        el.volume = targetVolume / 100;
        if (gainNodeRef.current) {
          gainNodeRef.current.gain.value = 1.0;
        }
      } else {
        
        el.volume = 1.0;
        if (gainNodeRef.current) {
          gainNodeRef.current.gain.value = targetVolume / 100;
        }
      }
    }
  };

  const attachMediaElement = (element: HTMLMediaElement | null) => {
    if (!element) return;
    currentElementRef.current = element;

    initAudioBoost(element);
    applyVolumeToCurrentElement(volume, isMuted);

    const handleNativeVolumeChange = () => {
      if (element.muted !== isMuted && element.muted !== (volume === 0)) {
        setIsMutedState(element.muted);
      }
    };

    element.addEventListener('volumechange', handleNativeVolumeChange);
  };

  const setVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(300, val));
    setVolumeState(clamped);
    triggerVibe(clamped > 100 ? [25, 15, 25] : 15);

    try {
      localStorage.setItem(STORAGE_KEY_VOLUME, clamped.toString());
    } catch {
      
    }

    if (clamped === 0) {
      setIsMutedState(true);
      applyVolumeToCurrentElement(0, true);
    } else {
      if (isMuted) {
        setIsMutedState(false);
      }
      applyVolumeToCurrentElement(clamped, false);
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMutedState(nextMuted);
    triggerVibe(20);

    try {
      localStorage.setItem(STORAGE_KEY_MUTED, nextMuted ? 'true' : 'false');
    } catch {
      
    }

    applyVolumeToCurrentElement(volume, nextMuted);
  };

  useEffect(() => {
    applyVolumeToCurrentElement(volume, isMuted);
  }, [volume, isMuted]);

  return (
    <VolumeContext.Provider
      value={{
        volume,
        isMuted,
        setVolume,
        toggleMute,
        attachMediaElement,
        triggerVibe,
      }}
    >
      {children}
    </VolumeContext.Provider>
  );
};

export const useVolume = (): VolumeContextType => {
  const context = useContext(VolumeContext);
  if (!context) {
    throw new Error('useVolume must be used within a VolumeProvider');
  }
  return context;
};
