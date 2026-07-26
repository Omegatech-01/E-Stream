import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Tv, Info, AlertTriangle, Play, Sparkles, CheckCheck, ShieldAlert } from 'lucide-react';
import { Channel } from '../types';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
}

interface NotificationItem {
  id: string;
  type: 'live' | 'featured' | 'system' | 'subscribed';
  title: string;
  message: string;
  time: string;
  isUnread: boolean;
  channel?: Channel;
}

export default function NotificationPanel({ isOpen, onClose, channels, onSelectChannel }: NotificationPanelProps) {
  const [filter, setFilter] = useState<'all' | 'subscribed' | 'live' | 'system'>('all');
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const notifications = useMemo<NotificationItem[]>(() => {
    if (!channels || channels.length === 0) {
      return [
        { id: 'sys-1', type: 'system', title: 'System Status', message: 'All live streaming proxies are operating normally.', time: 'Just now', isUnread: !readIds.has('sys-1') }
      ];
    }

    const items: NotificationItem[] = [];

    const subscribedChannels = channels.filter(c => c.isSubscribed);
    subscribedChannels.forEach(subChan => {
      items.push({
        id: `sub-${subChan.id}`,
        type: 'subscribed',
        title: `🔔 Subscribed Alert: ${subChan.name}`,
        message: `New program on air: ${subChan.nowPlaying || 'Live broadcast stream now playing'}`,
        time: 'Just now',
        isUnread: !readIds.has(`sub-${subChan.id}`),
        channel: subChan,
      });
    });

    const sportsChannels = channels.filter(c => c.category === 'sports' || c.name.toLowerCase().includes('sport'));
    if (sportsChannels.length > 0) {
      const topSports = sportsChannels[0];
      items.push({
        id: `sports-${topSports.id}`,
        type: 'live',
        title: '🔴 Sports Match Live',
        message: `${topSports.name} is broadcasting live: ${topSports.nowPlaying || 'Live tournament stream'}`,
        time: '2m ago',
        isUnread: !readIds.has(`sports-${topSports.id}`),
        channel: topSports,
      });
    }

    const gamingChannels = channels.filter(c => c.category === 'animation' || c.name.toLowerCase().match(/game|esport|ign|twitch|gaming|league|valorant/i));
    if (gamingChannels.length > 0) {
      const topGaming = gamingChannels[0];
      items.push({
        id: `gaming-${topGaming.id}`,
        type: 'live',
        title: '🎮 Esports Championship',
        message: `Live game coverage available on ${topGaming.name}`,
        time: '5m ago',
        isUnread: !readIds.has(`gaming-${topGaming.id}`),
        channel: topGaming,
      });
    }

    const featuredChannel = channels[Math.floor(channels.length / 2)] || channels[0];
    if (featuredChannel) {
      items.push({
        id: `feat-${featuredChannel.id}`,
        type: 'featured',
        title: '✨ E-Stream Pick',
        message: `High speed 1080p stream active for ${featuredChannel.name}`,
        time: '12m ago',
        isUnread: !readIds.has(`feat-${featuredChannel.id}`),
        channel: featuredChannel,
      });
    }

    items.push({
      id: 'sys-status',
      type: 'system',
      title: '⚡ E-Stream Proxy Engine',
      message: 'HLS adaptive bitrates and M3U8 CORS bypass active.',
      time: '1h ago',
      isUnread: !readIds.has('sys-status'),
    });

    return items;
  }, [channels, readIds]);

  const handleNotificationClick = (item: NotificationItem) => {
    setReadIds(prev => new Set(prev).add(item.id));
    if (item.channel) {
      onSelectChannel(item.channel);
      onClose();
    }
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadIds(new Set(allIds));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'subscribed') return n.type === 'subscribed';
    if (filter === 'live') return n.type === 'live' || n.type === 'featured';
    if (filter === 'system') return n.type === 'system';
    return true;
  });

  const unreadCount = notifications.filter(n => n.isUnread).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-[#0a0f1c] border-l border-white/10 z-50 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#060a14]">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Bell className="w-5 h-5 text-blue-400" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#060a14]"></span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-none">Notifications</h3>
                  <p className="text-xs text-slate-400 mt-1">{unreadCount} unread live alerts</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex px-4 py-2 border-b border-white/5 bg-[#080d1a] gap-1.5 overflow-x-auto hide-scrollbar">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  filter === 'all' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('subscribed')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  filter === 'subscribed' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Subscribed ({notifications.filter(n => n.type === 'subscribed').length})
              </button>
              <button
                onClick={() => setFilter('live')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  filter === 'live' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Live Events
              </button>
              <button
                onClick={() => setFilter('system')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  filter === 'system' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                System
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
              {filteredNotifications.map(notif => (
                <div 
                  key={notif.id} 
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer group flex gap-3.5 items-start ${
                    notif.isUnread
                      ? 'bg-blue-950/20 border-blue-500/30 hover:bg-blue-900/30 shadow-md'
                      : 'bg-white/5 border-white/5 hover:bg-white/10 opacity-80'
                  }`}
                >
                  <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                    notif.type === 'subscribed' ? 'bg-blue-600/30 border border-blue-400/50 text-blue-300' :
                    notif.type === 'live' ? 'bg-red-500/20 border border-red-500/40 text-red-400' :
                    notif.type === 'featured' ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400' :
                    'bg-slate-700/30 border border-slate-600/40 text-slate-300'
                  }`}>
                    {notif.type === 'subscribed' && <Bell className="w-4 h-4 text-blue-300 fill-current" />}
                    {notif.type === 'live' && <Tv className="w-4 h-4" />}
                    {notif.type === 'featured' && <Sparkles className="w-4 h-4" />}
                    {notif.type === 'system' && <ShieldAlert className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-500 shrink-0">{notif.time}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-snug line-clamp-2">
                      {notif.message}
                    </p>
                    {notif.channel && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                        <Play className="w-2.5 h-2.5 fill-current" /> Watch Live
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {filteredNotifications.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No notifications in this filter.
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-white/10 bg-[#060a14]">
              <button 
                onClick={markAllAsRead}
                className="w-full py-2.5 text-xs font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all as read
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
