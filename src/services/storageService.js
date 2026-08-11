import Dexie from 'dexie';

export const db = new Dexie('GizmoBeeDB');

db.version(1).stores({
  decks: 'id, title, subjectCategory, createdAt',
  cards: 'id, deckId, cardType, status, dueDate',
  userStats: 'userId',
  feynmanLogs: 'id, cardId, evaluatedAt',
  leaderboardEntries: 'id, weeklyXp, leagueTier, rankPosition'
});

export async function updateCard(cardId, updates) {
  await db.cards.update(cardId, updates);
}

// Storage Initialization — Clean start, no seeded/dummy decks!
export async function initStorage() {
  try {
    const stats = await db.userStats.get('local_user');

    if (!stats) {
      const todayDate = new Date().toISOString().split('T')[0];

      // Seed initial clean User Stats for local/guest user
      await db.userStats.put({
        userId: 'local_user',
        totalXp: 0,
        weeklyXp: 0,
        leagueTier: 'Bronze',
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: todayDate,
        dailyGoalTarget: 20,
        cardsStudiedToday: 0,
        cardsMastered: 0,
        predictedExamScore: 0,
        soundEnabled: true,
        soundVolume: 0.8,
        unlimitedHearts: true,
        level: 1
      });
    }
  } catch (err) {
    console.warn('Storage init warning (handled):', err);
  }
}

// User Stats helper
export async function getUserStats() {
  await initStorage();
  let stats = await db.userStats.get('local_user');
  if (!stats) {
    stats = {
      userId: 'local_user',
      totalXp: 0,
      weeklyXp: 0,
      leagueTier: 'Bronze',
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      dailyGoalTarget: 20,
      cardsStudiedToday: 0,
      cardsMastered: 0,
      predictedExamScore: 0,
      soundEnabled: true,
      soundVolume: 0.8,
      unlimitedHearts: true,
      level: 1
    };
    await db.userStats.put(stats);
  }
  return stats;
}

export async function updateUserStats(updates) {
  const current = await getUserStats();
  const updated = { ...current, ...updates };
  await db.userStats.put(updated);
  return updated;
}
