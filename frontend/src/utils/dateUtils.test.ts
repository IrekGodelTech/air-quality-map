import { describe, it, expect } from 'vitest';
import { formatDateTime } from './dateUtils';

describe('formatDateTime', () => {
  it('formats ISO date string correctly', () => {
    const isoDate = '2024-01-15T10:30:45.000Z';
    const result = formatDateTime(isoDate);
    
    // The result will vary based on timezone, but should match the format
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });

  it('formats date with single-digit month and day correctly', () => {
    const isoDate = '2024-03-05T08:05:03.000Z';
    const result = formatDateTime(isoDate);
    
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });

  it('pads single-digit values with zeros', () => {
    const isoDate = '2024-01-05T08:05:03.000Z';
    const result = formatDateTime(isoDate);
    
    // Check that month, day, hour, minute, second are all 2 digits
    const parts = result.split(/[-: ]/);
    expect(parts).toHaveLength(6); // YYYY, MM, DD, HH, MM, SS
    parts.forEach((part, index) => {
      if (index === 0) {
        expect(part).toHaveLength(4); // Year
      } else {
        expect(part).toHaveLength(2); // All other parts
      }
    });
  });

  it('handles midnight correctly', () => {
    const isoDate = '2024-06-15T00:00:00.000Z';
    const result = formatDateTime(isoDate);
    
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });

  it('handles end of day correctly', () => {
    const isoDate = '2024-12-31T23:59:59.000Z';
    const result = formatDateTime(isoDate);
    
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });

  it('converts UTC to local timezone', () => {
    // Create a specific date and verify it's formatted consistently
    const date = new Date('2024-06-15T12:00:00.000Z');
    const isoDate = date.toISOString();
    const result = formatDateTime(isoDate);
    
    // Verify format structure
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    
    // Verify the formatted string represents the same timestamp
    const [datePart, timePart] = result.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
    
    const reconstructed = new Date(year, month - 1, day, hours, minutes, seconds);
    expect(reconstructed.getTime()).toBe(date.getTime());
  });

  it('handles different years correctly', () => {
    const dates = [
      '2020-01-01T00:00:00.000Z',
      '2021-06-15T12:30:45.000Z',
      '2024-12-31T23:59:59.000Z',
      '2025-07-04T16:20:10.000Z',
    ];

    dates.forEach((isoDate) => {
      const result = formatDateTime(isoDate);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
      
      const year = isoDate.substring(0, 4);
      // Year should be somewhere in the result (accounting for timezone differences)
      const resultYear = result.substring(0, 4);
      // Could be +/-1 year depending on timezone
      expect(Math.abs(parseInt(resultYear) - parseInt(year))).toBeLessThanOrEqual(1);
    });
  });

  it('produces consistent format across multiple calls', () => {
    const isoDate = '2024-06-15T14:30:25.000Z';
    
    const result1 = formatDateTime(isoDate);
    const result2 = formatDateTime(isoDate);
    const result3 = formatDateTime(isoDate);
    
    expect(result1).toBe(result2);
    expect(result2).toBe(result3);
  });

  it('handles dates with milliseconds', () => {
    const isoDate = '2024-06-15T14:30:25.123Z';
    const result = formatDateTime(isoDate);
    
    // Should format to seconds precision, ignoring milliseconds
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });

  it('formats recent dates correctly', () => {
    const now = new Date();
    const isoDate = now.toISOString();
    const result = formatDateTime(isoDate);
    
    // Verify format
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    
    // Verify it contains current year
    const currentYear = now.getFullYear().toString();
    expect(result).toContain(currentYear);
  });
});
