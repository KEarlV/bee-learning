import { getSupabaseClient } from './supabaseService';

// SHA-256 hash using native Web Crypto API (no external deps)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'bee_salt_2024'); // salted
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const SESSION_KEY = 'bee_user_session';

// ── Register new user ─────────────────────────────────────────
export async function registerUser({ username, password }) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('No Supabase connection.');

  // Check username is not already taken (maybeSingle = no error if not found)
  const { data: existing } = await supabase
    .from('user_stats')
    .select('user_id')
    .ilike('username', username)
    .maybeSingle();

  if (existing) throw new Error('Username already taken. Choose another.');

  const password_hash = await hashPassword(password);

  const { data, error } = await supabase
    .from('user_stats')
    .insert({
      username,
      password_hash,
      account_status: 'pending',
      role: 'user',
      total_xp: 0,
      weekly_xp: 0,
    })
    .select('user_id, username, account_status')
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── Login existing user ───────────────────────────────────────
export async function loginUser({ username, password }) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('No Supabase connection.');

  const { data: user, error } = await supabase
    .from('user_stats')
    .select('user_id, username, password_hash, account_status, total_xp')
    .ilike('username', username)
    .maybeSingle();

  if (error || !user) throw new Error('Username not found.');

  const inputHash = await hashPassword(password);
  if (inputHash !== user.password_hash) throw new Error('Incorrect password.');

  if (user.account_status === 'pending') {
    throw new Error('Your account is pending admin approval. Please wait.');
  }
  if (user.account_status === 'rejected') {
    throw new Error('Your account has been rejected. Contact support.');
  }

  // Store session
  const session = {
    userId: user.user_id,
    username: user.username,
    avatarUrl: null,
    isAuthenticated: true,
    totalXp: user.total_xp || 0,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

// ── Logout ────────────────────────────────────────────────────
export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

// ── Restore session on page load ──────────────────────────────
export function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
