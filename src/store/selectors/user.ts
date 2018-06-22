import * as _ from 'lodash'
import { createSelector } from 'reselect'

import { ApplicationState } from 'Store/reducers'

/**
 * Returns the user state.
 * @param  state - The Redux state.
 * @return The user state.
 */
const getUserState = (state: ApplicationState) => state.user

/**
 * Returns if the user is logged in or not.
 * @param  state - The Redux state.
 * @return `true` when logged in.
 */
export const getIsLoggedIn = createSelector([getUserState], (user) => !_.isNil(user.tokens))
