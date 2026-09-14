/**
 * FitFam Local Timezone Date Utilities
 * Ensures all calendar date strings (YYYY-MM-DD) reflect the user's local timezone
 * rather than UTC ISO strings.
 */

/**
 * Returns the local calendar date as a YYYY-MM-DD string.
 * @param d Optional Date instance (defaults to current local time)
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
