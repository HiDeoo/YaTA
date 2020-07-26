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
