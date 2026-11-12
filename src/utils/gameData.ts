import { Competitor, DietModifier, StageConfig } from '../types/game';

export const DIET_MODIFIERS: DietModifier[] = [
  {
    id: 'balanced',
    name: 'Morning Oatmeal & Fruit',
    icon: '🥣',
    tagline: 'The Standard Champion',
    pushSpeedMult: 1.0,
    tensileStrengthMult: 1.0,
    tensionRiseMult: 1.0,
    bonusWeightMult: 1.0,
    description: 'Perfect baseline balance. Dependable push rate and solid structural integrity.'
  },
  {
    id: 'ghost_pepper',
    name: 'Ghost Pepper Burrito',
    icon: '🌶️',
    tagline: 'High Speed, Wild Wobble',
    pushSpeedMult: 1.45,
    tensileStrengthMult: 0.85,
    tensionRiseMult: 1.35,
    bonusWeightMult: 1.1,
    description: 'Blazing ejection velocity! Extreme sphincter tension—snip quickly or face explosive rupture!'
  },
  {
    id: 'mega_fiber',
    name: 'Psyllium Husk Mega-Fiber',
    icon: '🌾',
    tagline: 'Titanium Tensile Strength',
    pushSpeedMult: 0.85,
    tensileStrengthMult: 1.5,
    tensionRiseMult: 0.75,
    bonusWeightMult: 1.25,
    description: 'Nearly unbreakable! Push out gigantic unbroken logs with minimal risk of premature snaps.'
  },
  {
    id: 'triple_espresso',
    name: 'Triple Espresso Crash',
    icon: '☕',
    tagline: 'Twitchy Hyper Rhythm',
    pushSpeedMult: 1.3,
    tensileStrengthMult: 0.95,
    tensionRiseMult: 1.2,
    bonusWeightMult: 0.9,
    description: 'Rapid-fire pump rhythm. Great for quick aggressive bursts in tight competition.'
  },
  {
    id: 'cheesy_curry',
    name: 'Loaded Chili Mac & Cheese',
    icon: '🧀',
    tagline: 'Heavyweight Density King',
    pushSpeedMult: 0.9,
    tensileStrengthMult: 1.15,
    tensionRiseMult: 1.1,
    bonusWeightMult: 1.4,
    description: 'Dense and heavy. Produces monstrous gram weights on the scale with each centimeter.'
  }
];

export const ALL_COMPETITORS: Record<string, Competitor> = {
  taco_chad: {
    id: 'taco_chad',
    name: 'Taco Chad',
    title: 'The 3 AM Crunchwrapper',
    avatarEmoji: '🌮',
    stallNumber: 1,
    personality: 'greedy',
    targetLength: 36,
    pushSpeed: 3.4,
    tensileLimit: 42,
    currentLength: 0,
    currentWeight: 0,
    tension: 0,
    status: 'ready',
    score: 0,
    dialogue: "I put hot sauce on my hot sauce. Watch this monster drop!"
  },
  prune_penny: {
    id: 'prune_penny',
    name: 'Prune Penny',
    title: 'Grandma’s Secret Fiber',
    avatarEmoji: '👵',
    stallNumber: 2,
    personality: 'steady',
    targetLength: 32,
    pushSpeed: 2.2,
    tensileLimit: 48,
    currentLength: 0,
    currentWeight: 0,
    tension: 0,
    status: 'ready',
    score: 0,
    dialogue: "Patience, dearies. A steady pinch wins the blue ribbon every time."
  },
  big_tony: {
    id: 'big_tony',
    name: 'Big Tony',
    title: 'Meatball Marathoner',
    avatarEmoji: '🥩',
    stallNumber: 4,
    personality: 'perfectionist',
    targetLength: 28,
    pushSpeed: 2.8,
    tensileLimit: 36,
    currentLength: 0,
    currentWeight: 0,
    tension: 0,
    status: 'ready',
    score: 0,
    dialogue: "Fuhgeddaboudit! Clean cuts only. No messy splitters in my stall."
  },
  gamer_jax: {
    id: 'gamer_jax',
    name: 'Gamer Jax',
    title: 'Energy Drink Overdose',
    avatarEmoji: '🎮',
    stallNumber: 1,
    personality: 'reckless',
    targetLength: 40,
    pushSpeed: 3.8,
    tensileLimit: 39,
    currentLength: 0,
    currentWeight: 0,
    tension: 0,
    status: 'ready',
    score: 0,
    dialogue: "APM over 400! I'm streaming this log straight to the leaderboards!"
  },
  fiber_fiona: {
    id: 'fiber_fiona',
    name: 'Fiber Fiona',
    title: 'Chia Seed Grandmaster',
    avatarEmoji: '🥗',
    stallNumber: 4,
    personality: 'steady',
    targetLength: 45,
    pushSpeed: 2.5,
    tensileLimit: 52,
    currentLength: 0,
    currentWeight: 0,
    tension: 0,
    status: 'ready',
    score: 0,
    dialogue: "Organic gluten-free synergy. This continuous coil is modern art."
  },
  sir_flushelot: {
    id: 'sir_flushelot',
    name: 'Sir FlusheLot',
    title: 'Royal Knight of the Bowl',
    avatarEmoji: '👑',
    stallNumber: 2,
    personality: 'perfectionist',
    targetLength: 34,
    pushSpeed: 2.9,
    tensileLimit: 44,
    currentLength: 0,
    currentWeight: 0,
    tension: 0,
    status: 'ready',
    score: 0,
    dialogue: "By the porcelain crown, prepare for a snip of legendary majesty!"
  }
};

export const TOURNAMENT_STAGES: StageConfig[] = [
  {
    id: 1,
    name: 'Stall Derby Round 1: Office Floor 3 Restroom',
    subtitle: 'Modest stakes, thin stall dividers, polite coughs',
    location: 'Corporate HQ Bathroom',
    opponentIds: ['big_tony', 'prune_penny'],
    ambientColor: 'from-amber-100 to-amber-200',
    waterDepthCm: 50
  },
  {
    id: 2,
    name: 'Stall Derby Round 2: Highway Truck Stop Diner',
    subtitle: 'Heavy grease, rattling pipes, diesel-fueled competition',
    location: 'Route 66 Big Rig Oasis',
    opponentIds: ['taco_chad', 'gamer_jax'],
    ambientColor: 'from-orange-100 to-amber-200',
    waterDepthCm: 55
  },
  {
    id: 3,
    name: 'The Porcelain Grand Finale: Royal Flush Coliseum',
    subtitle: 'Gold-plated throne, cheering fans, world record glory',
    location: 'World Championship Arena',
    opponentIds: ['fiber_fiona', 'sir_flushelot'],
    ambientColor: 'from-yellow-100 to-amber-300',
    waterDepthCm: 60
  }
];
