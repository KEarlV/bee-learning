import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://wfhemonjldamzszunorg.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_lCJqQ_DwXn_N9s3axv0GQ_E1aBc';

const SUPABASE_URL_KEY = 'gizmo_supabase_url';
const SUPABASE_ANON_KEY = 'gizmo_supabase_anon_key';

let supabaseInstance = null;

export function getSupabaseCredentials() {
  const url = localStorage.getItem(SUPABASE_URL_KEY) || import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const anonKey = localStorage.getItem(SUPABASE_ANON_KEY) || import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  return { url, anonKey };
}

export function setSupabaseCredentials(url, anonKey) {
  localStorage.setItem(SUPABASE_URL_KEY, url);
  localStorage.setItem(SUPABASE_ANON_KEY, anonKey);
  supabaseInstance = null;
}

export function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance;

  const { url, anonKey } = getSupabaseCredentials();
  if (url && anonKey) {
    try {
      supabaseInstance = createClient(url, anonKey);
      return supabaseInstance;
    } catch (e) {
      console.warn('Supabase client creation error:', e);
    }
  }
  return null;
}

// 1. Subscribe to Real-Time Supabase Changes
export function subscribeToRealtimeChanges(onTableChange) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const channel = supabase
    .channel('public:realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public' },
      (payload) => {
        console.log('⚡ Supabase Realtime Payload:', payload);
        if (onTableChange) onTableChange(payload);
      }
    )
    .subscribe();

  return channel;
}

// 2. Fetch Leaderboard Rankings from Supabase
export async function fetchSupabaseLeaderboard(scope = 'local', city = 'Manila', country = 'Philippines') {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    let query = supabase.from('leaderboard_entries').select('*').order('weekly_xp', { ascending: false });

    if (scope === 'local' && city) {
      query = query.ilike('city_location', `%${city}%`);
    } else if (scope === 'national' && country) {
      query = query.ilike('country', `%${country}%`);
    }

    const { data, error } = await query.limit(50);
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Supabase leaderboard fetch error:', err);
    return null;
  }
}

// 3. Sync User Profile & Stats to Supabase
export async function syncUserStatsToSupabase(userStats) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('user_stats')
      .upsert({
        username: userStats.username || 'BeeLearner',
        city_location: userStats.cityLocation || 'Manila, 🇵🇭 Philippines',
        education_level: userStats.educationLevel || 'College / University',
        target_exam: userStats.targetExam || 'Biology & CS Midterms',
        preferred_study_style: userStats.preferredStudyStyle || 'Active Recall + Feynman',
        total_xp: userStats.totalXp || 350,
        weekly_xp: userStats.weeklyXp || 350,
        current_streak: userStats.currentStreak || 5,
        daily_goal_target: userStats.dailyGoalTarget || 20,
        cards_studied_today: userStats.cardsStudiedToday || 8,
        cards_mastered: userStats.cardsMastered || 14
      })
      .select();

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Supabase sync error:', err);
    return null;
  }
}
