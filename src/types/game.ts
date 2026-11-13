export type GameState = 
  | 'TITLE_MENU'
  | 'SELECT_DIET'
  | 'COUNTDOWN'
  | 'PLAYING'
  | 'SNIPPED_REVEAL'
  | 'ROUND_SUMMARY'
  | 'TOURNAMENT_WIN'
  | 'GAME_OVER';

export type GameMode = 'DERBY' | 'ENDLESS_LOG' | 'PRECISION_SNIP';

export type PoopExpression = 
  | 'curious'      // initial 0-10 cm
  | 'happy'        // 10-25 cm
  | 'determined'   // 25-45 cm
  | 'sweating'     // high tension / strain
  | 'panicked'     // critical danger zone > 80% tension
  | 'screaming'    // near snap limit
  | 'triumphant'   // clean snip executed!
  | 'snapped';     // broke prematurely!

export interface Competitor {
  id: string;
  name: string;
  title: string;
  avatarEmoji: string;
  stallNumber: number;
  personality: 'steady' | 'greedy' | 'reckless' | 'perfectionist';
  targetLength: number; // in cm
  pushSpeed: number; // cm per sec
  tensileLimit: number; // max cm before snap
  currentLength: number; // current cm in round
  currentWeight: number; // grams
  tension: number; // 0 - 100%
  status: 'ready' | 'pushing' | 'snipped' | 'snapped';
  snipTime?: number;
  isPlayer?: boolean;
  score: number;
  dialogue: string;
}

export interface DietModifier {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  pushSpeedMult: number;
  tensileStrengthMult: number;
  tensionRiseMult: number;
  bonusWeightMult: number;
  description: string;
}

export interface StageConfig {
  id: number;
  name: string;
  subtitle: string;
  location: string;
  targetGoalCm?: number;
  opponentIds: string[];
  ambientColor: string;
  waterDepthCm: number; // distance from porcelain exit to water
}

export type PoopQualityTier =
  | 'coarse'        // 0 - 29%
  | 'smooth'        // 30 - 54%
  | 'artisanal'     // 55 - 74%
  | 'sentient'      // 75 - 89%
  | 'transcendent'; // 90 - 100%

export interface QualityAchievement {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlockedAt?: number;
}

export interface SnipRecord {
  lengthCm: number;
  weightGrams: number;
  cleanCut: boolean;
  waterHit: boolean;
  snapped: boolean;
  peakTension: number;
  expression: PoopExpression;
  cleanBonus: number;
  weightBonus: number;
  totalPoints: number;
  timestamp: number;
  qualityScore?: number; // 0 - 100%
  qualityTier?: PoopQualityTier;
  qualityMultiplier?: number; // 1.0x - 2.5x
  qualityBonus?: number;
  emotionsExperiencedCount?: number;
  unlockedAchievementIds?: string[];
}
