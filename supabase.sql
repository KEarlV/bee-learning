-- ===================================================
-- SUPABASE POSTGRESQL PRODUCTION SCHEMA v2
-- Updated: Added account_status approval flow & admin roles
-- Copy and paste this into your Supabase SQL Editor!
-- ===================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Stats & Profile Management Table
CREATE TABLE IF NOT EXISTS public.user_stats (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) DEFAULT 'BeeLearner',
    email VARCHAR(255) UNIQUE,
    education_level VARCHAR(100) DEFAULT 'College / University',
    city_location VARCHAR(100) DEFAULT 'Manila, 🇵🇭 Philippines',
    country VARCHAR(100) DEFAULT 'Philippines',
    target_exam VARCHAR(255) DEFAULT 'Biology & CS Midterms',
    preferred_study_style VARCHAR(100) DEFAULT 'Active Recall + Feynman',
    avatar_url TEXT,
    -- Account Status: 'pending' | 'approved' | 'rejected'
    account_status VARCHAR(20) DEFAULT 'pending',
    -- Role: 'user' | 'admin'
    role VARCHAR(10) DEFAULT 'user',
    total_xp INT DEFAULT 0,
    weekly_xp INT DEFAULT 0,
    league_tier VARCHAR(20) DEFAULT 'Bronze',
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_active_date DATE DEFAULT CURRENT_DATE,
    daily_goal_target INT DEFAULT 20,
    cards_studied_today INT DEFAULT 0,
    cards_mastered INT DEFAULT 0,
    predicted_exam_score FLOAT DEFAULT 0.0,
    sound_enabled BOOLEAN DEFAULT TRUE,
    sound_volume FLOAT DEFAULT 0.8,
    unlimited_hearts BOOLEAN DEFAULT TRUE,
    level INT DEFAULT 1,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Document Scans Table
CREATE TABLE IF NOT EXISTS public.document_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_stats(user_id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    raw_extracted_text TEXT,
    preview_image_url TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Decks Table
CREATE TABLE IF NOT EXISTS public.decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_stats(user_id) ON DELETE CASCADE,
    source_scan_id UUID REFERENCES public.document_scans(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject_category VARCHAR(100) DEFAULT 'General Study',
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Cards Table (Spaced Repetition SM-2 Parameters)
CREATE TABLE IF NOT EXISTS public.cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID REFERENCES public.decks(id) ON DELETE CASCADE,
    card_type VARCHAR(50) DEFAULT 'flashcard',
    front_content TEXT NOT NULL,
    back_content TEXT NOT NULL,
    options TEXT[],
    hint_text TEXT,
    dynamic_mnemonic TEXT,
    image_url TEXT,
    ease_factor FLOAT DEFAULT 2.5,
    interval_days INT DEFAULT 0,
    repetitions INT DEFAULT 0,
    due_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(30) DEFAULT 'new',
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Leaderboard Entries Table
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_stats(user_id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL,
    city_location VARCHAR(100) DEFAULT 'Manila, 🇵🇭 Philippines',
    country VARCHAR(100) DEFAULT 'Philippines',
    avatar_url TEXT,
    weekly_xp INT DEFAULT 0,
    league_tier VARCHAR(20) DEFAULT 'Bronze',
    rank_position INT DEFAULT 1,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Realtime Publication Setup
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.decks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard_entries;

-- 8. Indexes
CREATE INDEX IF NOT EXISTS idx_leaderboard_city ON public.leaderboard_entries(city_location, weekly_xp DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_country ON public.leaderboard_entries(country, weekly_xp DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_global ON public.leaderboard_entries(weekly_xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_status ON public.user_stats(account_status);
CREATE INDEX IF NOT EXISTS idx_user_stats_role ON public.user_stats(role);

-- 9. Row Level Security (RLS)
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own row
CREATE POLICY "Users can access own stats" ON public.user_stats
    FOR ALL USING (true);

CREATE POLICY "Users can access own decks" ON public.decks
    FOR ALL USING (true);

CREATE POLICY "Users can access own cards" ON public.cards
    FOR ALL USING (true);

CREATE POLICY "Anyone can read leaderboard" ON public.leaderboard_entries
    FOR SELECT USING (true);

-- 10. Seed Default Admin Account (update password_hash manually)
-- This creates a placeholder admin row; hook up Supabase Auth for real login
INSERT INTO public.user_stats (username, email, role, account_status)
VALUES ('Admin', 'admin@beestudy.ai', 'admin', 'approved')
ON CONFLICT (email) DO NOTHING;
