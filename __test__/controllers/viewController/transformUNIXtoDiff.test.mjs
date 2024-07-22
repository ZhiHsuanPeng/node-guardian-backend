import { createRequire } from 'module';
import { describe, it, expect, vi, beforeEach } from 'vitest';
const require = createRequire(import.meta.url);
const dotenv = require('dotenv');
const { transformUNIXtoDiff } = require('../../../controllers/viewController');

dotenv.config();

describe('transformUNIXtoDiff', () => {
  const now = Date.now();

  // Time constant
  const oneMinute = 1 * 60 * 1000;
  const anHour = 60 * 60 * 1000;

  // Test varaiable
  const oneMinuteAgo = now - oneMinute;
  const thirtyMinutesAgo = now - anHour * 0.5;
  const oneHourAgo = now - anHour;
  const sixHoursAgo = now - anHour * 6;
  const oneDayAgo = now - anHour * 24;
  const twoDaysAgo = now - anHour * 48;
  const thirtyDaysAgo = now - anHour * 720;

  it('difference in unix = 1 minute should return 1 minute', () => {
    expect(transformUNIXtoDiff(oneMinuteAgo)).toBe('1 minute');
  });
  it('difference in unix > 1 minute and < 1 hour should return minutes', () => {
    expect(transformUNIXtoDiff(thirtyMinutesAgo)).toBe('30 minutes');
  });
  it('difference in unix = 1 hour should return 1 hour', () => {
    expect(transformUNIXtoDiff(oneHourAgo)).toBe('1 hour');
  });
  it('difference in unix > 1 hour and < 24 hours should return hours', () => {
    expect(transformUNIXtoDiff(sixHoursAgo)).toBe('6 hours');
  });
  it('difference in unix > 24 hours and < 48 hours should return 1 day', () => {
    expect(transformUNIXtoDiff(oneDayAgo)).toBe('1 day');
  });
  it('difference in unix > 24 hours should return days', () => {
    expect(transformUNIXtoDiff(twoDaysAgo)).toBe('2 days');
  });
  it('difference in unix > 24 hours should return days', () => {
    expect(transformUNIXtoDiff(thirtyDaysAgo)).toBe('30 days');
  });
});
