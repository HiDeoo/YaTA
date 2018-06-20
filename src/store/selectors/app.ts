import { createSelector } from 'reselect'

import { ApplicationState } from 'Store/reducers'

/**
 * Returns the app state.
 * @param  state - The Redux state.
 * @return The app state.
 */
const getAppState = (state: ApplicationState) => state.app

/**
 * Returns the current channel.
 * @param  state - The Redux state.
 * @return The current channel.
 */
export const getChannel = createSelector([getAppState], (app) => app.channel)
