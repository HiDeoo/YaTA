/**
 * Clones a date.
 * @param  date - The date to clone.
 * @return A new instance of the date.
 */
function cloneDate(date: Date): Date {
  return new Date(date.getTime())
}

/**
 * Removes a specified number of days to the given date.
 * @param  date - The date to modify.
 * @param  amount - The amount of days to remove
 * @return The new date.
 */
export function subDays(date: Date, amount: number): Date {
  const newDate = cloneDate(date)

  newDate.setDate(newDate.getDate() - amount)

  return newDate
}

/**
 * Removes a specified number of months to the given date.
 * Note: this is a very basic implementation.
 * @param  date - The date to modify.
 * @param  amount - The amount of month to remove
 * @return The new date.
 */
export function subMonths(date: Date, amount: number): Date {
  const newDate = cloneDate(date)

  newDate.setMonth(newDate.getMonth() - amount)

  return newDate
}

/**
 * Checks if 2 dates are in the same day.
 * @param lDate - The first date.
 * @param rDate - The second date.
 * @returns `true` is the dates are in the same day.
 */
export function isSameDay(lDate: Date, rDate: Date) {
  return getStartOfDay(lDate).getTime() === getStartOfDay(rDate).getTime()
}

/**
 * Gets the absolute number of days between two dates.
 * @param lDate - The first date.
 * @param rDate - The second date.
 * @returns The number of days.
 */
export function getDaysBetween(lDate: Date, rDate: Date) {
  return Math.abs(Math.floor((getNormalizedUTCDate(lDate) - getNormalizedUTCDate(rDate)) / (1000 * 60 * 60 * 24)))
}

/**
 * Returns the start of the day for a date.
 * @param date - The date.
 * @returns A new date at the start of the day.
 */
function getStartOfDay(date: Date) {
  const startOfDay = cloneDate(date)
  startOfDay.setHours(0, 0, 0, 0)

  return startOfDay
}

/**
 * Normalizes a date by removing the time and timezone informations.
 * @param date - The date to normalize.
 * @returns The normalized date.
 */
function getNormalizedUTCDate(date: Date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
}
