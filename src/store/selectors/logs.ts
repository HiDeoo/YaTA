import * as _ from 'lodash'
import { createSelector } from 'reselect'

import { SerializedMessage } from 'Libs/Message'
import { isMessage } from 'Store/ducks/logs'
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
 * Returns all the logs in a chronological order.
 * @param  state - The Redux state.
 * @return The logs in chronological order.
 */
export const getLogs = createSelector([getLogsAllIds, getLogsById], (allIds, byId) => {
  return _.map(allIds, (id) => byId[id])
})

/**
 * Returns all the logs matching specific ids.
 * @param  state - The Redux state.
 * @return The logs.
 */
export const getLogsByIds = (state: ApplicationState, ids: string[]) => {
  const logs: SerializedMessage[] = []

  _.forEach(ids, (id) => {
    const log = _.get(state.logs.byId, id)

    if (!_.isNil(log) && isMessage(log)) {
      logs.push(log)
    }
  })

  return logs
}

/**
 * Returns if auto scrolling is disabled or not.
 * @param  state - The Redux state.
 * @return `true` when disabled.
 */
export const getPauseAutoScroll = createSelector([getLogsState], (logs) => logs.pauseAutoScroll)
