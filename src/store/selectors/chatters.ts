import * as _ from 'lodash'
import { createSelector } from 'reselect'

import { ApplicationState } from 'store/reducers'

/**
 * Returns the chatter state.
 * @param  state - The Redux state.
 * @return The chatter state.
 */
const getChattersState = (state: ApplicationState) => state.chatters

/**
 * Returns the state of a specific chatter based on its id.
 * @param  state - The Redux state.
 * @param  id - The chatter id.
 * @return The chatter state.
 */
const getChatterState = (state: ApplicationState, id: string) => state.chatters.byId[id]

/**
 * Returns all the known chatters.
 * @param  state - The Redux state.
 * @return The chatters.
 */
export const getChatters = createSelector(
  [getChattersState],
  (chatters) => _.get(chatters, 'byId')
)

/**
 * Returns all the chatters map from username to id.
 * @param  state - The Redux state.
 * @return The chatters map.
 */
export const getChattersMap = createSelector(
  [getChattersState],
  (chatters) => _.get(chatters, 'byName')
)

/**
 * Creates the selector retuning a chatter logs ids.
 * @return The selector.
 */
export const makeGetChatterLogs = () =>
  createSelector(
    [getChatterState],
    (chatter) => _.get(chatter, 'logs')
  )
