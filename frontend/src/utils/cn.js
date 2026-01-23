/**
 * Class name concatenation utility
 * Handles conditional classes elegantly
 * @param {...(string|boolean|undefined|null)} classes - Class names or falsy values
 * @returns {string} - Concatenated class string
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
