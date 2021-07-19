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
 * Checks if 2 dates are in the same week.
 * @param lDate - The first date.
 * @param rDate - The second date.
 * @returns `true` is the dates are in the same week.
 */
export function isSameWeek(lDate: Date, rDate: Date) {
  return getStartOfWeek(lDate).getTime() === getStartOfWeek(rDate).getTime()
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
 * Returns the start of the week for a date.
 * @param date - The date.
 * @param weekStart - The day of the week (0 represents Sunday).
 * @returns A new date at the start of the week.
 */
function getStartOfWeek(date: Date, weekStart = 1) {
  const startOfWeek = cloneDate(date)

  const day = startOfWeek.getDay()
  const diff = day - weekStart + (day < weekStart ? 7 : 0)

  startOfWeek.setDate(startOfWeek.getDate() - diff)
  startOfWeek.setHours(0, 0, 0, 0)

  return startOfWeek
}
