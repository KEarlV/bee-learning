import { getAdminSupabaseClient } from './supabaseService';
import { getStoredSession } from './authService';

/**
 * Write a single activity log row to Supabase.
 * Fire-and-forget — never throws, so it never breaks the calling action.
 * Uses service role client to bypass RLS policies and avoid 401 Unauthorized errors.
 */
export async function logActivity(action, category = 'General', opts = {}) {
  try {
    const supabase = getAdminSupabaseClient();
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
