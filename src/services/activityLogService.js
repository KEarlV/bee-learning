import { getSupabaseClient } from './supabaseService';
import { getStoredSession } from './authService';

/**
 * Write a single activity log row to Supabase.
 * Fire-and-forget — never throws, so it never breaks the calling action.
 *
 * @param {string} action       e.g. 'User Login', 'Profile Updated'
 * @param {string} category     e.g. 'Auth', 'Profile', 'Study', 'AI'
 * @param {object} [opts]
 * @param {string} [opts.status]  'SUCCESS' | 'FAILED' | 'PENDING'
 * @param {number} [opts.tokens]  tokens used (for AI actions)
 * @param {string} [opts.userId]  override userId (defaults to session)
 * @param {string} [opts.username] override username
 */
export async function logActivity(action, category = 'General', opts = {}) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const session = getStoredSession();
    const userId   = opts.userId   ?? session?.userId   ?? null;
    const username = opts.username ?? session?.username ?? 'Guest';

    await supabase.from('activity_logs').insert({
      user_id:     userId,
      username,
      action,
      category,
      tokens_used: opts.tokens ?? 0,
      status:      opts.status ?? 'SUCCESS',
    });
  } catch (_) {
    // Silently ignore — logging must never break the app
  }
}
