import React from 'react';
import { Competitor } from '../types/game';

interface CompetitorStallCardProps {
  competitor: Competitor;
  rank?: number;
  isLeading?: boolean;
}

export const CompetitorStallCard: React.FC<CompetitorStallCardProps> = ({
  competitor,
  rank,
  isLeading
}) => {
  const isPushing = competitor.status === 'pushing';
  const isSnipped = competitor.status === 'snipped';
  const isSnapped = competitor.status === 'snapped';

  return (
    <div
      className={`relative p-2.5 rounded-xl border transition-all duration-150 ${
        isSnapped
          ? 'bg-rose-50/90 border-rose-200'
          : isSnipped
          ? 'bg-emerald-50/90 border-emerald-300 shadow-2xs'
          : isPushing
          ? 'bg-amber-50/90 border-amber-300'
          : 'bg-white border-slate-200/90'
      } ${isPushing ? 'animate-strain' : ''}`}
    >
      {/* Header row: Stall Number, Name, Status Badge */}
      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xl shrink-0" role="img" aria-label={competitor.name}>
            {competitor.avatarEmoji}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
              <span className="font-bold">Stall #{competitor.stallNumber}</span>
              {rank && <span className="text-slate-600 font-semibold">· #{rank}</span>}
            </div>
            <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">
              {competitor.name}
            </h4>
          </div>
        </div>

        {/* Status Badge */}
        <div className="shrink-0">
          {isSnapped ? (
            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
              SNAPPED!
            </span>
          ) : isSnipped ? (
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
              SNIPPED ✂️
            </span>
          ) : isPushing ? (
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
              STRAIN 💦
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              READY
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar & Real-time Length */}
      <div className="space-y-1 mb-1">
        <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-700">
          <span className="text-slate-500">Log</span>
          <span className="font-bold text-slate-900">
            {competitor.currentLength.toFixed(1)} cm
          </span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-150 ${
              isSnapped
                ? 'bg-rose-500'
                : isSnipped
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-amber-500 to-amber-700'
            }`}
            style={{ width: `${Math.min(100, (competitor.currentLength / 50) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>{Math.round(competitor.currentWeight)}g</span>
          <span>Tension: {Math.round(competitor.tension)}%</span>
        </div>
      </div>

      {/* Compact Dialogue Quote */}
      <div className="p-1.5 bg-slate-100/70 rounded-lg text-[10.5px] text-slate-700 italic border border-slate-200/50 truncate">
        &ldquo;{competitor.dialogue}&rdquo;
      </div>
    </div>
  );
};
