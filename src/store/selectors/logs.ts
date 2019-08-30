import * as _ from 'lodash'
import { createSelector } from 'reselect'

import { SerializedMessage } from 'Libs/Message'
import { SerializedNotification } from 'Libs/Notification'
import { isMessage, isNotification } from 'Store/ducks/logs'
import { ApplicationState } from 'Store/reducers'

/**
 * Returns the logs state.
 * @param  state - The Redux state.
 * @return The logs state.
 */
const getLogsState = (state: ApplicationState) => state.logs

/**
 * Returns all the logs organized by ids.
 * @param  state - The Redux state.
 * @return The logs.
 */
const getLogsById = (state: ApplicationState) => state.logs.byId

/**
 * Returns all logs ids in chronological order.
 * @param  state - The Redux state.
 * @return The logs ids.
 */
const getLogsAllIds = (state: ApplicationState) => state.logs.allIds

/**
 * Returns all the logs in a chronological order and the number of purged logs.
 * @param  state - The Redux state.
 * @return The logs in chronological order and the number of purged logs.
 */
export const getLogs = createSelector(
  [getLogsAllIds, getLogsById],
  (allIds, byId) => {
    let purgedCount = 0

    const logs = _.map(allIds, (id) => {
      const log = byId[id]

      if (isMessage(log) && log.purged) {
        purgedCount += 1
      }

      return log
    })

    return { logs, purgedCount }
  }
)

/**
 * Returns all the logs matching specific ids.
 * @param  state - The Redux state.
 * @return The logs.
 */
export const getLogsByIds = (state: ApplicationState, ids: string[]) => {
  const logs: Array<SerializedMessage | SerializedNotification> = []

  _.forEach(ids, (id) => {
    const log = _.get(state.logs.byId, id)

    if (!_.isNil(log) && (isMessage(log) || isNotification(log))) {
      logs.push(log)
    }
  })

  return logs
}

/**
 * Returns if auto scrolling is paused or not.
 * @param  state - The Redux state.
 * @return `true` when disabled.
 */
export const getIsAutoScrollPaused = createSelector(
  [getLogsState],
  (logs) => logs.isAutoScrollPaused
)

/**
 * Returns the id of the last message marked as read.
 * @param  state - The Redux state.
 * @return The message id if any
 */
export const getLastReadId = createSelector(
  [getLogsState],
  (logs) => logs.lastReadId
)
