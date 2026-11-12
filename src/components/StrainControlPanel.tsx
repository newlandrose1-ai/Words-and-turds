import React from 'react';
import { Scissors, Zap, AlertTriangle, Scale, Ruler, ChevronsLeftRight, Wind } from 'lucide-react';
import { PoopExpression } from '../types/game';

interface StrainControlPanelProps {
  lengthCm: number;
  weightGrams: number;
  tension: number;
  waterRemainingCm: number;
  isPushing: boolean;
  isFarting: boolean;
  isPlaying: boolean;
  isCheekSpread: boolean;
  awaitingFlush?: boolean;
  isFlushing?: boolean;
  expression: PoopExpression;
  onPushStart: () => void;
  onPushEnd: () => void;
  onFartStart: () => void;
  onFartEnd: () => void;
  onSnip: () => void;
  onQuickSnipSpread: () => void;
  onFlush?: () => void;
  onToggleCheekSpread?: () => void;
}

export const StrainControlPanel: React.FC<StrainControlPanelProps> = ({
  lengthCm,
  weightGrams,
  tension,
  waterRemainingCm,
  isPushing,
  isFarting,
  isPlaying,
  isCheekSpread,
  awaitingFlush = false,
  isFlushing = false,
  expression,
  onPushStart,
  onPushEnd,
  onFartStart,
  onFartEnd,
  onSnip,
  onQuickSnipSpread,
  onFlush
}) => {
  const isHighTension = tension > 75;
  const isExtremeTension = tension > 88;
  const lengthInches = (lengthCm * 0.3937).toFixed(1);

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border-2 border-amber-200/90 shadow-sm space-y-3">
      {/* Sleek Compact HUD Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {/* Length Metric */}
        <div className="p-2 sm:p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1 font-bold text-amber-900 text-[11px]">
              <Ruler className="w-3 h-3 text-amber-600" />
              <span>LENGTH</span>
            </div>
            <div className="text-lg sm:text-xl font-black font-mono text-amber-950 tabular-nums">
              {lengthCm.toFixed(1)} <span className="text-xs font-semibold text-amber-700">cm</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-amber-600 font-semibold">
            {lengthInches}&Prime;
          </span>
        </div>

        {/* Weight Metric */}
        <div className="p-2 sm:p-2.5 bg-emerald-50 rounded-xl border border-emerald-200/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1 font-bold text-emerald-900 text-[11px]">
              <Scale className="w-3 h-3 text-emerald-600" />
              <span>MASS</span>
            </div>
            <div className="text-lg sm:text-xl font-black font-mono text-emerald-950 tabular-nums">
              {Math.round(weightGrams)} <span className="text-xs font-semibold text-emerald-700">g</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-600 font-semibold">
            {(weightGrams * 0.03527).toFixed(1)}oz
          </span>
        </div>

        {/* Tension Gauge */}
        <div
          className={`p-2 sm:p-2.5 rounded-xl border transition-colors ${
            isExtremeTension
              ? 'bg-rose-100 border-rose-300 animate-pulse'
              : isHighTension
              ? 'bg-amber-100 border-amber-300'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between font-bold text-[11px] mb-1">
            <span className={isExtremeTension ? 'text-rose-900' : 'text-slate-700'}>
              <Zap className="w-3 h-3 inline mr-0.5 text-amber-500" />
              TENSION
            </span>
            <span className="font-mono text-xs">{Math.round(tension)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-100 ${
                isExtremeTension
                  ? 'bg-rose-600'
                  : isHighTension
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, tension)}%` }}
            />
          </div>
        </div>

        {/* Water Proximity Metric */}
        <div className="p-2 sm:p-2.5 bg-sky-50 rounded-xl border border-sky-200/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1 font-bold text-sky-900 text-[11px]">
              <AlertTriangle className="w-3 h-3 text-sky-600" />
              <span>WATER GAP</span>
            </div>
            <div className="text-lg sm:text-xl font-black font-mono text-sky-950 tabular-nums">
              {Math.max(0, waterRemainingCm).toFixed(1)} <span className="text-xs font-semibold text-sky-700">cm</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-sky-600 font-bold">
            {waterRemainingCm <= 6 ? 'SPLASH READY' : 'CLEAR'}
          </span>
        </div>
      </div>

      {/* Action Buttons Row OR Dedicated Flush CTA when specimen severed */}
      {awaitingFlush || isFlushing ? (
        <div className="pt-0.5">
          <button
            type="button"
            disabled={isFlushing}
            onClick={onFlush}
            className={`w-full py-4 px-4 sm:px-6 rounded-2xl font-display font-black text-white shadow-xl flex items-center justify-center gap-3 text-base sm:text-lg tracking-wide transition-all select-none cursor-pointer border-2 ${
              isFlushing
                ? 'bg-gradient-to-r from-sky-700 via-blue-800 to-indigo-900 border-sky-400 opacity-90 animate-pulse'
                : 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 border-sky-300 shadow-sky-500/40 hover:shadow-sky-500/60 active:scale-[0.99] animate-bounce'
            }`}
          >
            <span className="text-2xl animate-spin" style={{ animationDuration: isFlushing ? '0.7s' : '3.5s' }}>
              💧
            </span>
            <span className="truncate">
              {isFlushing
                ? 'SWIRLING VORTEX FLUSHING DOWN DRAIN...'
                : 'PULL LEVER TO FLUSH & REVEAL RATING'}
            </span>
            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-mono font-bold tracking-wider shrink-0">
              [ENTER]
            </span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-12 gap-2">
          {/* 1. STRAIN / PUSH BUTTON (4 cols) */}
          <button
            type="button"
            disabled={!isPlaying}
            onMouseDown={onPushStart}
            onMouseUp={onPushEnd}
            onMouseLeave={onPushEnd}
            onTouchStart={(e) => {
              e.preventDefault();
              onPushStart();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onPushEnd();
            }}
            className={`sm:col-span-4 flex flex-col items-center justify-center py-3.5 px-3 rounded-xl font-display font-black text-white shadow-sm active:scale-[0.98] transition-all cursor-pointer select-none ${
              !isPlaying
                ? 'bg-slate-300 opacity-60 cursor-not-allowed'
                : isPushing
                ? 'bg-amber-800 ring-4 ring-amber-300 shadow-inner'
                : 'bg-gradient-to-b from-amber-600 to-amber-800 hover:brightness-105'
            }`}
          >
            <div className="flex items-center gap-1.5 text-base sm:text-lg">
              <Zap className={`w-4 h-4 ${isPushing ? 'text-yellow-300 animate-bounce' : ''}`} />
              <span>{isPushing ? 'STRAINING...' : 'PUSH LOG'}</span>
            </div>
            <span className="text-[10px] font-mono font-medium text-amber-200">
              [SPACEBAR] Hold
            </span>
          </button>

          {/* 2. FART BOOST BUTTON (2 cols) */}
          <button
            type="button"
            disabled={!isPlaying || lengthCm < 1}
            onMouseDown={onFartStart}
            onMouseUp={onFartEnd}
            onMouseLeave={onFartEnd}
            onTouchStart={(e) => {
              e.preventDefault();
              onFartStart();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onFartEnd();
            }}
            className={`sm:col-span-3 flex flex-col items-center justify-center py-3.5 px-2.5 rounded-xl font-display font-black text-white shadow-sm active:scale-[0.98] transition-all cursor-pointer select-none ${
              !isPlaying || lengthCm < 1
                ? 'bg-slate-300 opacity-60 cursor-not-allowed'
                : isFarting
                ? 'bg-lime-700 ring-4 ring-lime-300 shadow-inner'
                : 'bg-gradient-to-b from-lime-600 via-lime-700 to-green-800 hover:brightness-105'
            }`}
          >
            <div className="flex items-center gap-1 text-sm sm:text-base">
              <Wind className="w-4 h-4 animate-pulse text-lime-200" />
              <span>FART BOOST</span>
            </div>
            <span className="text-[10px] font-mono font-medium text-lime-200">
              [F] Vent Pressure
            </span>
          </button>

          {/* 3. SPREAD & QUICK SNIP BUTTON (3 cols) */}
          <button
            type="button"
            disabled={!isPlaying || lengthCm < 2}
            onClick={onQuickSnipSpread}
            className={`sm:col-span-3 flex flex-col items-center justify-center py-3.5 px-2.5 rounded-xl font-display font-black text-white shadow-sm active:scale-[0.98] transition-all cursor-pointer select-none ${
              !isPlaying || lengthCm < 2
                ? 'bg-slate-300 opacity-60 cursor-not-allowed'
                : isCheekSpread
                ? 'bg-orange-700 ring-4 ring-orange-300 shadow-inner'
                : 'bg-gradient-to-b from-orange-500 via-orange-600 to-amber-700 hover:brightness-105'
            }`}
          >
            <div className="flex items-center gap-1 text-sm sm:text-base">
              <ChevronsLeftRight className="w-4 h-4" />
              <span>SPREAD & SNIP</span>
            </div>
            <span className="text-[10px] font-mono font-medium text-orange-200">
              [SHIFT] Quick Pinch
            </span>
          </button>

          {/* 4. REGULAR CLEAN SNIP BUTTON (2 cols) */}
          <button
            type="button"
            disabled={!isPlaying || lengthCm < 2}
            onClick={onSnip}
            className={`sm:col-span-2 flex flex-col items-center justify-center py-3.5 px-2 rounded-xl font-display font-black text-white shadow-sm active:scale-[0.98] transition-all cursor-pointer select-none ${
              !isPlaying || lengthCm < 2
                ? 'bg-slate-300 opacity-60 cursor-not-allowed'
                : 'bg-gradient-to-b from-rose-600 via-rose-700 to-red-800 hover:brightness-105 hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-1 text-sm sm:text-base">
              <Scissors className="w-4 h-4 rotate-90" />
              <span>SNIP</span>
            </div>
            <span className="text-[10px] font-mono font-medium text-rose-200">
              [ENTER]
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
