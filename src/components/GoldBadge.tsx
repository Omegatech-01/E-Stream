import React from 'react';

export function GoldCrownSvg({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldCrownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2A8" />
          <stop offset="30%" stopColor="#F59E0B" />
          <stop offset="70%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
        <linearGradient id="goldShine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
        </linearGradient>
      </defs>
      {}
      <path 
        d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5Z" 
        fill="url(#goldCrownGrad)" 
        stroke="#FEF3C7" 
        strokeWidth="0.75" 
        strokeLinejoin="round"
      />
      {}
      <path d="M4.5 17.5H19.5V19.5H4.5V17.5Z" fill="url(#goldCrownGrad)" stroke="#FEF3C7" strokeWidth="0.5" />
      {}
      <path d="M5 16L3 5L8.5 10L12 4L11 16H5Z" fill="url(#goldShine)" opacity="0.3" />
      {}
      <circle cx="3" cy="4" r="1.25" fill="#FFF" stroke="#F59E0B" strokeWidth="0.5" />
      <circle cx="12" cy="3" r="1.5" fill="#FFF" stroke="#F59E0B" strokeWidth="0.5" />
      <circle cx="21" cy="4" r="1.25" fill="#FFF" stroke="#F59E0B" strokeWidth="0.5" />
    </svg>
  );
}

export function GoldStarSvg({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="80%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
      </defs>
      <path 
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
        fill="url(#goldStarGrad)" 
        stroke="#FFF8DC" 
        strokeWidth="0.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GoldChannelTag({ compact = false, label = "GOLD" }: { compact?: boolean; label?: string }) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/30 via-yellow-400/40 to-amber-600/30 border border-amber-400/70 shadow-[0_0_12px_rgba(245,158,11,0.4)] backdrop-blur-md ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
      <GoldCrownSvg className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span className="font-black tracking-wider uppercase text-amber-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
        {label}
      </span>
    </div>
  );
}
