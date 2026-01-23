/**
 * Confetti Configuration
 * Orange/Gold circular confetti for celebration effects
 */
export const CONFETTI_COUNT = 50;

export const CONFETTI_COLORS = [
  'var(--color-brand-orange)',
  'var(--color-brand-gold)',
];

/**
 * Generate confetti items with pseudo-random distribution
 * @returns {Array} Array of confetti item configurations
 */
export function generateConfettiItems() {
  return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
    id: i,
    left: (i * 37 + 13) % 100,
    delay: (i * 0.04) % 2,
    duration: 2 + (i % 3),
    color: CONFETTI_COLORS[i % 2],
    size: 8 + (i % 4) * 2, // 8px, 10px, 12px, 14px
  }));
}
