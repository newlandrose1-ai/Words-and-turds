import React from 'react';
import { X, Trophy, Award, Sparkles, Trash2 } from 'lucide-react';
import { SnipRecord } from '../types/game';

interface HallOfFameModalProps {
  isOpen: boolean;
  onClose: () => void;
  bestRecords: SnipRecord[];
  tournamentsWon: number;
  onClearRecords: () => void;
}

export const HallOfFameModal: React.FC<HallOfFameModalProps> = ({
  isOpen,
  onClose,
  bestRecords,
  tournamentsWon,
  onClearRecords
}) => {
  if (!isOpen) return null;

  const longestLog = bestRecords.length
    ? Math.max(...bestRecords.map((r) => r.lengthCm))
    : 0;

  const heaviestLog = bestRecords.length
    ? Math.max(...bestRecords.map((r) => r.weightGrams))
    : 0;

  const highestScore = bestRecords.length
    ? Math.max(...bestRecords.map((r) => r.totalPoints))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-amber-300 relative overflow-hidden">
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

        {/* Highlights Cards */}
        <div className="grid grid-cols-3 gap-2.5 my-4">
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center">
            <span className="text-xs font-semibold text-amber-800">Longest Unbroken</span>
            <div className="text-xl font-black font-mono text-amber-950 mt-1">
              {longestLog.toFixed(1)} <span className="text-xs font-normal">cm</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
            <span className="text-xs font-semibold text-emerald-800">Heaviest Piece</span>
            <div className="text-xl font-black font-mono text-emerald-950 mt-1">
              {Math.round(heaviestLog)} <span className="text-xs font-normal">g</span>
            </div>
          </div>
          <div className="p-3 bg-yellow-50 rounded-2xl border border-yellow-200 text-center">
            <span className="text-xs font-semibold text-yellow-800">Tournaments</span>
            <div className="text-xl font-black font-mono text-yellow-950 mt-1 flex items-center justify-center gap-1">
              <span>{tournamentsWon}</span>
              <Award className="w-4 h-4 text-amber-600 inline" />
            </div>
          </div>
        </div>

        {/* Records list */}
        <div className="space-y-2 mb-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
            Recent Snip Records
          </div>

          {bestRecords.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400 italic bg-slate-50 rounded-2xl">
              No snip records logged yet. Enter the stall and make history!
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {bestRecords.slice(0, 10).map((rec, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-400">#{i + 1}</span>
                    <span className="font-bold text-slate-900">
                      {rec.lengthCm.toFixed(1)} cm
                    </span>
                    <span className="text-slate-500">
                      ({Math.round(rec.weightGrams)}g)
                    </span>
                    {rec.cleanCut && (
                      <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        CLEAN
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-amber-800">
                    {rec.totalPoints} pts
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
