import React, { useState } from 'react';
import { Channel } from '../types';
import { Tv, Play, Radio, Trophy, Film, Music, Baby, Sparkles, Activity } from 'lucide-react';
import { GoldCrownSvg, GoldChannelTag } from './GoldBadge';

interface LivePreviewCardProps {
  channel: Channel;
  className?: string;
  showHoverPlay?: boolean;
}

export const LivePreviewCard = React.memo<LivePreviewCardProps>(function LivePreviewCard({ channel, className = '', showHoverPlay = true }) {
  const [imgFailed, setImgFailed] = useState(!channel.logo || channel.logo.trim().length === 0);

  const getCategoryTheme = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'sports':
        return {
          bg: 'from-emerald-950 via-[#0a1f14] to-slate-950',
          accent: 'from-emerald-500 to-teal-400',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: <Trophy className="w-5 h-5 text-emerald-400" />,
        };
      case 'movies':
      case 'series':
      case 'entertainment':
        return {
          bg: 'from-purple-950 via-[#190a29] to-slate-950',
          accent: 'from-purple-500 to-pink-500',
          border: 'border-purple-500/30',
          text: 'text-purple-400',
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          icon: <Film className="w-5 h-5 text-purple-400" />,
        };
      case 'news':
      case 'radio':
        return {
          bg: 'from-red-950 via-[#260a0a] to-slate-950',
          accent: 'from-red-500 to-amber-500',
          border: 'border-red-500/30',
          text: 'text-red-400',
          badge: 'bg-red-500/20 text-red-300 border-red-500/40',
          icon: <Radio className="w-5 h-5 text-red-400" />,
        };
      case 'music':
        return {
          bg: 'from-pink-950 via-[#260a1c] to-slate-950',
          accent: 'from-pink-500 to-rose-400',
          border: 'border-pink-500/30',
          text: 'text-pink-400',
          badge: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
          icon: <Music className="w-5 h-5 text-pink-400" />,
        };
      case 'kids':
      case 'animation':
        return {
          bg: 'from-amber-950 via-[#241705] to-slate-950',
          accent: 'from-amber-500 to-yellow-400',
          border: 'border-amber-500/30',
          text: 'text-amber-400',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: <Baby className="w-5 h-5 text-amber-400" />,
        };
      default:
        return {
          bg: 'from-blue-950 via-[#0a1226] to-slate-950',
          accent: 'from-blue-500 to-cyan-400',
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          icon: <Tv className="w-5 h-5 text-blue-400" />,
        };
    }
  };

  const theme = getCategoryTheme(channel.category);

  const initials = channel.name
    .replace(/^\[?[a-z]{2,3}\]?/i, '')
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .slice(0, 3)
    .map(w => w[0])
    .join('')
    .toUpperCase() || 'E-STREAM';

  return (
    <div className={`w-full h-full relative overflow-hidden rounded-xl bg-gradient-to-br ${theme.bg} border ${theme.border} flex flex-col items-center justify-center p-3 text-center ${className}`}>
      {}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-black/60 pointer-events-none" />
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" />

      {}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10 pointer-events-none gap-1">
        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border backdrop-blur-md ${theme.badge}`}>
          {channel.category}
        </span>
        <div className="flex items-center gap-1">
          {channel.isGold && <GoldChannelTag compact />}
          <span className="flex items-center gap-1 text-[9px] font-bold text-red-400 bg-red-950/80 border border-red-500/40 px-2 py-0.5 rounded-full backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            LIVE HD
          </span>
        </div>
      </div>

      {}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pt-4">
        {!imgFailed && channel.logo && channel.logo.trim().length > 0 ? (
          <div className="w-full h-2/3 flex items-center justify-center p-1">
            <img
              src={channel.logo}
              alt={channel.name}
              referrerPolicy="no-referrer"
              className="max-w-full max-h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] transition-transform duration-300 group-hover:scale-105"
              onError={() => setImgFailed(true)}
            />
          </div>
        ) : (
          
          <div className="flex flex-col items-center justify-center my-auto space-y-2">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${theme.accent} p-0.5 shadow-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
              <div className="w-full h-full bg-[#080d1a] rounded-[14px] flex items-center justify-center">
                {theme.icon}
              </div>
            </div>

            <div className="space-y-0.5 max-w-full px-2">
              <span className="text-xs font-black tracking-widest text-white uppercase block truncate">
                {initials}
              </span>
              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                <Activity className="w-3 h-3 text-blue-400 animate-pulse" />
                <span>1080p • 60fps</span>
              </div>
            </div>
          </div>
        )}

        {}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-end gap-0.5 h-3">
            <span className="w-0.5 bg-blue-400 rounded-full animate-bounce h-2" style={{ animationDelay: '0ms' }} />
            <span className="w-0.5 bg-blue-400 rounded-full animate-bounce h-3" style={{ animationDelay: '150ms' }} />
            <span className="w-0.5 bg-blue-400 rounded-full animate-bounce h-1.5" style={{ animationDelay: '300ms' }} />
            <span className="w-0.5 bg-blue-400 rounded-full animate-bounce h-2.5" style={{ animationDelay: '450ms' }} />
          </div>
          <span className="text-[9px] font-mono text-slate-400/80">E-STREAM TV</span>
        </div>
      </div>
    </div>
  );
});

LivePreviewCard.displayName = 'LivePreviewCard';
