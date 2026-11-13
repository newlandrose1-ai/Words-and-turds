import React, { useEffect, useState } from 'react';
import { Sparkles, Heart, Award, Crown, Zap, Wind, Flame } from 'lucide-react';
import { PoopQualityTier } from '../types/game';
import { QUALITY_TIERS, QualityTierInfo } from '../utils/gameData';

interface PoopQualityMeterProps {
  qualityScore: number; // 0 to 100
  qualityTier: PoopQualityTier;
  tension: number;
  isPushing: boolean;
  isFarting: boolean;
  emotionsCount: number;
  cleanCut: boolean;
  isSnapped: boolean;
}

export const PoopQualityMeter: React.FC<PoopQualityMeterProps> = ({
  qualityScore,
  qualityTier,
  tension,
  isPushing,
  isFarting,
  emotionsCount,
  cleanCut,
  isSnapped
}) => {
  const currentTierInfo: QualityTierInfo = QUALITY_TIERS[qualityTier];
  const [lastTier, setLastTier] = useState<PoopQualityTier>(qualityTier);
  const [tierUpPulse, setTierUpPulse] = useState<boolean>(false);

  // Trigger brief celebration animation when tier upgrades
  useEffect(() => {
    if (qualityTier !== lastTier) {
      setTierUpPulse(true);
      const timer = setTimeout(() => setTierUpPulse(false), 900);
      setLastTier(qualityTier);
      return () => clearTimeout(timer);
    }
  }, [qualityTier, lastTier]);

  // Determine active dynamic buffs
  const isPacingOptimal = isPushing && tension >= 25 && tension <= 75;
  const isAdrenalineSurge = tension > 75 && tension < 95;
  const isGaseousAroma = isFarting;

  // Meter fill gradient based on tier
  const getGradientByTier = (tier: PoopQualityTier) => {
    switch (tier) {
      case 'transcendent':
        return 'from-amber-400 via-yellow-300 to-amber-500 animate-pulse';
      case 'sentient':
        return 'from-sky-400 via-cyan-400 to-blue-500';
      case 'artisanal':
        return 'from-emerald-400 via-teal-400 to-emerald-600';
      case 'smooth':
        return 'from-amber-500 via-orange-400 to-amber-600';
      case 'coarse':
      default:
        return 'from-stone-400 to-stone-600';
    }
  };

  return (
    <div
      className={`relative rounded-2xl bg-white/95 backdrop-blur-sm p-3 border-2 transition-all duration-300 shadow-sm ${
        qualityTier === 'transcendent'
          ? 'border-yellow-400 shadow-amber-300/40 ring-2 ring-yellow-300/50'
          : qualityTier === 'sentient'
          ? 'border-sky-300 shadow-sky-200/50'
          : 'border-amber-200/90'
      } ${tierUpPulse ? 'scale-[1.02] ring-4 ring-amber-400/60' : ''}`}
    >
      {/* Tier Up Banner Toast Overlay */}
      {tierUpPulse && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 text-amber-950 font-display font-black text-[11px] px-3 py-0.5 rounded-full shadow-md animate-bounce border border-yellow-200 flex items-center gap-1 z-30">
          <Sparkles className="w-3 h-3 text-amber-950" />
          <span>TIER UP: {currentTierInfo.name.toUpperCase()}!</span>
        </div>
      )}

      {/* Header Info: Title, Tier Name & Multiplier */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl shrink-0 select-none" role="img" aria-label={currentTierInfo.name}>
            {currentTierInfo.icon}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
              <span>POOP QUALITY METER</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-800 font-extrabold">{currentTierInfo.multiplier}x MULTIPLIER</span>
            </div>
            <h4 className="text-sm font-display font-black text-slate-900 truncate">
              {currentTierInfo.name}
            </h4>
          </div>
        </div>

        {/* Big Monospace Tabular Score */}
        <div className="text-right shrink-0">
          <div className="text-lg font-black font-mono tracking-tight text-amber-950 tabular-nums">
            {Math.round(qualityScore)}
            <span className="text-xs font-bold text-amber-700 ml-0.5">%</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 font-medium block -mt-1">
            Soul Resonance
          </span>
        </div>
      </div>

      {/* Thermometer / Progress Bar */}
      <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 mb-2">
        {/* Tier milestone notches */}
        <div className="absolute inset-0 flex justify-between px-1 pointer-events-none z-10 opacity-30">
          <div className="w-0.5 h-full bg-slate-400" style={{ marginLeft: '30%' }} title="Smooth Tier" />
          <div className="w-0.5 h-full bg-slate-400" style={{ marginLeft: '25%' }} title="Artisanal Tier" />
          <div className="w-0.5 h-full bg-slate-400" style={{ marginLeft: '20%' }} title="Sentient Tier" />
          <div className="w-0.5 h-full bg-slate-400" style={{ marginLeft: '15%' }} title="Transcendent Tier" />
        </div>

        <div
          className={`h-full rounded-full bg-gradient-to-r transition-all duration-200 relative ${getGradientByTier(
            qualityTier
          )}`}
          style={{ width: `${Math.max(4, Math.min(100, qualityScore))}%` }}
        >
          {/* Gleaming shine animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
        </div>
      </div>

      {/* Emotive Buffs & Resonance Ticker */}
      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
        {/* Pacing Buff */}
        <span
          className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors ${
            isPacingOptimal
              ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300'
              : 'bg-slate-50 text-slate-500 border border-slate-200/60'
          }`}
        >
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>Cadence: {isPacingOptimal ? 'Harmonic' : 'Pacing'}</span>
        </span>

        {/* Emotions Experienced Variety Buff */}
        <span
          className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors ${
            emotionsCount >= 3
              ? 'bg-sky-100 text-sky-900 font-bold border border-sky-300'
              : 'bg-slate-50 text-slate-500 border border-slate-200/60'
          }`}
        >
          <Heart className="w-3 h-3 text-rose-500" />
          <span>Drama: {emotionsCount}/6 Expressions</span>
        </span>

        {/* Fart Aeration Buff */}
        {isGaseousAroma && (
          <span className="px-2 py-0.5 rounded-md bg-lime-100 text-lime-900 font-bold border border-lime-300 flex items-center gap-1 animate-pulse">
            <Wind className="w-3 h-3 text-lime-600" />
            <span>Fart Aeration +Quality</span>
          </span>
        )}

        {/* Adrenaline High Tension Thrill */}
        {isAdrenalineSurge && (
          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold border border-amber-300 flex items-center gap-1 animate-pulse">
            <Flame className="w-3 h-3 text-amber-600" />
            <span>Adrenaline Thrill!</span>
          </span>
        )}

        {/* Snapped warning or clean snip reward */}
        {isSnapped ? (
          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 font-bold border border-rose-300 ml-auto">
            Fractured Quality Penalty
          </span>
        ) : cleanCut ? (
          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 ml-auto">
            ✨ Quality Locked In!
          </span>
        ) : (
          <span className="text-slate-400 ml-auto hidden sm:inline">
            Next: {currentTierInfo.tier === 'transcendent' ? 'MAX' : `${currentTierInfo.maxScore + 1}%`}
          </span>
        )}
      </div>
    </div>
  );
};
