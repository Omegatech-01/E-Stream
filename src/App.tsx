import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import WatchPage from './components/WatchPage';
import PipPlayer from './components/PipPlayer';
import DeviceFrame, { DeviceViewMode } from './components/DeviceFrame';
import InstallModal from './components/InstallModal';
import IntroSplashScreen from './components/IntroSplashScreen';
import { fetchChannels, getCachedChannels } from './api';
import { Channel, Category } from './types';
import NotificationPanel from './components/NotificationPanel';
import ErrorBoundary from './components/ErrorBoundary';
import NetworkStatus from './components/NetworkStatus';
import { subscribeToPush } from './lib/push';
import { Loader2, Tv, LayoutGrid, Film, Trophy, Radio, Music, Baby, Bell, Car, Briefcase, Smile, BookOpen, Heart, CloudSun, Compass, Clapperboard, Globe, Download, Star, BellRing } from 'lucide-react';
import { cn } from './lib/utils';
import { AnimatePresence } from 'motion/react';

const getIconForCategory = (id: string) => {
  switch (id.toLowerCase()) {
    case 'all': return <LayoutGrid className="w-5 h-5" />;
    case 'favorites': return <Star className="w-5 h-5 text-amber-400 fill-amber-400/30" />;
    case 'subscriptions': return <BellRing className="w-5 h-5 text-blue-400" />;
    case 'sports': return <Trophy className="w-5 h-5" />;
    case 'movies': return <Film className="w-5 h-5" />;
    case 'news': return <Radio className="w-5 h-5" />;
    case 'kids': case 'animation': return <Baby className="w-5 h-5" />;
    case 'music': return <Music className="w-5 h-5" />;
    case 'auto': return <Car className="w-5 h-5" />;
    case 'business': return <Briefcase className="w-5 h-5" />;
    case 'comedy': return <Smile className="w-5 h-5" />;
    case 'documentary': case 'education': case 'science': return <BookOpen className="w-5 h-5" />;
    case 'entertainment': case 'series': return <Clapperboard className="w-5 h-5" />;
    case 'lifestyle': case 'relax': return <Heart className="w-5 h-5" />;
    case 'weather': return <CloudSun className="w-5 h-5" />;
    case 'travel': case 'outdoor': return <Compass className="w-5 h-5" />;
    case 'culture': return <Globe className="w-5 h-5" />;
    default: return <Tv className="w-5 h-5" />;
  }
};

export default function App() {
  const cached = getCachedChannels();
  const [categories, setCategories] = useState<Category[]>(cached?.categories || []);
  const [channels, setChannels] = useState<Channel[]>(cached?.channels || []);
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('estream_favorites');
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [subscriptions, setSubscriptions] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('estream_subscriptions');
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [countries, setCountries] = useState<any[]>(cached?.countries || []);
  const [languages, setLanguages] = useState<any[]>(cached?.languages || []);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(cached?.channels?.[0]?.id || null);
  const [viewMode, setViewMode] = useState<'dashboard' | 'watch'>('dashboard');
  const [isPipActive, setIsPipActive] = useState(false);
  const [deviceMode, setDeviceMode] = useState<DeviceViewMode>('auto');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(!cached);
  const [showIntro, setShowIntro] = useState(true);

  const toggleFavorite = (channelId: string) => {
    setFavorites(prev => {
      const next = prev.includes(channelId)
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId];
      if (typeof window !== 'undefined') {
        localStorage.setItem('estream_favorites', JSON.stringify(next));
      }
      return next;
    });
  };

  const toggleSubscription = (channelId: string) => {
    setSubscriptions(prev => {
      const next = prev.includes(channelId)
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId];
      if (typeof window !== 'undefined') {
        localStorage.setItem('estream_subscriptions', JSON.stringify(next));
      }
      return next;
    });
  };

  useEffect(() => {
    async function loadData() {
      const data = await fetchChannels();
      setCategories(data.categories);
      setChannels(data.channels);
      setCountries(data.countries || []);
      setLanguages(data.languages || []);

      const params = new URLSearchParams(window.location.search);
      const targetChannelId = params.get('channel') || params.get('c');

      if (targetChannelId && data.channels.length > 0) {
        const found = data.channels.find(c => c.id === targetChannelId || c.name.toLowerCase() === targetChannelId.toLowerCase());
        if (found) {
          setActiveChannelId(found.id);
          if (viewMode !== 'watch') setViewMode('watch');
        }
      } else if (!activeChannelId && data.channels.length > 0) {
        setActiveChannelId(data.channels[0].id);
      }

      setIsLoading(false);
      
      setTimeout(subscribeToPush, 5000);
    }
    loadData();
  }, []);

  const handleSelectChannel = (channel: Channel) => {
    setActiveChannelId(channel.id);
    setViewMode('watch');
    setIsPipActive(false);
  };

  const handleTogglePip = () => {
    setIsPipActive(true);
    setViewMode('dashboard');
  };

  const handleBackFromWatch = () => {
    setIsPipActive(true);
    setViewMode('dashboard');
  };

  const enrichedChannels: Channel[] = channels.map(c => ({
    ...c,
    isFavorite: favorites.includes(c.id),
    isSubscribed: subscriptions.includes(c.id),
  }));

  const activeChannel = enrichedChannels.find(c => c.id === activeChannelId) || (enrichedChannels[0] || null);

  const fullCategories: Category[] = [
    { id: 'all', name: 'All Channels' },
    { id: 'favorites', name: 'Favorites', count: favorites.length },
    { id: 'subscriptions', name: 'Subscriptions', count: subscriptions.length },
    ...categories.filter(cat => cat.id !== 'all')
  ];

  const filteredChannels = activeCategory === 'all' 
    ? enrichedChannels
    : activeCategory === 'favorites'
      ? enrichedChannels.filter(c => c.isFavorite)
      : activeCategory === 'subscriptions'
        ? enrichedChannels.filter(c => c.isSubscribed)
        : activeCategory.startsWith('country-')
          ? enrichedChannels.filter(c => c.country && `country-${c.country.toLowerCase().replace(/[^a-z0-9]/g, '')}` === activeCategory)
          : activeCategory.startsWith('lang-')
            ? enrichedChannels.filter(c => c.language && `lang-${c.language.toLowerCase().replace(/[^a-z0-9]/g, '')}` === activeCategory)
            : enrichedChannels.filter(c => c.category === activeCategory);

  const activeCategoryName = fullCategories.find(c => c.id === activeCategory)?.name || 
                             countries.find(c => c.id === activeCategory)?.name || 
                             languages.find(c => c.id === activeCategory)?.name || 
                             'All Channels';

  return (
    <>
      <AnimatePresence>
        {showIntro && (
          <IntroSplashScreen onFinish={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      {isLoading && !showIntro ? (
        <DeviceFrame 
          deviceMode={deviceMode} 
          onDeviceChange={setDeviceMode} 
          onOpenInstall={() => setIsInstallModalOpen(true)}
        >
          <div className="flex flex-col md:flex-row h-full w-full overflow-hidden bg-[#050811] text-slate-200 font-sans">
            <Sidebar 
              categories={[]} 
              countries={[]}
              languages={[]}
              activeCategory="all" 
              onSelectCategory={() => {}}
              onOpenNotifications={() => {}}
              onOpenInstall={() => {}}
            />
            <Dashboard 
              categoryName="Initializing..."
              channels={[]} 
              activeChannel={null} 
              onSelectChannel={() => {}} 
              isLoading={true}
            />
          </div>
        </DeviceFrame>
      ) : (
        <DeviceFrame 
          deviceMode={deviceMode} 
          onDeviceChange={setDeviceMode} 
          onOpenInstall={() => setIsInstallModalOpen(true)}
        >
          <div className="flex flex-col md:flex-row h-full w-full overflow-hidden bg-[#050811] text-slate-200 font-sans selection:bg-blue-500/30">
            <Sidebar 
              categories={fullCategories} 
              countries={countries}
              languages={languages}
              activeCategory={activeCategory} 
              onSelectCategory={setActiveCategory}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
              onOpenInstall={() => setIsInstallModalOpen(true)}
            />
            <ErrorBoundary fallbackTitle="Application dashboard error">
              <Dashboard 
                categoryName={activeCategoryName}
                channels={filteredChannels} 
                activeChannel={activeChannel} 
                onSelectChannel={handleSelectChannel} 
                onToggleFavorite={toggleFavorite}
                onToggleSubscription={toggleSubscription}
                isLoading={isLoading}
              />
            </ErrorBoundary>
            
            <AnimatePresence>
              {viewMode === 'watch' && activeChannel && (
                <ErrorBoundary fallbackTitle="Watch page error">
                  <WatchPage 
                    channel={activeChannel} 
                    onBack={handleBackFromWatch} 
                    onTogglePip={handleTogglePip}
                    relatedChannels={filteredChannels}
                    onSelectChannel={handleSelectChannel}
                    onToggleFavorite={toggleFavorite}
                    onToggleSubscription={toggleSubscription}
                  />
                </ErrorBoundary>
              )}

              {viewMode === 'dashboard' && isPipActive && activeChannel && (
                <ErrorBoundary fallbackTitle="Picture in Picture error">
                  <PipPlayer
                    channel={activeChannel}
                    onExpand={() => {
                      setViewMode('watch');
                      setIsPipActive(false);
                    }}
                    onClose={() => setIsPipActive(false)}
                  />
                </ErrorBoundary>
              )}
            </AnimatePresence>
            
            {}
            {viewMode === 'dashboard' && (
              <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0f1c]/90 backdrop-blur-xl border-t border-white/5 z-40 px-4 py-3 pb-safe flex justify-between items-center overflow-x-auto gap-4 hide-scrollbar">
                {fullCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all relative",
                      activeCategory === cat.id ? "text-blue-500 scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    {getIconForCategory(cat.id)}
                    <span className="text-[10px] font-medium whitespace-nowrap">
                      {cat.name} {cat.count !== undefined && cat.count > 0 ? `(${cat.count})` : ''}
                    </span>
                  </button>
                ))}
                <button
                  onClick={() => setIsInstallModalOpen(true)}
                  className="flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all text-emerald-400 hover:text-emerald-300"
                >
                  <Download className="w-5 h-5" />
                  <span className="text-[10px] font-bold whitespace-nowrap">Install App</span>
                </button>
                <button
                  onClick={() => setIsNotificationsOpen(true)}
                  className="flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all text-slate-500 hover:text-slate-300 relative"
                >
                  <div className="relative">
                    <Bell className="w-5 h-5" />
                    {subscriptions.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border border-[#0a0f1c] animate-pulse"></span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium whitespace-nowrap">Alerts</span>
                </button>
              </div>
            )}

            <NotificationPanel 
              isOpen={isNotificationsOpen} 
              onClose={() => setIsNotificationsOpen(false)} 
              channels={enrichedChannels}
              onSelectChannel={handleSelectChannel}
            />

            <InstallModal 
              isOpen={isInstallModalOpen} 
              onClose={() => setIsInstallModalOpen(false)} 
            />

            <NetworkStatus />
          </div>
        </DeviceFrame>
      )}
    </>
  );
}
