import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Share2, PlusSquare, X, CheckCircle2, Smartphone, Monitor, Tv, ArrowRight } from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstallModal({ isOpen, onClose }: InstallModalProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

    const inStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(inStandalone);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-[#0d1322] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden text-white"
        >
          {}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-xl shadow-blue-500/20 shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-[#050811] rounded-[14px] flex items-center justify-center text-blue-400 font-black text-xl">
                <Tv className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Install E-Stream App</h3>
              <p className="text-xs text-slate-400 mt-0.5">Works on iPhone, iPad, Android & PC</p>
            </div>
          </div>

          {isStandalone || installed ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-3 animate-bounce" />
              <h4 className="text-lg font-bold text-white">E-Stream is Installed!</h4>
              <p className="text-sm text-slate-400 mt-1">
                You are running E-Stream directly as a home screen app with 300% volume boost support.
              </p>
              <button
                onClick={onClose}
                className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all"
              >
                Done
              </button>
            </div>
          ) : isIOS ? (
            
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-xs text-blue-300 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-400 shrink-0" />
                <span>Follow these 3 easy steps in Safari to add E-Stream to your iPhone Home Screen:</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-400 font-bold flex items-center justify-center text-xs shrink-0">
                    1
                  </div>
                  <div className="text-xs text-slate-200">
                    Tap the <span className="font-bold text-white inline-flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded"><Share2 className="w-3.5 h-3.5 text-blue-400" /> Share</span> button at the bottom of Safari
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-400 font-bold flex items-center justify-center text-xs shrink-0">
                    2
                  </div>
                  <div className="text-xs text-slate-200">
                    Scroll down and select <span className="font-bold text-white inline-flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded"><PlusSquare className="w-3.5 h-3.5 text-blue-400" /> Add to Home Screen</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-400 font-bold flex items-center justify-center text-xs shrink-0">
                    3
                  </div>
                  <div className="text-xs text-slate-200">
                    Tap <span className="font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Add</span> in top right corner to install
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30"
              >
                Got It!
              </button>
            </div>
          ) : (
            
            <div className="space-y-4">
              <p className="text-sm text-slate-300">
                Install E-Stream on your device for instant launch, custom video controls, full screen live TV, and 300% volume booster.
              </p>

              <div className="grid grid-cols-2 gap-3 py-2">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-2 text-xs text-slate-300">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  <span>Mobile Friendly</span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-2 text-xs text-slate-300">
                  <Monitor className="w-4 h-4 text-emerald-400" />
                  <span>Desktop Native</span>
                </div>
              </div>

              {deferredPrompt ? (
                <button
                  onClick={handleNativeInstall}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Install E-Stream Now</span>
                </button>
              ) : (
                <div className="text-xs text-slate-400 bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                  To install, open your browser menu (⋮) and tap <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home screen"</strong>.
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
