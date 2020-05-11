import _ from 'lodash'
import { createSelector } from 'reselect'

import { ApplicationState } from 'store/reducers'

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

/**
 * Returns if the user is known as a moderator or not.
 * @param  state - The Redux state.
 * @return `true` when a moderator.
 */
export const getIsMod = createSelector([getUserState], (user) => user.isMod)

/**
 * Returns the chat login details.
 * @param  state - The Redux state.
 * @return The chat login details.
 */
export const getChatLoginDetails = createSelector([getUserState], (user) => {
  if (_.isNil(user.tokens) || _.isNil(user.username)) {
    return null
  }

  return {
    password: `oauth:${user.tokens.access}`,
    username: user.username,
  }
})

/**
 * Returns the login details.
 * @param  state - The Redux state.
 * @return The login details.
 */
export const getLoginDetails = createSelector([getUserState], (user) => {
  if (_.isNil(user.tokens) || _.isNil(user.username)) {
    return null
  }

  return {
    id: user.tokens.id.sub,
    password: user.tokens.access,
    username: user.username,
  }
})
