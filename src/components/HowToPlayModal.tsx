import React from 'react';
import { X, Zap, Scissors, AlertTriangle, ShieldCheck } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-amber-200 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚽</span>
            <h3 className="text-xl font-display font-black text-amber-950">
              How to Win the Porcelain Derby
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

        {/* Content Rules */}
        <div className="py-4 space-y-4 text-sm text-slate-700 max-h-[70vh] overflow-y-auto">
          {/* Rule 1 */}
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold font-mono shrink-0">
              1
            </div>
            <div>
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600" />
                Push & Produce Length
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Press and hold or rapidly tap the <strong>PUSH / STRAIN</strong> button (or hold <strong>[SPACEBAR]</strong>). Watch your emotive poop log emerge, grow longer, and jiggle!
              </p>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold font-mono shrink-0">
              2
            </div>
            <div>
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Manage Tension & The Water Gap
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                As the log gets heavier, the <strong>Sphincter Tension</strong> gauge climbs. Releasing the push button lets tension cool down. If tension hits 100% or the tip touches water before snipping, the log snaps and fractures into penalty nuggets!
              </p>
            </div>
          </div>

          {/* Rule 3 */}
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-xl bg-lime-100 text-lime-800 flex items-center justify-center font-bold font-mono shrink-0">
              3
            </div>
            <div>
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="text-base">💨</span>
                Turbo Fart Boost [F]
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Press and hold <strong>[F]</strong> or click <strong>FART BOOST</strong>! Unleashes high-pressure gaseous thrust that launches the log forward at double speed while rapidly venting sphincter tension!
              </p>
            </div>
          </div>

          {/* Rule 4 */}
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center font-bold font-mono shrink-0">
              4
            </div>
            <div>
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="text-base">🍑</span>
                Spread Asscheeks Quick Snip [SHIFT]
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Need an emergency escape or speed bonus? Press <strong>[SHIFT]</strong> or click <strong>SPREAD & QUICK SNIP</strong>! Your asscheeks dynamically spread apart, instantly relieving sphincter tension and executing a razor-sharp rapid guillotine cut (+50 pts style bonus)!
              </p>
            </div>
          </div>

          {/* Rule 4 */}
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold font-mono shrink-0">
              4
            </div>
            <div>
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-emerald-600" />
                Heavy Thunk Dropping Mechanics
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Once severed, your continuous log accelerates downward under full gravity and smashes into the toilet bowl with a visceral, room-shaking <strong>HEAVY THUNK</strong> sound effect, explosive water droplets, and expanding shockwave ripples!
              </p>
            </div>
          </div>

          {/* Rule 5 */}
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold font-mono shrink-0">
              5
            </div>
            <div>
              <h4 className="font-bold text-slate-900">
                The Official Stall Weigh-In
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Your unbroken piece is weighed and measured against the contestants in adjacent stalls. The player with the single largest unbroken piece wins the round!
              </p>
            </div>
          </div>

          {/* Persistent Legal & Safety Notice */}
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/90 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block">Safety & Compliance Notice:</strong>
              <span>
                Receive-only RF monitoring compliance: This app observes radio-frequency activity only. It does not block, jam, or transmit signals.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white text-sm transition-colors cursor-pointer"
          >
            Got it, Let's Push!
          </button>
        </div>
      </div>
    </div>
  );
};
