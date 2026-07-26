import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tv, Sparkles, Play, Radio, Shield, Zap, Flame } from 'lucide-react';

interface IntroSplashScreenProps {
  onFinish: () => void;
}

export default function IntroSplashScreen({ onFinish }: IntroSplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing E-Stream Core...');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setProgress(35);
      setStatusText('Connecting to Ultra-Low Latency Streams...');
    }, 400);

    const timer2 = setTimeout(() => {
      setProgress(70);
      setStatusText('Loading Live Broadcast Channels...');
    }, 900);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setStatusText('Welcome to E-Stream TV');
    }, 1500);

    const timer4 = setTimeout(() => {
      onFinish();
    }, 2100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 z-[100] bg-[#030611] flex flex-col items-center justify-center text-white overflow-hidden select-none"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-[#030611] to-[#030611] pointer-events-none" />
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center px-6 text-center max-w-sm w-full">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: 'spring', damping: 15 }}
          className="relative mb-6"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 shadow-[0_0_50px_rgba(59,130,246,0.6)] flex items-center justify-center">
            <div className="w-full h-full bg-[#070c1e] rounded-[22px] flex items-center justify-center relative overflow-hidden">
              <Tv className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 animate-pulse" />
              <Sparkles className="w-4 h-4 text-cyan-300 absolute top-2 right-2 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          </div>

          <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-red-600 border border-red-400 text-[10px] font-black uppercase tracking-wider text-white shadow-lg flex items-center gap-1 animate-bounce">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            LIVE
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-blue-100 to-cyan-400 bg-clip-text text-transparent mb-2 drop-shadow-sm">
            E-Stream
          </h1>
          <p className="text-xs sm:text-sm text-blue-200/80 font-medium tracking-wide max-w-xs mx-auto mb-8">
            Live TV & Broadcasts
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full space-y-3"
        >
          <div className="w-full h-2 bg-slate-900/80 rounded-full border border-blue-500/20 overflow-hidden p-0.5 shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.8)]"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="text-blue-400 font-semibold">{statusText}</span>
            <span>{progress}%</span>
          </div>
        </motion.div>

        <button
          onClick={onFinish}
          className="mt-8 text-xs text-slate-500 hover:text-slate-300 underline tracking-wider transition-colors"
        >
          Skip Intro
        </button>
      </div>
    </motion.div>
  );
}
