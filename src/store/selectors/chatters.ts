import * as _ from 'lodash'
import { createSelector } from 'reselect'

import { ApplicationState } from 'Store/reducers'

/**
 * Returns the chatter state.
 * @param  state - The Redux state.
 * @return The chatter state.
 */
const getChattersState = (state: ApplicationState) => state.chatters

/**
 * Returns all the known chatters.
 * @param  state - The Redux state.
 * @return The chatters.
 */
export const getChatters = createSelector([getChattersState], (chatters) => _.get(chatters, 'byId'))
