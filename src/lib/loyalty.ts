/**
 * Loyalty-tier business rules.
 *
 * Extracted from the Loyalty page so the thresholds live in one place and can
 * be unit-tested independently of Supabase and the UI.
 */

export type Tier = 'bronze' | 'silver' | 'gold' | 'platinum';

export const TIER_THRESHOLDS: Record<Tier, number> = {
  bronze: 0,
  silver: 200,
  gold: 500,
  platinum: 1000,
};

/** Return the loyalty tier for a given points balance. */
export function tierForPoints(points: number): Tier {
  if (points >= TIER_THRESHOLDS.platinum) return 'platinum';
  if (points >= TIER_THRESHOLDS.gold) return 'gold';
  if (points >= TIER_THRESHOLDS.silver) return 'silver';
  return 'bronze';
}
