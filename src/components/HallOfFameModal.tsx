import React, { useState } from 'react';
import { X, Trophy, Award, Sparkles, Trash2, Heart, Crown } from 'lucide-react';
import { SnipRecord } from '../types/game';
import { QUALITY_TIERS, QUALITY_ACHIEVEMENTS } from '../utils/gameData';

interface HallOfFameModalProps {
  isOpen: boolean;
  onClose: () => void;
  bestRecords: SnipRecord[];
  tournamentsWon: number;
  unlockedAchievementIds?: string[];
  onClearRecords: () => void;
}

export const HallOfFameModal: React.FC<HallOfFameModalProps> = ({
  isOpen,
  onClose,
  bestRecords,
  tournamentsWon,
  unlockedAchievementIds = [],
  onClearRecords
}) => {
  const [activeTab, setActiveTab] = useState<'records' | 'achievements'>('records');

  if (!isOpen) return null;

  const longestLog = bestRecords.length
    ? Math.max(...bestRecords.map((r) => r.lengthCm))
    : 0;

  const heaviestLog = bestRecords.length
    ? Math.max(...bestRecords.map((r) => r.weightGrams))
    : 0;

  const peakQuality = bestRecords.length
    ? Math.max(...bestRecords.map((r) => r.qualityScore ?? 0))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-amber-300 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <h3 className="text-xl font-display font-black text-amber-950">
              The Golden Throne Hall of Fame
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlights Cards (4 columns) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3.5">
          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Longest</span>
            <div className="text-lg font-black font-mono text-amber-950 mt-0.5">
              {longestLog.toFixed(1)} <span className="text-[10px] font-normal">cm</span>
            </div>
          </div>
          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Heaviest</span>
            <div className="text-lg font-black font-mono text-emerald-950 mt-0.5">
              {Math.round(heaviestLog)} <span className="text-[10px] font-normal">g</span>
            </div>
          </div>
          <div className="p-2.5 bg-sky-50 rounded-xl border border-sky-200 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800">Peak Quality</span>
            <div className="text-lg font-black font-mono text-sky-950 mt-0.5">
              {Math.round(peakQuality)}%
            </div>
          </div>
          <div className="p-2.5 bg-yellow-50 rounded-xl border border-yellow-200 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-800">Trophies</span>
            <div className="text-lg font-black font-mono text-yellow-950 mt-0.5 flex items-center justify-center gap-1">
              <span>{tournamentsWon}</span>
              <Award className="w-4 h-4 text-amber-600 inline" />
            </div>
          </div>
        </div>

        {/* Tab Toggle: Recent Records vs Quality Achievements */}
        <div className="flex border-b border-slate-200 mb-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('records')}
            className={`pb-2 px-3 text-xs font-mono font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'records'
                ? 'border-amber-600 text-amber-950'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Recent Snip Records ({bestRecords.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('achievements')}
            className={`pb-2 px-3 text-xs font-mono font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1 ${
              activeTab === 'achievements'
                ? 'border-amber-600 text-amber-950'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <span>Quality Achievements</span>
            <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-full font-bold">
              {unlockedAchievementIds.length}/{QUALITY_ACHIEVEMENTS.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Records list */}
        {activeTab === 'records' && (
          <div className="space-y-2 mb-4">
            {bestRecords.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400 italic bg-slate-50 rounded-2xl">
                No snip records logged yet. Enter the stall and make history!
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {bestRecords.slice(0, 10).map((rec, i) => {
                  const tier = rec.qualityTier || 'smooth';
                  const tierInfo = QUALITY_TIERS[tier];
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-mono transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-400">#{i + 1}</span>
                        <span className="font-bold text-slate-900">
                          {rec.lengthCm.toFixed(1)} cm
                        </span>
                        <span className="text-slate-500">
                          ({Math.round(rec.weightGrams)}g)
                        </span>
                        <span className="text-[11px] text-amber-800 font-bold" title={tierInfo.name}>
                          {tierInfo.icon} {Math.round(rec.qualityScore ?? 50)}%
                        </span>
                        {rec.cleanCut && (
                          <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            CLEAN
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-amber-900">
                        {rec.totalPoints} pts
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Quality Achievements Showcase */}
        {activeTab === 'achievements' && (
          <div className="max-h-56 overflow-y-auto space-y-2 mb-4 pr-1">
            {QUALITY_ACHIEVEMENTS.map((ach) => {
              const isUnlocked = unlockedAchievementIds.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all ${
                    isUnlocked
                      ? 'bg-amber-50/70 border-amber-300/80 shadow-2xs'
                      : 'bg-slate-50/60 border-slate-200 opacity-60'
                  }`}
                >
                  <span className={`text-2xl shrink-0 ${isUnlocked ? '' : 'grayscale'}`}>
                    {ach.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-xs text-slate-900">
                        {ach.name}
                      </span>
                      {isUnlocked ? (
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                          UNLOCKED
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">
                          LOCKED
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      {ach.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action row */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          {bestRecords.length > 0 && (
            <button
              type="button"
              onClick={onClearRecords}
              className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto px-5 py-2 rounded-xl font-bold bg-slate-800 hover:bg-slate-900 text-white text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
