/**
 * Streak utility for accurate sync & countdown calculations.
 */

export function calculateStreak(currentStreak = 1, lastActiveDate = null, createdAt = null) {
  const baseStreak = Math.max(1, Number(currentStreak) || 1);

  // Today in local YYYY-MM-DD
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Yesterday in local YYYY-MM-DD
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  // Extract raw date string (YYYY-MM-DD)
  const extractDateStr = (dateInput) => {
    if (!dateInput) return null;
    if (typeof dateInput === 'string') {
      return dateInput.split('T')[0];
    }
    if (dateInput instanceof Date) {
      return `${dateInput.getFullYear()}-${String(dateInput.getMonth() + 1).padStart(2, '0')}-${String(dateInput.getDate()).padStart(2, '0')}`;
    }
    return null;
  };

  const lastActiveStr = extractDateStr(lastActiveDate);
  const createdStr = extractDateStr(createdAt);

  // Determine key reference date
  const refDateStr = lastActiveStr || createdStr;

  if (!refDateStr) {
    return baseStreak;
  }

  if (refDateStr === todayStr) {
    return baseStreak;
  }

  if (refDateStr === yesterdayStr) {
    // Registered or last active yesterday! Next day streak = 2 (or base + 1 if base > 1)
    return Math.max(baseStreak + 1, 2);
  }

  // Parse dates to check multi-day difference
  const refDateObj = new Date(refDateStr);
  const todayDateObj = new Date(todayStr);
  const diffDays = Math.round((todayDateObj - refDateObj) / (1000 * 3600 * 24));

  if (diffDays === 1) {
    return Math.max(baseStreak + 1, 2);
  } else if (diffDays > 1) {
    // Inactive for 2+ days
    return 1;
  }

  return baseStreak;
}

/**
 * Returns formatted time remaining until midnight reset (next streak day).
 */
export function getTimeUntilNextDay() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);

  const diffMs = midnight - now;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return {
    hours,
    minutes,
    seconds,
    formatted: `${hours}h ${minutes}m`,
    fullFormatted: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  };
}
