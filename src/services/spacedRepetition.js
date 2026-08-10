// SuperMemo SM-2 Spaced Repetition Algorithm Engine

export function calculateSM2(card, qualityRating) {
  // qualityRating: 0 = Again (Failed), 3 = Hard, 4 = Good, 5 = Easy
  const q = Math.max(0, Math.min(5, qualityRating));

  let { easeFactor = 2.5, intervalDays = 0, repetitions = 0 } = card;

  if (q < 3) {
    // Failed recall (Again) -> reset repetition sequence
    repetitions = 0;
    intervalDays = 1;
  } else {
    // Successful recall -> calculate next interval
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetitions += 1;
  }

  // Adjust Ease Factor (minimum EF = 1.3)
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;
  easeFactor = Math.round(easeFactor * 100) / 100;

  // Compute Next Due Date
  const dueDateObj = new Date();
  dueDateObj.setDate(dueDateObj.getDate() + intervalDays);
  const dueDate = dueDateObj.toISOString().split('T')[0];

  // Determine Card Status
  let status = 'review';
  if (q < 3) {
    status = 'learning';
  } else if (intervalDays >= 21) {
    status = 'mastered';
  }

  return {
    easeFactor,
    intervalDays,
    repetitions,
    dueDate,
    status,
    lastReviewedAt: new Date().toISOString()
  };
}
