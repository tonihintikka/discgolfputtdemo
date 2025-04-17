/**
 * Utilities for formatting various values in the application
 */

/**
 * Formats a difficulty level to a more readable format
 * @param difficulty The difficulty level to format (e.g., 'easy', 'medium', 'hard')
 * @returns Formatted difficulty level with capitalized first letter
 */
export const formatDifficultyLevel = (difficulty: string): string => {
  if (!difficulty) return '';
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
};

/**
 * Formats a date to a localized string
 * @param date The date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString();
};

/**
 * Formats a date to include time
 * @param date The date to format
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date | string): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString();
};

/**
 * Formats a percentage value
 * @param value The value to format as percentage
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number): string => {
  return `${Math.round(value * 100)}%`;
}; 