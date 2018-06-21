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
