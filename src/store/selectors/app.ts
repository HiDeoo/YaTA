import * as _ from 'lodash'
import { createSelector } from 'reselect'

import { ApplicationState } from 'Store/reducers'

/**
 * Returns the app state.
 * @param  state - The Redux state.
 * @return The app state.
 */
const getAppState = (state: ApplicationState) => state.app

/**
 * Returns the emote sets state.
 * @param  state - The Redux state.
 * @return The emote sets state.
 */
const getEmoteSetsState = (state: ApplicationState) => state.app.emoteSets

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

/**
 * Returns the history.
 * @param  state - The Redux state.
 * @return The history.
 */
export const getHistory = createSelector([getAppState], (app) => app.history)

/**
 * Returns the history index.
 * @param  state - The Redux state.
 * @return The history index.
 */
export const getHistoryIndex = createSelector([getAppState], (app) => app.historyIndex)

/**
 * Returns all the emotes available.
 * @param  state - The Redux state.
 * @return The emotes.
 */
export const getEmotes = createSelector([getEmoteSetsState], (sets) => {
  return _.flatten(_.values(sets)).sort()
})
