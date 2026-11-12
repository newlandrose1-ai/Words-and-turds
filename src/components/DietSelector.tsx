import React from 'react';
import { Sparkles, Check } from 'lucide-react';
import { DietModifier } from '../types/game';
import { DIET_MODIFIERS } from '../utils/gameData';

interface DietSelectorProps {
  selectedDiet: DietModifier;
  onSelectDiet: (diet: DietModifier) => void;
  onConfirm: () => void;
  stageTitle?: string;
}

export const DietSelector: React.FC<DietSelectorProps> = ({
  selectedDiet,
  onSelectDiet,
  onConfirm,
  stageTitle
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-amber-200 shadow-sm max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-1.5">
        <span className="text-xs font-bold font-mono text-amber-800 uppercase tracking-widest bg-amber-100 px-3 py-1 rounded-full">
          Pre-Round Nutrition Lab
        </span>
        <h3 className="text-2xl sm:text-3xl font-display font-black text-slate-900">
          Choose Your Pre-Derby Meal
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          {stageTitle ? `Preparing for ${stageTitle}. ` : ''}
          Your diet dictates push velocity, log tensile strength, and gram weight on the scale!
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
                  : 'bg-slate-50/60 border-slate-200 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">{diet.icon}</span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {diet.name}
                    </h4>
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

              {/* Stat badges */}
              <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-slate-600">
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                  Speed: {diet.pushSpeedMult}x
                </span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                  Tensile: {diet.tensileStrengthMult}x
                </span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                  Density: {diet.bonusWeightMult}x
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Enter Stall Button */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={onConfirm}
          className="w-full sm:w-auto min-w-[240px] py-3.5 px-8 rounded-2xl font-display font-black text-white text-lg bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-700 hover:brightness-105 shadow-md active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          <span>Enter Stall & Begin Strain!</span>
        </button>
      </div>
    </div>
  );
};
