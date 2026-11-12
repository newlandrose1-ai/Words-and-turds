import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, Sparkles, RotateCcw, ArrowRight, ShieldCheck, AlertOctagon } from 'lucide-react';
import { Competitor, SnipRecord } from '../types/game';
import { sounds } from '../utils/audio';

interface WeighInCeremonyModalProps {
  playerRecord: SnipRecord | null;
  competitors: Competitor[];
  roundNumber: number;
  totalRounds: number;
  stageName: string;
  onNextStage: () => void;
  onRetry: () => void;
  onMainMenu: () => void;
}

export const WeighInCeremonyModal: React.FC<WeighInCeremonyModalProps> = ({
  playerRecord,
  competitors,
  roundNumber,
  totalRounds,
  stageName,
  onNextStage,
  onRetry,
  onMainMenu
}) => {
  // Combine player and competitors into a sorted leaderboard
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
    // If snapped, rank lower than clean snips
    if (a.snapped && !b.snapped) return 1;
    if (!a.snapped && b.snapped) return -1;
    // Otherwise sorted by continuous length
    return b.lengthCm - a.lengthCm;
  });

  const playerRank = allEntries.findIndex((e) => e.isPlayer) + 1;
  const isWinner = playerRank === 1 && !(playerRecord?.snapped);

  useEffect(() => {
    if (isWinner) {
      sounds.playFanfare();
      // Burst celebratory confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Safe fallback
      }
    }
  }, [isWinner]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-amber-300 relative overflow-hidden">
        {/* Decorative Top Banner */}
        <div className="text-center space-y-1.5 mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold font-mono">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>OFFICIAL STALL WEIGH-IN · ROUND {roundNumber} OF {totalRounds}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900">
            {isWinner
              ? '👑 BIGGEST UNBROKEN LOG VICTORY!'
              : playerRecord?.snapped
              ? '💥 PREMATURE SNAP DISASTER!'
              : `STALL RANK: #${playerRank} PLACE`}
          </h2>
          <p className="text-sm text-slate-600">
            {stageName}
          </p>
        </div>

        {/* Player Snapshot Highlight Card */}
        {playerRecord && (
          <div
            className={`p-4 rounded-2xl mb-5 border ${
              isWinner
                ? 'bg-gradient-to-r from-amber-50 to-yellow-100 border-amber-300'
                : playerRecord.snapped
                ? 'bg-rose-50 border-rose-200'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Your Log Statistics
              </span>
              {playerRecord.cleanCut ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" /> Clean Snip Bonus (+30%)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                  <AlertOctagon className="w-3.5 h-3.5" /> Fractured / Snapped
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/50">
                <div className="text-xs text-slate-500 font-mono">Length</div>
                <div className="text-xl font-black font-mono text-amber-950">
                  {playerRecord.lengthCm.toFixed(1)} cm
                </div>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/50">
                <div className="text-xs text-slate-500 font-mono">Weight</div>
                <div className="text-xl font-black font-mono text-amber-950">
                  {Math.round(playerRecord.weightGrams)} g
                </div>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/50">
                <div className="text-xs text-slate-500 font-mono">Total Score</div>
                <div className="text-xl font-black font-mono text-emerald-700">
                  {playerRecord.totalPoints} pts
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Stall Contestants Leaderboard */}
        <div className="space-y-2 mb-6 max-h-56 overflow-y-auto pr-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">
            Stall Leaderboard (Continuous Piece Size)
          </div>

          {allEntries.map((entry, index) => {
            const isTop = index === 0;
            return (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  entry.isPlayer
                    ? 'ring-2 ring-amber-500 bg-amber-50/60 border-amber-200 font-semibold'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 text-sm font-bold font-mono text-slate-500 text-center">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </span>
                  <span className="text-xl">{entry.avatarEmoji}</span>
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{entry.name}</span>
                      {entry.isPlayer && (
                        <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {entry.snapped ? (
                        <span className="text-rose-600 font-medium">Premature Snap (Lost continuous log)</span>
                      ) : (
                        <span>Clean Cut · {Math.round(entry.weightGrams)}g mass</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className={`text-base font-black ${isTop ? 'text-amber-800' : 'text-slate-800'}`}>
                    {entry.lengthCm.toFixed(1)} cm
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {entry.score} pts
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Next / Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          {isWinner ? (
            roundNumber < totalRounds ? (
              <button
                type="button"
                onClick={onNextStage}
                className="w-full sm:flex-1 py-3 px-5 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>Advance to Next Stall Derby</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onMainMenu}
                className="w-full sm:flex-1 py-3 px-5 rounded-xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 hover:brightness-105 text-white flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Claim World Porcelain Trophy!</span>
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={onRetry}
              className="w-full sm:flex-1 py-3 px-5 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry This Stall</span>
            </button>
          )}

          <button
            type="button"
            onClick={onMainMenu}
            className="w-full sm:w-auto py-3 px-4 rounded-xl font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm transition-all cursor-pointer"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};
