import * as _ from 'lodash'
import { Reducer } from 'redux'
import { REHYDRATE } from 'redux-persist/lib/constants'

import Theme from 'Constants/theme'
import { SerializedAction } from 'Libs/Action'
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
  UPDATE_HIGHLIGHT = 'settings/UPDATE_HIGHLIGHT',
  REMOVE_HIGHLIGHT = 'settings/REMOVE_HIGHLIGHT',
  ADD_HIGHLIGHTS_IGNORED_USERS = 'settings/ADD_HIGHLIGHTS_IGNORED_USERS',
  REMOVE_HIGHLIGHTS_IGNORED_USER = 'settings/REMOVE_HIGHLIGHTS_IGNORED_USER',
  ADD_ACTION = 'settings/ADD_ACTION',
  REMOVE_ACTION = 'settings/REMOVE_ACTION',
  UPDATE_ACTION = 'settings/UPDATE_ACTION',
  TOGGLE_HIDE_WHISPERS = 'settings/TOGGLE_HIDE_WHISPERS',
}

/**
 * Initial state.
 */
export const initialState = {
  actions: {},
  autoConnectInDev: true,
  copyMessageOnDoubleClick: true,
  hideWhispers: false,
  highlights: {},
  highlightsIgnoredUsers: [],
  lastKnownVersion: null,
  showContextMenu: true,
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
    case Actions.UPDATE_HIGHLIGHT: {
      const { id, pattern } = action.payload

      return {
        ...state,
        highlights: { ...state.highlights, [id]: { ...state.highlights[id], pattern } },
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
export const addHighlight = (highlight: Highlight) =>
  createAction(Actions.ADD_HIGHLIGHT, {
    highlight,
  })

/**
 * Update an highlight pattern.
 * @param  id - The highlight id.
 * @param  pattern - The new pattern.
 * @return The action.
 */
export const updateHighlight = (id: string, pattern: string) =>
  createAction(Actions.UPDATE_HIGHLIGHT, {
    id,
    pattern,
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
  | ReturnType<typeof updateHighlight>
  | ReturnType<typeof removeHighlight>
  | ReturnType<typeof addHighlightsIgnoredUsers>
  | ReturnType<typeof removeHighlightsIgnoredUser>
  | ReturnType<typeof addAction>
  | ReturnType<typeof removeAction>
  | ReturnType<typeof updateAction>
  | ReturnType<typeof toggleHideWhispers>

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
}

/**
 * Highlights.
 */
export type Highlights = { [key in Highlight['id']]: Highlight }

/**
 * Highlight.
 */
export type Highlight = {
  id: string
  pattern: string
}

/**
 * Actions.
 */
export type SerializedActions = { [key in SerializedAction['id']]: SerializedAction }
