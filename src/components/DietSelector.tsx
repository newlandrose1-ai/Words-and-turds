import React, { useEffect } from 'react';
import { ArrowLeft, Check, Play } from 'lucide-react';
import { DietModifier, GameMode } from '../types/game';
import { DIET_MODIFIERS } from '../utils/gameData';

interface DietSelectorProps {
  gameMode: GameMode;
  onChangeMode: (mode: GameMode) => void;
  selectedDiet: DietModifier;
  onSelectDiet: (diet: DietModifier) => void;
  onConfirm: () => void;
  onBack: () => void;
  stageTitle?: string;
}

export const DietSelector: React.FC<DietSelectorProps> = ({
  gameMode,
  onChangeMode,
  selectedDiet,
  onSelectDiet,
  onConfirm,
  onBack,
  stageTitle
}) => {
  // Press Enter to start immediately, Escape to go back
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter') {
        e.preventDefault();
        onConfirm();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        onBack();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onConfirm, onBack]);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-amber-200 shadow-sm max-w-3xl mx-auto w-full space-y-5">
      {/* Top Bar: Back Button & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-amber-900 bg-slate-100 hover:bg-amber-100/80 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Main Menu</span>
        </button>

        {/* Quick Mode Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          {(
            [
              { id: 'DERBY', label: 'Stall Derby' },
              { id: 'ENDLESS_LOG', label: 'Endless Log' },
              { id: 'PRECISION_SNIP', label: 'Precision Snip' }
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onChangeMode(m.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                gameMode === m.id
                  ? 'bg-white text-amber-950 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="text-center space-y-1">
        <div className="text-xs font-medium text-amber-800">
          Pre-Round Nutrition Lab {stageTitle && gameMode === 'DERBY' ? `· ${stageTitle}` : ''}
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900">
          Choose Your Pre-Derby Meal
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Your meal sets your push velocity, tensile snap resistance, and scale density.
        </p>
      </div>

      {/* Grid of Diet Modifiers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DIET_MODIFIERS.map((diet) => {
          const isSelected = selectedDiet.id === diet.id;
          return (
            <button
              key={diet.id}
              type="button"
              onClick={() => onSelectDiet(diet)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-400 shadow-sm'
                  : 'bg-slate-50/60 border-slate-200 hover:bg-white hover:border-amber-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl select-none">{diet.icon}</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {diet.name}
                    </h3>
                    <span className="text-xs font-medium text-amber-700">
                      {diet.tagline}
                    </span>
                  </div>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                {diet.description}
              </p>

              {/* Clean Visual Stat Comparison Bars */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/70 text-[10px] font-mono">
                <div>
                  <div className="flex justify-between text-slate-500 mb-0.5">
                    <span>Speed</span>
                    <span className="font-bold text-slate-800 tabular-nums">{diet.pushSpeedMult}x</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${Math.min(100, (diet.pushSpeedMult / 1.5) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-500 mb-0.5">
                    <span>Strength</span>
                    <span className="font-bold text-slate-800 tabular-nums">{diet.tensileStrengthMult}x</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, (diet.tensileStrengthMult / 1.5) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-500 mb-0.5">
                    <span>Density</span>
                    <span className="font-bold text-slate-800 tabular-nums">{diet.bonusWeightMult}x</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full"
                      style={{ width: `${Math.min(100, (diet.bonusWeightMult / 1.5) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Confirm & Enter Stall CTA */}
      <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onConfirm}
          className="w-full sm:w-auto min-w-[260px] py-3.5 px-8 rounded-2xl font-display font-black text-white text-lg bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-700 hover:brightness-105 shadow-md active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center gap-2.5"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>Enter Stall & Start</span>
          <span className="text-[11px] font-mono bg-white/20 px-2 py-0.5 rounded-md">
            [ENTER]
          </span>
        </button>
      </div>
    </div>
  );
};
