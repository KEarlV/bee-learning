# Gizmo AI Study Engine - Database Schema & Data Models

## 1. Overview
The data architecture supports a dual-layer strategy:
1. **Offline-First Local Storage (IndexedDB via Dexie.js)**: Powers zero-latency local deck retrieval, card review intervals, and offline practice.
2. **Cloud Database (Supabase PostgreSQL / `supabase.sql`)**: Complete SQL schema ready for instant cloud deployment, multi-device sync, and team deck sharing.
3. **Offline Quick Reviewer (In-Memory Engine)**: Temporary flashcard parsing and review engine that operates entirely in memory without writing to storage or cloud databases.

---

## 2. Supabase PostgreSQL Production Schema (`supabase.sql`)

```sql
-- See full script in project root file: supabase.sql

CREATE TABLE public.user_stats (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    total_xp INT DEFAULT 0,
    weekly_xp INT DEFAULT 0,
    league_tier VARCHAR(20) DEFAULT 'Gold',
    current_streak INT DEFAULT 1,
    daily_goal_target INT DEFAULT 20,
    cards_studied_today INT DEFAULT 0,
    cards_mastered INT DEFAULT 0,
    predicted_exam_score FLOAT DEFAULT 75.0,
    sound_enabled BOOLEAN DEFAULT TRUE,
    sound_volume FLOAT DEFAULT 0.8,
    unlimited_hearts BOOLEAN DEFAULT TRUE
);

CREATE TABLE public.decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_stats(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject_category VARCHAR(100) DEFAULT 'General Study',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID REFERENCES public.decks(id) ON DELETE CASCADE,
    card_type VARCHAR(50) DEFAULT 'flashcard',
    front_content TEXT NOT NULL,
    back_content TEXT NOT NULL,
    options TEXT[],
    hint_text TEXT,
    dynamic_mnemonic TEXT,
    ease_factor FLOAT DEFAULT 2.5,
    interval_days INT DEFAULT 0,
    repetitions INT DEFAULT 0,
    due_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(30) DEFAULT 'new'
);
```

---

## 3. Data Model Specifications

### A. `UserStats` Schema
```typescript
type LeagueTier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Master';

interface UserStats {
  userId: string;              // Default 'local_user'
  totalXp: number;             // Total experience points earned
  weeklyXp: number;            // Current week points for leaderboard ranking
  leagueTier: LeagueTier;      // Current division league (default: 'Gold')
  currentStreak: number;        // Consecutive daily study streak
  longestStreak: number;        // Personal best streak record
  lastActiveDate: string;       // ISO Date string (YYYY-MM-DD)
  dailyGoalTarget: number;     // e.g. 20 cards per day
  cardsStudiedToday: number;   // Counter reset daily
  cardsMastered: number;        // Cards with interval > 21 days
  predictedExamScore: number;  // 0-100% exam readiness index
  soundEnabled: boolean;       // Gizmo sound FX toggle (default: true)
  soundVolume: number;        // 0.0 to 1.0 volume multiplier (default: 0.8)
  unlimitedHearts: boolean;    // Unlimited practice hearts (default: true)
  level: number;               // Calculated level: Math.floor(totalXp / 100) + 1
}
```

### B. Offline Quick Reviewer (In-Memory Engine)
```typescript
interface QuickReviewSession {
  sessionId: string;
  sourceText: string;
  inMemoryCards: Card[];       // Transient array (not saved to IndexedDB or Supabase)
  isCompleted: boolean;
}
```
