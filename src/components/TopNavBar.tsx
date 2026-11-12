import React from 'react';
import { Volume2, VolumeX, HelpCircle, Trophy } from 'lucide-react';
import { GameMode } from '../types/game';

interface TopNavBarProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onOpenHelp: () => void;
  onOpenRecords: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  currentMode,
  onSelectMode,
  onOpenHelp,
  onOpenRecords,
  soundEnabled,
  onToggleSound
}) => {
  return (
    <header className="flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 py-3.5 bg-white/95 backdrop-blur-md border-b border-amber-200/80 sticky top-0 z-40 shadow-xs">
      {/* Zone 1: Brand Wordmark (Single text element) */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-2xl" role="img" aria-label="Porcelain Toilet">🚽</span>
        <button
          onClick={() => onSelectMode('DERBY')}
          className="text-lg sm:text-xl font-display font-black tracking-tight text-amber-950 hover:text-amber-700 whitespace-nowrap shrink-0 transition-colors cursor-pointer text-left"
        >
          My Second Asshole
        </button>
      </div>

      {/* Zone 2: 4 Clean Single-Line Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <button
          type="button"
          onClick={() => onSelectMode('DERBY')}
          className={`hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentMode === 'DERBY' ? 'text-amber-800 font-bold border-b-2 border-amber-600 pb-0.5' : ''
          }`}
        >
          Stall Derby
        </button>
        <button
          type="button"
          onClick={() => onSelectMode('ENDLESS_LOG')}
          className={`hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentMode === 'ENDLESS_LOG' ? 'text-amber-800 font-bold border-b-2 border-amber-600 pb-0.5' : ''
          }`}
        >
          Endless Log
        </button>
        <button
          type="button"
          onClick={() => onSelectMode('PRECISION_SNIP')}
          className={`hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentMode === 'PRECISION_SNIP' ? 'text-amber-800 font-bold border-b-2 border-amber-600 pb-0.5' : ''
          }`}
        >
          Precision Snip
        </button>
        <button
          type="button"
          onClick={onOpenRecords}
          className="hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          <span>Hall of Fame</span>
        </button>
      </nav>

      {/* Zone 3: 1 Primary Action Area */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute cartoon sounds' : 'Unmute cartoon sounds'}
          className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-700" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        </button>

        <button
          type="button"
          onClick={onOpenHelp}
          className="px-3.5 py-1.5 text-xs font-bold text-amber-950 bg-amber-200/90 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>How to Play</span>
        </button>
      </div>
    </header>
  );
};
