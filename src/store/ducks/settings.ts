import * as _ from 'lodash'
import { Reducer } from 'redux'
import { REHYDRATE } from 'redux-persist/lib/constants'

import Theme from 'Constants/theme'
import { createAction, RehydrateAction } from 'Utils/redux'

/**
 * Actions types.
 */
export enum Actions {
  TOGGLE_THEME = 'settings/TOGGLE_THEME',
}

/**
 * Initial state.
 */
export const initialState = {
  theme: Theme.Dark as SettingsState['theme'],
}

/**
 * Settings reducer.
 * @param  [state=initialState] - Current state.
 * @param  action - Current action.
 * @return The new state.
 */
const settingsReducer: Reducer<SettingsState, SettingsActions> = (state = initialState, action) => {
  switch (action.type) {
    case REHYDRATE: {
      if (!_.get(action.payload, 'settings')) {
        return state
      }

      return action.payload.settings
    }
    case Actions.TOGGLE_THEME: {
      return {
        ...state,
        theme: state.theme === Theme.Dark ? Theme.Light : Theme.Dark,
      }
    }
    default: {
      return state
    }
  }
}

export default settingsReducer

/**
 * Toggle between the light & dark theme.
 * @return The action.
 */
export const toggleTheme = () => createAction(Actions.TOGGLE_THEME)

/**
 * Settings actions.
 */
export type SettingsActions = RehydrateAction | ReturnType<typeof toggleTheme>

/**
 * Settings state.
 */
export type SettingsState = {
  /**
   * Test state.
   */
  theme: Theme
}
