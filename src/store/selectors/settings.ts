import * as _ from 'lodash'
import { createSelector } from 'reselect'

import { ApplicationState } from 'Store/reducers'

/**
 * Returns the settings state.
 * @param  state - The Redux state.
 * @return The settings state.
 */
const getSettingsState = (state: ApplicationState) => state.settings

/**
 * Returns all the actions organized by ids.
 * @param  state - The Redux state.
 * @return The logs.
 */
const getActionsById = (state: ApplicationState) => state.settings.actions.byId

/**
 * Returns all actions ids sorted by order.
 * @param  state - The Redux state.
 * @return The logs ids.
 */
const getActionsAllIds = (state: ApplicationState) => state.settings.actions.allIds

/**
 * Returns the theme.
 * @param  state - The Redux state.
 * @return The theme.
 */
export const getTheme = createSelector([getSettingsState], (settings) => settings.theme)

/**
 * Returns the last known version.
 * @param  state - The Redux state.
 * @return The version.
 */
export const getLastKnownVersion = createSelector([getSettingsState], (settings) => settings.lastKnownVersion)

/**
 * Returns the 'Copy message on double click' setting.
 * @param  state - The Redux state.
 * @return The 'Copy message on double click' setting.
 */
export const getCopyMessageOnDoubleClick = createSelector(
  [getSettingsState],
  (settings) => settings.copyMessageOnDoubleClick
)

/**
 * Returns the 'Show context menu' setting.
 * @param  state - The Redux state.
 * @return The 'Show context menu' setting.
 */
export const getShowContextMenu = createSelector([getSettingsState], (settings) => settings.showContextMenu)

/**
 * Returns the highlights.
 * @param  state - The Redux state.
 * @return The highlights.
 */
export const getHighlights = createSelector([getSettingsState], (settings) => settings.highlights)

/**
 * Returns the highlights ignored users.
 * @param  state - The Redux state.
 * @return The ignored users.
 */
export const getHighlightsIgnoredUsers = createSelector(
  [getSettingsState],
  (settings) => settings.highlightsIgnoredUsers
)

/**
 * Returns the permanently highlighted users.
 * @param  state - The Redux state.
 * @return The users.
 */
export const getHighlightsPermanentUsers = createSelector(
  [getSettingsState],
  (settings) => settings.highlightsPermanentUsers
)

/**
 * Returns the actions in order.
 * @param  state - The Redux state.
 * @return The actions in order.
 */
export const getActions = createSelector([getActionsAllIds, getActionsById], (allIds, byId) => {
  return _.map(allIds, (id) => byId[id])
})

/**
 * Returns the 'Hide whispers' setting.
 * @param  state - The Redux state.
 * @return The 'Hide whispers' setting.
 */
export const getHideWhispers = createSelector([getSettingsState], (settings) => settings.hideWhispers)

/**
 * Returns all settings available for a backup.
 * @param  state - The Redux state.
 * @return The settings.
 */
export const getSettingsBackup = (state: ApplicationState) => state.settings

/**
 * Returns the 'Automatically focus the input field' setting.
 * @param  state - The Redux state.
 * @return The 'Automatically focus the input field' setting.
 */
export const getAutoFocusInput = createSelector([getSettingsState], (settings) => settings.autoFocusInput)

/**
 * Returns the 'Show viewer count' setting.
 * @param  state - The Redux state.
 * @return The 'Show viewer count' setting.
 */
export const getShowViewerCount = createSelector([getSettingsState], (settings) => settings.showViewerCount)

/**
 * Returns the 'Disable dialog animations' setting.
 * @param  state - The Redux state.
 * @return The 'Disable dialog animations' setting.
 */
export const getDisableDialogAnimations = createSelector(
  [getSettingsState],
  (settings) => settings.disableDialogAnimations
)

/**
 * Returns the 'Highlight all mentions' setting.
 * @param  state - The Redux state.
 * @return The 'Highlight all mentions' setting.
 */
export const getHighlightAllMentions = createSelector([getSettingsState], (settings) => settings.highlightAllMentions)

/**
 * Returns the 'Prioritize usernames' setting.
 * @param  state - The Redux state.
 * @return The 'Prioritize usernames' setting.
 */
export const getPrioritizeUsernames = createSelector([getSettingsState], (settings) => settings.prioritizeUsernames)

/**
 * Returns the 'Host threshold' setting.
 * @param  state - The Redux state.
 * @return The 'Host threshold' setting.
 */
export const getHostThreshold = createSelector([getSettingsState], (settings) => settings.hostThreshold)

/**
 * Returns the 'Auto-host threshold' setting.
 * @param  state - The Redux state.
 * @return The 'Auto-host threshold' setting.
 */
export const getAutoHostThreshold = createSelector([getSettingsState], (settings) => settings.autoHostThreshold)

/**
 * Returns the 'Play sound on mentions' setting.
 * @param  state - The Redux state.
 * @return The 'Play sound on mentions' setting.
 */
export const getPlaySoundOnMentions = createSelector([getSettingsState], (settings) => settings.playSoundOnMentions)

/**
 * Returns the 'Play sound on whispers' setting.
 * @param  state - The Redux state.
 * @return The 'Play sound on whispers' setting.
 */
export const getPlaySoundOnWhispers = createSelector([getSettingsState], (settings) => settings.playSoundOnWhispers)

/**
 * Returns the 'Follows sort order' setting.
 * @param  state - The Redux state.
 * @return The 'Follows sort order' setting.
 */
export const getFollowsSortOrder = createSelector([getSettingsState], (settings) => settings.followsSortOrder)

/**
 * Returns the 'Hide offline follows' setting.
 * @param  state - The Redux state.
 * @return The 'Hide offline follows' setting.
 */
export const getHideOfflineFollows = createSelector([getSettingsState], (settings) => settings.hideOfflineFollows)
