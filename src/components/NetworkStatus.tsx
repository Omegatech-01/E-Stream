import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSlow, setIsSlow] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
      if (!navigator.onLine) {
        setShowStatus(true);
      }
    }

    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    const checkConnectionQuality = () => {
      if (typeof navigator !== 'undefined' && 'connection' in navigator) {
        const conn = (navigator as any).connection;
        if (conn && (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g')) {
          setIsSlow(true);
          setShowStatus(true);
        } else {
          setIsSlow(false);

        }
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn) {
        conn.addEventListener('change', checkConnectionQuality);
        checkConnectionQuality();
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (typeof navigator !== 'undefined' && 'connection' in navigator) {
        const conn = (navigator as any).connection;
        if (conn) {
          conn.removeEventListener('change', checkConnectionQuality);
        }
      }
    };
  }, []);

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-20 md:bottom-6 right-6 z-50 pointer-events-none"
        >
          {!isOnline ? (
            <div className="flex items-center gap-3 bg-[#0a0f1c]/90 border border-red-500/20 text-white px-4 py-2.5 rounded-2xl shadow-[0_8px_32px_rgba(239,68,68,0.2)] backdrop-blur-xl">
              <div className="p-1.5 bg-red-500/20 rounded-full">
                <WifiOff className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <div className="text-sm font-semibold tracking-tight text-red-100">You are offline</div>
                <div className="text-[10px] text-red-500/80 font-medium">Please check your connection</div>
              </div>
            </div>
          ) : isSlow ? (
            <div className="flex items-center gap-3 bg-[#0a0f1c]/90 border border-amber-500/20 text-white px-4 py-2.5 rounded-2xl shadow-[0_8px_32px_rgba(245,158,11,0.2)] backdrop-blur-xl">
              <div className="p-1.5 bg-amber-500/20 rounded-full">
                <Activity className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <div className="text-sm font-semibold tracking-tight text-amber-100">Slow connection</div>
                <div className="text-[10px] text-amber-500/80 font-medium">Video quality may be reduced</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-[#0a0f1c]/90 border border-emerald-500/20 text-white px-4 py-2.5 rounded-2xl shadow-[0_8px_32px_rgba(16,185,129,0.2)] backdrop-blur-xl">
              <div className="p-1.5 bg-emerald-500/20 rounded-full">
                <Wifi className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <div className="text-sm font-semibold tracking-tight text-emerald-100">Back online</div>
                <div className="text-[10px] text-emerald-500/80 font-medium">Connection restored</div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
