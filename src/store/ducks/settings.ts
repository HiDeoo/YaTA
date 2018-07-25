import * as _ from 'lodash'
import { Reducer } from 'redux'
import { REHYDRATE } from 'redux-persist/lib/constants'

import Theme from 'Constants/theme'
import { SerializedAction } from 'Libs/Action'
import { HighlightColors, SerializedHighlight } from 'Libs/Highlight'
import { createAction, RehydrateAction } from 'Utils/redux'

/**
 * Actions types.
 */
export enum Actions {
  TOGGLE_THEME = 'settings/TOGGLE_THEME',
  SET_VERSION = 'settings/SET_VERSION',
  TOGGLE_COPY_MESSAGE_DOUBLE_CLICK = 'settings/TOGGLE_COPY_MESSAGE_DOUBLE_CLICK',
  TOGGLE_SHOW_CONTEXT_MENU = 'settings/TOGGLE_SHOW_CONTEXT_MENU',
  TOGGLE_AUTO_CONNECT_IN_DEV = 'settings/TOGGLE_AUTO_CONNECT_IN_DEV',
  ADD_HIGHLIGHT = 'settings/ADD_HIGHLIGHT',
  UPDATE_HIGHLIGHT_PATTERN = 'settings/UPDATE_HIGHLIGHT_PATTERN',
  UPDATE_HIGHLIGHT_COLOR = 'settings/UPDATE_HIGHLIGHT_COLOR',
  REMOVE_HIGHLIGHT = 'settings/REMOVE_HIGHLIGHT',
  ADD_HIGHLIGHTS_IGNORED_USERS = 'settings/ADD_HIGHLIGHTS_IGNORED_USERS',
  REMOVE_HIGHLIGHTS_IGNORED_USER = 'settings/REMOVE_HIGHLIGHTS_IGNORED_USER',
  ADD_ACTION = 'settings/ADD_ACTION',
  REMOVE_ACTION = 'settings/REMOVE_ACTION',
  UPDATE_ACTION = 'settings/UPDATE_ACTION',
  TOGGLE_HIDE_WHISPERS = 'settings/TOGGLE_HIDE_WHISPERS',
  RESTORE = 'settings/RESTORE',
  TOGGLE_AUTO_FOCUS_INPUT = 'settings/TOGGLE_AUTO_FOCUS_INPUT',
  TOGGLE_SHOW_VIEWER_COUNT = 'settings/TOGGLE_SHOW_VIEWER_COUNT',
  TOGGLE_DISABLE_DIALOG_ANIMATIONS = 'settings/TOGGLE_DISABLE_DIALOG_ANIMATIONS',
}

/**
 * Initial state.
 */
export const initialState = {
  actions: {},
  autoConnectInDev: true,
  autoFocusInput: true,
  copyMessageOnDoubleClick: true,
  disableDialogAnimations: false,
  hideWhispers: false,
  highlights: {},
  highlightsIgnoredUsers: [],
  lastKnownVersion: null,
  showContextMenu: true,
  showViewerCount: false,
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
    case Actions.TOGGLE_AUTO_CONNECT_IN_DEV: {
      return {
        ...state,
        autoConnectInDev: !state.autoConnectInDev,
      }
    }
    case Actions.ADD_HIGHLIGHT: {
      const { highlight } = action.payload

      return {
        ...state,
        highlights: { ...state.highlights, [highlight.id]: highlight },
      }
    }
    case Actions.UPDATE_HIGHLIGHT_PATTERN: {
      const { id, pattern } = action.payload

      return {
        ...state,
        highlights: { ...state.highlights, [id]: { ...state.highlights[id], pattern } },
      }
    }
    case Actions.UPDATE_HIGHLIGHT_COLOR: {
      const { id, color } = action.payload

      return {
        ...state,
        highlights: { ...state.highlights, [id]: { ...state.highlights[id], color } },
      }
    }
    case Actions.REMOVE_HIGHLIGHT: {
      const { id } = action.payload

      const { [id]: highlightToRemove, ...otherHighlights } = state.highlights

      return {
        ...state,
        highlights: otherHighlights,
      }
    }
    case Actions.ADD_HIGHLIGHTS_IGNORED_USERS: {
      return {
        ...state,
        highlightsIgnoredUsers: [...state.highlightsIgnoredUsers, ...action.payload.usernames],
      }
    }
    case Actions.REMOVE_HIGHLIGHTS_IGNORED_USER: {
      return {
        ...state,
        highlightsIgnoredUsers: _.filter(
          state.highlightsIgnoredUsers,
          (username) => username !== action.payload.username
        ),
      }
    }
    case Actions.ADD_ACTION: {
      const { action: newAction } = action.payload

      return {
        ...state,
        actions: { ...state.actions, [newAction.id]: newAction },
      }
    }
    case Actions.REMOVE_ACTION: {
      const { id } = action.payload

      const { [id]: actionToRemove, ...otherActions } = state.actions

      return {
        ...state,
        actions: otherActions,
      }
    }
    case Actions.UPDATE_ACTION: {
      const { id, action: updatedAction } = action.payload

      return {
        ...state,
        actions: { ...state.actions, [id]: { ...state.actions[id], ...updatedAction } },
      }
    }
    case Actions.TOGGLE_HIDE_WHISPERS: {
      return {
        ...state,
        hideWhispers: !state.hideWhispers,
      }
    }
    case Actions.RESTORE: {
      return {
        ...state,
        ...action.payload.json,
      }
    }
    case Actions.TOGGLE_AUTO_FOCUS_INPUT: {
      return {
        ...state,
        autoFocusInput: !state.autoFocusInput,
      }
    }
    case Actions.TOGGLE_SHOW_VIEWER_COUNT: {
      return {
        ...state,
        showViewerCount: !state.showViewerCount,
      }
    }
    case Actions.TOGGLE_DISABLE_DIALOG_ANIMATIONS: {
      return {
        ...state,
        disableDialogAnimations: !state.disableDialogAnimations,
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
 * Toggle the 'Auto connect in dev' setting.
 * @return The action.
 */
export const toggleAutoConnectInDev = () => createAction(Actions.TOGGLE_AUTO_CONNECT_IN_DEV)

/**
 * Add an highlight.
 * @param  highlight - The new highlight.
 * @return The action.
 */
export const addHighlight = (highlight: SerializedHighlight) =>
  createAction(Actions.ADD_HIGHLIGHT, {
    highlight,
  })

/**
 * Update an highlight pattern.
 * @param  id - The highlight id.
 * @param  pattern - The new pattern.
 * @return The action.
 */
export const updateHighlightPattern = (id: string, pattern: string) =>
  createAction(Actions.UPDATE_HIGHLIGHT_PATTERN, {
    id,
    pattern,
  })

/**
 * Update an highlight color.
 * @param  id - The highlight id.
 * @param  color - The new color.
 * @return The action.
 */
export const updateHighlightColor = (id: string, color: HighlightColors) =>
  createAction(Actions.UPDATE_HIGHLIGHT_COLOR, {
    color,
    id,
  })

/**
 * Removes an highlight.
 * @param  id - The highlight id.
 * @return The action.
 */
export const removeHighlight = (id: string) =>
  createAction(Actions.REMOVE_HIGHLIGHT, {
    id,
  })

/**
 * Ignores one or multiple users for highlights and mentions.
 * @param  usernames - The usernames to ignore.
 * @return The action.
 */
export const addHighlightsIgnoredUsers = (usernames: string[]) =>
  createAction(Actions.ADD_HIGHLIGHTS_IGNORED_USERS, {
    usernames,
  })

/**
 * Removes an ignored user for highlights and mentions.
 * @param  username - The username to remove.
 * @return The action.
 */
export const removeHighlightsIgnoredUser = (username: string) =>
  createAction(Actions.REMOVE_HIGHLIGHTS_IGNORED_USER, {
    username,
  })

/**
 * Add an Action.
 * @param  action - The new action.
 * @return The action.
 */
export const addAction = (action: SerializedAction) =>
  createAction(Actions.ADD_ACTION, {
    action,
  })

/**
 * Removes an action.
 * @param  id - The action id.
 * @return The action.
 */
export const removeAction = (id: string) =>
  createAction(Actions.REMOVE_ACTION, {
    id,
  })

/**
 * Update an action.
 * @param  id - The action id.
 * @param  pattern - The updated action.
 * @return The action.
 */
export const updateAction = (id: string, action: SerializedAction) =>
  createAction(Actions.UPDATE_ACTION, {
    action,
    id,
  })

/**
 * Toggle the 'Hide whispers' setting.
 * @return The action.
 */
export const toggleHideWhispers = () => createAction(Actions.TOGGLE_HIDE_WHISPERS)

/**
 * Restores settings from a backup.
 * @param  json - The JSON backup.
 * @return The action.
 */
export const restoreSettings = (json: SettingsState) =>
  createAction(Actions.RESTORE, {
    json,
  })

/**
 * Toggle the 'Automatically focus the input field' setting.
 * @return The action.
 */
export const toggleAutoFocusInput = () => createAction(Actions.TOGGLE_AUTO_FOCUS_INPUT)

/**
 * Toggle the 'Show viewer count' setting.
 * @return The action.
 */
export const toggleShowViewerCount = () => createAction(Actions.TOGGLE_SHOW_VIEWER_COUNT)

/**
 * Toggle the 'Disable dialog animations' setting.
 * @return The action.
 */
export const toggleDisableDialogAnimations = () => createAction(Actions.TOGGLE_DISABLE_DIALOG_ANIMATIONS)

/**
 * Settings actions.
 */
export type SettingsActions =
  | RehydrateAction
  | ReturnType<typeof toggleTheme>
  | ReturnType<typeof setVersion>
  | ReturnType<typeof toggleCopyMessageOnDoubleClick>
  | ReturnType<typeof toggleShowContextMenu>
  | ReturnType<typeof toggleAutoConnectInDev>
  | ReturnType<typeof addHighlight>
  | ReturnType<typeof updateHighlightPattern>
  | ReturnType<typeof updateHighlightColor>
  | ReturnType<typeof removeHighlight>
  | ReturnType<typeof addHighlightsIgnoredUsers>
  | ReturnType<typeof removeHighlightsIgnoredUser>
  | ReturnType<typeof addAction>
  | ReturnType<typeof removeAction>
  | ReturnType<typeof updateAction>
  | ReturnType<typeof toggleHideWhispers>
  | ReturnType<typeof restoreSettings>
  | ReturnType<typeof toggleAutoFocusInput>
  | ReturnType<typeof toggleShowViewerCount>
  | ReturnType<typeof toggleDisableDialogAnimations>

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

  /**
   * When in dev mode, auto-connect to the chat servers.
   */
  autoConnectInDev: boolean

  /**
   * Highlights.
   */
  highlights: Highlights

  /**
   * Users ignored for highlights & mentions.
   */
  highlightsIgnoredUsers: string[]

  /**
   * Actions.
   */
  actions: SerializedActions

  /**
   * Hides whispers (received & sent).
   */
  hideWhispers: boolean

  /**
   * Automatically focus the input field when focusing the application.
   */
  autoFocusInput: boolean

  /**
   * Shows the viewer count in the header.
   */
  showViewerCount: boolean

  /**
   * Disables dialog animations.
   */
  disableDialogAnimations: boolean
}

/**
 * Highlights.
 */
export type Highlights = { [key in SerializedHighlight['id']]: SerializedHighlight }

/**
 * Actions.
 */
export type SerializedActions = { [key in SerializedAction['id']]: SerializedAction }
