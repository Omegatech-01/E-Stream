import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, Flame, Trophy, TrendingUp, Users, MessageSquare, ThumbsUp, X, Sparkles, Activity, Shield, Zap } from 'lucide-react';
import { Channel } from '../types';

interface EsportsOverlayProps {
  channel: Channel;
  isOpen: boolean;
  onClose: () => void;
}

interface EsportsMatch {
  game: string;
  tournament: string;
  teamA: { name: string; tag: string; score: number; logo: string; color: string };
  teamB: { name: string; tag: string; score: number; logo: string; color: string };
  mvp: { name: string; kda: string; hsPct: string; adr: string; hero: string };
  sentimentHype: number; 
  status: string;
  map: string;
}

const PRESET_MATCHES: Record<string, EsportsMatch> = {
  cs2: {
    game: 'CS2 Major Championship',
    tournament: 'IEM Katowice - Grand Final',
    teamA: { name: 'G2 Esports', tag: 'G2', score: 14, logo: '⚡', color: 'from-amber-500 to-orange-600' },
    teamB: { name: 'Natus Vincere', tag: 'NAVI', score: 12, logo: '🟡', color: 'from-[#facc15] to-[#ca8a04]' },
    mvp: { name: 'm0NESY', kda: '28/11/6', hsPct: '72%', adr: '118.5', hero: 'AWP' },
    sentimentHype: 81,
    status: 'MAP 3 • LIVE (ROUND 27)',
    map: 'de_mirage',
  },
  valorant: {
    game: 'VALORANT Champions Tour',
    tournament: 'Masters Tokyo - Upper Final',
    teamA: { name: 'Fnatic', tag: 'FNC', score: 2, logo: '🟠', color: 'from-orange-500 to-red-600' },
    teamB: { name: 'Paper Rex', tag: 'PRX', score: 1, logo: '🟣', color: 'from-purple-500 to-indigo-600' },
    mvp: { name: 'Derke', kda: '22/9/4', hsPct: '61%', adr: '165.2', hero: 'Jett' },
    sentimentHype: 88,
    status: 'MAP 3 • LIVE (11-9)',
    map: 'Lotus',
  },
  lol: {
    game: 'League of Legends Worlds',
    tournament: 'World Championship - Final',
    teamA: { name: 'T1', tag: 'T1', score: 2, logo: '🔴', color: 'from-red-600 to-rose-700' },
    teamB: { name: 'Gen.G Esports', tag: 'GEN', score: 2, logo: '🟡', color: 'from-yellow-500 to-amber-600' },
    mvp: { name: 'Faker', kda: '8/1/12', hsPct: '100%', adr: '782 DPM', hero: 'Azir' },
    sentimentHype: 94,
    status: 'GAME 5 • LIVE (28:14)',
    map: 'Summoner\'s Rift',
  }
};

export default function EsportsOverlay({ channel, isOpen, onClose }: EsportsOverlayProps) {
  const [selectedGameKey, setSelectedGameKey] = useState<string>('cs2');
  const [matchState, setMatchState] = useState<EsportsMatch>(PRESET_MATCHES.cs2);
  const [userVote, setUserVote] = useState<'A' | 'B' | null>(null);
  const [hypePct, setHypePct] = useState(81);
  const [socialFeed, setSocialFeed] = useState<Array<{ id: number; author: string; handle: string; text: string; tag: string; time: string }>>([
    { id: 1, author: 'Esports Pulse', handle: '@EsportsPulse', text: 'INSANE 1v3 AWP clutch on A site! What a round!', tag: '🔥 HIGHLIGHT', time: '1m ago' },
    { id: 2, author: 'G2 Fan Club', handle: '@G2Army', text: 'WE CANNOT LOSE THIS ROUND! LET\'S GOOO!', tag: '⚡ HYPE', time: '2m ago' },
    { id: 3, author: 'Tactical Analyst', handle: '@TacticalCS', text: 'Full economy reset for Navi here. Utility usage will be crucial.', tag: '📊 ANALYSIS', time: '4m ago' },
  ]);

  useEffect(() => {
    const preset = PRESET_MATCHES[selectedGameKey] || PRESET_MATCHES.cs2;
    setMatchState(preset);
    setHypePct(preset.sentimentHype);
  }, [selectedGameKey]);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      
      setHypePct(prev => {
        const delta = (Math.random() - 0.48) * 3;
        return Math.min(98, Math.max(50, Math.round(prev + delta)));
      });

      const newPosts = [
        { text: 'ACE! Unbelievable spray transfer!', tag: '🔥 ACE', handle: '@EsportsDaily' },
        { text: 'Crowd going wild in the arena right now!', tag: '🏟️ ARENA', handle: '@KatowiceLive' },
        { text: 'What a tactical timeout read!', tag: '🧠 BRAIN', handle: '@CasterGuild' },
      ];
      const randomPost = newPosts[Math.floor(Math.random() * newPosts.length)];
      setSocialFeed(prev => [
        { id: Date.now(), author: 'Community Feed', handle: randomPost.handle, text: randomPost.text, tag: randomPost.tag, time: 'Just now' },
        ...prev.slice(0, 4)
      ]);
    }, 6000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleVote = (team: 'A' | 'B') => {
    setUserVote(team);
    setHypePct(prev => team === 'A' ? Math.min(99, prev + 4) : Math.max(40, prev - 4));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="absolute top-16 right-4 sm:right-6 z-40 w-80 sm:w-96 bg-[#090d18]/95 backdrop-blur-2xl border border-blue-500/30 rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.85)] text-slate-200 overflow-hidden flex flex-col max-h-[80vh]"
        >
          {}
          <div className="p-4 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <Gamepad2 className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  E-Sports Live HUD
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                </h3>
                <p className="text-[11px] text-blue-300/80 font-medium">{channel.name}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {}
          <div className="flex border-b border-white/10 bg-[#060a14] px-2 py-1.5 gap-1 shrink-0 overflow-x-auto hide-scrollbar">
            {Object.keys(PRESET_MATCHES).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedGameKey(key)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  selectedGameKey === key
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          {}
          <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
            {}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2 flex items-center justify-between">
                <span>{matchState.tournament}</span>
                <span className="text-red-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  {matchState.status}
                </span>
              </div>

              {}
              <div className="flex items-center justify-between py-2 border-y border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{matchState.teamA.logo}</span>
                  <div>
                    <div className="text-sm font-black text-white">{matchState.teamA.tag}</div>
                    <div className="text-[10px] text-slate-400">{matchState.teamA.name}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 font-mono text-xl font-extrabold">
                  <span className="text-blue-400">{matchState.teamA.score}</span>
                  <span className="text-slate-600 text-sm">:</span>
                  <span className="text-amber-400">{matchState.teamB.score}</span>
                </div>

                <div className="flex items-center gap-2 text-right">
                  <div>
                    <div className="text-sm font-black text-white">{matchState.teamB.tag}</div>
                    <div className="text-[10px] text-slate-400">{matchState.teamB.name}</div>
                  </div>
                  <span className="text-2xl">{matchState.teamB.logo}</span>
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>Current Map: <strong className="text-slate-200">{matchState.map}</strong></span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> MVP: {matchState.mvp.name}
                </span>
              </div>
            </div>

            {}
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-950/40 to-slate-900/60 border border-blue-500/20">
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-400" /> Match MVP Stats
                </span>
                <span className="text-slate-400">{matchState.mvp.hero}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-black/30 p-1.5 rounded-lg border border-white/5">
                  <div className="text-[10px] text-slate-500">K/D/A</div>
                  <div className="text-xs font-mono font-bold text-emerald-400">{matchState.mvp.kda}</div>
                </div>
                <div className="bg-black/30 p-1.5 rounded-lg border border-white/5">
                  <div className="text-[10px] text-slate-500">HS %</div>
                  <div className="text-xs font-mono font-bold text-blue-400">{matchState.mvp.hsPct}</div>
                </div>
                <div className="bg-black/30 p-1.5 rounded-lg border border-white/5">
                  <div className="text-[10px] text-slate-500">ADR</div>
                  <div className="text-xs font-mono font-bold text-amber-400">{matchState.mvp.adr}</div>
                </div>
              </div>
            </div>

            {}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500" /> Social Hype Sentiment
                </span>
                <span className="text-orange-400 font-mono">{hypePct}% HYPE</span>
              </div>

              {}
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-orange-500 rounded-full"
                  animate={{ width: `${hypePct}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {}
              <div className="pt-1">
                <div className="text-[10px] text-slate-400 font-semibold mb-1.5 text-center">Predict Winner & Boost Hype</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleVote('A')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all border ${
                      userVote === 'A'
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/40'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                    }`}
                  >
                    {matchState.teamA.tag} Win
                  </button>
                  <button
                    onClick={() => handleVote('B')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all border ${
                      userVote === 'B'
                        ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-500/40'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                    }`}
                  >
                    {matchState.teamB.tag} Win
                  </button>
                </div>
              </div>
            </div>

            {}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> Live Social Reactions
              </div>
              <div className="space-y-1.5">
                {socialFeed.map(item => (
                  <div key={item.id} className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-blue-300 text-[11px]">{item.handle}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">{item.tag}</span>
                    </div>
                    <p className="text-slate-300 leading-snug">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
