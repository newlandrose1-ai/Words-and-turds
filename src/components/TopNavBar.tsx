import React from 'react';
import { Volume2, VolumeX, HelpCircle, Trophy, Home } from 'lucide-react';
import { GameMode, GameState } from '../types/game';

interface TopNavBarProps {
  gameState: GameState;
  currentMode: GameMode;
  onGoHome: () => void;
  onSelectMode: (mode: GameMode) => void;
  onOpenHelp: () => void;
  onOpenRecords: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  gameState,
  currentMode,
  onGoHome,
  onSelectMode,
  onOpenHelp,
  onOpenRecords,
  soundEnabled,
  onToggleSound
}) => {
  const isInMatch = gameState === 'PLAYING' || gameState === 'SELECT_DIET' || gameState === 'ROUND_SUMMARY';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 py-3">
        {/* Zone 1: Brand Wordmark (Returns cleanly to Main Menu) */}
        <button
          type="button"
          onClick={onGoHome}
          title="Return to Main Menu"
          className="flex items-center gap-2 text-lg sm:text-xl font-display font-black tracking-tight text-amber-950 hover:text-amber-700 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
        >
          <span className="text-2xl" role="img" aria-hidden="true">🚽</span>
          <span>My Second Asshole</span>
        </button>

        {/* Zone 2: Concise Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={onGoHome}
            className={`hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 py-1 ${
              gameState === 'TITLE_MENU'
                ? 'text-amber-800 font-bold border-b-2 border-amber-600'
                : ''
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Menu</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('DERBY')}
            className={`hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 ${
              isInMatch && currentMode === 'DERBY'
                ? 'text-amber-800 font-bold border-b-2 border-amber-600'
                : ''
            }`}
          >
            Stall Derby
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('ENDLESS_LOG')}
            className={`hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 ${
              isInMatch && currentMode === 'ENDLESS_LOG'
                ? 'text-amber-800 font-bold border-b-2 border-amber-600'
                : ''
            }`}
          >
            Endless Log
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('PRECISION_SNIP')}
            className={`hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 ${
              isInMatch && currentMode === 'PRECISION_SNIP'
                ? 'text-amber-800 font-bold border-b-2 border-amber-600'
                : ''
            }`}
          >
            Precision Snip
          </button>

          <button
            type="button"
            onClick={onOpenRecords}
            className="hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 py-1"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>Hall of Fame</span>
          </button>
        </nav>

        {/* Zone 3: Quick Actions (Accessible on both mobile & desktop) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenRecords}
            aria-label="Open Hall of Fame"
            title="Hall of Fame & Achievements"
            className="md:hidden p-2 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
            title={soundEnabled ? 'Mute sound effects [M]' : 'Unmute sound effects [M]'}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-700" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenHelp}
            className="px-3.5 py-2 text-xs font-bold text-amber-950 bg-amber-200/90 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">How to Play</span>
            <span className="sm:hidden">Rules</span>
          </button>
        </div>
      </div>
    </header>
  );
};
