import { describe, it, expect } from 'vitest';
import { WINNING_LINES, getCompletedLines, getHighlightedPositions } from './bingoUtils';

describe('bingoUtils', () => {
  describe('WINNING_LINES', () => {
    it('has 12 winning lines', () => {
      expect(WINNING_LINES).toHaveLength(12);
    });

    it('has 5 horizontal lines', () => {
      const horizontalLines = WINNING_LINES.slice(0, 5);
      expect(horizontalLines[0]).toEqual([0, 1, 2, 3, 4]);
      expect(horizontalLines[4]).toEqual([20, 21, 22, 23, 24]);
    });

    it('has 5 vertical lines', () => {
      const verticalLines = WINNING_LINES.slice(5, 10);
      expect(verticalLines[0]).toEqual([0, 5, 10, 15, 20]);
      expect(verticalLines[4]).toEqual([4, 9, 14, 19, 24]);
    });

    it('has 2 diagonal lines', () => {
      const diagonalLines = WINNING_LINES.slice(10, 12);
      expect(diagonalLines[0]).toEqual([0, 6, 12, 18, 24]);
      expect(diagonalLines[1]).toEqual([4, 8, 12, 16, 20]);
    });
  });

  describe('getCompletedLines', () => {
    it('returns empty array when no cells are activated', () => {
      const cells = Array(25).fill(null).map((_, i) => ({
        position: i,
        is_activated: false,
      }));
      expect(getCompletedLines(cells)).toEqual([]);
    });

    it('detects first horizontal line', () => {
      const cells = Array(25).fill(null).map((_, i) => ({
        position: i,
        is_activated: i < 5, // 0, 1, 2, 3, 4 activated
      }));
      const completedLines = getCompletedLines(cells);
      expect(completedLines).toHaveLength(1);
      expect(completedLines[0]).toEqual([0, 1, 2, 3, 4]);
    });

    it('detects first vertical line', () => {
      const cells = Array(25).fill(null).map((_, i) => ({
        position: i,
        is_activated: [0, 5, 10, 15, 20].includes(i),
      }));
      const completedLines = getCompletedLines(cells);
      expect(completedLines).toHaveLength(1);
      expect(completedLines[0]).toEqual([0, 5, 10, 15, 20]);
    });

    it('detects main diagonal line', () => {
      const cells = Array(25).fill(null).map((_, i) => ({
        position: i,
        is_activated: [0, 6, 12, 18, 24].includes(i),
      }));
      const completedLines = getCompletedLines(cells);
      expect(completedLines).toHaveLength(1);
      expect(completedLines[0]).toEqual([0, 6, 12, 18, 24]);
    });

    it('detects multiple lines', () => {
      // 첫 번째 가로줄 + 첫 번째 세로줄
      const cells = Array(25).fill(null).map((_, i) => ({
        position: i,
        is_activated: i < 5 || [5, 10, 15, 20].includes(i),
      }));
      const completedLines = getCompletedLines(cells);
      expect(completedLines).toHaveLength(2);
    });

    it('handles empty cells array', () => {
      expect(getCompletedLines([])).toEqual([]);
    });
  });

  describe('getHighlightedPositions', () => {
    it('returns empty set when no completed lines', () => {
      expect(getHighlightedPositions([])).toEqual(new Set());
    });

    it('returns positions from single completed line', () => {
      const completedLines = [[0, 1, 2, 3, 4]];
      const result = getHighlightedPositions(completedLines);
      expect(result).toEqual(new Set([0, 1, 2, 3, 4]));
    });

    it('returns unique positions from multiple lines', () => {
      // 첫 번째 가로줄 + 첫 번째 세로줄 (0 is shared)
      const completedLines = [
        [0, 1, 2, 3, 4],
        [0, 5, 10, 15, 20],
      ];
      const result = getHighlightedPositions(completedLines);
      expect(result).toEqual(new Set([0, 1, 2, 3, 4, 5, 10, 15, 20]));
    });
  });
});
