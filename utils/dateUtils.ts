/**
 * Format date to display as "9 December 2025"
 * @param date - Date object, string, or number timestamp
 * @returns Formatted date string
 * 
 * Examples:
 * - formatDisplayDate(new Date()) -> "15 December 2024"
 * - formatDisplayDate("2024-12-25") -> "25 December 2024"
 * - formatDisplayDate(1735689600000) -> "1 January 2025"
 */
export function formatDisplayDate(date: Date | string | number): string {
  const dateObj = new Date(date);
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long', 
    year: 'numeric'
  };
  
  return dateObj.toLocaleDateString('en-US', options);
}

/**
 * Format date with time for detailed displays
 * @param date - Date object, string, or number timestamp
 * @returns Formatted date and time string
 * 
 * Examples:
 * - formatDisplayDateTime(new Date()) -> "15 December 2024 at 10:30 AM"
 */
export function formatDisplayDateTime(date: Date | string | number): string {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const dateOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  
  const dateStr = dateObj.toLocaleDateString('en-US', dateOptions);
  const timeStr = dateObj.toLocaleTimeString('en-US', timeOptions);
  
  return `${dateStr} at ${timeStr}`;
} 