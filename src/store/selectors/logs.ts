import * as _ from 'lodash'
import { createSelector } from 'reselect'

import { ApplicationState } from 'Store/reducers'

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
