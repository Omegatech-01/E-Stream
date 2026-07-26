import React from 'react';

export const ChannelSkeleton = () => (
  <div className="relative aspect-video rounded-2xl bg-white/5 border border-white/10 overflow-hidden animate-pulse">
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
      <div className="h-4 w-2/3 bg-white/10 rounded-full" />
      <div className="h-3 w-1/2 bg-white/5 rounded-full" />
    </div>
  </div>
);

export const HeroSkeleton = () => (
  <div className="relative w-full aspect-[21/9] md:aspect-[3/1] rounded-3xl overflow-hidden bg-slate-950 animate-pulse border border-white/5">
    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-transparent to-transparent" />
    <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-12 space-y-6">
      <div className="h-4 w-32 bg-white/10 rounded-full" />
      <div className="h-12 w-1/2 bg-white/5 rounded-2xl" />
      <div className="h-6 w-1/3 bg-white/5 rounded-full" />
      <div className="h-12 w-40 bg-white/10 rounded-full" />
    </div>
  </div>
);
