import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Sparkles, Trophy, RotateCcw, AlertTriangle, ShieldCheck, Target, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameMode, GameState, PoopExpression, Competitor, DietModifier, SnipRecord } from './types/game';
import { DIET_MODIFIERS, ALL_COMPETITORS, TOURNAMENT_STAGES } from './utils/gameData';
import { sounds, triggerHaptic } from './utils/audio';
import { TopNavBar } from './components/TopNavBar';
import { PoopLogCanvas } from './components/PoopLogCanvas';
import { CompetitorStallCard } from './components/CompetitorStallCard';
import { StrainControlPanel } from './components/StrainControlPanel';
import { ScoreRevealCardModal } from './components/ScoreRevealCardModal';
import { DietSelector } from './components/DietSelector';
import { HowToPlayModal } from './components/HowToPlayModal';
import { HallOfFameModal } from './components/HallOfFameModal';

export default function App() {
  // Game Navigation & State
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [gameMode, setGameMode] = useState<GameMode>('DERBY');
  const [stageIndex, setStageIndex] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showHallOfFame, setShowHallOfFame] = useState<boolean>(false);

  // Selected Diet Modifier
  const [selectedDiet, setSelectedDiet] = useState<DietModifier>(DIET_MODIFIERS[0]);

  // Player Poop Physics State
  const [lengthCm, setLengthCm] = useState<number>(0);
  const [weightGrams, setWeightGrams] = useState<number>(0);
  const [tension, setTension] = useState<number>(0);
  const [isPushing, setIsPushing] = useState<boolean>(false);
  const [isFarting, setIsFarting] = useState<boolean>(false);
  const [isSnipping, setIsSnipping] = useState<boolean>(false);
  const [isQuickSnipping, setIsQuickSnipping] = useState<boolean>(false);
  const [isCheekSpread, setIsCheekSpread] = useState<boolean>(false);
  const [isSnapped, setIsSnapped] = useState<boolean>(false);
  const [cleanCut, setCleanCut] = useState<boolean>(false);
  const [expression, setExpression] = useState<PoopExpression>('curious');

  // Interactive Flush & Vortex States
  const [isFlushing, setIsFlushing] = useState<boolean>(false);
  const [awaitingFlush, setAwaitingFlush] = useState<boolean>(false);

  // Precision Target for Precision Snip Mode
  const [precisionTargetCm, setPrecisionTargetCm] = useState<number>(26.0);

  // Competitors in current stage
  const [competitors, setCompetitors] = useState<Competitor[]>([]);

  // Round Results & Records
  const [lastSnipRecord, setLastSnipRecord] = useState<SnipRecord | null>(null);
  const [bestRecords, setBestRecords] = useState<SnipRecord[]>(() => {
    try {
      const saved = localStorage.getItem('msa_records');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [tournamentsWon, setTournamentsWon] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('msa_trophies') || 0);
    } catch {
      return 0;
    }
  });

  const currentStage = TOURNAMENT_STAGES[stageIndex] || TOURNAMENT_STAGES[0];
  const waterDepth = gameMode === 'ENDLESS_LOG' ? 999 : currentStage.waterDepthCm;
  const waterRemaining = waterDepth - lengthCm;

  // Sound toggle sync
  const handleToggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  // Initialize competitors for a stage
  const setupStageCompetitors = useCallback((sIndex: number) => {
    const stage = TOURNAMENT_STAGES[sIndex] || TOURNAMENT_STAGES[0];
    const rivals = stage.opponentIds.map((id) => {
      const base = ALL_COMPETITORS[id];
      return {
        ...base,
        currentLength: 0,
        currentWeight: 0,
        tension: 0,
        status: 'ready' as const,
        score: 0
      };
    });
    setCompetitors(rivals);
  }, []);

  // Start a new match
  const handleStartMatch = (mode: GameMode = 'DERBY') => {
    sounds.playClick();
    setGameMode(mode);
    if (mode === 'PRECISION_SNIP') {
      const target = Number((18 + Math.random() * 20).toFixed(1));
      setPrecisionTargetCm(target);
    }
    setGameState('SELECT_DIET');
  };

  // Confirm diet and begin the active play round
  const handleConfirmDiet = () => {
    sounds.playClick();
    setLengthCm(0);
    setWeightGrams(0);
    setTension(0);
    setIsPushing(false);
    setIsFarting(false);
    setIsSnipping(false);
    setIsQuickSnipping(false);
    setIsCheekSpread(false);
    setIsSnapped(false);
    setCleanCut(false);
    setExpression('curious');
    setLastSnipRecord(null);

    setupStageCompetitors(stageIndex);
    setIsFlushing(false);
    setAwaitingFlush(false);
    setGameState('PLAYING');
  };

  // Interactive Whirlpool Flush Action
  const handleTriggerFlush = useCallback(() => {
    if (isFlushing) return;
    triggerHaptic([60, 40, 100, 60, 180, 80, 240]);
    sounds.playFlush(true);
    setIsFlushing(true);
    setAwaitingFlush(false);
  }, [isFlushing]);

  const handleFlushComplete = useCallback(() => {
    setIsFlushing(false);
    setAwaitingFlush(false);
    setGameState('ROUND_SUMMARY');
  }, []);

  // The Push / Strain action
  const handlePushStart = useCallback(() => {
    if (gameState !== 'PLAYING' || isSnapped || isSnipping) return;
    setIsPushing(true);
    sounds.playStrain(0.6);
  }, [gameState, isSnapped, isSnipping]);

  const handlePushEnd = useCallback(() => {
    setIsPushing(false);
  }, []);

  // Fart Boost action
  const handleFartStart = useCallback(() => {
    if (gameState !== 'PLAYING' || isSnapped || isSnipping || lengthCm < 0.5) return;
    setIsFarting(true);
  }, [gameState, isSnapped, isSnipping, lengthCm]);

  const handleFartEnd = useCallback(() => {
    setIsFarting(false);
  }, []);

  // SPREAD ASSCHEEKS & QUICK SNIP (Triggered via Shift key or dedicated button)
  const handleQuickSnipSpread = useCallback(() => {
    if (gameState !== 'PLAYING' || lengthCm < 2 || isSnapped || isSnipping) return;

    setIsPushing(false);
    setIsCheekSpread(true);
    setIsQuickSnipping(true);
    setIsSnipping(true);

    sounds.playCheekSpread();
    sounds.playQuickSnip();

    // Instantly relieve sphincter tension
    setTension(0);

    setTimeout(() => {
      setCleanCut(true);
      setExpression('triumphant');

      // Calculate score with Spread Asscheeks Bonus
      const lengthBonus = lengthCm * 20;
      const weightBonus = weightGrams * 0.8;
      const cleanBonus = 160;
      const spreadBonus = 50; // Special style bonus for spread cheek quick pinch
      const totalPoints = Math.round(lengthBonus + weightBonus + cleanBonus + spreadBonus);

      const record: SnipRecord = {
        lengthCm,
        weightGrams,
        cleanCut: true,
        waterHit: false,
        snapped: false,
        peakTension: tension,
        expression: 'triumphant',
        cleanBonus: cleanBonus + spreadBonus,
        weightBonus: Math.round(weightBonus),
        totalPoints,
        timestamp: Date.now()
      };

      setLastSnipRecord(record);
      saveRecord(record);

      // Prompt player to flush the specimen down the toilet!
      setTimeout(() => {
        setAwaitingFlush(true);
      }, 750);
    }, 280);
  }, [gameState, lengthCm, isSnapped, isSnipping, weightGrams, tension]);

  // The Decisive Regular Snip Action
  const handleSnip = useCallback(() => {
    if (gameState !== 'PLAYING' || lengthCm < 2 || isSnapped || isSnipping) return;

    setIsPushing(false);
    setIsSnipping(true);
    setIsQuickSnipping(false);
    sounds.playSnip();

    setTimeout(() => {
      setCleanCut(true);
      setExpression('triumphant');

      // Calculate score
      const lengthBonus = lengthCm * 20;
      const weightBonus = weightGrams * 0.8;
      const cleanBonus = 150;
      const totalPoints = Math.round(lengthBonus + weightBonus + cleanBonus);

      const record: SnipRecord = {
        lengthCm,
        weightGrams,
        cleanCut: true,
        waterHit: false,
        snapped: false,
        peakTension: tension,
        expression: 'triumphant',
        cleanBonus,
        weightBonus: Math.round(weightBonus),
        totalPoints,
        timestamp: Date.now()
      };

      setLastSnipRecord(record);
      saveRecord(record);

      // Prompt player to pull flush
      setTimeout(() => {
        setAwaitingFlush(true);
      }, 750);
    }, 350);
  }, [gameState, lengthCm, isSnapped, isSnipping, weightGrams, tension]);

  // Handle premature snap
  const triggerPrematureSnap = useCallback(() => {
    setIsPushing(false);
    setIsSnapped(true);
    setExpression('snapped');
    sounds.playSnapBreak();

    setTimeout(() => {
      sounds.playPlop(0.5);
      const penaltyScore = Math.max(0, Math.round(lengthCm * 4));
      const record: SnipRecord = {
        lengthCm: Number((lengthCm * 0.35).toFixed(1)), // Only remaining fragment counts
        weightGrams: Number((weightGrams * 0.35).toFixed(1)),
        cleanCut: false,
        waterHit: false,
        snapped: true,
        peakTension: 100,
        expression: 'snapped',
        cleanBonus: 0,
        weightBonus: 0,
        totalPoints: penaltyScore,
        timestamp: Date.now()
      };
      setLastSnipRecord(record);
      saveRecord(record);

      setTimeout(() => {
        setAwaitingFlush(true);
      }, 800);
    }, 400);
  }, [lengthCm, weightGrams]);

  // Save record to local storage
  const saveRecord = (rec: SnipRecord) => {
    setBestRecords((prev) => {
      const updated = [rec, ...prev].slice(0, 20);
      try {
        localStorage.setItem('msa_records', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Keyboard shortcut listeners (Space = push, Enter = snip, Shift = spread asscheeks quick snip, F = fart boost, Flush = Space/Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (awaitingFlush) {
        if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyF') {
          e.preventDefault();
          handleTriggerFlush();
          return;
        }
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (!isPushing) handlePushStart();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        if (!isFarting) handleFartStart();
      } else if (e.key === 'Shift' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        e.preventDefault();
        handleQuickSnipSpread();
      } else if (e.code === 'Enter') {
        e.preventDefault();
        handleSnip();
      } else if (e.code === 'KeyM') {
        handleToggleSound();
      } else if (e.code === 'Escape') {
        setShowHelp(false);
        setShowHallOfFame(false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handlePushEnd();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        handleFartEnd();
      } else if (e.key === 'Shift' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        if (!isSnipping) {
          setIsCheekSpread(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handlePushStart, handlePushEnd, handleFartStart, handleFartEnd, handleSnip, handleQuickSnipSpread, handleTriggerFlush, awaitingFlush, isPushing, isFarting, isSnipping]);

  // Active Game Loop Physics & Competitor AI Simulation
  useEffect(() => {
    if (gameState !== 'PLAYING' || isSnipping || isSnapped) return;

    const interval = setInterval(() => {
      // 1. Player Physics Update
      if (isFarting) {
        // High-velocity gaseous thrust downward + pressure relief!
        setLengthCm((prev) => {
          const speed = 4.8 * selectedDiet.pushSpeedMult;
          const next = prev + speed * 0.05;
          setWeightGrams(next * 12.5 * selectedDiet.bonusWeightMult);

          if (next >= waterDepth) {
            triggerPrematureSnap();
            return waterDepth;
          }
          return next;
        });

        // Fart vents gas and relieves sphincter tension!
        setTension((prev) => Math.max(0, prev - 2.2));
      } else if (isPushing) {
        setLengthCm((prev) => {
          const speed = 2.6 * selectedDiet.pushSpeedMult;
          const next = prev + speed * 0.05;

          // Estimate weight based on density & volume (cross section * length)
          setWeightGrams(next * 12.5 * selectedDiet.bonusWeightMult);

          // Check for water touch limit
          if (next >= waterDepth) {
            triggerPrematureSnap();
            return waterDepth;
          }

          return next;
        });

        // Tension increases while pushing, accelerating as log gets longer
        setTension((prev) => {
          const baseRate = 1.35 * selectedDiet.tensionRiseMult;
          const lengthWeightFactor = 1 + (lengthCm / 20) * (1 / selectedDiet.tensileStrengthMult);
          const next = prev + baseRate * lengthWeightFactor;

          if (next >= 100) {
            triggerPrematureSnap();
            return 100;
          }

          if (next > 80 && Math.random() < 0.2) {
            sounds.playTensionWarning();
          }

          return next;
        });

        // Squeak periodically
        if (Math.random() < 0.15) {
          sounds.playSqueak(1 + Math.random() * 0.4);
        }
      } else {
        // When not pushing, sphincter tension gradually relaxes!
        setTension((prev) => Math.max(0, prev - 1.8));
      }

      // Update emotive expression
      if (tension > 85) {
        setExpression('panicked');
      } else if (tension > 55 || isPushing) {
        setExpression('sweating');
      } else if (lengthCm > 25) {
        setExpression('determined');
      } else if (lengthCm > 10) {
        setExpression('happy');
      } else {
        setExpression('curious');
      }

      // 2. Competitor AI Simulation
      setCompetitors((prevCompetitors) => {
        return prevCompetitors.map((comp) => {
          if (comp.status === 'snipped' || comp.status === 'snapped') {
            return comp;
          }

          // Decide whether bot pushes or pauses
          const isBotPushing = Math.random() < 0.85;
          let newLength = comp.currentLength;
          let newTension = comp.tension;
          let newStatus = comp.status;

          if (isBotPushing) {
            newStatus = 'pushing';
            newLength += comp.pushSpeed * 0.05 * (0.8 + Math.random() * 0.4);
            newTension += 1.4 * (1 + newLength / 35);
          } else {
            newTension = Math.max(0, newTension - 2.0);
          }

          const newWeight = newLength * 12.0;

          // Check if bot snaps
          if (newLength >= comp.tensileLimit || newTension >= 100) {
            return {
              ...comp,
              status: 'snapped',
              currentLength: Number((newLength * 0.35).toFixed(1)),
              currentWeight: Number((newWeight * 0.35).toFixed(1)),
              dialogue: "Darn it! Lost my continuous piece!",
              score: Math.round(newLength * 5)
            };
          }

          // Check if bot reaches target and snips!
          if (newLength >= comp.targetLength || (newTension > 85 && Math.random() < 0.4)) {
            const score = Math.round(newLength * 20 + newWeight * 0.7 + 120);
            return {
              ...comp,
              status: 'snipped',
              currentLength: Number(newLength.toFixed(1)),
              currentWeight: Number(newWeight.toFixed(1)),
              dialogue: `Snipped clean at ${newLength.toFixed(1)} cm!`,
              score
            };
          }

          return {
            ...comp,
            status: newStatus,
            currentLength: newLength,
            currentWeight: newWeight,
            tension: newTension
          };
        });
      });
    }, 50);

    return () => clearInterval(interval);
  }, [
    gameState,
    isPushing,
    isSnipping,
    isSnapped,
    lengthCm,
    selectedDiet,
    waterDepth,
    tension,
    triggerPrematureSnap
  ]);

  // Advance to next stage in Derby tournament
  const handleNextStage = () => {
    sounds.playFlush();
    if (stageIndex < TOURNAMENT_STAGES.length - 1) {
      setStageIndex((prev) => prev + 1);
      setGameState('SELECT_DIET');
    } else {
      // Tournament Won!
      setTournamentsWon((prev) => {
        const next = prev + 1;
        try {
          localStorage.setItem('msa_trophies', String(next));
        } catch {
          // ignore
        }
        return next;
      });
      setGameState('TOURNAMENT_WIN');
    }
  };

  const handleRetryStage = () => {
    sounds.playFlush();
    handleConfirmDiet();
  };

  const handleMainMenu = () => {
    sounds.playClick();
    setStageIndex(0);
    setGameState('TITLE_MENU');
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/50 text-slate-900">
      {/* Top Navigation Bar */}
      <TopNavBar
        currentMode={gameMode}
        onSelectMode={(mode) => {
          setGameMode(mode);
          handleStartMatch(mode);
        }}
        onOpenHelp={() => setShowHelp(true)}
        onOpenRecords={() => setShowHallOfFame(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {/* TITLE MENU VIEW */}
        {gameState === 'TITLE_MENU' && (
          <div className="max-w-3xl mx-auto w-full text-center space-y-7 py-6 sm:py-10">
            {/* Mascot & Title Lockup */}
            <div className="space-y-3">
              <div className="text-6xl sm:text-7xl animate-float-bob inline-block select-none" role="img" aria-label="Porcelain Toilet Champion">
                🚽✨
              </div>
              <h1 className="text-4xl sm:text-6xl font-display font-black tracking-tight text-amber-950">
                My Second Asshole
              </h1>
              <p className="text-base sm:text-lg text-amber-900/80 max-w-xl mx-auto leading-relaxed">
                The high-stakes porcelain derby! Strain, produce length, and strategically snip the largest unbroken emotive poop to dominate your toilet rivals.
              </p>
            </div>

            {/* Game Mode Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              {/* Stall Derby Tournament */}
              <button
                type="button"
                onClick={() => handleStartMatch('DERBY')}
                className="p-5 rounded-2xl bg-white border-2 border-amber-300 hover:border-amber-500 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">🏆</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-mono">
                    3 STAGES
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                  Stall Derby
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Compete across 3 authentic bathrooms. Out-snip Taco Chad, Prune Penny, and Big Tony for the Golden Plunger!
                </p>
              </button>

              {/* Endless Mega-Log */}
              <button
                type="button"
                onClick={() => handleStartMatch('ENDLESS_LOG')}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">🐍</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-mono">
                    NO WATER CAP
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                  Endless Log
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Test the limits of your sphincter tensile strength. Push out the longest unbroken monster continuous log without snapping!
                </p>
              </button>

              {/* Precision Snip */}
              <button
                type="button"
                onClick={() => handleStartMatch('PRECISION_SNIP')}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">🎯</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-900 px-2 py-0.5 rounded font-mono">
                    TARGET CM
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                  Precision Snip
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Hit the exact centimeter target demanded by the master plumbing inspector. Extreme timing required.
                </p>
              </button>
            </div>

            {/* Quick Play CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleStartMatch('DERBY')}
                className="w-full sm:w-auto min-w-[280px] py-4 px-8 rounded-2xl font-display font-black text-white text-xl bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-600 hover:brightness-105 shadow-lg active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center gap-2.5"
              >
                <Play className="w-6 h-6 fill-white" />
                <span>START STALL DERBY</span>
              </button>
            </div>
          </div>
        )}

        {/* DIET SELECTION VIEW */}
        {gameState === 'SELECT_DIET' && (
          <DietSelector
            selectedDiet={selectedDiet}
            onSelectDiet={setSelectedDiet}
            onConfirm={handleConfirmDiet}
            stageTitle={gameMode === 'DERBY' ? currentStage.name : undefined}
          />
        )}

        {/* ACTIVE PLAYING VIEW (Compact Unified Viewport) */}
        {gameState === 'PLAYING' && (
          <div className="space-y-2.5 max-w-5xl mx-auto w-full">
            {/* Slim Header Telemetry Bar */}
            <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white/90 backdrop-blur-xs rounded-xl border border-amber-200 shadow-2xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl shrink-0">🚽</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                    <span className="font-bold text-amber-800 uppercase">
                      {gameMode === 'DERBY'
                        ? `Round ${stageIndex + 1}/${TOURNAMENT_STAGES.length}`
                        : gameMode === 'ENDLESS_LOG'
                        ? 'Endless Drop'
                        : `Target ${precisionTargetCm.toFixed(1)}cm`}
                    </span>
                    <span>·</span>
                    <span className="truncate">{selectedDiet.icon} {selectedDiet.name}</span>
                  </div>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {gameMode === 'DERBY' ? currentStage.name : 'Porcelain Battle Coliseum'}
                  </h2>
                </div>
              </div>

              {/* Status Badge & Interactive Flush Button */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => sounds.playFlush()}
                  title="Click to flush toilet bowl"
                  className="px-2.5 py-1 text-[11px] font-mono font-bold bg-sky-100 hover:bg-sky-200 text-sky-800 rounded-lg border border-sky-300 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>💧 Flush</span>
                </button>

                <span
                  className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border ${
                    isFarting
                      ? 'bg-lime-100 text-lime-900 border-lime-300 animate-pulse'
                      : isPushing
                      ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {isFarting ? '💨 FART THRUST!' : isPushing ? '🔥 STRAINING' : 'POISED'}
                </span>
              </div>
            </div>

            {/* Unified 2-Column Battle Arena: Fits on One Screen */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
              {/* Left / Center 8 Columns: Main Toilet Stage & Docked Controls */}
              <div className="lg:col-span-8 flex flex-col space-y-2">
                {/* Poop Physics Canvas with Animated Toilet */}
                <div className="relative h-[320px] sm:h-[390px] w-full">
                  <PoopLogCanvas
                    lengthCm={lengthCm}
                    weightGrams={weightGrams}
                    maxWaterDepthCm={waterDepth}
                    tension={tension}
                    isPushing={isPushing}
                    isFarting={isFarting}
                    isSnipping={isSnipping}
                    isQuickSnipping={isQuickSnipping}
                    isCheekSpread={isCheekSpread}
                    isSnapped={isSnapped}
                    isFlushing={isFlushing}
                    expression={expression}
                    cleanCut={cleanCut}
                    onFlushClick={handleTriggerFlush}
                    onFlushComplete={handleFlushComplete}
                  />

                  {/* Water Danger Alert Banner */}
                  {waterRemaining <= 8 && !isSnapped && !isSnipping && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-rose-600 text-white font-mono font-bold text-[11px] shadow-md animate-bounce flex items-center gap-1 z-20">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>WATER HAZARD! SNIP NOW!</span>
                    </div>
                  )}

                  {/* Clean Snip Celebration Flash */}
                  {cleanCut && (
                    <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/10 pointer-events-none z-20">
                      <div className="p-3.5 bg-white/95 rounded-2xl shadow-xl border border-emerald-300 text-center animate-in zoom-in-75 duration-200">
                        <span className="text-2xl block mb-0.5">
                          {isQuickSnipping ? '⚡🍑✂️' : '✂️✨'}
                        </span>
                        <div className="text-lg font-display font-black text-emerald-800">
                          {isQuickSnipping ? 'SPREAD & QUICK SNIP!' : 'CLEAN SNIP!'}
                        </div>
                        <div className="text-xs font-mono text-emerald-600">
                          Locked in: {lengthCm.toFixed(1)} cm · {Math.round(weightGrams)}g
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tactile Control Panel Docked Cleanly */}
                <StrainControlPanel
                  lengthCm={lengthCm}
                  weightGrams={weightGrams}
                  tension={tension}
                  waterRemainingCm={waterRemaining}
                  isPushing={isPushing}
                  isFarting={isFarting}
                  isPlaying={gameState === 'PLAYING' && !isSnipping && !isSnapped}
                  isCheekSpread={isCheekSpread}
                  awaitingFlush={awaitingFlush}
                  isFlushing={isFlushing}
                  expression={expression}
                  onPushStart={handlePushStart}
                  onPushEnd={handlePushEnd}
                  onFartStart={handleFartStart}
                  onFartEnd={handleFartEnd}
                  onSnip={handleSnip}
                  onQuickSnipSpread={handleQuickSnipSpread}
                  onFlush={handleTriggerFlush}
                  onToggleCheekSpread={() => setIsCheekSpread(!isCheekSpread)}
                />
              </div>

              {/* Right 4 Columns: Adjacent Stalls Strip & Strategy Tips */}
              <div className="lg:col-span-4 flex flex-col space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    Adjacent Stalls Telemetry
                  </h3>
                  <span className="text-[10px] text-amber-700 font-mono font-semibold">
                    Live Race
                  </span>
                </div>

                {/* Competitors List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                  {competitors.map((comp) => (
                    <CompetitorStallCard
                      key={comp.id}
                      competitor={comp}
                    />
                  ))}
                </div>

                {/* Precision Target Goal Card if in Precision Mode */}
                {gameMode === 'PRECISION_SNIP' && (
                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900">
                      <Target className="w-3.5 h-3.5 text-sky-600" />
                      <span>Inspector Target</span>
                    </div>
                    <div className="text-xl font-black font-mono text-sky-950">
                      {precisionTargetCm.toFixed(1)} cm
                    </div>
                    <p className="text-[11px] text-sky-700">
                      Snip as close to this exact length as possible.
                    </p>
                  </div>
                )}

                {/* Quick Controls Cheat Sheet Box */}
                <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-950 space-y-1 font-mono">
                  <div className="font-bold flex items-center gap-1 text-amber-900">
                    <span>🎮 KEYBOARD SHORTCUTS:</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>[SPACEBAR]</span> <span className="font-semibold text-amber-900">Push / Strain</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>[F]</span> <span className="font-semibold text-lime-700">Fart Boost</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>[SHIFT]</span> <span className="font-semibold text-orange-700">Spread & Quick Snip</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>[ENTER]</span> <span className="font-semibold text-rose-700">Clean Snip</span>
                  </div>
                  <div className="flex justify-between text-slate-700 pt-0.5 border-t border-amber-200/60">
                    <span>[FLUSH]</span> <span className="font-semibold text-sky-700">Enter / Space (When Dropped)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TOURNAMENT WINNER VIEW */}
        {gameState === 'TOURNAMENT_WIN' && (
          <div className="max-w-xl mx-auto w-full text-center space-y-6 py-10 bg-white rounded-3xl p-8 border-2 border-amber-400 shadow-xl">
            <div className="text-6xl animate-bounce">🏆🚽👑</div>
            <div className="space-y-2">
              <span className="text-xs font-bold font-mono text-amber-800 uppercase tracking-widest bg-amber-100 px-3 py-1 rounded-full">
                World Champion of the Stall
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-black text-amber-950">
                The Golden Plunger Is Yours!
              </h2>
              <p className="text-sm text-slate-600">
                You out-strained and out-snipped the greatest porcelain contenders in history. Your continuous logs have been etched into bathroom legend.
              </p>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center">
              <div className="text-xs font-mono text-amber-800">Total Championships Won</div>
              <div className="text-3xl font-black font-mono text-amber-950 mt-1">
                {tournamentsWon} 🏆
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => handleStartMatch('DERBY')}
                className="py-3 px-6 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md transition-all cursor-pointer"
              >
                Defend Title in Another Derby
              </button>
              <button
                type="button"
                onClick={handleMainMenu}
                className="py-3 px-5 rounded-xl font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
              >
                Main Menu
              </button>
            </div>
          </div>
        )}
      </main>

      {/* STYLISED SCORE REVEAL CARD & SPECIMEN AUTOPSY MODAL */}
      {gameState === 'ROUND_SUMMARY' && (
        <ScoreRevealCardModal
          playerRecord={lastSnipRecord}
          competitors={competitors}
          roundNumber={stageIndex + 1}
          totalRounds={TOURNAMENT_STAGES.length}
          stageName={currentStage.name}
          isQuickSnipped={isQuickSnipping}
          onNextStage={handleNextStage}
          onRetry={handleRetryStage}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* HOW TO PLAY MODAL */}
      <HowToPlayModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />

      {/* HALL OF FAME MODAL */}
      <HallOfFameModal
        isOpen={showHallOfFame}
        onClose={() => setShowHallOfFame(false)}
        bestRecords={bestRecords}
        tournamentsWon={tournamentsWon}
        onClearRecords={() => {
          setBestRecords([]);
          try {
            localStorage.removeItem('msa_records');
          } catch {
            // ignore
          }
        }}
      />

      {/* PERSISTENT MANDATORY LEGAL / SAFETY NOTICE FOOTER */}
      <footer className="mt-auto border-t border-amber-200/60 bg-white/90 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium text-slate-700">
              Receive-only RF monitoring:
            </span>
            <span className="text-slate-500">
              This app observes radio-frequency activity only. It does not block, jam, or transmit signals.
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            My Second Asshole · The Porcelain Derby
          </div>
        </div>
      </footer>
    </div>
  );
}
