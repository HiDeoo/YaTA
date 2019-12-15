import * as _ from 'lodash'
import { createSelector } from 'reselect'

import { ApplicationState } from 'store/reducers'

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
export const getChannel = createSelector(
  [getAppState],
  (app) => app.channel
)

/**
 * Returns the current status.
 * @param  state - The Redux state.
 * @return The current status.
 */
export const getStatus = createSelector(
  [getAppState],
  (app) => app.status
)

/**
 * Returns if a new changelog is available or not.
 * @param  state - The Redux state.
 * @return `true` when a changelog is available.
 */
export const getShouldReadChangelog = createSelector(
  [getAppState],
  (app) => app.shouldReadChangelog
)

/**
 * Returns the history.
 * @param  state - The Redux state.
 * @return The history.
 */
export const getHistory = createSelector(
  [getAppState],
  (app) => app.history
)

/**
 * Returns the history index.
 * @param  state - The Redux state.
 * @return The history index.
 */
export const getHistoryIndex = createSelector(
  [getAppState],
  (app) => app.historyIndex
)

/**
 * Returns all the emotes available.
 * @param  state - The Redux state.
 * @return The emotes.
 */
export const getEmotes = createSelector(
  [getAppState],
  (app) => {
    return _.sortBy(_.flatten(_.values(app.emotes)), 'code')
  }
)

/**
 * Returns the room state.
 * @param  state - The Redux state.
 * @return The room state.
 */
export const getRoomState = createSelector(
  [getAppState],
  (app) => app.roomState
)

/**
 * Returns the channel id when defined.
 * @param  state - The Redux state.
 * @return The channel id.
 */
export const getChannelId = createSelector(
  [getAppState],
  (app) => _.get(app.roomState, 'roomId')
)

/**
 * Returns the username of the last person that sent us a whisper.
 * @param  state - The Redux state.
 * @return The username.
 */
export const getLastWhisperSender = createSelector(
  [getAppState],
  (app) => app.lastWhisperSender
)

/**
 * Returns all the emotes sets available.
 * @param  state - The Redux state.
 * @return The emotes sets.
 */
export const getEmotesSets = createSelector(
  [getAppState],
  (app) => {
    return _.reduce(
      app.emotes,
      (emotes, setEmotes, setPrefix) => {
        emotes[setPrefix] = _.sortBy(setEmotes, (emote) => emote.code.toLowerCase())

        return emotes
      },
      {} as typeof app.emotes
    )
  }
)
