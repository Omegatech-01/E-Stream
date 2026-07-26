import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Channel } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, RotateCw, AlertCircle, Radio, Tv, Zap, PictureInPicture2 } from 'lucide-react';
import { useVolume } from '../context/VolumeContext';

interface VideoPlayerProps {
  channel: Channel | null;
  isHeroPreview?: boolean;
  isPip?: boolean;
}

export default function VideoPlayer({ channel, isHeroPreview = false, isPip = false }: VideoPlayerProps) {
  const { volume, isMuted, setVolume, toggleMute, attachMediaElement, triggerVibe } = useVolume();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isBuffering, setIsBuffering] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(!isPip);
  const [retryCount, setRetryCount] = useState(0);
  const [useDirectUrl, setUseDirectUrl] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [seekableStart, setSeekableStart] = useState(0);
  const [seekableEnd, setSeekableEnd] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isHeroPreview) {
        videoRef.current.muted = true;
        videoRef.current.volume = 0;
      } else {
        attachMediaElement(videoRef.current);
      }
    }
  }, [channel, attachMediaElement, isHeroPreview]);

  const safePlay = () => {
    if (!videoRef.current) return;
    const promise = videoRef.current.play();
    if (promise !== undefined) {
      playPromiseRef.current = promise;
      promise
        .then(() => {
          playPromiseRef.current = null;
          setIsPlaying(true);
          setIsBuffering(false);
          setError(false);
        })
        .catch(e => {
          playPromiseRef.current = null;
          if (e.name !== 'AbortError' && !e.message?.includes('interrupted')) {
            console.warn('Auto-play was prevented', e);
          }
          setIsPlaying(false);
          setIsBuffering(false);
        });
    }
  };

  const safePause = () => {
    if (!videoRef.current) return;
    if (playPromiseRef.current) {
      playPromiseRef.current
        .then(() => {
          if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        })
        .catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    setIsBuffering(true);
    setError(false);
    setErrorMessage(null);
    setIsPlaying(true);
    setRetryCount(0);
    setUseDirectUrl(false);
    setCurrentTime(0);
    setDuration(0);
    setBufferedEnd(0);
    setSeekableStart(0);
    setSeekableEnd(0);
  }, [channel]);

  const handleRetry = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setError(false);
    setErrorMessage(null);
    setIsBuffering(true);
    setRetryCount(prev => prev + 1);
    if (retryCount >= 1) {
      setUseDirectUrl(prev => !prev);
    }
  };

  const updateProgress = () => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    setCurrentTime(v.currentTime);
    if (isFinite(v.duration) && v.duration > 0) {
      setDuration(v.duration);
    }

    if (v.seekable && v.seekable.length > 0) {
      setSeekableStart(v.seekable.start(0));
      setSeekableEnd(v.seekable.end(v.seekable.length - 1));
    }

    if (v.buffered && v.buffered.length > 0) {
      let maxB = 0;
      for (let i = 0; i < v.buffered.length; i++) {
        if (v.buffered.end(i) > maxB) {
          maxB = v.buffered.end(i);
        }
      }
      setBufferedEnd(maxB);
    }
  };

  useEffect(() => {
    if (!channel || !videoRef.current) return;

    let hls: Hls | null = null;
    const video = videoRef.current;
    let autoRetryTimer: NodeJS.Timeout | null = null;
    let autoSwitchTimer: NodeJS.Timeout | null = null;
    let isCleanedUp = false;

    let streamUrl = channel.url;
    if (useDirectUrl && streamUrl.startsWith('/api/stream-proxy?url=')) {
      try {
        const parsed = new URL(streamUrl, window.location.origin);
        const raw = parsed.searchParams.get('url');
        if (raw) streamUrl = raw;
      } catch (e) {
        
      }
    }

    const scheduleAutoRetry = (delayMs = 3000) => {
      if (isCleanedUp) return;
      setIsBuffering(true);
      if (autoRetryTimer) clearTimeout(autoRetryTimer);
      autoRetryTimer = setTimeout(() => {
        if (isCleanedUp) return;
        if (hls) {
          try {
            hls.loadSource(streamUrl);
            hls.startLoad();
          } catch (e) {
            console.warn('Auto-retry error:', e);
          }
        } else if (video) {
          video.src = streamUrl;
          video.load();
          safePlay();
        }
      }, delayMs);
    };

    if (Hls.isSupported()) {
      hls = new Hls({
        maxMaxBufferLength: 30,
        maxBufferLength: 15,
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 10,
        levelLoadingTimeOut: 10000,
        levelLoadingMaxRetry: 10,
        fragLoadingTimeOut: 10000,
        fragLoadingMaxRetry: 10,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 10,
        startLevel: -1,
        capLevelToPlayerSize: true,
        startFragPrefetch: true,
        progressive: true,
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsBuffering(false);
        setError(false);
        safePlay();
      });

      hls.on(Hls.Events.FRAG_LOADED, () => {
        setIsBuffering(false);
        setError(false);
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setIsBuffering(true);
          console.warn(`HLS fatal error [${data.type}]: ${data.details}. Auto-retrying...`);

          if (data.details === 'manifestParsingError' || data.details === 'manifestLoadError') {
            console.info('Stream manifest parsing failed. Falling back to native HTML5 video player...');
            if (hls) {
              try {
                hls.destroy();
                hls = null;
              } catch (e) {
                
              }
            }
            if (video) {
              video.src = streamUrl;
              video.load();
              safePlay();
            }
            return;
          }

          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              try {
                hls?.startLoad();
              } catch (e) {
                scheduleAutoRetry(2000);
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              try {
                hls?.recoverMediaError();
              } catch (e) {
                scheduleAutoRetry(2000);
              }
              break;
            default:
              scheduleAutoRetry(3000);
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsBuffering(false);
        setError(false);
        safePlay();
      });
      video.addEventListener('error', () => {
        console.warn('Native HLS playback error encountered. Auto-retrying infinitely...');
        scheduleAutoRetry(3000);
      });
    }

    return () => {
      isCleanedUp = true;
      if (autoRetryTimer) clearTimeout(autoRetryTimer);
      if (autoSwitchTimer) clearTimeout(autoSwitchTimer);
      if (videoRef.current) {
        safePause();
        try {
          videoRef.current.removeAttribute('src');
          videoRef.current.load();
        } catch (e) {
          
        }
      }
      if (hls) {
        hls.destroy();
      }
    };
  }, [channel, retryCount, useDirectUrl]);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    triggerVibe(20);
    if (isPlaying) {
      safePause();
    } else {
      safePlay();
    }
  };

  const handleToggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    toggleMute();
  };

  const toggleFullscreen = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    triggerVibe(25);
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  const toggleNativePip = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    triggerVibe(20);
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('Native Picture-in-Picture failed:', err);
    }
  };

  const handleMouseMove = () => {
    if (isPip) {
      setShowControls(false); 
      return;
    }
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const minTime = seekableStart > 0 ? seekableStart : 0;
  const maxTime = seekableEnd > 0 ? seekableEnd : (duration > 0 ? duration : Math.max(bufferedEnd, currentTime));
  const totalSpan = Math.max(1, maxTime - minTime);

  const progressPct = Math.min(100, Math.max(0, ((currentTime - minTime) / totalSpan) * 100));
  const bufferedPct = Math.min(100, Math.max(0, ((bufferedEnd - minTime) / totalSpan) * 100));
  const isAtLive = maxTime - currentTime < 10;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const pct = parseFloat(e.target.value);
    const targetTime = minTime + (pct / 100) * totalSpan;
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const handleRewind10 = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const target = Math.max(minTime, videoRef.current.currentTime - 10);
      videoRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const handleForward10 = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const target = Math.min(maxTime, videoRef.current.currentTime + 10);
      videoRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const handleGoLive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const liveTarget = maxTime > 1 ? maxTime - 0.5 : maxTime;
      videoRef.current.currentTime = liveTarget;
      setCurrentTime(liveTarget);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const h = Math.floor(m / 60);
    if (h > 0) {
      const rm = m % 60;
      return `${h}:${rm < 10 ? '0' : ''}${rm}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!channel) {
    return (
      <div className="w-full h-full bg-[#0a0f1c] rounded-none md:rounded-2xl flex items-center justify-center text-slate-500 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0f1c] to-[#0a0f1c]"></div>
        <div className="text-center z-10">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
             <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
             </div>
          </div>
          <p className="text-lg font-medium text-slate-300">Select a channel to start watching</p>
          <p className="text-sm mt-2 opacity-75 text-slate-500">Live TV streams instantly</p>
        </div>
      </div>
    );
  }

  if (isHeroPreview) {
    return (
      <div className="w-full h-full relative overflow-hidden bg-black/40 pointer-events-none">
        <video
          ref={videoRef}
          className="w-full h-full object-cover opacity-70 mix-blend-screen transition-opacity duration-1000 scale-105"
          playsInline
          muted
          autoPlay
          loop
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => {
            setIsBuffering(false);
            setIsPlaying(true);
            setError(false);
          }}
        />
        {channel?.logo && isBuffering && (
          <img
            src={channel.logo}
            alt=""
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen blur-sm transition-opacity duration-500"
          />
        )}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative group bg-black overflow-hidden md:rounded-2xl flex flex-col justify-center select-none"
      onMouseMove={handleMouseMove}
      onTouchStart={handleMouseMove}
      onTouchMove={handleMouseMove}
      onClick={isPip ? undefined : togglePlay}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        onTimeUpdate={updateProgress}
        onProgress={updateProgress}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          setIsPlaying(true);
          setError(false);
        }}
        onPause={() => setIsPlaying(false)}
      />
      
      <AnimatePresence>
        {isBuffering && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center z-20 pointer-events-none p-6 text-center"
          >
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-white font-semibold text-base drop-shadow-md">Connecting to Live Stream...</p>
            <p className="text-xs text-blue-300/80 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              Auto-reconnecting indefinitely on network drop
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 pointer-events-none flex flex-col justify-between z-30"
          >
            <div className="h-28 bg-gradient-to-b from-black/90 via-black/50 to-transparent p-4 md:p-6 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-900 border border-white/10 p-1 shrink-0 shadow-xl flex items-center justify-center overflow-hidden">
                  {channel.logo ? (
                    <img 
                      src={channel.logo} 
                      alt={channel.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        if ((e.target as HTMLElement).nextElementSibling) {
                          ((e.target as HTMLElement).nextElementSibling as HTMLElement).style.display = 'flex';
                        }
                      }} 
                    />
                  ) : null}
                  <div className={`w-full h-full bg-blue-600/20 rounded flex items-center justify-center text-blue-400 font-bold text-xs ${channel.logo ? 'hidden' : ''}`}>
                    <Tv className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white drop-shadow-md leading-tight">{channel.name}</h2>
                  {channel.nowPlaying && (
                    <p className="text-sm font-medium text-blue-400 drop-shadow-md line-clamp-1 mt-0.5">
                      {channel.nowPlaying}
                    </p>
                  )}
                  <div className="flex items-center flex-wrap gap-2 text-xs mt-0.5">
                    {isAtLive ? (
                      <span className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Live
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        DVR ({formatTime(currentTime - minTime)} / {formatTime(totalSpan)})
                      </span>
                    )}
                    <span className="text-slate-300 capitalize drop-shadow-md bg-white/5 px-2 py-0.5 rounded-full border border-white/10">{channel.category}</span>
                    {channel.country && (
                      <span className="text-blue-300 font-medium bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 uppercase tracking-wider">{channel.country}</span>
                    )}
                    {channel.language && (
                      <span className="text-slate-400 font-medium bg-white/5 px-2 py-0.5 rounded-full border border-white/10 capitalize">{channel.language}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {!isPlaying && !isBuffering && (
                <div className="w-16 h-16 rounded-full bg-blue-600/90 backdrop-blur-md flex items-center justify-center text-white shadow-2xl border border-white/20">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
              )}
            </div>

            <div className="p-4 md:p-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col gap-2.5 pointer-events-auto mt-auto">
              
              <div className="w-full relative group/slider flex items-center py-2 cursor-pointer">
                <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden group-hover/slider:h-2.5 transition-all relative">
                  <div 
                    className="absolute left-0 top-0 bottom-0 bg-white/40 transition-all duration-300"
                    style={{ width: `${bufferedPct}%` }}
                  />
                  <div 
                    className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-500 to-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)]"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div 
                  className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-lg top-1/2 -translate-y-1/2 -ml-1.5 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-150 pointer-events-none"
                  style={{ left: `${progressPct}%` }}
                />
                <input 
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={isNaN(progressPct) ? 0 : progressPct}
                  onChange={handleSeekChange}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-4">
                  <button 
                    onClick={togglePlay}
                    className="text-white hover:text-blue-400 transition-colors focus:outline-none p-1"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                  </button>

                  <button
                    onClick={handleRewind10}
                    className="text-slate-300 hover:text-white transition-colors focus:outline-none flex items-center gap-1 text-xs font-semibold p-1"
                    title="Rewind 10s"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">10s</span>
                  </button>

                  <button
                    onClick={handleForward10}
                    className="text-slate-300 hover:text-white transition-colors focus:outline-none flex items-center gap-1 text-xs font-semibold p-1"
                    title="Forward 10s"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span className="hidden sm:inline">10s</span>
                  </button>

                  <div className="flex items-center gap-2 group/volume relative">
                    <button 
                      onClick={handleToggleMute}
                      className="text-white hover:text-blue-400 transition-colors focus:outline-none p-1"
                      title={isMuted ? "Unmute" : `Volume: ${volume}%`}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-5 h-5 text-red-400" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </button>

                    <div className="w-0 opacity-0 group-hover/volume:w-28 group-hover/volume:opacity-100 transition-all duration-300 flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 shadow-xl">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="1"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => setVolume(Math.min(100, parseInt(e.target.value, 10)))}
                        onClick={(e) => e.stopPropagation()}
                        className="w-20 h-1.5 accent-blue-500 cursor-pointer"
                      />
                      <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded whitespace-nowrap text-slate-300">
                        {volume}%
                      </span>
                    </div>
                  </div>

                  <div className="text-xs font-mono text-slate-300 font-medium">
                    {formatTime(currentTime - minTime)} / {formatTime(totalSpan)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isAtLive ? (
                    <button 
                      onClick={handleGoLive}
                      className="flex items-center gap-1.5 text-xs font-bold text-white px-2.5 py-1 bg-red-600 rounded-lg shadow-md border border-red-500/50 hover:bg-red-500 transition-all"
                    >
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                      LIVE
                    </button>
                  ) : (
                    <button 
                      onClick={handleGoLive}
                      className="flex items-center gap-1.5 text-xs font-bold text-amber-300 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg border border-amber-500/40 transition-all active:scale-95"
                      title="Jump to live edge"
                    >
                      <Radio className="w-3.5 h-3.5 animate-pulse" />
                      <span>GO TO LIVE</span>
                    </button>
                  )}

                  {typeof document !== 'undefined' && document.pictureInPictureEnabled && (
                    <button 
                      onClick={toggleNativePip}
                      className="text-white hover:text-blue-400 transition-colors focus:outline-none p-1"
                      title="Picture-in-Picture Mode"
                    >
                      <PictureInPicture2 className="w-5 h-5" />
                    </button>
                  )}

                  <button 
                    onClick={toggleFullscreen}
                    className="text-white hover:text-blue-400 transition-colors focus:outline-none p-1"
                    title="Fullscreen"
                  >
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
