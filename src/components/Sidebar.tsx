import React from 'react';
import { Category } from '../types';
import { cn } from '../lib/utils';
import { Tv, Film, Trophy, Radio, Baby, Music, LayoutGrid, Bell, Settings, User, Car, Briefcase, Smile, BookOpen, Heart, CloudSun, Compass, Clapperboard, Globe, Sparkles, Download, Star, BellRing } from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  categories: Category[];
  countries: any[];
  languages: any[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
  onOpenNotifications: () => void;
  onOpenInstall?: () => void;
}

const getIconForCategory = (id: string) => {
  if (id.startsWith('country-')) return <Globe className="w-5 h-5 text-emerald-400" />;
  if (id.startsWith('lang-')) return <Compass className="w-5 h-5 text-amber-400" />;
  
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

export default function Sidebar({ categories, countries, languages, activeCategory, onSelectCategory, onOpenNotifications, onOpenInstall }: SidebarProps) {
  const mainCategories = categories.filter(c => !c.id.startsWith('country-') && !c.id.startsWith('lang-'));

  return (
    <aside className="w-64 h-screen bg-[#0a0f1c] border-r border-white/5 flex flex-col pt-6 pb-4 hidden md:flex shrink-0">
      <div className="px-8 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Tv className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">E-Stream</h1>
      </div>

      {onOpenInstall && (
        <div className="px-4 mb-4">
          <button
            onClick={onOpenInstall}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-3 rounded-2xl flex items-center justify-between shadow-lg shadow-blue-600/20 transition-all active:scale-95 group text-left"
          >
            <div>
              <div className="text-xs font-bold flex items-center gap-1">
                <span>Install App</span>
                <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
              </div>
              <div className="text-[10px] text-blue-200">For iPhone, PC & Android</div>
            </div>
            <div className="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Download className="w-4 h-4 text-white" />
            </div>
          </button>
        </div>
      )}

      <div className="flex-1 px-4 overflow-y-auto space-y-6 pb-6 custom-scrollbar">
        <div className="space-y-1">
          <div className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">
            Main Categories
          </div>
          {mainCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={cn(
                  "w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-300 group relative",
                  isActive 
                    ? "bg-blue-600/10 text-blue-500 font-medium" 
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-r-full"
                  />
                )}
                <span className={cn("transition-colors", isActive ? "text-blue-500" : "text-slate-500 group-hover:text-slate-300")}>
                  {getIconForCategory(cat.id)}
                </span>
                <span className="flex-1 text-left truncate text-sm">{cat.name}</span>
                {cat.count !== undefined && cat.count > 0 && (
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[24px] text-center",
                    isActive ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-slate-500"
                  )}>
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {countries.length > 0 && (
          <div className="space-y-1">
            <div className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 flex items-center justify-between">
              <span>Countries</span>
              <Globe className="w-3 h-3 opacity-50" />
            </div>
            <div className="grid grid-cols-1 gap-1">
              {countries.slice(0, 15).map((country) => {
                const isActive = activeCategory === country.id;
                return (
                  <button
                    key={country.id}
                    onClick={() => onSelectCategory(country.id)}
                    className={cn(
                      "w-full flex items-center gap-3.5 px-4 py-2 rounded-xl transition-all duration-200 group relative",
                      isActive 
                        ? "bg-emerald-500/10 text-emerald-400 font-medium" 
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    )}
                  >
                    <span className={cn("transition-colors", isActive ? "text-emerald-400" : "text-slate-600 group-hover:text-slate-400")}>
                      <Globe className="w-4 h-4" />
                    </span>
                    <span className="flex-1 text-left truncate text-xs font-medium">{country.name}</span>
                    <span className="text-[9px] font-bold text-slate-600 group-hover:text-slate-500">{country.count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {languages.length > 0 && (
          <div className="space-y-1">
            <div className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 flex items-center justify-between">
              <span>Languages</span>
              <Compass className="w-3 h-3 opacity-50" />
            </div>
            <div className="grid grid-cols-1 gap-1">
              {languages.slice(0, 10).map((lang) => {
                const isActive = activeCategory === lang.id;
                return (
                  <button
                    key={lang.id}
                    onClick={() => onSelectCategory(lang.id)}
                    className={cn(
                      "w-full flex items-center gap-3.5 px-4 py-2 rounded-xl transition-all duration-200 group relative",
                      isActive 
                        ? "bg-amber-500/10 text-amber-400 font-medium" 
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    )}
                  >
                    <span className={cn("transition-colors", isActive ? "text-amber-400" : "text-slate-600 group-hover:text-slate-400")}>
                      <Compass className="w-4 h-4" />
                    </span>
                    <span className="flex-1 text-left truncate text-xs font-medium">{lang.name}</span>
                    <span className="text-[9px] font-bold text-slate-600 group-hover:text-slate-500">{lang.count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="px-4 mt-auto pt-6 border-t border-white/5 space-y-2">
         <button onClick={onOpenNotifications} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all group">
            <Bell className="w-5 h-5 text-slate-500 group-hover:text-slate-300" />
            <span>Notifications</span>
         </button>
         <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all group">
            <Settings className="w-5 h-5 text-slate-500 group-hover:text-slate-300" />
            <span>Settings</span>
         </button>
         <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all group mt-4">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
               <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Guest User</span>
         </button>
      </div>
    </aside>
  );
}
