/**
 * Tier Progression System:
 * - Bronze III (0 XP) -> Bronze II (100 XP) -> Bronze I (200 XP)
 * - Silver IV (300 XP) -> Silver III (450 XP) -> Silver II (600 XP) -> Silver I (750 XP)
 * - Gold V (900 XP) -> Gold IV (1,100 XP) -> Gold III (1,300 XP) -> Gold II (1,500 XP) -> Gold I (1,700 XP)
 * - Platinum IV (2,000 XP) -> Platinum III (2,400 XP) -> Platinum II (2,800 XP) -> Platinum I (3,200 XP)
 * - Diamond V (4,000 XP) -> Diamond IV (4,800 XP) -> Diamond III (5,600 XP) -> Diamond II (6,400 XP) -> Diamond I (7,200 XP)
 * - Master (8,000+ XP)
 */
export function getTierInfo(xp = 0) {
  const numXp = Number(xp) || 0;

  if (numXp >= 8000) {
    return {
      tier: 'Master',
      division: 'Grandmaster',
      full: 'Master',
      badge: '👑 Master',
      color: 'text-amber-300 bg-amber-500/20 border-amber-400/40',
      nextTierXp: 10000,
    };
  }

  // Diamond Tier V -> I
  if (numXp >= 7200) return { tier: 'Diamond', division: 'I', full: 'Diamond I', badge: '💎 Diamond I', color: 'text-indigo-300 bg-indigo-500/20 border-indigo-400/40', nextTierXp: 8000 };
  if (numXp >= 6400) return { tier: 'Diamond', division: 'II', full: 'Diamond II', badge: '💎 Diamond II', color: 'text-indigo-300 bg-indigo-500/20 border-indigo-400/40', nextTierXp: 7200 };
  if (numXp >= 5600) return { tier: 'Diamond', division: 'III', full: 'Diamond III', badge: '💎 Diamond III', color: 'text-indigo-300 bg-indigo-500/20 border-indigo-400/40', nextTierXp: 6400 };
  if (numXp >= 4800) return { tier: 'Diamond', division: 'IV', full: 'Diamond IV', badge: '💎 Diamond IV', color: 'text-indigo-300 bg-indigo-500/20 border-indigo-400/40', nextTierXp: 5600 };
  if (numXp >= 4000) return { tier: 'Diamond', division: 'V', full: 'Diamond V', badge: '💎 Diamond V', color: 'text-indigo-300 bg-indigo-500/20 border-indigo-400/40', nextTierXp: 4800 };

  // Platinum Tier IV -> I
  if (numXp >= 3200) return { tier: 'Platinum', division: 'I', full: 'Platinum I', badge: '🔮 Platinum I', color: 'text-sky-300 bg-sky-500/20 border-sky-400/40', nextTierXp: 4000 };
  if (numXp >= 2800) return { tier: 'Platinum', division: 'II', full: 'Platinum II', badge: '🔮 Platinum II', color: 'text-sky-300 bg-sky-500/20 border-sky-400/40', nextTierXp: 3200 };
  if (numXp >= 2400) return { tier: 'Platinum', division: 'III', full: 'Platinum III', badge: '🔮 Platinum III', color: 'text-sky-300 bg-sky-500/20 border-sky-400/40', nextTierXp: 2800 };
  if (numXp >= 2000) return { tier: 'Platinum', division: 'IV', full: 'Platinum IV', badge: '🔮 Platinum IV', color: 'text-sky-300 bg-sky-500/20 border-sky-400/40', nextTierXp: 2400 };

  // Gold Tier V -> I
  if (numXp >= 1700) return { tier: 'Gold', division: 'I', full: 'Gold I', badge: '🥇 Gold I', color: 'text-amber-400 bg-amber-500/20 border-amber-500/40', nextTierXp: 2000 };
  if (numXp >= 1500) return { tier: 'Gold', division: 'II', full: 'Gold II', badge: '🥇 Gold II', color: 'text-amber-400 bg-amber-500/20 border-amber-500/40', nextTierXp: 1700 };
  if (numXp >= 1300) return { tier: 'Gold', division: 'III', full: 'Gold III', badge: '🥇 Gold III', color: 'text-amber-400 bg-amber-500/20 border-amber-500/40', nextTierXp: 1500 };
  if (numXp >= 1100) return { tier: 'Gold', division: 'IV', full: 'Gold IV', badge: '🥇 Gold IV', color: 'text-amber-400 bg-amber-500/20 border-amber-500/40', nextTierXp: 1300 };
  if (numXp >= 900)  return { tier: 'Gold', division: 'V', full: 'Gold V', badge: '🥇 Gold V', color: 'text-amber-400 bg-amber-500/20 border-amber-500/40', nextTierXp: 1100 };

  // Silver Tier IV -> I
  if (numXp >= 750) return { tier: 'Silver', division: 'I', full: 'Silver I', badge: '🥈 Silver I', color: 'text-slate-300 bg-slate-700/30 border-slate-400/40', nextTierXp: 900 };
  if (numXp >= 600) return { tier: 'Silver', division: 'II', full: 'Silver II', badge: '🥈 Silver II', color: 'text-slate-300 bg-slate-700/30 border-slate-400/40', nextTierXp: 750 };
  if (numXp >= 450) return { tier: 'Silver', division: 'III', full: 'Silver III', badge: '🥈 Silver III', color: 'text-slate-300 bg-slate-700/30 border-slate-400/40', nextTierXp: 600 };
  if (numXp >= 300) return { tier: 'Silver', division: 'IV', full: 'Silver IV', badge: '🥈 Silver IV', color: 'text-slate-300 bg-slate-700/30 border-slate-400/40', nextTierXp: 450 };

  // Bronze Tier III -> I
  if (numXp >= 200) return { tier: 'Bronze', division: 'I', full: 'Bronze I', badge: '🥉 Bronze I', color: 'text-amber-700 bg-amber-900/30 border-amber-700/40', nextTierXp: 300 };
  if (numXp >= 100) return { tier: 'Bronze', division: 'II', full: 'Bronze II', badge: '🥉 Bronze II', color: 'text-amber-700 bg-amber-900/30 border-amber-700/40', nextTierXp: 200 };
  return { tier: 'Bronze', division: 'III', full: 'Bronze III', badge: '🥉 Bronze III', color: 'text-amber-700 bg-amber-900/30 border-amber-700/40', nextTierXp: 100 };
}
