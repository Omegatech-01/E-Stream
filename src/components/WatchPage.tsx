import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Channel } from '../types';
import VideoPlayer from './VideoPlayer';
import ErrorBoundary from './ErrorBoundary';
import EsportsOverlay from './EsportsOverlay';
import { ArrowLeft, Info, Share2, Maximize2, Calendar, Tv, PictureInPicture2, Minimize2, Gamepad2, Check, Copy, Star, Bell, BellRing } from 'lucide-react';
import { GoldCrownSvg, GoldChannelTag } from './GoldBadge';

interface WatchPageProps {
  channel: Channel;
  onBack: () => void;
  relatedChannels: Channel[];
  onSelectChannel: (channel: Channel) => void;
  onTogglePip?: () => void;
  onToggleFavorite?: (channelId: string) => void;
  onToggleSubscription?: (channelId: string) => void;
}

export default function WatchPage({ channel, onBack, relatedChannels, onSelectChannel, onTogglePip, onToggleFavorite, onToggleSubscription }: WatchPageProps) {
  const [activeTab, setActiveTab] = useState<'similar' | 'guide' | 'details'>('similar');
  const [isEsportsOpen, setIsEsportsOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleShare = async () => {
    
    const url = new URL(window.location.href);
    url.searchParams.set('channel', channel.id);
    const shareUrl = url.toString();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${channel.name} | E-Stream TV`,
          text: `Watch ${channel.name} live broadcast on E-Stream!`,
          url: shareUrl,
        });
        setShareCopied(true);
        setShowToast(true);
        setTimeout(() => {
          setShareCopied(false);
          setShowToast(false);
        }, 3000);
        return;
      } catch (err) {
        
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setShowToast(true);
      setTimeout(() => {
        setShareCopied(false);
        setShowToast(false);
      }, 3000);
    } catch (e) {
      
      console.error('Failed to copy channel link:', e);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 bg-[#050811] flex flex-col md:flex-row"
    >
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-5 py-2.5 rounded-2xl bg-blue-600 text-white font-semibold text-xs shadow-[0_10px_30px_rgba(37,99,235,0.5)] border border-blue-400 flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-300" />
            <span>Channel link copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="p-4 md:p-6 flex items-center justify-between gap-4 bg-gradient-to-b from-black/80 to-transparent z-10 absolute top-0 left-0 right-0 pointer-events-none">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-colors pointer-events-auto"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => setIsEsportsOpen(!isEsportsOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md transition-all active:scale-95 shadow-lg ${
                isEsportsOpen 
                  ? 'bg-amber-500/40 border-amber-400 text-amber-200 shadow-amber-500/20 ring-2 ring-amber-400/50' 
                  : 'bg-white/10 hover:bg-white/20 border-white/20 text-slate-200'
              }`}
              title="Toggle E-Sports Match HUD & Social Sentiment Overlay"
            >
              <Gamepad2 className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>E-Sports HUD</span>
            </button>

            {onTogglePip && (
              <button
                onClick={onTogglePip}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-300 font-semibold text-xs backdrop-blur-md transition-all active:scale-95 shadow-lg"
                title="Minimize to Picture in Picture Mini-Player"
              >
                <PictureInPicture2 className="w-4 h-4 text-blue-400" />
                <span className="hidden sm:inline">Picture in Picture</span>
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 w-full bg-black flex items-center justify-center relative">
          <ErrorBoundary fallbackTitle="Stream failed to initialize">
            <VideoPlayer channel={channel} />
          </ErrorBoundary>

          <EsportsOverlay
            channel={channel}
            isOpen={isEsportsOpen}
            onClose={() => setIsEsportsOpen(false)}
          />
        </div>

        <div className="p-4 md:p-8 bg-[#0a0f1c] border-t border-white/10 shrink-0">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 max-w-7xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-slate-900 border border-white/10 p-2 shrink-0 flex items-center justify-center overflow-hidden">
                {channel.logo && channel.logo.trim() ? (
                  <img 
                    src={channel.logo} 
                    alt={channel.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                      if ((e.target as HTMLElement).nextElementSibling) {
                        ((e.target as HTMLElement).nextElementSibling as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div className={`w-full h-full bg-blue-600/20 text-blue-400 rounded flex items-center justify-center ${channel.logo && channel.logo.trim() ? 'hidden' : ''}`}>
                  <Tv className="w-8 h-8" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-white">{channel.name}</h1>
                  {channel.isGold && <GoldChannelTag label="OMEGATECH GOLD" />}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-slate-400">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live
                  </span>
                  <span className="capitalize">{channel.category}</span>
                  {channel.country && (
                    <span className="text-blue-300 font-bold uppercase tracking-wider">{channel.country}</span>
                  )}
                  {channel.language && (
                    <span className="text-slate-300 capitalize">{channel.language}</span>
                  )}
                  {channel.nowPlaying && (
                    <>
                      <span>•</span>
                      <span className="text-slate-300 truncate max-w-[200px]">{channel.nowPlaying}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {onToggleFavorite && (
                <button
                  onClick={() => onToggleFavorite(channel.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all active:scale-95 shadow-md ${
                    channel.isFavorite
                      ? 'bg-amber-500 text-slate-950 font-bold border border-amber-300'
                      : 'bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-500/30'
                  }`}
                  title={channel.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                >
                  <Star className={`w-4 h-4 ${channel.isFavorite ? 'fill-current text-slate-950' : 'text-amber-400'}`} />
                  <span>{channel.isFavorite ? 'Favorited' : 'Favorite'}</span>
                </button>
              )}

              {onToggleSubscription && (
                <button
                  onClick={() => onToggleSubscription(channel.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all active:scale-95 shadow-md ${
                    channel.isSubscribed
                      ? 'bg-blue-600 text-white font-bold border border-blue-400'
                      : 'bg-white/5 hover:bg-white/10 text-blue-300 border border-blue-500/30'
                  }`}
                  title={channel.isSubscribed ? 'Subscribed to channel updates' : 'Subscribe to get program notifications'}
                >
                  {channel.isSubscribed ? (
                    <>
                      <BellRing className="w-4 h-4 text-emerald-300" />
                      <span>Subscribed</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4 text-blue-400" />
                      <span>Subscribe</span>
                    </>
                  )}
                </button>
              )}

              <button 
                onClick={handleShare}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all active:scale-95 shadow-md ${
                  shareCopied 
                    ? 'bg-emerald-600/90 text-white border border-emerald-400' 
                    : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 hover:text-white'
                }`}
                title="Share or copy live channel link"
              >
                {shareCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Link Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-blue-400" />
                    <span>Share Channel</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full md:w-80 lg:w-96 bg-[#0a0f1c] border-l border-white/10 flex flex-col h-[40vh] md:h-full shrink-0">
        <div className="flex border-b border-white/10">
          <button 
            onClick={() => setActiveTab('similar')}
            className={`flex-1 py-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'similar' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            Similar
          </button>
          <button 
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'guide' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            Guide
          </button>
          <button 
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'details' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            Details
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'similar' && (
              <motion.div 
                key="similar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 space-y-3"
              >
                {relatedChannels.filter(c => c.id !== channel.id).slice(0, 15).map(c => (
                  <button
                    key={c.id}
                    onClick={() => onSelectChannel(c)}
                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors text-left group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-slate-900 border border-white/10 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                      {c.logo && c.logo.trim() ? (
                        <img 
                          src={c.logo} 
                          alt={c.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                            if ((e.target as HTMLElement).nextElementSibling) {
                              ((e.target as HTMLElement).nextElementSibling as HTMLElement).style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full bg-blue-600/20 text-blue-400 rounded flex items-center justify-center ${c.logo && c.logo.trim() ? 'hidden' : ''}`}>
                        <Tv className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white truncate">{c.name}</h4>
                      {c.nowPlaying && (
                        <p className="text-xs text-blue-400 truncate mt-0.5">{c.nowPlaying}</p>
                      )}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
            
            {activeTab === 'guide' && (
              <motion.div 
                key="guide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col h-full"
              >
                <div className="p-4 border-b border-white/10 bg-white/5">
                  <h3 className="text-sm font-semibold text-white mb-1">Today's Schedule</h3>
                  <p className="text-xs text-slate-400">Times shown in your local timezone</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {[...Array(6)].map((_, i) => {
                    const now = new Date();
                    const startTime = new Date(now.getTime() - (now.getMinutes() % 30) * 60000 + i * 30 * 60000 - 30 * 60000);
                    const endTime = new Date(startTime.getTime() + 30 * 60000);
                    const isLive = now >= startTime && now < endTime;
                    
                    const shows = [
                      "Morning News", "Live Sports Coverage", "Action Movie Marathon",
                      "Documentary Special", "Music Videos", "Late Night Show",
                      "Comedy Special", "Drama Series", "Reality TV Show"
                    ];
                    
                    const showName = shows[(channel.name.length + i) % shows.length];
                    
                    const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div key={i} className={`flex gap-4 p-3 rounded-xl border ${isLive ? 'bg-blue-500/10 border-blue-500/30' : 'bg-transparent border-white/5'}`}>
                        <div className="shrink-0 flex flex-col items-end w-16">
                          <span className={`text-sm font-medium ${isLive ? 'text-blue-400' : 'text-slate-300'}`}>
                            {formatTime(startTime)}
                          </span>
                        </div>
                        <div>
                          <h4 className={`text-sm font-medium mb-1 ${isLive ? 'text-white' : 'text-slate-200'}`}>
                            {showName}
                          </h4>
                          <p className="text-xs text-slate-400">
                            {formatTime(startTime)} - {formatTime(endTime)}
                          </p>
                          {isLive && (
                            <span className="inline-block mt-2 text-[10px] uppercase tracking-wider font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded">
                              Live Now
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === 'details' && (
              <motion.div 
                key="details"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6"
              >
                <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-white/10 p-3 mx-auto mb-6 flex items-center justify-center overflow-hidden">
                  {channel.logo && channel.logo.trim() ? (
                    <img 
                      src={channel.logo} 
                      alt={channel.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                        if ((e.target as HTMLElement).nextElementSibling) {
                          ((e.target as HTMLElement).nextElementSibling as HTMLElement).style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center ${channel.logo && channel.logo.trim() ? 'hidden' : ''}`}>
                    <Tv className="w-12 h-12" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white text-center mb-6">{channel.name}</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-slate-400 text-sm">Category</span>
                    <span className="text-white font-medium capitalize">{channel.category}</span>
                  </div>
                  {channel.country && (
                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                      <span className="text-slate-400 text-sm">Country</span>
                      <span className="text-blue-400 font-medium uppercase tracking-wider">{channel.country}</span>
                    </div>
                  )}
                  {channel.language && (
                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                      <span className="text-slate-400 text-sm">Language</span>
                      <span className="text-white font-medium capitalize">{channel.language}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-slate-400 text-sm">Status</span>
                    <span className="text-emerald-400 font-medium">Live Stream</span>
                  </div>
                  {channel.nowPlaying && (
                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                      <span className="text-slate-400 text-sm">Quality</span>
                      <span className="text-white font-medium">{channel.nowPlaying.replace('Quality: ', '')}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-slate-400 text-sm">Stream ID</span>
                    <span className="text-white font-medium text-xs font-mono">{channel.id}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
