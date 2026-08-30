import { describe, it, expect } from 'vitest';
import { warrantyState } from './warranty';

const NOW = new Date('2026-06-01T00:00:00Z');

describe('warrantyState', () => {
  it('respects an explicit claimed or expired status', () => {
    expect(warrantyState('claimed', '2027-01-01', NOW).state).toBe('claimed');
    expect(warrantyState('expired', '2027-01-01', NOW).state).toBe('expired');
  });

  it('derives expired when the end date is in the past', () => {
    expect(warrantyState('active', '2026-05-01', NOW).state).toBe('expired');
  });

  it('flags warranties within the expiring window', () => {
    const result = warrantyState('active', '2026-06-20', NOW);
    expect(result.state).toBe('expiring');
    expect(result.daysRemaining).toBe(19);
  });

  it('is active well before expiry', () => {
    expect(warrantyState('active', '2026-12-01', NOW).state).toBe('active');
  });
});
