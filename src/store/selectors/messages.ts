import * as _ from 'lodash'
import { createSelector } from 'reselect'

import { ApplicationState } from 'Store/reducers'

/**
 * Returns all the messages organized by ids.
 * @param  state - The Redux state.
 * @return The messages.
 */
const getMessagesById = (state: ApplicationState) => state.messages.byId

/**
 * Returns all messages ids in chronological order.
 * @param  state - The Redux state.
 * @return The messages ids.
 */
const getMessagesAllIds = (state: ApplicationState) => state.messages.allIds

/**
 * Returns all the messages in a chronological order.
 * @param  state - The Redux state.
 * @return The messages in chronological order.
 */
export const getMessages = createSelector([getMessagesAllIds, getMessagesById], (allIds, byId) => {
  return _.map(allIds, (id) => byId[id])
})
