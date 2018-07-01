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

/**
 * Returns the current status.
 * @param  state - The Redux state.
 * @return The current status.
 */
export const getStatus = createSelector([getAppState], (app) => app.status)

/**
 * Returns if a new changelog is available or not.
 * @param  state - The Redux state.
 * @return `true` when a changelog is available.
 */
export const getShouldReadChangelog = createSelector([getAppState], (app) => app.shouldReadChangelog)

/**
 * Returns if the chatters list should be visible or not.
 * @param  state - The Redux state.
 * @return `true` when showing the chatters list.
 */
export const getShowChattersList = createSelector([getAppState], (app) => app.showChattersList)
