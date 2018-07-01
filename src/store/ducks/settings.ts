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
  SET_VERSION = 'settings/SET_VERSION',
  TOGGLE_COPY_MESSAGE_DOUBLE_CLICK = 'settings/TOGGLE_COPY_MESSAGE_DOUBLE_CLICK',
  TOGGLE_SHOW_CONTEXT_MENU = 'settings/TOGGLE_SHOW_CONTEXT_MENU',
}

/**
 * Initial state.
 */
export const initialState = {
  copyMessageOnDoubleClick: true,
  lastKnownVersion: null,
  showContextMenu: false,
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
    case Actions.SET_VERSION: {
      return {
        ...state,
        lastKnownVersion: action.payload.version,
      }
    }
    case Actions.TOGGLE_COPY_MESSAGE_DOUBLE_CLICK: {
      return {
        ...state,
        copyMessageOnDoubleClick: !state.copyMessageOnDoubleClick,
      }
    }
    case Actions.TOGGLE_SHOW_CONTEXT_MENU: {
      return {
        ...state,
        showContextMenu: !state.showContextMenu,
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
 * Sets the last known version of the application.
 * @param  version - The new version.
 * @return The action.
 */
export const setVersion = (version: string) =>
  createAction(Actions.SET_VERSION, {
    version,
  })

/**
 * Toggle the 'Copy message on double click' setting.
 * @return The action.
 */
export const toggleCopyMessageOnDoubleClick = () => createAction(Actions.TOGGLE_COPY_MESSAGE_DOUBLE_CLICK)

/**
 * Toggle the 'Show context menu' setting.
 * @return The action.
 */
export const toggleShowContextMenu = () => createAction(Actions.TOGGLE_SHOW_CONTEXT_MENU)

/**
 * Settings actions.
 */
export type SettingsActions =
  | RehydrateAction
  | ReturnType<typeof toggleTheme>
  | ReturnType<typeof setVersion>
  | ReturnType<typeof toggleCopyMessageOnDoubleClick>
  | ReturnType<typeof toggleShowContextMenu>

/**
 * Settings state.
 */
export type SettingsState = {
  /**
   * Selected theme.
   */
  theme: Theme

  /**
   * Last know version of the application.
   */
  lastKnownVersion: string | null

  /**
   * Defines if messages should be copied in the clipboard when double clicking them.
   */
  copyMessageOnDoubleClick: boolean

  /**
   * Defines if a context menu should be added to each message.
   */
  showContextMenu: boolean
}
