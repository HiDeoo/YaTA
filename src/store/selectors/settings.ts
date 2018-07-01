import { createSelector } from 'reselect'

import { ApplicationState } from 'Store/reducers'

/**
 * Returns the settings state.
 * @param  state - The Redux state.
 * @return The settings state.
 */
const getSettingsState = (state: ApplicationState) => state.settings

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
