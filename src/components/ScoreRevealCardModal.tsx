import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, Sparkles, RotateCcw, ArrowRight, ShieldCheck, AlertOctagon, Scale, Ruler, Zap, Wind, Droplets, Crown, Heart } from 'lucide-react';
import { Competitor, SnipRecord } from '../types/game';
import { QUALITY_TIERS, QUALITY_ACHIEVEMENTS } from '../utils/gameData';
import { sounds } from '../utils/audio';

interface ScoreRevealCardModalProps {
  playerRecord: SnipRecord | null;
  competitors: Competitor[];
  roundNumber: number;
  totalRounds: number;
  stageName: string;
  isQuickSnipped?: boolean;
  onNextStage: () => void;
  onRetry: () => void;
  onMainMenu: () => void;
}

export const ScoreRevealCardModal: React.FC<ScoreRevealCardModalProps> = ({
  playerRecord,
  competitors,
  roundNumber,
  totalRounds,
  stageName,
  isQuickSnipped = false,
  onNextStage,
  onRetry,
  onMainMenu
}) => {
  const [stampRevealed, setStampRevealed] = useState<boolean>(false);

  // Combine player and competitors sorted by continuous unbroken length
  const allEntries = [
    {
      id: 'player',
      name: 'You (The Contender)',
      avatarEmoji: '🚽',
      lengthCm: playerRecord?.lengthCm || 0,
      weightGrams: playerRecord?.weightGrams || 0,
      snapped: playerRecord?.snapped || false,
      cleanCut: playerRecord?.cleanCut || false,
      score: playerRecord?.totalPoints || 0,
      isPlayer: true
    },
    ...competitors.map((c) => ({
      id: c.id,
      name: c.name,
      avatarEmoji: c.avatarEmoji,
      lengthCm: c.currentLength,
      weightGrams: c.currentWeight,
      snapped: c.status === 'snapped',
      cleanCut: c.status === 'snipped',
      score: c.score,
      isPlayer: false
    }))
  ].sort((a, b) => {
    if (a.snapped && !b.snapped) return 1;
    if (!a.snapped && b.snapped) return -1;
    return b.lengthCm - a.lengthCm;
  });

  const playerRank = allEntries.findIndex((e) => e.isPlayer) + 1;
  const isWinner = playerRank === 1 && !(playerRecord?.snapped);

  // Extract Poop Quality Meter stats
  const quality = playerRecord?.qualityScore ?? 50;
  const qualityTier = playerRecord?.qualityTier || 'smooth';
  const tierInfo = QUALITY_TIERS[qualityTier] || QUALITY_TIERS.smooth;
  const qualityMult = playerRecord?.qualityMultiplier || tierInfo.multiplier;
  const qualityBonus = playerRecord?.qualityBonus || 0;
  const unlockedAchievements = playerRecord?.unlockedAchievementIds || [];

  // Calculate Overall Performance Rating Rank incorporating Quality Score
  let rankGrade = 'B';
  let rankTitle = 'SOLID CONTENDER';
  let rankBadgeColor = 'from-amber-500 to-yellow-600 text-amber-950 border-amber-300';
  let inspectorVerdict = 'A respectable unbroken specimen with consistent density.';

  if (playerRecord?.snapped) {
    rankGrade = 'F';
    rankTitle = 'PREMATURE SPLATTER';
    rankBadgeColor = 'from-rose-600 to-red-800 text-rose-100 border-rose-400';
    inspectorVerdict = 'Catastrophic tensile failure. Fragmentation caused severe bowl spray.';
  } else if (playerRecord) {
    const len = playerRecord.lengthCm;
    if (qualityTier === 'transcendent' || (len >= 34 && isWinner)) {
      rankGrade = 'S+';
      rankTitle = qualityTier === 'transcendent' ? 'TRANSCENDENT GOLDEN TITAN' : 'LEGENDARY PORCELAIN TITAN';
      rankBadgeColor = 'from-amber-400 via-yellow-300 to-amber-500 text-amber-950 border-yellow-400 shadow-amber-300/50';
      inspectorVerdict =
        qualityTier === 'transcendent'
          ? 'Supreme celestial quality. Iridescent golden glaze, heavenly aromatic cadence, and historic 2.5x multiplier!'
          : 'Architectural masterpiece. Epic hydrodynamic length, zero skid friction, thunderous ceramic thunk.';
    } else if (qualityTier === 'sentient' || len >= 28) {
      rankGrade = 'A+';
      rankTitle = qualityTier === 'sentient' ? 'SENTIENT MASTERPIECE' : 'MAJESTIC FIBER BEAST';
      rankBadgeColor = 'from-sky-400 to-blue-600 text-sky-950 border-sky-300 shadow-sky-200';
      inspectorVerdict =
        qualityTier === 'sentient'
          ? 'Deep soulful emotiveness! The specimen radiated charismatic presence, glowing anime glints, and silky luster.'
          : 'Superb tensile fiber alignment. Smooth exit trajectory with minimal bowl turbulence.';
    } else if (len >= 20 || qualityTier === 'artisanal') {
      rankGrade = 'B';
      rankTitle = qualityTier === 'artisanal' ? 'ARTISANAL BLUE RIBBON' : 'COMPETENT LOG';
      rankBadgeColor = 'from-emerald-400 to-teal-600 text-emerald-950 border-emerald-300 shadow-emerald-200';
      inspectorVerdict = 'Solid artisanal grade piece. Handled the drop cleanly with moderate water displacement.';
    } else {
      rankGrade = 'C';
      rankTitle = 'NUGGET CLASS';
      rankBadgeColor = 'from-slate-400 to-slate-600 text-slate-100 border-slate-300';
      inspectorVerdict = 'Conservative snip. Recommend increased dietary bran, steady pacing, and bolder sphincter endurance.';
    }
  }

  useEffect(() => {
    // Stamp stamp-reveal delay
    const t = setTimeout(() => {
      setStampRevealed(true);
      if (qualityTier === 'transcendent') {
        sounds.playTranscendentChoir();
      } else if (isWinner) {
        sounds.playFanfare();
      }
      if (isWinner || qualityTier === 'transcendent') {
        try {
          confetti({
            particleCount: qualityTier === 'transcendent' ? 120 : 90,
            spread: 85,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }
      }
    }, 350);

    return () => clearTimeout(t);
  }, [isWinner, qualityTier]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-gradient-to-b from-white via-amber-50/50 to-orange-50/40 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border-2 border-amber-300 relative overflow-hidden my-auto">
        {/* Certificate Seal & Top Header */}
        <div className="flex items-center justify-between border-b border-amber-200/80 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🚽</span>
            <div>
              <div className="text-[10px] font-mono font-bold tracking-widest text-amber-800 uppercase flex items-center gap-1.5">
                <span>OFFICIAL SPECIMEN AUTOPSY</span>
                <span>·</span>
                <span>ROUND {roundNumber}/{totalRounds}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 tracking-tight">
                Flushed Score Reveal
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              {stageName.split(':')[0]}
            </span>
          </div>
        </div>

        {/* The Stylized Performance Rating Grade Card */}
        <div className="relative p-4 rounded-2xl bg-white border-2 border-amber-200/90 shadow-sm mb-3.5 overflow-hidden">
          {/* Background Decorative Stamp */}
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                OVERALL PERFORMANCE RATING
              </span>
              <h3 className="text-lg sm:text-xl font-display font-black text-slate-900 truncate">
                {rankTitle}
              </h3>
              <p className="text-xs text-slate-600 italic leading-relaxed">
                &ldquo;{inspectorVerdict}&rdquo;
              </p>
            </div>

            {/* Giant Grade Stamp Badge with Spring Animation */}
            <div
              className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${rankBadgeColor} flex flex-col items-center justify-center font-display font-black shadow-md border-2 transform transition-all duration-300 ${
                stampRevealed ? 'scale-100 rotate-[-6deg]' : 'scale-50 opacity-0 rotate-12'
              }`}
            >
              <span className="text-2xl sm:text-3xl leading-none">{rankGrade}</span>
              <span className="text-[9px] font-mono tracking-tighter uppercase font-bold">RATING</span>
            </div>
          </div>

          {/* Quick Stylized Flushed Log Metrics (4-Column Layout including Quality Meter) */}
          {playerRecord && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100 text-center font-mono">
              <div className="p-2 bg-amber-50 rounded-xl border border-amber-200/60">
                <span className="text-[10px] text-amber-800 font-bold block">LENGTH</span>
                <span className="text-sm sm:text-base font-black text-amber-950">
                  {playerRecord.lengthCm.toFixed(1)} <span className="text-[10px]">cm</span>
                </span>
              </div>
              <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200/60">
                <span className="text-[10px] text-emerald-800 font-bold block">MASS</span>
                <span className="text-sm sm:text-base font-black text-emerald-950">
                  {Math.round(playerRecord.weightGrams)} <span className="text-[10px]">g</span>
                </span>
              </div>
              <div className="p-2 bg-sky-50 rounded-xl border border-sky-200/60">
                <span className="text-[10px] text-sky-800 font-bold block">QUALITY</span>
                <span className="text-sm sm:text-base font-black text-sky-950 flex items-center justify-center gap-0.5">
                  <span>{tierInfo.icon}</span>
                  <span>{Math.round(quality)}%</span>
                  <span className="text-[10px] text-sky-700 font-semibold">({qualityMult}x)</span>
                </span>
              </div>
              <div className="p-2 bg-yellow-50 rounded-xl border border-yellow-200/60">
                <span className="text-[10px] text-yellow-800 font-bold block">TOTAL PTS</span>
                <span className="text-sm sm:text-base font-black text-yellow-950">
                  {playerRecord.totalPoints}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quality Meter Autopsy Callout Card */}
        {playerRecord && (
          <div className="p-3 bg-gradient-to-r from-amber-50 via-yellow-50/70 to-orange-50 border border-amber-200 rounded-2xl mb-3 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-2xl select-none">{tierInfo.icon}</span>
              <div>
                <div className="font-display font-black text-amber-950 flex items-center gap-1.5">
                  <span>{tierInfo.name}</span>
                  <span className="text-[10px] font-mono font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                    {qualityMult}x Emotive Multiplier
                  </span>
                </div>
                <div className="text-[11px] text-amber-900/80 leading-tight">
                  {tierInfo.description}
                </div>
              </div>
            </div>
            {qualityBonus > 0 && (
              <div className="text-right shrink-0 font-mono">
                <span className="text-[10px] text-amber-700 block font-semibold">QUALITY BONUS</span>
                <span className="text-xs sm:text-sm font-black text-emerald-700">+{qualityBonus} pts</span>
              </div>
            )}
          </div>
        )}

        {/* Newly Unlocked Achievements in this round */}
        {unlockedAchievements.length > 0 && (
          <div className="p-2.5 bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 border border-purple-200 rounded-2xl mb-3 text-xs space-y-1.5">
            <div className="text-[10px] font-mono font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-purple-600" />
              <span>SPECIAL ACHIEVEMENTS UNLOCKED:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {unlockedAchievements.map((achId) => {
                const ach = QUALITY_ACHIEVEMENTS.find((a) => a.id === achId);
                if (!ach) return null;
                return (
                  <span
                    key={ach.id}
                    className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-purple-200 font-mono text-[11px] font-bold text-purple-950 shadow-2xs"
                  >
                    <span>{ach.emoji}</span>
                    <span>{ach.name}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Flushed Turd Breakdown Tags */}
        {playerRecord && (
          <div className="flex flex-wrap gap-1.5 mb-3.5 text-[11px] font-mono">
            {playerRecord.cleanCut ? (
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1 rounded-lg border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Clean Snip Cut (+150 pts)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-900 font-bold px-2.5 py-1 rounded-lg border border-rose-200">
                <AlertOctagon className="w-3.5 h-3.5" /> Fractured Splatter
              </span>
            )}

            {isQuickSnipped && (
              <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-900 font-bold px-2.5 py-1 rounded-lg border border-orange-200">
                <span>🍑</span> Spread Cheeks Quick Cut (+50 pts)
              </span>
            )}

            <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-900 font-bold px-2.5 py-1 rounded-lg border border-sky-200">
              <Droplets className="w-3.5 h-3.5" /> Heavy Thunk Splash Displaced
            </span>
          </div>
        )}

        {/* Stall Leaderboard Comparison */}
        <div className="space-y-1.5 mb-5 max-h-40 overflow-y-auto pr-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            Stall Leaderboard (Continuous Specimen Size)
          </div>

          {allEntries.map((entry, idx) => {
            const isTop = idx === 0;
            return (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl border text-xs transition-all ${
                  entry.isPlayer
                    ? 'ring-2 ring-amber-500 bg-amber-50/80 border-amber-300 font-semibold'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 text-center font-bold font-mono text-slate-500">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </span>
                  <span className="text-lg">{entry.avatarEmoji}</span>
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5 leading-tight">
                      <span>{entry.name}</span>
                      {entry.isPlayer && (
                        <span className="text-[9px] bg-amber-200 text-amber-900 px-1 py-0.2 rounded font-bold">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {entry.snapped ? 'Premature Break' : `${Math.round(entry.weightGrams)}g mass`}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className={`font-black text-sm ${isTop ? 'text-amber-800' : 'text-slate-800'}`}>
                    {entry.lengthCm.toFixed(1)} cm
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {entry.score} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 border-t border-slate-100">
          {isWinner ? (
            roundNumber < totalRounds ? (
              <button
                type="button"
                onClick={onNextStage}
                className="w-full sm:flex-1 py-3 px-5 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-sm"
              >
                <span>Advance to Next Stall Derby</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onMainMenu}
                className="w-full sm:flex-1 py-3 px-5 rounded-xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 hover:brightness-105 text-white flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Claim World Porcelain Trophy!</span>
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={onRetry}
              className="w-full sm:flex-1 py-3 px-5 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry This Stall</span>
            </button>
          )}

          <button
            type="button"
            onClick={onMainMenu}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-all cursor-pointer"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};
