import React from 'react';
import { Monitor, Smartphone, Tablet, LayoutGrid, Zap, Download } from 'lucide-react';
import { cn } from '../lib/utils';

export type DeviceViewMode = 'auto' | 'pc' | 'tablet' | 'iphone';

interface DeviceFrameProps {
  deviceMode: DeviceViewMode;
  onDeviceChange: (mode: DeviceViewMode) => void;
  onOpenInstall: () => void;
  children: React.ReactNode;
}

export default function DeviceFrame({ deviceMode, onDeviceChange, onOpenInstall, children }: DeviceFrameProps) {
  return (
    <div className="w-full h-screen relative bg-[#02040a] overflow-hidden flex flex-col">
      {deviceMode === 'auto' ? (
        <div className="w-full h-full relative overflow-hidden">
          {children}
        </div>
      ) : (
        <>
          <div className="bg-[#080d1a] border-b border-white/10 px-3 py-1.5 flex items-center justify-between shrink-0 z-50 text-xs select-none">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                <span>300% BOOST</span>
              </div>
              <span className="hidden sm:inline text-slate-400 font-medium">Device Preview:</span>
            </div>

            <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 gap-1">
              <button
                onClick={() => onDeviceChange('auto')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all font-medium text-slate-400 hover:text-white hover:bg-white/5"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Auto</span>
              </button>

              <button
                onClick={() => onDeviceChange('pc')}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all font-medium",
                  deviceMode === 'pc' 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>PC</span>
              </button>

              <button
                onClick={() => onDeviceChange('tablet')}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all font-medium",
                  deviceMode === 'tablet' 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span>Tablet</span>
              </button>

              <button
                onClick={() => onDeviceChange('iphone')}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all font-medium",
                  deviceMode === 'iphone' 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>iPhone</span>
              </button>
            </div>

            <button
              onClick={onOpenInstall}
              className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          </div>

          <div className="flex-1 w-full overflow-auto flex items-center justify-center p-0 md:p-4 bg-[#02040a]">
            {deviceMode === 'pc' && (
              <div className="w-full max-w-[1280px] h-[90vh] bg-[#050811] rounded-2xl border border-white/20 shadow-2xl overflow-hidden flex flex-col relative">
                <div className="h-6 bg-[#0d1322] border-b border-white/10 flex items-center px-3 gap-1.5 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                  <div className="mx-auto text-[10px] text-slate-500 font-mono">E-Stream Desktop PC View</div>
                </div>
                <div className="flex-1 relative overflow-hidden">
                  {children}
                </div>
              </div>
            )}

            {deviceMode === 'tablet' && (
              <div className="w-[768px] h-[92vh] bg-[#050811] rounded-[32px] border-[10px] border-[#182030] shadow-2xl overflow-hidden flex flex-col relative">
                <div className="h-5 bg-[#182030] flex items-center justify-center shrink-0">
                  <div className="w-3 h-3 rounded-full bg-slate-800 border border-white/10"></div>
                </div>
                <div className="flex-1 relative overflow-hidden">
                  {children}
                </div>
              </div>
            )}

            {deviceMode === 'iphone' && (
              <div className="w-[390px] h-[820px] max-h-[95vh] bg-[#050811] rounded-[48px] border-[12px] border-[#182235] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative">
                <div className="h-8 bg-[#182235] flex items-center justify-center relative shrink-0 z-50">
                  <div className="w-24 h-4 bg-black rounded-full flex items-center justify-end px-2 gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-900 border border-blue-900"></div>
                  </div>
                </div>
                <div className="flex-1 relative overflow-hidden">
                  {children}
                </div>
                <div className="h-4 bg-[#050811] flex items-center justify-center shrink-0 z-50">
                  <div className="w-28 h-1 bg-white/30 rounded-full"></div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
