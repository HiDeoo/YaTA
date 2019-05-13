import * as _ from 'lodash'
import { createSelector } from 'reselect'

import { Shortcut, ShortcutDefinitions, ShortcutGroup, ShortcutType } from 'Constants/shortcut'
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
export const getTheme = createSelector(
  [getSettingsState],
  (settings) => settings.theme
)

/**
 * Returns the last known version.
 * @param  state - The Redux state.
 * @return The version.
 */
export const getLastKnownVersion = createSelector(
  [getSettingsState],
  (settings) => settings.lastKnownVersion
)

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
export const getShowContextMenu = createSelector(
  [getSettingsState],
  (settings) => settings.showContextMenu
)

/**
 * Returns the highlights.
 * @param  state - The Redux state.
 * @return The highlights.
 */
export const getHighlights = createSelector(
  [getSettingsState],
  (settings) => settings.highlights
)

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
export const getActions = createSelector(
  [getActionsAllIds, getActionsById],
  (allIds, byId) => {
    return _.map(allIds, (id) => byId[id])
  }
)

/**
 * Returns the 'Hide whispers' setting.
 * @param  state - The Redux state.
 * @return The 'Hide whispers' setting.
 */
export const getHideWhispers = createSelector(
  [getSettingsState],
  (settings) => settings.hideWhispers
)

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
export const getAutoFocusInput = createSelector(
  [getSettingsState],
  (settings) => settings.autoFocusInput
)

/**
 * Returns the 'Show viewer count' setting.
 * @param  state - The Redux state.
 * @return The 'Show viewer count' setting.
 */
export const getShowViewerCount = createSelector(
  [getSettingsState],
  (settings) => settings.showViewerCount
)

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
export const getHighlightAllMentions = createSelector(
  [getSettingsState],
  (settings) => settings.highlightAllMentions
)

/**
 * Returns the 'Prioritize usernames' setting.
 * @param  state - The Redux state.
 * @return The 'Prioritize usernames' setting.
 */
export const getPrioritizeUsernames = createSelector(
  [getSettingsState],
  (settings) => settings.prioritizeUsernames
)

/**
 * Returns the 'Host threshold' setting.
 * @param  state - The Redux state.
 * @return The 'Host threshold' setting.
 */
export const getHostThreshold = createSelector(
  [getSettingsState],
  (settings) => settings.hostThreshold
)

/**
 * Returns the 'Auto-host threshold' setting.
 * @param  state - The Redux state.
 * @return The 'Auto-host threshold' setting.
 */
export const getAutoHostThreshold = createSelector(
  [getSettingsState],
  (settings) => settings.autoHostThreshold
)

/**
 * Returns the 'Follows sort order' setting.
 * @param  state - The Redux state.
 * @return The 'Follows sort order' setting.
 */
export const getFollowsSortOrder = createSelector(
  [getSettingsState],
  (settings) => settings.followsSortOrder
)

/**
 * Returns the 'Hide offline follows' setting.
 * @param  state - The Redux state.
 * @return The 'Hide offline follows' setting.
 */
export const getHideOfflineFollows = createSelector(
  [getSettingsState],
  (settings) => settings.hideOfflineFollows
)

/**
 * Returns all shortcuts.
 * @param  state - The Redux state.
 * @return The shortcuts.
 */
export const getShortcuts = createSelector(
  [getSettingsState],
  (settings) => {
    return _.reduce(
      ShortcutType,
      (shortcuts, shortcut) => {
        shortcuts[shortcut] = { ...ShortcutDefinitions[shortcut], combo: settings.shortcuts[shortcut] }

        return shortcuts
      },
      {} as Record<ShortcutType, Shortcut>
    )
  }
)

/**
 * Returns all shortcuts grouped.
 * @param  state - The Redux state.
 * @return The grouped shortcuts.
 */
export const getGroupedShortcuts = createSelector(
  [getShortcuts],
  (shortcuts) => {
    return _.reduce(
      ShortcutGroup,
      (groupedShortcuts, group) => {
        const groupShortcuts = _.filter(shortcuts, ['group', group])

        if (groupShortcuts.length > 0) {
          groupedShortcuts[group] = groupShortcuts
        }

        return groupedShortcuts
      },
      {} as Record<ShortcutGroup, Shortcut[]>
    )
  }
)

/**
 * Returns the 'Hide VIP badges' setting.
 * @param  state - The Redux state.
 * @return The 'Hide VIP badges' setting.
 */
export const getHideVIPBadges = createSelector(
  [getSettingsState],
  (settings) => settings.hideVIPBadges
)

/**
 * Returns the 'Add whispers to history' setting.
 * @param  state - The Redux state.
 * @return The 'Add whispers to history' setting.
 */
export const getAddWhispersToHistory = createSelector(
  [getSettingsState],
  (settings) => settings.addWhispersToHistory
)

/**
 * Returns the sound settings.
 * @param  state - The Redux state.
 * @return The sound settings.
 */
export const getSoundSettings = createSelector(
  [getSettingsState],
  (settings) => settings.sounds
)

/**
 * Returns the 'Play sound on messages only in my channel' setting.
 * @param  state - The Redux state.
 * @return The 'Play sound on messages only in my channel' setting.
 */
export const getPlayMessageSoundOnlyInOwnChannel = createSelector(
  [getSettingsState],
  (settings) => settings.playMessageSoundOnlyInOwnChannel
)

/**
 * Returns the 'Delay between throttled sounds' setting.
 * @param  state - The Redux state.
 * @return The 'Delay between throttled sounds' setting.
 */
export const getDelayBetweenThrottledSounds = createSelector(
  [getSettingsState],
  (settings) => settings.delayBetweenThrottledSounds
)

/**
 * Returns the 'Hide header' setting.
 * @param  state - The Redux state.
 * @return The 'Hide header' setting.
 */
export const getHideHeader = createSelector(
  [getSettingsState],
  (settings) => settings.hideHeader
)
