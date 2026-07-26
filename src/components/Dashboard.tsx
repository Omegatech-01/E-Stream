import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Channel } from '../types';
import { Search, Play } from 'lucide-react';
import { VirtualChannelGrid } from './VirtualChannelGrid';
import VideoPlayer from './VideoPlayer';

import { ChannelSkeleton, HeroSkeleton } from './Skeleton';

interface DashboardProps {
  channels: Channel[];
  activeChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
  onToggleFavorite?: (channelId: string) => void;
  onToggleSubscription?: (channelId: string) => void;
  categoryName: string;
  isLoading?: boolean;
}

export default function Dashboard({ channels, activeChannel, onSelectChannel, onToggleFavorite, onToggleSubscription, categoryName, isLoading = false }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevCategoryRef = useRef(categoryName);
  
  const featuredChannel = activeChannel || (channels.length > 0 ? channels[0] : null);

  const handleChannelSelect = (channel: Channel) => {
    onSelectChannel(channel);
  };

  useEffect(() => {
    if (prevCategoryRef.current !== categoryName) {
      prevCategoryRef.current = categoryName;
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    }
  }, [categoryName]);

  const filteredChannels = useMemo(() => {
    if (!searchQuery.trim()) return channels;
    const query = searchQuery.toLowerCase().trim();
    return channels.filter(c => 
      c.name.toLowerCase().includes(query) || 
      (c.nowPlaying && c.nowPlaying.toLowerCase().includes(query))
    );
  }, [channels, searchQuery]);

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#050811] relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none"></div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 pb-24 relative z-10 scroll-smooth">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
             <h2 className="text-3xl font-bold text-white tracking-tight">{categoryName}</h2>
             <p className="text-slate-400 mt-1">{filteredChannels.length} Live Channels Available</p>
           </div>
           
           <div className="relative max-w-md w-full">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
               <Search className="h-5 w-5 text-slate-500" />
             </div>
             <input
               type="text"
               placeholder="Search channels, shows, movies..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all backdrop-blur-sm"
             />
           </div>
        </header>

        {isLoading ? (
          <section className="w-full mx-auto mb-10">
            <HeroSkeleton />
          </section>
        ) : featuredChannel && !searchQuery && (
          <section className="w-full mx-auto mb-10">
            <div className="relative w-full aspect-[21/9] md:aspect-[3/1] rounded-3xl overflow-hidden shadow-2xl group cursor-pointer bg-slate-950" onClick={() => handleChannelSelect(featuredChannel)}>
              <div className="absolute right-0 top-0 bottom-0 w-full md:w-3/4 overflow-hidden pointer-events-none z-0">
                <VideoPlayer channel={featuredChannel} isHeroPreview={true} />
              </div>

              <div className="absolute inset-0 bg-gradient-to-r from-[#050811] via-[#050811]/85 to-transparent z-10 pointer-events-none"></div>

              {featuredChannel.logo && featuredChannel.logo.trim() ? (
                <img 
                  src={featuredChannel.logo} 
                  alt={featuredChannel.name} 
                  referrerPolicy="no-referrer"
                  className="absolute right-0 top-0 h-full w-2/3 object-cover opacity-20 mix-blend-screen group-hover:scale-105 transition-transform duration-700 blur-sm pointer-events-none z-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : null}
              
              <div className="absolute inset-0 z-20 flex flex-col justify-center p-6 md:p-12">
                <div className="flex items-center gap-3 text-sm text-blue-400 font-medium mb-4">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20">
                    <Play className="w-3 h-3 text-blue-400 fill-current ml-0.5" />
                  </span>
                  Featured Stream
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">
                  {featuredChannel.name}
                </h1>
                
                {featuredChannel.nowPlaying && (
                  <p className="text-lg md:text-xl text-slate-300 max-w-xl mb-8 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    Live Now: {featuredChannel.nowPlaying}
                  </p>
                )}
                
                <button 
                  className="w-fit flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-slate-200 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Watch Live
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="pt-4 pb-12">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-500 rounded-full inline-block"></span>
            {isLoading ? 'Scanning Frequencies...' : `Channels (${filteredChannels.length})`}
          </h3>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => <ChannelSkeleton key={i} />)}
            </div>
          ) : (
            <VirtualChannelGrid
              channels={filteredChannels}
              activeChannel={activeChannel}
              onSelectChannel={handleChannelSelect}
              onToggleFavorite={onToggleFavorite}
              onToggleSubscription={onToggleSubscription}
              scrollElementRef={scrollRef}
            />
          )}
          
          {!isLoading && filteredChannels.length === 0 && (
            <div className="text-center py-20 px-4">
               <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                 <Search className="w-8 h-8 text-slate-500" />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">
                 {categoryName === 'Favorites' 
                   ? 'No Favorite Channels Yet' 
                   : categoryName === 'Subscriptions' 
                     ? 'No Channel Subscriptions' 
                     : 'No channels found'}
               </h3>
               <p className="text-slate-400 max-w-sm mx-auto text-sm leading-relaxed">
                 {categoryName === 'Favorites'
                   ? 'Click the star icon on any channel card or in the player to pin your top channels here for instant access.'
                   : categoryName === 'Subscriptions'
                     ? 'Subscribe to channels by clicking the bell icon on any channel card or watch page to receive program alerts.'
                     : "We couldn't find any channels matching your search. Try a different keyword."}
               </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

