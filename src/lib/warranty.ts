/**
 * Warranty-status business rules.
 *
 * Extracted from the Warranties page: derive a warranty's effective state from
 * its stored status and end date, decoupled from any UI (icons/colours).
 */

import { differenceInDays } from 'date-fns';

export type WarrantyState = 'active' | 'expiring' | 'expired' | 'claimed';

export interface WarrantyStatus {
  state: WarrantyState;
  daysRemaining: number;
}

/** Warranties within this many days of expiry are flagged as "expiring". */
export const EXPIRING_WINDOW_DAYS = 30;

export function warrantyState(
  status: string,
  endDate: string | Date,
  now: Date = new Date(),
): WarrantyStatus {
  if (status === 'claimed') return { state: 'claimed', daysRemaining: 0 };
  if (status === 'expired') return { state: 'expired', daysRemaining: 0 };

  const daysRemaining = differenceInDays(new Date(endDate), now);
  if (daysRemaining < 0) return { state: 'expired', daysRemaining };
  if (daysRemaining <= EXPIRING_WINDOW_DAYS) return { state: 'expiring', daysRemaining };
  return { state: 'active', daysRemaining };
}
