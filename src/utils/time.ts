import * as _ from 'lodash'

/**
 * RegExp used to identify an ISO 8601 duration.
 */
const DurationRegExp = /^PT(?:(\d+)D)?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/

/**
 * Returns the human readable representation of an ISO 8601 duration used by Youtube.
 * @param  duration - The ISO 8601 duration.
 * @return The human readable duration.
 */
export function durationToString(duration: string) {
  const matches = DurationRegExp.exec(duration)

  if (_.isNil(matches)) {
    return null
  }

  const days = parseInt(_.get(matches, 1, '0'), 10)
  const hours = parseInt(_.get(matches, 2, '0'), 10)
  const minutes = parseInt(_.get(matches, 3, '0'), 10)
  const seconds = parseInt(_.get(matches, 4, '0'), 10)

  let timeString = ''

  if (days > 0) {
    timeString = timeString.concat(`${padTimeUnit(days)}:`)
  }

  if (hours > 0) {
    timeString = timeString.concat(`${padTimeUnit(hours)}:`)
  }

  timeString = minutes > 0 ? timeString.concat(`${padTimeUnit(minutes)}:`) : '00:'

  if (seconds > 0) {
    timeString = timeString.concat(`${padTimeUnit(seconds)}`)
  }

  return timeString.length > 0 ? timeString : null
}

/**
 * Pads a time unit.
 * @param  timeUnit - The pad unit to pad.
 * @return The padded time unit.
 */
export function padTimeUnit(timeUnit: string | number) {
  return _.padStart(_.isNumber(timeUnit) ? timeUnit.toString() : timeUnit, 2, '0')
}
