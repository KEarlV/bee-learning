import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wfhemonjldamzszunorg.supabase.co';

// Anon key — safe for regular users (respects RLS)
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmaGVtb25qbGRhbXpzenVub3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNzIzNjIsImV4cCI6MjEwMTk0ODM2Mn0.d9AuQ9-ykne0KTNmr1rsWFLYXd7Pd0rIbiYYKR48kBk';

// Service role key — bypasses RLS, ONLY used in Admin Panel (never exposed to users)
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmaGVtb25qbGRhbXpzenVub3JnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjM3MjM2MiwiZXhwIjoyMTAxOTQ4MzYyfQ.2vmkTpAt_tSvCqXR36TcoxWK-beKBrvsh9cclvFffbE';

let supabaseInstance = null;
let adminSupabaseInstance = null;

// Regular user client — uses anon key, respects RLS policies
export function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance;
  try {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabaseInstance;
  } catch (e) {
    console.warn('Supabase client creation error:', e);
    return null;
  }
}

// Admin-only client — uses service_role key, bypasses RLS
// Only called from AdminPanel — never used in user-facing components
export function getAdminSupabaseClient() {
  if (adminSupabaseInstance) return adminSupabaseInstance;
  try {
    adminSupabaseInstance = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    return adminSupabaseInstance;
  } catch (e) {
    console.warn('Admin Supabase client creation error:', e);
    return null;
  }
}

// Legacy helpers kept for backward compatibility
export function getSupabaseCredentials() {
  return { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };
}
export function setSupabaseCredentials() {} // no-op — credentials are now fixed

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
    const payload = {
      username: userStats.username || 'BeeLearner',
      city_location: userStats.cityLocation || 'Manila, 🇵🇭 Philippines',
      education_level: userStats.educationLevel || 'College / University',
      target_exam: userStats.targetExam || 'Biology & CS Midterms',
      preferred_study_style: userStats.preferredStudyStyle || 'Active Recall + Feynman',
      total_xp: userStats.totalXp ?? 0,
      weekly_xp: userStats.weeklyXp ?? 0,
      current_streak: userStats.currentStreak ?? 1,
      daily_goal_target: userStats.dailyGoalTarget ?? 20,
      cards_studied_today: userStats.cardsStudiedToday ?? 0,
      cards_mastered: userStats.cardsMastered ?? 0
    };

    if (userStats.userId && userStats.userId !== 'local_user') {
      payload.user_id = userStats.userId;
    }
    if (userStats.email) {
      payload.email = userStats.email;
    }

    const { data, error } = await supabase
      .from('user_stats')
      .upsert(payload, { onConflict: payload.user_id ? 'user_id' : payload.email ? 'email' : undefined })
      .select();

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Supabase sync error:', err);
    return null;
  }
}

