import { describe, it, expect } from 'vitest';
import { tierForPoints } from './loyalty';

describe('tierForPoints', () => {
  it('maps points to the correct tier at each boundary', () => {
    expect(tierForPoints(0)).toBe('bronze');
    expect(tierForPoints(199)).toBe('bronze');
    expect(tierForPoints(200)).toBe('silver');
    expect(tierForPoints(499)).toBe('silver');
    expect(tierForPoints(500)).toBe('gold');
    expect(tierForPoints(999)).toBe('gold');
    expect(tierForPoints(1000)).toBe('platinum');
    expect(tierForPoints(5000)).toBe('platinum');
  });
});
