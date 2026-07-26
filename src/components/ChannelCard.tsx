import React, { useState, useEffect } from 'react';
import { Channel } from '../types';
import { Play, Star, Bell, BellRing } from 'lucide-react';
import { LivePreviewCard } from './LivePreviewCard';
import { GoldCrownSvg, GoldChannelTag } from './GoldBadge';

interface ChannelCardProps {
  channel: Channel;
  isActive: boolean;
  onSelect: (channel: Channel) => void;
  onToggleFavorite?: (channelId: string) => void;
  onToggleSubscription?: (channelId: string) => void;
}

export const ChannelCard = React.memo(({ channel, isActive, onSelect, onToggleFavorite, onToggleSubscription }: ChannelCardProps) => {
  const [imgSrc, setImgSrc] = useState<string>(channel.logo || '');
  const [hasFailed, setHasFailed] = useState<boolean>(!channel.logo);

  useEffect(() => {
    if (channel.logo && channel.logo.trim().length > 0) {
      setImgSrc(channel.logo);
      setHasFailed(false);
    } else {
      setHasFailed(true);
    }
  }, [channel.logo]);

  const handleImageError = () => {
    setHasFailed(true);
  };

  return (
    <div className="relative group w-full">
      <div className="absolute top-2 left-2 z-40 flex items-center gap-1.5">
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(channel.id);
            }}
            className={`p-1.5 rounded-xl backdrop-blur-md transition-all shadow-md active:scale-90 ${
              channel.isFavorite
                ? 'bg-amber-500 text-slate-950 border border-amber-300'
                : 'bg-black/60 text-slate-300 hover:text-amber-300 hover:bg-black/80 border border-white/10'
            }`}
            title={channel.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          >
            <Star className={`w-3.5 h-3.5 ${channel.isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}

        {onToggleSubscription && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSubscription(channel.id);
            }}
            className={`p-1.5 rounded-xl backdrop-blur-md transition-all shadow-md active:scale-90 ${
              channel.isSubscribed
                ? 'bg-blue-600 text-white border border-blue-400'
                : 'bg-black/60 text-slate-300 hover:text-blue-400 hover:bg-black/80 border border-white/10'
            }`}
            title={channel.isSubscribed ? 'Subscribed (Click to unsubscribe)' : 'Subscribe to Channel Alerts'}
          >
            {channel.isSubscribed ? <BellRing className="w-3.5 h-3.5 text-blue-300" /> : <Bell className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {channel.isGold && !isActive && (
        <div className="absolute top-2 right-2 z-40 pointer-events-none">
          <GoldChannelTag compact />
        </div>
      )}

      <button
        onClick={() => onSelect(channel)}
        className={`relative rounded-2xl aspect-[3/4] w-full flex flex-col overflow-hidden text-left transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          isActive 
            ? 'ring-2 ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
            : 'border border-white/5 shadow-lg bg-[#0a0f1c]/80'
        }`}
      >
        <div className="absolute inset-0 bg-black/85 group-hover:opacity-100 opacity-0 transition-opacity duration-200 z-30 flex flex-col justify-between p-3.5 text-white pointer-events-none">
          <div className="flex flex-wrap items-center gap-1.5 pl-14">
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {channel.category}
            </span>
            {channel.country && (
              <span className="text-[10px] font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded-full border border-white/10 uppercase">
                {channel.country}
              </span>
            )}
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium ml-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live
            </span>
          </div>

          <div className="flex flex-col items-center justify-center my-auto text-center px-1">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200 mb-2 border border-blue-400/50">
              <Play className="w-4 h-4 text-white fill-current ml-0.5" />
            </div>
            {channel.nowPlaying ? (
              <p className="text-[11px] font-medium text-slate-200 line-clamp-3">
                {channel.nowPlaying}
              </p>
            ) : (
              <p className="text-[11px] text-slate-300">Click to watch live stream</p>
            )}
          </div>

          <div className="text-[10px] text-slate-400 border-t border-white/10 pt-1.5 text-center truncate font-medium">
            {channel.name}
          </div>
        </div>

        <div className="flex-1 bg-slate-950 flex items-center justify-center relative overflow-hidden">
          {!hasFailed && imgSrc && imgSrc.trim().length > 0 ? (
            <div className="w-full h-full p-3 flex items-center justify-center">
              <img 
                src={imgSrc} 
                alt={channel.name}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-full h-full object-contain filter group-hover:scale-105 transition-transform duration-300"
                onError={handleImageError}
              />
            </div>
          ) : (
            <LivePreviewCard channel={channel} />
          )}
        </div>
        
        <div className="relative z-20 p-3 bg-[#0a0f1c] h-20 flex flex-col justify-center border-t border-white/5">
          {channel.nowPlaying && (
            <p className="text-[11px] font-medium text-blue-400 mb-0.5 truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              {channel.nowPlaying}
            </p>
          )}
          <h4 className="text-xs font-semibold text-white truncate group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
            {channel.isGold && <GoldCrownSvg className="w-3.5 h-3.5 shrink-0" />}
            <span className="truncate">{channel.name}</span>
          </h4>
        </div>
        
        {isActive && (
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-red-600 px-2 py-0.5 rounded-full shadow-lg border border-red-400">
            <span className="text-[9px] font-bold text-white uppercase tracking-wider">Live</span>
          </div>
        )}
      </button>
    </div>
  );
});

ChannelCard.displayName = 'ChannelCard';

