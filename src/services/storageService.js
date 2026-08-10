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

// Seed Initial Sample Decks safely using put / bulkPut
export async function initStorage() {
  try {
    const deckCount = await db.decks.count();

    if (deckCount === 0) {
      const defaultDeckId = 'deck-bio-101';
      const csDeckId = 'deck-cs-101';
      const spanishDeckId = 'deck-es-101';

      const nowIso = new Date().toISOString();
      const todayDate = nowIso.split('T')[0];

      // Seed Decks safely
      await db.decks.bulkPut([
        {
          id: defaultDeckId,
          title: 'Cell Biology & Organelles',
          description: 'Key structures, functions, ATP synthesis, and cell membranes.',
          subjectCategory: 'Science',
          tags: ['biology', 'exam-prep', 'diagrams'],
          createdAt: nowIso,
          updatedAt: nowIso
        },
        {
          id: csDeckId,
          title: 'JavaScript & Web Tech Essentials',
          description: 'Promises, Async/Await, Closures, DOM, and HTTP methods.',
          subjectCategory: 'Computer Science',
          tags: ['js', 'programming', 'frontend'],
          createdAt: nowIso,
          updatedAt: nowIso
        },
        {
          id: spanishDeckId,
          title: 'Spanish Vocabulary & Travel',
          description: 'Essential phrases, greetings, directions, and dining.',
          subjectCategory: 'Language',
          tags: ['spanish', 'phrases'],
          createdAt: nowIso,
          updatedAt: nowIso
        }
      ]);

      // Seed Sample Cards safely
      await db.cards.bulkPut([
        {
          id: 'card-bio-1',
          deckId: defaultDeckId,
          cardType: 'flashcard',
          frontContent: 'What is the primary function of Mitochondria in cells?',
          backContent: 'Mitochondria produce ATP through cellular respiration and oxidative phosphorylation.',
          hintText: 'Known as the powerhouse of the cell.',
          dynamicMnemonic: 'Mighty Mitochondria = Power Plant generating ATP electricity!',
          easeFactor: 2.5,
          intervalDays: 0,
          repetitions: 0,
          dueDate: todayDate,
          status: 'new'
        },
        {
          id: 'card-bio-2',
          deckId: defaultDeckId,
          cardType: 'multiple_choice',
          frontContent: 'Which organelle is responsible for protein synthesis?',
          backContent: 'Ribosomes translate mRNA into amino acid chains (proteins).',
          options: ['Ribosome', 'Golgi Apparatus', 'Lysosome', 'Smooth ER'],
          hintText: 'Can be free in cytoplasm or bound to Rough ER.',
          easeFactor: 2.5,
          intervalDays: 0,
          repetitions: 0,
          dueDate: todayDate,
          status: 'new'
        },
        {
          id: 'card-cs-1',
          deckId: csDeckId,
          cardType: 'flashcard',
          frontContent: 'What is a Closure in JavaScript?',
          backContent: 'A closure is a function bundled together with references to its surrounding state.',
          hintText: 'Inner functions retain outer scope variables.',
          easeFactor: 2.5,
          intervalDays: 0,
          repetitions: 0,
          dueDate: todayDate,
          status: 'new'
        }
      ]);

      // Seed User Stats safely
      await db.userStats.put({
        userId: 'local_user',
        totalXp: 350,
        weeklyXp: 350,
        leagueTier: 'Gold',
        currentStreak: 5,
        longestStreak: 12,
        lastActiveDate: todayDate,
        dailyGoalTarget: 20,
        cardsStudiedToday: 8,
        cardsMastered: 14,
        predictedExamScore: 88,
        soundEnabled: true,
        soundVolume: 0.8,
        unlimitedHearts: true,
        level: 4
      });

      // Seed Leaderboard Entries safely
      await db.leaderboardEntries.bulkPut([
        { id: 'user-1', userId: 'user-alex', username: 'Alex_Mastery', avatarUrl: '/bee_frame_1.png', weeklyXp: 820, leagueTier: 'Gold', rankPosition: 1, streakDays: 14, isCurrentUser: false },
        { id: 'user-2', userId: 'user-sophia', username: 'Sophia_Brain', avatarUrl: '/bee_frame_2.png', weeklyXp: 640, leagueTier: 'Gold', rankPosition: 2, streakDays: 9, isCurrentUser: false },
        { id: 'user-3', userId: 'local_user', username: 'You (Bee Learner)', avatarUrl: '/bee_frame_4.png', weeklyXp: 350, leagueTier: 'Gold', rankPosition: 3, streakDays: 5, isCurrentUser: true }
      ]);
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
      totalXp: 350,
      weeklyXp: 350,
      leagueTier: 'Gold',
      currentStreak: 5,
      longestStreak: 12,
      lastActiveDate: new Date().toISOString().split('T')[0],
      dailyGoalTarget: 20,
      cardsStudiedToday: 8,
      cardsMastered: 14,
      predictedExamScore: 88,
      soundEnabled: true,
      soundVolume: 0.8,
      unlimitedHearts: true,
      level: 4
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
